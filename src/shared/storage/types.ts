import {
    DictionaryCardSyncEntity,
    PendingSyncOperation,
    PushSyncRequestOperation,
    SettingSyncEntity,
    SyncEntityType,
    SyncStatus,
} from '@/src/shared/sync/types';
import { DictionaryCard } from '@/src/shared/types/dictionary';
import { PersistedStorySettingKey } from '@/src/shared/types/settings';

export type PersistedSettingsRecord = Record<string, string | null>;

export type PersistedSettingEntry = {
    deletedAt: string | null;
    serverRevision: number | null;
    setting: PersistedStorySettingKey;
    syncStatus: SyncStatus;
    updatedAt: string;
    value: string | null;
};

export type AppStorage = {
    initialize(): Promise<void>;
    withTransaction<T>(task: () => Promise<T>): Promise<T>;
    dictionaryCards: {
        applyRemoteEntity(entity: DictionaryCardSyncEntity): Promise<void>;
        createLocal(card: string): Promise<DictionaryCard | null>;
        getAll(): Promise<DictionaryCard[]>;
        getPendingSyncCandidates(): Promise<DictionaryCard[]>;
        hardDeleteLocal(id: string): Promise<void>;
        markDeletedLocally(id: string): Promise<boolean>;
        markSyncSettled(id: string, serverRevision?: number): Promise<void>;
    };
    settings: {
        applyRemoteEntity(entity: SettingSyncEntity): Promise<void>;
        ensureDefaults(defaults: Record<string, string>): Promise<void>;
        getAll(): Promise<PersistedSettingsRecord>;
        getPendingSyncCandidates(): Promise<PersistedSettingEntry[]>;
        markSyncSettled(setting: PersistedStorySettingKey, serverRevision?: number): Promise<void>;
        update(setting: PersistedStorySettingKey, value: string | null): Promise<boolean>;
    };
    syncOutbox: {
        deleteByOperationIds(operationIds: string[]): Promise<void>;
        getNextBatch(limit: number): Promise<PendingSyncOperation[]>;
        hasUnsettledOperationForEntity(
            entityType: SyncEntityType,
            entityId: string,
        ): Promise<boolean>;
        insertOperation(
            operation: PushSyncRequestOperation & {
                createdAt: string;
                deviceId: string;
                id: string;
                payload: string | null;
            },
        ): Promise<void>;
        markBatchFailed(operationIds: string[]): Promise<void>;
        markBatchInFlight(operationIds: string[]): Promise<void>;
    };
    syncState: {
        getLastSyncCursor(): Promise<number | null>;
        markSyncCompleted(): Promise<void>;
        markSyncStarted(): Promise<void>;
        setLastSyncCursor(cursor: number): Promise<void>;
    };
};
