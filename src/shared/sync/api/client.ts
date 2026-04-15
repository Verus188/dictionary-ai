import { httpClient } from '@/src/shared/api/http/client';
import { PullSyncResponse, PushSyncRequest, PushSyncResponse } from '@/src/shared/sync/types';

const SYNC_PULL_PATH = '/sync/pull';
const SYNC_PUSH_PATH = '/sync/push';
const DEFAULT_PULL_LIMIT = 200;

export const pushSync = async (payload: PushSyncRequest): Promise<PushSyncResponse> => {
    const response = await httpClient.post<PushSyncResponse>(SYNC_PUSH_PATH, payload);

    return response.data;
};

export const pullSync = async (cursor?: number | null): Promise<PullSyncResponse> => {
    const response = await httpClient.get<PullSyncResponse>(SYNC_PULL_PATH, {
        params: {
            cursor: cursor ?? undefined,
            limit: DEFAULT_PULL_LIMIT,
        },
    });

    return response.data;
};
