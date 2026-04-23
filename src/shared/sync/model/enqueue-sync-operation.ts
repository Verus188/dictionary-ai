import { generateId } from '@/src/shared/lib/generate-id';
import { AppStorage } from '@/src/shared/storage/types';
import { getStableDeviceId } from '@/src/shared/sync/lib/device-id-storage';
import { PushSyncRequestOperation } from '@/src/shared/sync/types';

export const enqueueSyncOperation = async (
    storage: AppStorage,
    operation: PushSyncRequestOperation,
) => {
    const deviceId = await getStableDeviceId();

    await storage.syncOutbox.insertOperation({
        ...operation,
        createdAt: operation.clientUpdatedAt,
        deviceId,
        id: generateId(),
        payload: operation.payload === null ? null : JSON.stringify(operation.payload),
    });
};
