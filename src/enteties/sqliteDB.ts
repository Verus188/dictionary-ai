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
}

const sqliteBD = new SQLiteBD();

export default sqliteBD;
