import { SQLiteDatabase } from 'expo-sqlite';
import { dictionaryCardsRepository } from '@/src/shared/db/repositories/dictionary-cards-repository';
import { initializeDatabase } from '@/src/shared/db/bootstrap';
import { settingsRepository } from '@/src/shared/db/repositories/settings-repository';
import { syncOutboxRepository } from '@/src/shared/sync/db/outbox-repository';
import { syncStateRepository } from '@/src/shared/sync/db/sync-state-repository';
import { AppStorage } from '@/src/shared/storage/types';

export const createMobileAppStorage = (db: SQLiteDatabase): AppStorage => ({
    initialize: () => initializeDatabase(db),
    withTransaction: async <T,>(task: () => Promise<T>) => {
        let result: T | undefined;

        await db.withTransactionAsync(async () => {
            result = await task();
        });

        return result as T;
    },
    dictionaryCards: {
        applyRemoteEntity: (entity) => dictionaryCardsRepository.applyRemoteEntity(db, entity),
        createLocal: (card) => dictionaryCardsRepository.createLocal(db, card),
        getAll: () => dictionaryCardsRepository.getAll(db),
        getPendingSyncCandidates: () => dictionaryCardsRepository.getPendingSyncCandidates(db),
        hardDeleteLocal: (id) => dictionaryCardsRepository.hardDeleteLocal(db, id),
        markDeletedLocally: (id) => dictionaryCardsRepository.markDeletedLocally(db, id),
        markSyncSettled: (id, serverRevision) =>
            dictionaryCardsRepository.markSyncSettled(db, id, serverRevision),
    },
    settings: {
        applyRemoteEntity: (entity) => settingsRepository.applyRemoteEntity(db, entity),
        ensureDefaults: (defaults) => settingsRepository.ensureDefaults(db, defaults),
        getAll: () => settingsRepository.getAll(db),
        getPendingSyncCandidates: () => settingsRepository.getPendingSyncCandidates(db),
        markSyncSettled: (setting, serverRevision) =>
            settingsRepository.markSyncSettled(db, setting, serverRevision),
        update: (setting, value) => settingsRepository.update(db, setting, value),
    },
    syncOutbox: {
        deleteByOperationIds: (operationIds) =>
            syncOutboxRepository.deleteByOperationIds(db, operationIds),
        getNextBatch: (limit) => syncOutboxRepository.getNextBatch(db, limit),
        hasUnsettledOperationForEntity: (entityType, entityId) =>
            syncOutboxRepository.hasUnsettledOperationForEntity(db, entityType, entityId),
        insertOperation: (operation) => syncOutboxRepository.insertOperation(db, operation),
        markBatchFailed: (operationIds) => syncOutboxRepository.markBatchFailed(db, operationIds),
        markBatchInFlight: (operationIds) =>
            syncOutboxRepository.markBatchInFlight(db, operationIds),
    },
    syncState: {
        getLastSyncCursor: () => syncStateRepository.getLastSyncCursor(db),
        markSyncCompleted: () => syncStateRepository.markSyncCompleted(db),
        markSyncStarted: () => syncStateRepository.markSyncStarted(db),
        setLastSyncCursor: (cursor) => syncStateRepository.setLastSyncCursor(db, cursor),
    },
});
