import axios from 'axios';
import {
    ContinueStoryApiRequest,
    ContinueStoryApiResponse,
    InitStoryApiRequest,
    InitStoryApiResponse,
} from './types';

export const AI_API_BASE_URL = 'http://localhost:3000';

const STORY_INIT_PATH = 'ai/story/init';
const STORY_CONTINUE_PATH = 'ai/story/continue';

const buildUrl = (path: string) => {
    const normalizedBaseUrl = AI_API_BASE_URL.trim().replace(/\/+$/g, '');

    if (!normalizedBaseUrl) {
        throw new Error('AI_API_BASE_URL is empty');
    }

    return `${normalizedBaseUrl}/${path}`;
};

export const initStory = async (payload: InitStoryApiRequest): Promise<InitStoryApiResponse> => {
    const response = await axios.post<InitStoryApiResponse>(buildUrl(STORY_INIT_PATH), payload, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return response.data;
};

export const continueStory = async (
    payload: ContinueStoryApiRequest,
): Promise<ContinueStoryApiResponse> => {
    const response = await axios.post<ContinueStoryApiResponse>(
        buildUrl(STORY_CONTINUE_PATH),
        payload,
        {
            headers: {
                'Content-Type': 'application/json',
            },
        },
    );

    return response.data;
};
