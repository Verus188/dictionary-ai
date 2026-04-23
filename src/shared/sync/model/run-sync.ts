import { pushSync, pullSync } from '@/src/shared/sync/api/client';
import { getStableDeviceId } from '@/src/shared/sync/lib/device-id-storage';
import { seedPendingSyncOperations } from '@/src/shared/sync/model/seed-pending-sync-operations';
import { AppStorage } from '@/src/shared/storage/types';
import { PersistedStorySettingKey } from '@/src/shared/types/settings';
import {
    DictionaryCardSyncEntity,
    PendingSyncOperation,
    PullSyncChange,
    PushSyncConflict,
    PushSyncRequestOperation,
    SettingSyncEntity,
} from '@/src/shared/sync/types';

const PUSH_BATCH_LIMIT = 50;

const parseOperationPayload = (payload: string | null) => {
    if (!payload) {
        return null;
    }

    return JSON.parse(payload);
};

const toPushOperation = (operation: PendingSyncOperation): PushSyncRequestOperation => ({
    clientUpdatedAt: operation.clientUpdatedAt,
    entityId: operation.entityId,
    entityType: operation.entityType,
    operationId: operation.operationId,
    operationType: operation.operationType,
    payload: parseOperationPayload(operation.payload),
});

const settlePushConflicts = async (
    storage: AppStorage,
    conflicts: PushSyncConflict[],
): Promise<boolean> => {
    let didChangeLocalData = false;

    for (const conflict of conflicts) {
        if (conflict.type !== 'dictionary_duplicate_merged') {
            continue;
        }

        didChangeLocalData = true;
        await storage.dictionaryCards.hardDeleteLocal(conflict.submittedEntityId);
        await storage.dictionaryCards.applyRemoteEntity(conflict.canonicalEntity);
    }

    return didChangeLocalData;
};

const settlePushResults = async (
    storage: AppStorage,
    operations: PendingSyncOperation[],
    conflicts: PushSyncConflict[],
    results: Array<{
        entityId: string;
        entityType: 'dictionaryCard' | 'setting';
        operationId: string;
        serverRevision?: number;
        status: 'applied' | 'noop' | 'ignored';
    }>,
) => {
    const conflictedOperationIds = new Set(conflicts.map((conflict) => conflict.operationId));

    for (const result of results) {
        if (conflictedOperationIds.has(result.operationId)) {
            continue;
        }

        const operation = operations.find((item) => item.operationId === result.operationId);

        if (!operation) {
            continue;
        }

        if (result.entityType === 'dictionaryCard') {
            await storage.dictionaryCards.markSyncSettled(result.entityId, result.serverRevision);
            continue;
        }

        await storage.settings.markSyncSettled(
            result.entityId as PersistedStorySettingKey,
            result.serverRevision,
        );
    }
};

const pushOutbox = async (storage: AppStorage, deviceId: string): Promise<boolean> => {
    let didChangeLocalData = false;

    while (true) {
        const batch = await storage.syncOutbox.getNextBatch(PUSH_BATCH_LIMIT);

        if (batch.length === 0) {
            return didChangeLocalData;
        }

        const operationIds = batch.map((item) => item.operationId);
        await storage.syncOutbox.markBatchInFlight(operationIds);

        try {
            const response = await pushSync({
                deviceId,
                operations: batch.map(toPushOperation),
            });

            const changedByConflicts = await settlePushConflicts(storage, response.conflicts);
            await settlePushResults(storage, batch, response.conflicts, response.results);

            await storage.syncOutbox.deleteByOperationIds([
                ...response.results.map((item) => item.operationId),
                ...response.conflicts.map((item) => item.operationId),
            ]);

            didChangeLocalData = didChangeLocalData || changedByConflicts;
        } catch (error) {
            await storage.syncOutbox.markBatchFailed(operationIds);
            throw error;
        }
    }
};

const applyPullChange = async (storage: AppStorage, change: PullSyncChange) => {
    if (change.entityType === 'dictionaryCard') {
        await storage.dictionaryCards.applyRemoteEntity(change.entity as DictionaryCardSyncEntity);
        return;
    }

    await storage.settings.applyRemoteEntity(change.entity as SettingSyncEntity);
};

const pullRemoteChanges = async (storage: AppStorage): Promise<boolean> => {
    let didChangeLocalData = false;
    let cursor = await storage.syncState.getLastSyncCursor();

    while (true) {
        const response = await pullSync(cursor);

        if (response.changes.length > 0) {
            didChangeLocalData = true;

            await storage.withTransaction(async () => {
                for (const change of response.changes) {
                    await applyPullChange(storage, change);
                }

                await storage.syncState.setLastSyncCursor(response.cursor);
            });
        } else if (response.cursor !== cursor && response.cursor > 0) {
            await storage.syncState.setLastSyncCursor(response.cursor);
        }

        cursor = response.cursor;

        if (!response.hasMore) {
            return didChangeLocalData;
        }
    }
};

export const runSync = async (storage: AppStorage): Promise<{ didChangeLocalData: boolean }> => {
    const deviceId = await getStableDeviceId();

    await storage.syncState.markSyncStarted();
    await seedPendingSyncOperations(storage, deviceId);

    const didChangeLocalDataFromPush = await pushOutbox(storage, deviceId);
    const didChangeLocalDataFromPull = await pullRemoteChanges(storage);

    await storage.syncState.markSyncCompleted();

    return {
        didChangeLocalData: didChangeLocalDataFromPush || didChangeLocalDataFromPull,
    };
};
