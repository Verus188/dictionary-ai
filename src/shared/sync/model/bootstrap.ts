import { atom } from '@reatom/core';
import { onConnect } from '@reatom/hooks';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { hydrateDictionaryCardsAction } from '@/src/features/dictionary/model/actions';
import { hydrateSettingsAction } from '@/src/features/settings/model/actions';
import { AppStorage } from '@/src/shared/storage/types';
import { runSync } from './run-sync';
import { registerSyncRunner, runSyncNow, scheduleSync } from './sync-scheduler';

const PERIODIC_SYNC_INTERVAL_MS = 90_000;

const syncBootstrapAtoms = new WeakMap<AppStorage, ReturnType<typeof atom<null>>>();

let syncBootstrapAtomId = 0;

const createSyncBootstrapAtom = (storage: AppStorage) => {
    const syncBootstrapAtom = atom(
        null,
        `syncBootstrapAtom#${++syncBootstrapAtomId}`,
    );

    onConnect(syncBootstrapAtom, (ctx) => {
        const runAndHydrate = async () => {
            try {
                const result = await runSync(storage);

                if (!result.didChangeLocalData) {
                    return;
                }

                await Promise.all([
                    hydrateSettingsAction(ctx, storage),
                    hydrateDictionaryCardsAction(ctx, storage),
                ]);
            } catch (error) {
                console.warn('Sync failed', error);
            }
        };

        const unregisterSyncRunner = registerSyncRunner(runAndHydrate);
        const intervalId = setInterval(() => {
            scheduleSync(0);
        }, PERIODIC_SYNC_INTERVAL_MS);
        const appStateSubscription = AppState.addEventListener(
            'change',
            (nextAppState: AppStateStatus) => {
                if (nextAppState === 'active') {
                    scheduleSync(0);
                }
            },
        );

        const handleWindowOnline = () => {
            scheduleSync(0);
        };

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
            window.addEventListener('online', handleWindowOnline);
        }

        void runSyncNow();

        return () => {
            unregisterSyncRunner();
            clearInterval(intervalId);
            appStateSubscription.remove();

            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.removeEventListener('online', handleWindowOnline);
            }
        };
    });

    return syncBootstrapAtom;
};

export const getSyncBootstrapAtom = (storage: AppStorage) => {
    const existingAtom = syncBootstrapAtoms.get(storage);

    if (existingAtom) {
        return existingAtom;
    }

    const nextAtom = createSyncBootstrapAtom(storage);
    syncBootstrapAtoms.set(storage, nextAtom);

    return nextAtom;
};
