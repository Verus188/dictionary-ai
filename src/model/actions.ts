import { action, AtomMut } from "@reatom/core";
import { SQLiteDatabase } from "expo-sqlite";
import sqliteBD from "../enteties/sqliteDB";
import { dictionaryCardsAtom } from "./atoms";

export const addDictionaryCardAction = action(
  async (ctx, db: SQLiteDatabase, card: string) => {
    await sqliteBD.saveCard(db, card);
    dictionaryCardsAtom(ctx, await sqliteBD.getAllCards(db));
  }
);

export const deleteDictionaryCardAction = action(
  async (ctx, db: SQLiteDatabase, id: string) => {
    await sqliteBD.deleteCard(db, id);
    dictionaryCardsAtom(ctx, await sqliteBD.getAllCards(db));
  }
);

export const setSettingAction = action(
  async (
    ctx,
    db: SQLiteDatabase,
    settingAtom: AtomMut<string>,
    setting: string,
    value: string
  ) => {
    await sqliteBD.setSetting(db, setting, value);
    settingAtom(ctx, value);
  }
);
