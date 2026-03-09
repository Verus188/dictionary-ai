import axios from 'axios';
import { AIGenerateRequest, AIGenerateResponse } from './types';

export const AI_API_BASE_URL = 'http://localhost:3000';
const AI_GENERATE_PATH = 'ai/generate';

const buildAIGenerateUrl = () => {
    const normalizedBaseUrl = AI_API_BASE_URL.trim().replace(/\/+$/g, '');

    if (!normalizedBaseUrl) {
        throw new Error('AI_API_BASE_URL is empty');
    }

    return `${normalizedBaseUrl}/${AI_GENERATE_PATH}`;
};

const validatePayload = (payload: AIGenerateRequest) => {
    const prompt = payload.prompt.trim();

    if (!prompt) {
        throw new Error('`prompt` is required and must not be empty');
    }

    if (
        payload.temperature !== undefined &&
        (Number.isNaN(payload.temperature) || payload.temperature < 0 || payload.temperature > 2)
    ) {
        throw new Error('`temperature` must be between 0 and 2');
    }

    return {
        prompt,
        temperature: payload.temperature,
    };
};

export const generateAIText = async (payload: AIGenerateRequest): Promise<AIGenerateResponse> => {
    const validPayload = validatePayload(payload);
    const url = buildAIGenerateUrl();

    const response = await axios.post<AIGenerateResponse>(url, validPayload, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return response.data;
};
