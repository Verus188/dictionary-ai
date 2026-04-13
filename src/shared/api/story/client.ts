import {
    ContinueStoryApiRequest,
    ContinueStoryApiResponse,
    InitStoryApiRequest,
    InitStoryApiResponse,
} from '@/src/shared/api/story/types';
import { httpClient } from '@/src/shared/api/http/client';

const STORY_INIT_PATH = 'ai/story/init';
const STORY_CONTINUE_PATH = 'ai/story/continue';

export const initStory = async (payload: InitStoryApiRequest): Promise<InitStoryApiResponse> => {
    const response = await httpClient.post<InitStoryApiResponse>(STORY_INIT_PATH, payload);

    return response.data;
};

export const continueStory = async (
    payload: ContinueStoryApiRequest,
): Promise<ContinueStoryApiResponse> => {
    const response = await httpClient.post<ContinueStoryApiResponse>(STORY_CONTINUE_PATH, payload);

    return response.data;
};
