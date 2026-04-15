import { useEffect, useRef } from 'react';
import { reatomComponent } from '@reatom/npm-react';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { authUserAtom } from '@/src/features/auth/model/atoms';
import { AuthGate } from '@/src/features/auth/ui/AuthGate';
import { initializeApp } from './initialize-app';
import { getUserDatabaseName } from './get-user-database-name';
import { resetUserScopedState } from './reset-user-scoped-state';
import { SyncBootstrap } from './SyncBootstrap';

const RootStack = () => (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
);

export const UserScopedApp = reatomComponent(({ ctx }) => {
    const authUser = ctx.spy(authUserAtom);
    const userId = authUser?.id ?? null;
    const previousUserIdRef = useRef<string | null>(userId);

    useEffect(() => {
        if (previousUserIdRef.current === userId) {
            return;
        }

        resetUserScopedState(ctx);
        previousUserIdRef.current = userId;
    }, [ctx, userId]);

    const appContent = (
        <AuthGate>
            <RootStack />
        </AuthGate>
    );

    if (!userId) {
        return appContent;
    }

    const databaseName = getUserDatabaseName(userId);

    return (
        <SQLiteProvider
            key={databaseName}
            databaseName={databaseName}
            onInit={initializeApp}
            options={{ useNewConnection: false }}
        >
            <SyncBootstrap />
            {appContent}
        </SQLiteProvider>
    );
});
