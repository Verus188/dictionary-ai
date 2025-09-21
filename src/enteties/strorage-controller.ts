import * as SQLite from "expo-sqlite";
import { DictionaryCardInfo } from "../model/types";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = (async () => {
      const database = await SQLite.openDatabaseAsync("dictionary.db");

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
    return db.getAllAsync<DictionaryCardInfo>(
      "SELECT * FROM dictionaryCards ORDER BY id DESC"
    );
  },
};

export { storage };
