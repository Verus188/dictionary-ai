import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { generateId } from '@/src/shared/lib/generate-id';

const DEVICE_ID_KEY = 'sync.deviceId';

let inMemoryDeviceId: string | null = null;

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

        return fallback();
    }
};

export const getStableDeviceId = async (): Promise<string> => {
    if (inMemoryDeviceId) {
        return inMemoryDeviceId;
    }

    const webStorage = getWebStorage();
    const storedWebDeviceId = webStorage?.getItem(DEVICE_ID_KEY);

    if (storedWebDeviceId) {
        inMemoryDeviceId = storedWebDeviceId;
        return storedWebDeviceId;
    }

    const storedSecureStoreDeviceId = webStorage
        ? null
        : await withSecureStoreFallback(
              async () => SecureStore.getItemAsync(DEVICE_ID_KEY),
              async () => inMemoryDeviceId,
          );

    if (storedSecureStoreDeviceId) {
        inMemoryDeviceId = storedSecureStoreDeviceId;
        return storedSecureStoreDeviceId;
    }

    const nextDeviceId = generateId();
    inMemoryDeviceId = nextDeviceId;

    if (webStorage) {
        webStorage.setItem(DEVICE_ID_KEY, nextDeviceId);
        return nextDeviceId;
    }

    await withSecureStoreFallback(
        async () => SecureStore.setItemAsync(DEVICE_ID_KEY, nextDeviceId),
        async () => undefined,
    );

    return nextDeviceId;
};
