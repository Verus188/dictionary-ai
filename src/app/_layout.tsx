import { reatomContext } from "@reatom/npm-react";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { reatomCtx } from "../model/atoms";

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName="dictionary.db"
      onInit={async (db) => {
        await db.execAsync(`
        PRAGMA journal_mode = WAL;
        DROP TABLE IF EXISTS dictionaryCards;
        DROP TABLE IF EXISTS settings;
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
