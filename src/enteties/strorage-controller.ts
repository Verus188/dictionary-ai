import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

type DictionaryCardRow = {
  id: number;
  card: string;
};

function resolveDatabaseDirectory() {
  const defaultDirectory = SQLite.defaultDatabaseDirectory;

  if (typeof defaultDirectory === "string" && defaultDirectory.length > 0) {
    return defaultDirectory;
  }

  if (Platform.OS === "web") {
    return ".";
  }

  const documentDirectory = FileSystem.Paths.document.uri.replace(/\/*$/, "");

  if (!documentDirectory) {
    throw new Error(
      "expo-file-system failed to provide a document directory for SQLite"
    );
  }

  return `${documentDirectory}/SQLite`;
}

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = (async () => {
      const directory = resolveDatabaseDirectory();
      const database = await SQLite.openDatabaseAsync(
        "dictionary.db",
        undefined,
        directory
      );

      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS dictionaryCards (
          id INTEGER PRIMARY KEY NOT NULL,
          card TEXT NOT NULL
        );
      `);

      return database;
    })();
  }

  return databasePromise;
}

const storage = {
  async saveCard(card: string) {
    const db = await getDatabase();
    await db.runAsync("INSERT INTO dictionaryCards (card) VALUES (?)", [card]);
  },

  async getAllCards() {
    const db = await getDatabase();
    return db.getAllAsync<DictionaryCardRow>(
      "SELECT * FROM dictionaryCards ORDER BY id DESC"
    );
  },
};

export { storage };
