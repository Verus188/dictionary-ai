import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { generateId } from '@/src/shared/lib/generate-id';
import {
    DictionaryCardSyncEntity,
    PendingSyncOperation,
    PushSyncRequestOperation,
    SettingSyncEntity,
    SyncEntityType,
    SyncStatus,
} from '@/src/shared/sync/types';
import {
    AppStorage,
    PersistedSettingEntry,
    PersistedSettingsRecord,
} from '@/src/shared/storage/types';
import { DictionaryCard } from '@/src/shared/types/dictionary';
import { PersistedStorySettingKey } from '@/src/shared/types/settings';

const DATABASE_VERSION = 1;

const STORE_NAMES = {
    dictionaryCards: 'dictionaryCards',
    settings: 'settings',
    syncOutbox: 'syncOutbox',
    syncState: 'syncState',
} as const;

type DictionaryCardRecord = Required<
    Pick<
        DictionaryCard,
        | 'card'
        | 'createdAt'
        | 'deletedAt'
        | 'id'
        | 'normalizedCard'
        | 'serverRevision'
        | 'syncStatus'
        | 'updatedAt'
    >
>;

type SettingRecord = PersistedSettingEntry;

type SyncOutboxRecord = PendingSyncOperation;

type SyncStateRecord = {
    key: string;
    value: string | null;
};

interface AppWebStorageSchema extends DBSchema {
    dictionaryCards: {
        key: string;
        value: DictionaryCardRecord;
        indexes: {
            normalizedCard: string;
        };
    };
    settings: {
        key: PersistedStorySettingKey;
        value: SettingRecord;
    };
    syncOutbox: {
        key: string;
        value: SyncOutboxRecord;
        indexes: {
            operationId: string;
        };
    };
    syncState: {
        key: string;
        value: SyncStateRecord;
    };
}

const DEFAULT_SYNC_STATUS: SyncStatus = 'pending';

const normalizeDictionaryCard = (card: string) => card.trim().replace(/\s+/g, ' ').toLowerCase();

const getCurrentTimestamp = () => new Date().toISOString();

const openIndexedDb = (databaseName: string) =>
    openDB<AppWebStorageSchema>(databaseName, DATABASE_VERSION, {
        upgrade(database) {
            if (!database.objectStoreNames.contains(STORE_NAMES.settings)) {
                database.createObjectStore(STORE_NAMES.settings, { keyPath: 'setting' });
            }

            if (!database.objectStoreNames.contains(STORE_NAMES.dictionaryCards)) {
                const store = database.createObjectStore(STORE_NAMES.dictionaryCards, {
                    keyPath: 'id',
                });
                store.createIndex('normalizedCard', 'normalizedCard', { unique: false });
            }

            if (!database.objectStoreNames.contains(STORE_NAMES.syncOutbox)) {
                const store = database.createObjectStore(STORE_NAMES.syncOutbox, {
                    keyPath: 'id',
                });
                store.createIndex('operationId', 'operationId', { unique: true });
            }

            if (!database.objectStoreNames.contains(STORE_NAMES.syncState)) {
                database.createObjectStore(STORE_NAMES.syncState, { keyPath: 'key' });
            }
        },
    });

const resetInFlightOutboxStatuses = async (database: IDBPDatabase<AppWebStorageSchema>) => {
    const staleRecords = (await database.getAll(STORE_NAMES.syncOutbox)).filter(
        (record) => record.status === 'inFlight',
    );

    if (staleRecords.length === 0) {
        return;
    }

    const transaction = database.transaction(STORE_NAMES.syncOutbox, 'readwrite');
    const store = transaction.store;

    for (const record of staleRecords) {
        await store.put({
            ...record,
            status: 'failed',
        });
    }

    await transaction.done;
};

