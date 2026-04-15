import { SQLiteDatabase } from 'expo-sqlite';
import { dictionaryCardsRepository } from '@/src/shared/db/repositories/dictionary-cards-repository';
import { settingsRepository } from '@/src/shared/db/repositories/settings-repository';
import { pushSync, pullSync } from '@/src/shared/sync/api/client';
import { syncOutboxRepository } from '@/src/shared/sync/db/outbox-repository';
import { syncStateRepository } from '@/src/shared/sync/db/sync-state-repository';
import { getStableDeviceId } from '@/src/shared/sync/lib/device-id-storage';
import { seedPendingSyncOperations } from '@/src/shared/sync/model/seed-pending-sync-operations';
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
    db: SQLiteDatabase,
    conflicts: PushSyncConflict[],
): Promise<boolean> => {
    let didChangeLocalData = false;

    for (const conflict of conflicts) {
        if (conflict.type !== 'dictionary_duplicate_merged') {
            continue;
        }

        didChangeLocalData = true;
        await dictionaryCardsRepository.hardDeleteLocal(db, conflict.submittedEntityId);
        await dictionaryCardsRepository.applyRemoteEntity(db, conflict.canonicalEntity);
    }

    return didChangeLocalData;
};

const settlePushResults = async (
    db: SQLiteDatabase,
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
            await dictionaryCardsRepository.markSyncSettled(
                db,
                result.entityId,
                result.serverRevision,
            );
            continue;
        }

        await settingsRepository.markSyncSettled(
            db,
            result.entityId as PersistedStorySettingKey,
            result.serverRevision,
        );
    }
};

const pushOutbox = async (db: SQLiteDatabase, deviceId: string): Promise<boolean> => {
    let didChangeLocalData = false;

    while (true) {
        const batch = await syncOutboxRepository.getNextBatch(db, PUSH_BATCH_LIMIT);

        if (batch.length === 0) {
            return didChangeLocalData;
        }

        const operationIds = batch.map((item) => item.operationId);
        await syncOutboxRepository.markBatchInFlight(db, operationIds);

        try {
            const response = await pushSync({
                deviceId,
                operations: batch.map(toPushOperation),
            });

            const changedByConflicts = await settlePushConflicts(db, response.conflicts);
            await settlePushResults(db, batch, response.conflicts, response.results);

            await syncOutboxRepository.deleteByOperationIds(db, [
                ...response.results.map((item) => item.operationId),
                ...response.conflicts.map((item) => item.operationId),
            ]);

            didChangeLocalData = didChangeLocalData || changedByConflicts;
        } catch (error) {
            await syncOutboxRepository.markBatchFailed(db, operationIds);
            throw error;
        }
    }
};

const applyPullChange = async (db: SQLiteDatabase, change: PullSyncChange) => {
    if (change.entityType === 'dictionaryCard') {
        await dictionaryCardsRepository.applyRemoteEntity(
            db,
            change.entity as DictionaryCardSyncEntity,
        );
        return;
    }

    await settingsRepository.applyRemoteEntity(db, change.entity as SettingSyncEntity);
};

const pullRemoteChanges = async (db: SQLiteDatabase): Promise<boolean> => {
    let didChangeLocalData = false;
    let cursor = await syncStateRepository.getLastSyncCursor(db);

    while (true) {
        const response = await pullSync(cursor);

        if (response.changes.length > 0) {
            didChangeLocalData = true;

            await db.withTransactionAsync(async () => {
                for (const change of response.changes) {
                    await applyPullChange(db, change);
                }

                await syncStateRepository.setLastSyncCursor(db, response.cursor);
            });
        } else if (response.cursor !== cursor && response.cursor > 0) {
            await syncStateRepository.setLastSyncCursor(db, response.cursor);
        }

        cursor = response.cursor;

        if (!response.hasMore) {
            return didChangeLocalData;
        }
    }
};

export const runSync = async (db: SQLiteDatabase): Promise<{ didChangeLocalData: boolean }> => {
    const deviceId = await getStableDeviceId();

    await syncStateRepository.markSyncStarted(db);
    await seedPendingSyncOperations(db, deviceId);

    const didChangeLocalDataFromPush = await pushOutbox(db, deviceId);
    const didChangeLocalDataFromPull = await pullRemoteChanges(db);

    await syncStateRepository.markSyncCompleted(db);

    return {
        didChangeLocalData: didChangeLocalDataFromPush || didChangeLocalDataFromPull,
    };
};
