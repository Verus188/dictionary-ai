import { createContext, useContext } from 'react';
import { AppStorage } from './types';

export const AppStorageContext = createContext<AppStorage | null>(null);

export const useAppStorage = () => {
    const storage = useContext(AppStorageContext);

    if (!storage) {
        throw new Error('useAppStorage must be used within an AppStorageContext provider');
    }

    return storage;
};