export const createWebAppStorage = async (databaseName: string): Promise<AppStorage> => {
    const database = await openIndexedDb(databaseName);
    let isInitialized = false;

    const initialize = async () => {
        if (isInitialized) {
            return;
        }

        await resetInFlightOutboxStatuses(database);
        isInitialized = true;
    };

    return {
        initialize,
        withTransaction: async <T,>(task: () => Promise<T>) => task(),
        dictionaryCards: {
            applyRemoteEntity: async (entity: DictionaryCardSyncEntity) => {
                const normalizedCard = normalizeDictionaryCard(entity.card);

                await database.put(STORE_NAMES.dictionaryCards, {
                    card: normalizedCard,
                    createdAt: entity.updatedAt,
                    deletedAt: entity.deletedAt,
                    id: entity.id,
                    normalizedCard,
                    serverRevision: entity.serverRevision,
                    syncStatus: 'synced',
                    updatedAt: entity.updatedAt,
                });
            },
            createLocal: async (card: string) => {
                const normalizedCard = normalizeDictionaryCard(card);

                if (!normalizedCard) {
                    return null;
                }

                const matchingCards = await database.getAllFromIndex(
                    STORE_NAMES.dictionaryCards,
                    'normalizedCard',
                    normalizedCard,
                );
                const hasDuplicate = matchingCards.some((existingCard) => existingCard.deletedAt === null);

                if (hasDuplicate) {
                    return null;
                }

                const now = getCurrentTimestamp();
                const nextCard: DictionaryCardRecord = {
                    card: normalizedCard,
                    createdAt: now,
                    deletedAt: null,
                    id: generateId(),
                    normalizedCard,
                    serverRevision: null,
                    syncStatus: DEFAULT_SYNC_STATUS,
                    updatedAt: now,
                };

                await database.put(STORE_NAMES.dictionaryCards, nextCard);

                return nextCard;
            },
            getAll: async () => {
                const records = await database.getAll(STORE_NAMES.dictionaryCards);

                return records
                    .filter((record) => record.deletedAt === null)
                    .sort((left, right) => left.card.localeCompare(right.card))
                    .map((record) => ({
                        ...record,
                        id: String(record.id),
                    }));
            },
            getPendingSyncCandidates: async () => {
                const records = await database.getAll(STORE_NAMES.dictionaryCards);

                return records
                    .filter((record) => record.syncStatus === 'pending')
                    .sort((left, right) => left.updatedAt.localeCompare(right.updatedAt));
            },
            hardDeleteLocal: (id: string) => database.delete(STORE_NAMES.dictionaryCards, id),
            markDeletedLocally: async (id: string) => {
                const record = await database.get(STORE_NAMES.dictionaryCards, id);

                if (!record || record.deletedAt !== null) {
                    return false;
                }

                const now = getCurrentTimestamp();
                await database.put(STORE_NAMES.dictionaryCards, {
                    ...record,
                    deletedAt: now,
                    syncStatus: 'pending',
                    updatedAt: now,
                });

                return true;
            },
            markSyncSettled: async (id: string, serverRevision?: number) => {
                const record = await database.get(STORE_NAMES.dictionaryCards, id);

                if (!record) {
                    return;
                }

                await database.put(STORE_NAMES.dictionaryCards, {
                    ...record,
                    serverRevision: serverRevision ?? record.serverRevision,
                    syncStatus: 'synced',
                });
            },
        },
        settings: {
            applyRemoteEntity: async (entity: SettingSyncEntity) => {
                await database.put(STORE_NAMES.settings, {
                    deletedAt: entity.deletedAt,
                    serverRevision: entity.serverRevision,
                    setting: entity.key,
                    syncStatus: 'synced',
                    updatedAt: entity.updatedAt,
                    value: entity.value === null ? null : String(entity.value),
                });
            },
            ensureDefaults: async (defaults: Record<string, string>) => {
                const existingKeys = new Set(
                    (await database.getAllKeys(STORE_NAMES.settings)) as PersistedStorySettingKey[],
                );
                const now = getCurrentTimestamp();

                for (const [setting, value] of Object.entries(defaults)) {
                    if (existingKeys.has(setting as PersistedStorySettingKey)) {
                        continue;
                    }

                    await database.put(STORE_NAMES.settings, {
                        deletedAt: null,
                        serverRevision: null,
                        setting: setting as PersistedStorySettingKey,
                        syncStatus: DEFAULT_SYNC_STATUS,
                        updatedAt: now,
                        value,
                    });
                }
            },
            getAll: async () => {
                const records = await database.getAll(STORE_NAMES.settings);

                return records.reduce<PersistedSettingsRecord>((acc, record) => {
                    if (record.deletedAt === null) {
                        acc[record.setting] = record.value;
                    }

                    return acc;
                }, {});
            },
            getPendingSyncCandidates: async () => {
                const records = await database.getAll(STORE_NAMES.settings);

                return records
                    .filter((record) => record.syncStatus === 'pending')
                    .sort((left, right) => left.updatedAt.localeCompare(right.updatedAt));
            },
            markSyncSettled: async (setting, serverRevision?: number) => {
                const record = await database.get(STORE_NAMES.settings, setting);

                if (!record) {
                    return;
                }

                await database.put(STORE_NAMES.settings, {
                    ...record,
                    serverRevision: serverRevision ?? record.serverRevision,
                    syncStatus: 'synced',
                });
            },
            update: async (setting, value) => {
                const existingRecord = await database.get(STORE_NAMES.settings, setting);

                if (
                    existingRecord &&
                    existingRecord.value === value &&
                    existingRecord.deletedAt === null
                ) {
                    return false;
                }

                const now = getCurrentTimestamp();
                await database.put(STORE_NAMES.settings, {
                    deletedAt: null,
                    serverRevision: existingRecord?.serverRevision ?? null,
                    setting,
                    syncStatus: 'pending',
                    updatedAt: now,
                    value,
                });

                return true;
            },
        },
        syncOutbox: {
            deleteByOperationIds: async (operationIds: string[]) => {
                if (operationIds.length === 0) {
                    return;
                }

                const records = await database.getAll(STORE_NAMES.syncOutbox);
                const transaction = database.transaction(STORE_NAMES.syncOutbox, 'readwrite');
                const store = transaction.store;

                for (const record of records) {
                    if (!operationIds.includes(record.operationId)) {
                        continue;
                    }

                    await store.delete(record.id);
                }

                await transaction.done;
            },
            getNextBatch: async (limit: number) => {
                const records = await database.getAll(STORE_NAMES.syncOutbox);

                return records
                    .filter((record) => record.status === 'pending' || record.status === 'failed')
                    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
                    .slice(0, limit);
            },
            hasUnsettledOperationForEntity: async (
                entityType: SyncEntityType,
                entityId: string,
            ) => {
                const records = await database.getAll(STORE_NAMES.syncOutbox);

                return records.some(
                    (record) => record.entityType === entityType && record.entityId === entityId,
                );
            },
            insertOperation: async (
                operation: PushSyncRequestOperation & {
                    createdAt: string;
                    deviceId: string;
                    id: string;
                    payload: string | null;
                },
            ) => {
                const existingRecord = await database.getFromIndex(
                    STORE_NAMES.syncOutbox,
                    'operationId',
                    operation.operationId,
                );

                if (existingRecord) {
                    return;
                }

                await database.put(STORE_NAMES.syncOutbox, {
                    clientUpdatedAt: operation.clientUpdatedAt,
                    createdAt: operation.createdAt,
                    deviceId: operation.deviceId,
                    entityId: operation.entityId,
                    entityType: operation.entityType,
                    id: operation.id,
                    lastAttemptAt: null,
                    operationId: operation.operationId,
                    operationType: operation.operationType,
                    payload: operation.payload,
                    retryCount: 0,
                    status: 'pending',
                });
            },
            markBatchFailed: async (operationIds: string[]) => {
                if (operationIds.length === 0) {
                    return;
                }

                const records = await database.getAll(STORE_NAMES.syncOutbox);
                const transaction = database.transaction(STORE_NAMES.syncOutbox, 'readwrite');
                const store = transaction.store;

                for (const record of records) {
                    if (!operationIds.includes(record.operationId)) {
                        continue;
                    }

                    await store.put({
                        ...record,
                        status: 'failed',
                    });
                }

                await transaction.done;
            },
            markBatchInFlight: async (operationIds: string[]) => {
                if (operationIds.length === 0) {
                    return;
                }

                const records = await database.getAll(STORE_NAMES.syncOutbox);
                const now = getCurrentTimestamp();
                const transaction = database.transaction(STORE_NAMES.syncOutbox, 'readwrite');
                const store = transaction.store;

                for (const record of records) {
                    if (!operationIds.includes(record.operationId)) {
                        continue;
                    }

                    await store.put({
                        ...record,
                        lastAttemptAt: now,
                        retryCount: record.retryCount + 1,
                        status: 'inFlight',
                    });
                }

                await transaction.done;
            },
        },
        syncState: {
            getLastSyncCursor: async () => {
                const record = await database.get(STORE_NAMES.syncState, 'lastSyncCursor');

                if (!record?.value) {
                    return null;
                }

                const parsed = Number(record.value);

                return Number.isFinite(parsed) ? parsed : null;
            },
            markSyncCompleted: async () => {
                await database.put(STORE_NAMES.syncState, {
                    key: 'lastSyncCompletedAt',
                    value: getCurrentTimestamp(),
                });
            },
            markSyncStarted: async () => {
                await database.put(STORE_NAMES.syncState, {
                    key: 'lastSyncStartedAt',
                    value: getCurrentTimestamp(),
                });
            },
            setLastSyncCursor: async (cursor: number) => {
                await database.put(STORE_NAMES.syncState, {
                    key: 'lastSyncCursor',
                    value: String(cursor),
                });
            },
        },
    };
};
