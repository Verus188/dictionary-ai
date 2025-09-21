import { SQLiteDatabase } from "expo-sqlite";
import { DictionaryCardInfo } from "../model/types";

class SQLiteBD {
  getAllCards = async (db: SQLiteDatabase): Promise<DictionaryCardInfo[]> => {
    return db.getAllAsync("SELECT * FROM dictionaryCards order by card ");
  };

  saveCard = async (db: SQLiteDatabase, card: string): Promise<void> => {
    db.runAsync("INSERT INTO dictionaryCards (card) VALUES (?)", [card]);
  };

  deleteCard = async (db: SQLiteDatabase, id: string): Promise<void> => {
    db.runAsync("DELETE FROM dictionaryCards WHERE id = ?", [id]);
  };

  setSetting = async (
    db: SQLiteDatabase,
    setting: string,
    value: string | null
  ) => {
    db.runAsync("UPDATE settings WHERE setting = ? SET value = ?", [
      setting,
      value,
    ]);
  };
}

const sqliteBD = new SQLiteBD();

export default sqliteBD;
