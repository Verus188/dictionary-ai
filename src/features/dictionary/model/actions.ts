import { reatomAsync } from '@reatom/async';
import { Ctx } from '@reatom/core';
import { generateId } from '@/src/shared/lib/generate-id';
import { AppStorage } from '@/src/shared/storage/types';
import { enqueueSyncOperation } from '@/src/shared/sync/model/enqueue-sync-operation';
import { scheduleSync } from '@/src/shared/sync/model/sync-scheduler';
import { dictionaryCardsAtom, isDictionaryCardModalVisibleAtom } from './atoms';

export const hydrateDictionaryCardsAction = reatomAsync(async (ctx, storage: AppStorage) => {
    dictionaryCardsAtom(ctx, await storage.dictionaryCards.getAll());
}, 'hydrateDictionaryCards');

export const addDictionaryCardAction = reatomAsync(
    async (ctx, storage: AppStorage, card: string) => {
        const nextCard = await storage.dictionaryCards.createLocal(card);

        if (nextCard) {
            await enqueueSyncOperation(storage, {
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

        dictionaryCardsAtom(ctx, await storage.dictionaryCards.getAll());
    },
    'addDictionaryCard',
);

export const deleteDictionaryCardAction = reatomAsync(
    async (ctx, storage: AppStorage, id: string) => {
        const didDelete = await storage.dictionaryCards.markDeletedLocally(id);

        if (didDelete) {
            await enqueueSyncOperation(storage, {
                clientUpdatedAt: new Date().toISOString(),
                entityId: id,
                entityType: 'dictionaryCard',
                operationId: generateId(),
                operationType: 'delete',
                payload: null,
            });
            scheduleSync();
        }

        dictionaryCardsAtom(ctx, await storage.dictionaryCards.getAll());
    },
    'deleteDictionaryCard',
);

export const openDictionaryCardModal = (ctx: Ctx) => {
    isDictionaryCardModalVisibleAtom(ctx, true);
};

export const closeDictionaryCardModal = (ctx: Ctx) => {
    isDictionaryCardModalVisibleAtom(ctx, false);
};
