import { generateId } from '@/src/shared/lib/generate-id';
import { AppStorage } from '@/src/shared/storage/types';
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

export const seedPendingSyncOperations = async (storage: AppStorage, deviceId: string) => {
    const pendingCards = await storage.dictionaryCards.getPendingSyncCandidates();

    for (const card of pendingCards) {
        const hasOutboxOperation = await storage.syncOutbox.hasUnsettledOperationForEntity(
            'dictionaryCard',
            card.id,
        );

        if (hasOutboxOperation) {
            continue;
        }

        await storage.syncOutbox.insertOperation(
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

    const pendingSettings = await storage.settings.getPendingSyncCandidates();

    for (const setting of pendingSettings) {
        const hasOutboxOperation = await storage.syncOutbox.hasUnsettledOperationForEntity(
            'setting',
            setting.setting,
        );

        if (hasOutboxOperation) {
            continue;
        }

        await storage.syncOutbox.insertOperation(
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
