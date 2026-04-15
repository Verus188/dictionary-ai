import { PersistedStorySettingKey } from '@/src/shared/types/settings';

export type SyncEntityType = 'dictionaryCard' | 'setting';

export type SyncOperationType = 'upsert' | 'delete';

export type SyncStatus = 'synced' | 'pending' | 'failed';

export type SyncOutboxStatus = 'pending' | 'inFlight' | 'failed';

export type DictionaryCardSyncEntity = {
    id: string;
    card: string;
    deletedAt: string | null;
    serverRevision: number;
    updatedAt: string;
};

export type SettingSyncEntity = {
    deletedAt: string | null;
    key: PersistedStorySettingKey;
    serverRevision: number;
    updatedAt: string;
    value: unknown | null;
};

export type PushSyncResult = {
    entityId: string;
    entityType: SyncEntityType;
    operationId: string;
    serverRevision?: number;
    status: 'applied' | 'noop' | 'ignored';
};

export type PushSyncConflict = {
    canonicalEntity: DictionaryCardSyncEntity;
    entityType: 'dictionaryCard';
    operationId: string;
    submittedEntityId: string;
    type: 'dictionary_duplicate_merged';
};

export type PushSyncResponse = {
    conflicts: PushSyncConflict[];
    results: PushSyncResult[];
};

export type PullSyncChange = {
    changeType: SyncOperationType;
    cursor: number;
    entity: DictionaryCardSyncEntity | SettingSyncEntity;
    entityType: SyncEntityType;
};

export type PullSyncResponse = {
    changes: PullSyncChange[];
    cursor: number;
    hasMore: boolean;
};

export type PushSyncRequestOperation = {
    clientUpdatedAt: string;
    entityId: string;
    entityType: SyncEntityType;
    operationId: string;
    operationType: SyncOperationType;
    payload: unknown | null;
};

export type PushSyncRequest = {
    deviceId: string;
    operations: PushSyncRequestOperation[];
};

export type PendingSyncOperation = {
    clientUpdatedAt: string;
    createdAt: string;
    deviceId: string;
    entityId: string;
    entityType: SyncEntityType;
    id: string;
    lastAttemptAt: string | null;
    operationId: string;
    operationType: SyncOperationType;
    payload: string | null;
    retryCount: number;
    status: SyncOutboxStatus;
};
