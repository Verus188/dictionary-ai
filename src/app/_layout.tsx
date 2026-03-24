import { reatomContext } from '@reatom/npm-react';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { initializeApp } from '@/src/app/bootstrap/initialize-app';
import { reatomCtx } from '@/src/app/providers/reatom';
import { AppToast } from '@/src/shared/ui/AppToast';

export default function RootLayout() {
    return (
        <SQLiteProvider
            databaseName="dictionary.db"
            onInit={initializeApp}
            options={{ useNewConnection: false }}
        >
            <reatomContext.Provider value={reatomCtx}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
                <AppToast />
            </reatomContext.Provider>
        </SQLiteProvider>
    );
}
