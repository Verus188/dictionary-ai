import { reatomAsync } from '@reatom/async';
import { Ctx } from '@reatom/core';
import { SQLiteDatabase } from 'expo-sqlite';
import { dictionaryCardsRepository } from '@/src/shared/db/repositories/dictionary-cards-repository';
import { generateId } from '@/src/shared/lib/generate-id';
import { enqueueSyncOperation } from '@/src/shared/sync/model/enqueue-sync-operation';
import { scheduleSync } from '@/src/shared/sync/model/sync-scheduler';
import { dictionaryCardsAtom, isDictionaryCardModalVisibleAtom } from './atoms';

export const hydrateDictionaryCardsAction = reatomAsync(async (ctx, db: SQLiteDatabase) => {
    dictionaryCardsAtom(ctx, await dictionaryCardsRepository.getAll(db));
}, 'hydrateDictionaryCards');

export const addDictionaryCardAction = reatomAsync(async (ctx, db: SQLiteDatabase, card: string) => {
    const nextCard = await dictionaryCardsRepository.createLocal(db, card);

    if (nextCard) {
        await enqueueSyncOperation(db, {
            clientUpdatedAt: nextCard.updatedAt ?? new Date().toISOString(),
            entityId: nextCard.id,
            entityType: 'dictionaryCard',
            operationId: generateId(),
            operationType: 'upsert',
            payload: {
                card: nextCard.card,
                id: nextCard.id,
            },
        });
        scheduleSync();
    }

    dictionaryCardsAtom(ctx, await dictionaryCardsRepository.getAll(db));
}, 'addDictionaryCard');

export const deleteDictionaryCardAction = reatomAsync(
    async (ctx, db: SQLiteDatabase, id: string) => {
        const didDelete = await dictionaryCardsRepository.markDeletedLocally(db, id);

        if (didDelete) {
            await enqueueSyncOperation(db, {
                clientUpdatedAt: new Date().toISOString(),
                entityId: id,
                entityType: 'dictionaryCard',
                operationId: generateId(),
                operationType: 'delete',
                payload: null,
            });
            scheduleSync();
        }

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
