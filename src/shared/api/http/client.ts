import axios from 'axios';

declare module 'axios' {
    export interface AxiosRequestConfig {
        skipUnauthorizedHandler?: boolean;
    }
}

// const DEFAULT_API_BASE_URL = 'http://localhost:3000';
const DEFAULT_API_BASE_URL = 'https://dictionary-ai-be.onrender.com';
const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register'];

const normalizeBaseUrl = (baseUrl: string) => {
    const normalizedBaseUrl = baseUrl.trim().replace(/\/+$/g, '');

    if (!normalizedBaseUrl) {
        throw new Error('API base URL is empty');
    }

    return normalizedBaseUrl;
};

export const API_BASE_URL = normalizeBaseUrl(
    process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL,
);

export const httpClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let accessToken: string | null = null;
let unauthorizedHandler: (() => Promise<void> | void) | null = null;
let unauthorizedRequest: Promise<void> | null = null;

const isPublicAuthPath = (url?: string) => {
    if (!url) {
        return false;
    }

    return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
};

httpClient.interceptors.request.use((config) => {
    if (!accessToken) {
        return config;
    }

    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;

    return config;
});

httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (
            error.response?.status === 401 &&
            !error.config?.skipUnauthorizedHandler &&
            !isPublicAuthPath(error.config?.url) &&
            unauthorizedHandler
        ) {
            if (!unauthorizedRequest) {
                unauthorizedRequest = Promise.resolve(unauthorizedHandler()).finally(() => {
                    unauthorizedRequest = null;
                });
            }

            await unauthorizedRequest;
        }

        return Promise.reject(error);
    },
);

export const setHttpClientAccessToken = (nextAccessToken: string | null) => {
    accessToken = nextAccessToken;
};

export const setUnauthorizedHandler = (handler: (() => Promise<void> | void) | null) => {
    unauthorizedHandler = handler;
};
