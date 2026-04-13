import { reatomContext } from '@reatom/npm-react';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { initializeApp } from '@/src/app/bootstrap/initialize-app';
import { reatomCtx } from '@/src/app/providers/reatom';
import { AuthGate } from '@/src/features/auth/ui/AuthGate';
import { AppToast } from '@/src/shared/ui/AppToast';
import '../global.css';

export default function RootLayout() {
    return (
        <SQLiteProvider
            databaseName="dictionary.db"
            onInit={initializeApp}
            options={{ useNewConnection: false }}
        >
            <reatomContext.Provider value={reatomCtx}>
                <AuthGate>
                    <Stack>
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="login" options={{ headerShown: false }} />
                        <Stack.Screen name="register" options={{ headerShown: false }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    </Stack>
                </AuthGate>
                <AppToast />
            </reatomContext.Provider>
        </SQLiteProvider>
    );
}
