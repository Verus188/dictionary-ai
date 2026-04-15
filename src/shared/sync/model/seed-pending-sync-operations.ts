import { SQLiteDatabase } from 'expo-sqlite';
import { dictionaryCardsRepository } from '@/src/shared/db/repositories/dictionary-cards-repository';
import { settingsRepository } from '@/src/shared/db/repositories/settings-repository';
import { generateId } from '@/src/shared/lib/generate-id';
import { syncOutboxRepository } from '@/src/shared/sync/db/outbox-repository';
import { PushSyncRequestOperation } from '@/src/shared/sync/types';

const createOperationRecord = (
    deviceId: string,
    operation: PushSyncRequestOperation,
): (PushSyncRequestOperation & {
    createdAt: string;
    deviceId: string;
    id: string;
    payload: string | null;
}) => ({
    ...operation,
    createdAt: operation.clientUpdatedAt,
    deviceId,
    id: generateId(),
    payload: operation.payload === null ? null : JSON.stringify(operation.payload),
});

export const seedPendingSyncOperations = async (db: SQLiteDatabase, deviceId: string) => {
    const pendingCards = await dictionaryCardsRepository.getPendingSyncCandidates(db);

    for (const card of pendingCards) {
        const hasOutboxOperation = await syncOutboxRepository.hasUnsettledOperationForEntity(
            db,
            'dictionaryCard',
            card.id,
        );

        if (hasOutboxOperation) {
            continue;
        }

        await syncOutboxRepository.insertOperation(
            db,
            createOperationRecord(deviceId, {
                clientUpdatedAt: card.updatedAt ?? new Date().toISOString(),
                entityId: card.id,
                entityType: 'dictionaryCard',
                operationId: generateId(),
                operationType: card.deletedAt ? 'delete' : 'upsert',
                payload: card.deletedAt
                    ? null
                    : {
                          card: card.card,
                          id: card.id,
                      },
            }),
        );
    }

    const pendingSettings = await settingsRepository.getPendingSyncCandidates(db);

    for (const setting of pendingSettings) {
        const hasOutboxOperation = await syncOutboxRepository.hasUnsettledOperationForEntity(
            db,
            'setting',
            setting.setting,
        );

        if (hasOutboxOperation) {
            continue;
        }

        await syncOutboxRepository.insertOperation(
            db,
            createOperationRecord(deviceId, {
                clientUpdatedAt: setting.updatedAt,
                entityId: setting.setting,
                entityType: 'setting',
                operationId: generateId(),
                operationType: setting.deletedAt ? 'delete' : 'upsert',
                payload: setting.deletedAt
                    ? null
                    : {
                          key: setting.setting,
                          value: setting.value,
                      },
            }),
        );
    }
};
