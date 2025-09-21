import { reatomContext } from "@reatom/npm-react";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { reatomCtx } from "../model/atoms";

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName="dictionary.db"
      onInit={async (db) => {
        db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS dictionaryCards (
          id INTEGER PRIMARY KEY NOT NULL,
          card TEXT NOT NULL
        );
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
