import { reatomAsync } from '@reatom/async';
import { Ctx } from '@reatom/core';
import { SQLiteDatabase } from 'expo-sqlite';
import { dictionaryCardsRepository } from '@/src/shared/db/repositories/dictionary-cards-repository';
import { dictionaryCardsAtom, isDictionaryCardModalVisibleAtom } from './atoms';

export const hydrateDictionaryCardsAction = reatomAsync(async (ctx, db: SQLiteDatabase) => {
    dictionaryCardsAtom(ctx, await dictionaryCardsRepository.getAll(db));
}, 'hydrateDictionaryCards');

export const addDictionaryCardAction = reatomAsync(async (ctx, db: SQLiteDatabase, card: string) => {
    await dictionaryCardsRepository.save(db, card);
    dictionaryCardsAtom(ctx, await dictionaryCardsRepository.getAll(db));
}, 'addDictionaryCard');

export const deleteDictionaryCardAction = reatomAsync(
    async (ctx, db: SQLiteDatabase, id: string) => {
        await dictionaryCardsRepository.delete(db, id);
        dictionaryCardsAtom(ctx, await dictionaryCardsRepository.getAll(db));
    },
    'deleteDictionaryCard',
);

export const openDictionaryCardModal = (ctx: Ctx) => {
    isDictionaryCardModalVisibleAtom(ctx, true);
};

export const closeDictionaryCardModal = (ctx: Ctx) => {
    isDictionaryCardModalVisibleAtom(ctx, false);
};
