import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'auth.accessToken';
let inMemoryAccessToken: string | null = null;

const getWebStorage = () => {
    if (Platform.OS !== 'web' || typeof globalThis.localStorage === 'undefined') {
        return null;
    }

    return globalThis.localStorage;
};

const isUnavailableSecureStoreError = (error: unknown) =>
    error instanceof Error &&
    error.message.includes('ExpoSecureStore') &&
    error.message.includes('is not a function');

const readFallbackAccessToken = async () => {
    const webStorage = getWebStorage();

    if (webStorage) {
        return webStorage.getItem(ACCESS_TOKEN_KEY);
    }

    return inMemoryAccessToken;
};

const writeFallbackAccessToken = async (accessToken: string) => {
    inMemoryAccessToken = accessToken;

    const webStorage = getWebStorage();
    webStorage?.setItem(ACCESS_TOKEN_KEY, accessToken);
};

const clearFallbackAccessToken = async () => {
    inMemoryAccessToken = null;

    const webStorage = getWebStorage();
    webStorage?.removeItem(ACCESS_TOKEN_KEY);
};

const withSecureStoreFallback = async <T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
): Promise<T> => {
    try {
        return await operation();
    } catch (error) {
        if (!isUnavailableSecureStoreError(error)) {
            throw error;
        }

        console.warn('SecureStore is unavailable in the current runtime, using fallback storage.');

        return fallback();
    }
};

export const authSessionStorage = {
    getAccessToken: () => {
        const webStorage = getWebStorage();

        if (webStorage) {
            return readFallbackAccessToken();
        }

        return withSecureStoreFallback(
            async () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
            readFallbackAccessToken,
        );
    },
    setAccessToken: (accessToken: string) => {
        const webStorage = getWebStorage();

        if (webStorage) {
            return writeFallbackAccessToken(accessToken);
        }

        inMemoryAccessToken = accessToken;

        return withSecureStoreFallback(
            async () => SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
            async () => undefined,
        );
    },
    clearAccessToken: () => {
        const webStorage = getWebStorage();

        if (webStorage) {
            return clearFallbackAccessToken();
        }

        inMemoryAccessToken = null;

        return withSecureStoreFallback(
            async () => SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
            async () => undefined,
        );
    },
};
