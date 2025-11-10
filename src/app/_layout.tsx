import { reatomContext } from '@reatom/npm-react';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { setAIController } from '../enteties/AIController';
import sqliteBD from '../enteties/sqliteDB';
import { reatomCtx, storySettingsAtoms } from '../model/atoms';

// DELETE FROM dictionaryCards;
// DELETE FROM settings;
export default function RootLayout() {
    return (
        <SQLiteProvider
            databaseName="dictionary.db"
            onInit={async (db) => {
                await db.execAsync(`
        PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS dictionaryCards (
            id INTEGER PRIMARY KEY NOT NULL,
            card TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS settings (
            setting TEXT PRIMARY KEY NOT NULL,
            value TEXT
          );
          INSERT INTO settings (setting, value) VALUES 
          ('AIModel', 'gemeni'),
          ('openRouterToken', NULL),
          ('storyContinuationLength', '800'),
          ('educationLanguage', 'English'),
          ('storyLanguageDifficulty', '2')
          ON CONFLICT(setting) DO NOTHING;
        `);

                const settings = await sqliteBD.getSettings(db);

                const ctx = reatomCtx;

                const {
                    storyLanguageDifficultyAtom: storyLanguageDifficulty,
                    educationLanguageAtom: educationLanguage,
                    openRouterTokenAtom: openRouterToken,
                    AIModelAtom: AIModel,
                    chunkLengthAtom: chunkLength,
                } = storySettingsAtoms;

                const savedAIModel = settings.AIModel ?? ctx.get(AIModel);
                AIModel(ctx, savedAIModel);
                setAIController(savedAIModel);

                if (settings.openRouterToken !== undefined) {
                    openRouterToken(ctx, settings.openRouterToken ?? '');
                }

                const savedEducationLanguage =
                    settings.educationLanguage ?? settings.educationlanguage;
                if (savedEducationLanguage !== undefined && savedEducationLanguage !== null) {
                    educationLanguage(ctx, savedEducationLanguage);
                }

                if (settings.storyContinuationLength !== undefined) {
                    chunkLength(ctx, settings.storyContinuationLength ?? ctx.get(chunkLength));
                }

                if (settings.storyLanguageDifficulty !== undefined) {
                    storyLanguageDifficulty(
                        ctx,
                        settings.storyLanguageDifficulty ?? ctx.get(storyLanguageDifficulty),
                    );
                }
            }}
            options={{ useNewConnection: false }}
        >
            <reatomContext.Provider value={reatomCtx}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
            </reatomContext.Provider>
        </SQLiteProvider>
    );
}
