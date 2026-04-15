import { SQLiteDatabase } from 'expo-sqlite';
import { generateId } from '@/src/shared/lib/generate-id';
import { syncOutboxRepository } from '@/src/shared/sync/db/outbox-repository';
import { getStableDeviceId } from '@/src/shared/sync/lib/device-id-storage';
import { PushSyncRequestOperation } from '@/src/shared/sync/types';

export const enqueueSyncOperation = async (
    db: SQLiteDatabase,
    operation: PushSyncRequestOperation,
) => {
    const deviceId = await getStableDeviceId();

    await syncOutboxRepository.insertOperation(db, {
        ...operation,
        createdAt: operation.clientUpdatedAt,
        deviceId,
        id: generateId(),
        payload: operation.payload === null ? null : JSON.stringify(operation.payload),
    });
};
