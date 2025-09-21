import { action } from "@reatom/core";
import { SQLiteDatabase } from "expo-sqlite";
import sqliteBD from "../enteties/sqliteDB";
import { dictionaryCardsAtom } from "./atoms";

export const addDictionaryCard = action(
  async (ctx, db: SQLiteDatabase, card: string) => {
    await sqliteBD.saveCard(db, card);
    dictionaryCardsAtom(ctx, await sqliteBD.getAllCards(db));
  }
);

export const deleteDictionaryCard = action(
  async (ctx, db: SQLiteDatabase, id: string) => {
    await sqliteBD.deleteCard(db, id);
    dictionaryCardsAtom(ctx, await sqliteBD.getAllCards(db));
  }
);
