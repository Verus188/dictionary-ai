import { useEffect, useRef, useState } from 'react';
import { reatomComponent } from '@reatom/npm-react';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { Platform } from 'react-native';
import { authUserAtom, isAuthBootstrapPendingAtom } from '@/src/features/auth/model/atoms';
import { AuthGate } from '@/src/features/auth/ui/AuthGate';
import { AuthLoadingScreen } from '@/src/features/auth/ui/parts/AuthLoadingScreen';
import { getColor } from '@/src/shared/theme/getColor';
import { DatabaseLockedScreen } from './DatabaseLockedScreen';
import { initializeApp } from './initialize-app';
import { getUserDatabaseName } from './get-user-database-name';
import { resetUserScopedState } from './reset-user-scoped-state';
import { SyncBootstrap } from './SyncBootstrap';

const RootStack = () => (
    <Stack
        screenOptions={{
            headerShown: false,
            contentStyle: {
                backgroundColor: getColor('main-bg'),
            },
        }}
    >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
);

export const UserScopedApp = reatomComponent(({ ctx }) => {
    const authUser = ctx.spy(authUserAtom);
    const isAuthBootstrapPending = ctx.spy(isAuthBootstrapPendingAtom);
    const userId = authUser?.id ?? null;
    const previousUserIdRef = useRef<string | null>(userId);
    const [isDatabaseLocked, setIsDatabaseLocked] = useState(false);
    const [isDatabaseReady, setIsDatabaseReady] = useState(false);

    const isDatabaseLockedError = (error: Error) =>
        error.message.includes('createSyncAccessHandle') &&
        error.message.includes('another open Access Handle');

    useEffect(() => {
        if (previousUserIdRef.current === userId) {
            return;
        }

        resetUserScopedState(ctx);
        previousUserIdRef.current = userId;
        setIsDatabaseLocked(false);
        setIsDatabaseReady(false);
    }, [ctx, userId]);

    const appContent = (
        <AuthGate>
            <RootStack />
        </AuthGate>
    );

    if (isAuthBootstrapPending) {
        return <AuthLoadingScreen />;
    }

    if (!userId) {
        return appContent;
    }

    if (isDatabaseLocked) {
        return <DatabaseLockedScreen />;
    }

    const databaseName = getUserDatabaseName(userId);

    return (
        <>
            {!isDatabaseReady ? <AuthLoadingScreen /> : null}
            <SQLiteProvider
                key={databaseName}
                databaseName={databaseName}
                onError={(error) => {
                    if (Platform.OS === 'web' && isDatabaseLockedError(error)) {
                        setIsDatabaseLocked(true);
                        return;
                    }

                    throw error;
                }}
                onInit={async (db) => {
                    await initializeApp(db);
                    setIsDatabaseReady(true);
                }}
                options={{ useNewConnection: false }}
            >
                {isDatabaseReady ? <SyncBootstrap /> : null}
                {isDatabaseReady ? appContent : null}
            </SQLiteProvider>
        </>
    );
});
