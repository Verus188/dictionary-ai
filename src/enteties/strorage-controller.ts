import * as SQLite from "expo-sqlite";

const db = await SQLite.openDatabaseAsync("dictionary");

await db.execAsync(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS dictionaryCards (id INTEGER PRIMARY KEY NOT NULL, card TEXT NOT NULL);
`);

const storage = {
  async saveCard(card: string) {
    await db.runAsync("INSERT INTO dictionaryCards (card) VALUES (?)", card);
  },

  async getAllCards() {
    return await db.getAllAsync<{ id: number; card: string }>(
      "SELECT * FROM dictionaryCards ORDER BY id DESC"
    );
  },
};

export { storage };
