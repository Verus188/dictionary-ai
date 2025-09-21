import { reatomContext } from "@reatom/npm-react";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { setAIController } from "../enteties/AIController";
import sqliteBD from "../enteties/sqliteDB";
import {
  AIModelAtom,
  educationLanguageAtom,
  openRouterTokenAtom,
  reatomCtx,
  storyContinuationLengthAtom,
  storyLanguageDifficultyAtom,
} from "../model/atoms";

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

        const savedAIModel = settings.AIModel ?? ctx.get(AIModelAtom);
        AIModelAtom(ctx, savedAIModel);
        setAIController(savedAIModel);

        if (settings.openRouterToken !== undefined) {
          openRouterTokenAtom(ctx, settings.openRouterToken ?? "");
        }

        const savedEducationLanguage =
          settings.educationLanguage ?? settings.educationlanguage;
        if (
          savedEducationLanguage !== undefined &&
          savedEducationLanguage !== null
        ) {
          educationLanguageAtom(ctx, savedEducationLanguage);
        }

        if (settings.storyContinuationLength !== undefined) {
          storyContinuationLengthAtom(
            ctx,
            settings.storyContinuationLength ??
              ctx.get(storyContinuationLengthAtom)
          );
        }

        if (settings.storyLanguageDifficulty !== undefined) {
          storyLanguageDifficultyAtom(
            ctx,
            settings.storyLanguageDifficulty ??
              ctx.get(storyLanguageDifficultyAtom)
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
