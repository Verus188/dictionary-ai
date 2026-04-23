import { initializeApp } from '@/src/app/bootstrap/initialize-app';
import { AppStorage } from '@/src/shared/storage/types';
import { createWebAppStorage } from '@/src/shared/storage/web/create-web-app-storage';

const webStoragePromises = new Map<string, Promise<AppStorage>>();

export const getWebStoragePromise = (databaseName: string) => {
    const existingPromise = webStoragePromises.get(databaseName);

    if (existingPromise) {
        return existingPromise;
    }

    const nextPromise = createWebAppStorage(databaseName)
        .then(async (storage) => {
            await initializeApp(storage);
            return storage;
        })
        .catch((error) => {
            webStoragePromises.delete(databaseName);
            throw error;
        });

    webStoragePromises.set(databaseName, nextPromise);

    return nextPromise;
};

export const clearWebStoragePromises = () => {
    webStoragePromises.clear();
};
