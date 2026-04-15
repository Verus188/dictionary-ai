import { useEffect } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { hydrateDictionaryCardsAction } from '@/src/features/dictionary/model/actions';
import { hydrateSettingsAction } from '@/src/features/settings/model/actions';
import { reatomCtx } from '@/src/app/providers/reatom';
import { runSync } from '@/src/shared/sync/model/run-sync';
import { registerSyncRunner, runSyncNow, scheduleSync } from '@/src/shared/sync/model/sync-scheduler';

const PERIODIC_SYNC_INTERVAL_MS = 90_000;

export const SyncBootstrap = () => {
    const db = useSQLiteContext();

    useEffect(() => {
        const runAndHydrate = async () => {
            try {
                const result = await runSync(db);

                if (!result.didChangeLocalData) {
                    return;
                }

                await Promise.all([
                    hydrateSettingsAction(reatomCtx, db),
                    hydrateDictionaryCardsAction(reatomCtx, db),
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
    }, [db]);

    return null;
};
