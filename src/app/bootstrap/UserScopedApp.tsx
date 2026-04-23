import { authUserAtom, isAuthBootstrapPendingAtom } from '@/src/features/auth/model/atoms';
import { authBootstrapAtom } from '@/src/features/auth/model/bootstrap';
import { AuthGate } from '@/src/features/auth/ui/AuthGate';
import { AuthLoadingScreen } from '@/src/features/auth/ui/parts/AuthLoadingScreen';
import { AppStorageContext } from '@/src/shared/storage/context';
import { createMobileAppStorage } from '@/src/shared/storage/mobile/create-mobile-app-storage';
import { AppStorage } from '@/src/shared/storage/types';
import { getColor } from '@/src/shared/theme/getColor';
import { reatomComponent } from '@reatom/npm-react';
import { Stack } from 'expo-router';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { PropsWithChildren, Suspense, use, useRef } from 'react';
import { Platform } from 'react-native';
import { getUserDatabaseName } from './get-user-database-name';
import { initializeApp } from './initialize-app';
import './model';
import { SyncBootstrap } from './SyncBootstrap';
import { getWebStoragePromise } from './web-storage-cache';

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

const MobileStorageBridge = ({ children }: PropsWithChildren) => {
    const db = useSQLiteContext();
    const storageRef = useRef<{
        db: ReturnType<typeof useSQLiteContext>;
        storage: AppStorage;
    } | null>(null);

    if (!storageRef.current || storageRef.current.db !== db) {
        storageRef.current = {
            db,
            storage: createMobileAppStorage(db),
        };
    }

    return (
        <AppStorageContext.Provider value={storageRef.current.storage}>
            {children}
        </AppStorageContext.Provider>
    );
};

const WebStorageBridge = reatomComponent<PropsWithChildren & { databaseName: string }>(
    ({ children, databaseName }) => {
        const storage = use(getWebStoragePromise(databaseName));

        return <AppStorageContext.Provider value={storage}>{children}</AppStorageContext.Provider>;
    },
);

export const UserScopedApp = reatomComponent(({ ctx }) => {
    ctx.spy(authBootstrapAtom);
    const authUser = ctx.spy(authUserAtom);
    const isAuthBootstrapPending = ctx.spy(isAuthBootstrapPendingAtom);
    const userId = authUser?.id ?? null;

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

    const databaseName = getUserDatabaseName(userId);

    if (Platform.OS === 'web') {
        return (
            <Suspense fallback={<AuthLoadingScreen />}>
                <WebStorageBridge databaseName={databaseName}>
                    <SyncBootstrap>{appContent}</SyncBootstrap>
                </WebStorageBridge>
            </Suspense>
        );
    }

    return (
        <Suspense fallback={<AuthLoadingScreen />}>
            <SQLiteProvider
                key={databaseName}
                databaseName={databaseName}
                onInit={async (db) => {
                    await initializeApp(createMobileAppStorage(db));
                }}
                options={{ useNewConnection: false }}
                useSuspense
            >
                <MobileStorageBridge>
                    <SyncBootstrap>{appContent}</SyncBootstrap>
                </MobileStorageBridge>
            </SQLiteProvider>
        </Suspense>
    );
});
