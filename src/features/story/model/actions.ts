import { reatomAsync } from '@reatom/async';
import { Ctx } from '@reatom/core';
import { continueStory, initStory } from '@/src/shared/api/story/client';
import { DictionaryCard } from '@/src/shared/types/dictionary';
import {
    ContinueStoryRequest,
    DictionaryCardDto,
    InitStoryRequest,
    StoryChunk,
    StoryChunkVariants,
} from '@/src/shared/types/story';
import { showErrorToast } from '@/src/shared/ui/AppToast';
import { dictionaryCardsAtom } from '@/src/features/dictionary/model/atoms';
import { buildStorySettings } from '@/src/features/settings/model/selectors';
import {
    isInitStoryLoadingAtom,
    nextStoryChunksResource,
    storyAtom,
    storyChunkAtom,
} from './atoms';

const mapDictionaryCardsToDto = (dictionaryCards: DictionaryCard[]): DictionaryCardDto[] => {
    return dictionaryCards.map((card) => ({
        id: card.id,
        text: card.card,
    }));
};

export const initStoryAction = reatomAsync(async (ctx) => {
    isInitStoryLoadingAtom(ctx, true);

    try {
        const payload: InitStoryRequest = {
            settings: buildStorySettings(ctx),
            cards: mapDictionaryCardsToDto(ctx.get(dictionaryCardsAtom)),
        };

        const chunk = await initStory(payload);
        storyAtom(ctx, chunk.text);
        storyChunkAtom(ctx, chunk);
        nextStoryChunksResource(ctx);

        return chunk;
    } catch (error) {
        console.error(error);
        showErrorToast('Не удалось сгенерировать историю');
        throw new Error('Error generating story');
    } finally {
        isInitStoryLoadingAtom(ctx, false);
    }
}, 'initStory');

export const generateStoryChunksAction = reatomAsync(async (ctx): Promise<StoryChunkVariants> => {
    try {
        const chunk = ctx.get(storyChunkAtom);
        const story = ctx.get(storyAtom);

        if (!chunk || !story) {
            throw new Error('No story found');
        }

        const payload: ContinueStoryRequest = {
            story,
            actions: chunk.actions,
            settings: buildStorySettings(ctx),
            cards: mapDictionaryCardsToDto(ctx.get(dictionaryCardsAtom)),
        };

        return continueStory(payload);
    } catch (error) {
        console.error(error);
        showErrorToast('Не удалось сгенерировать продолжение истории');
        throw new Error('Error generating story');
    }
}, 'generateStoryChunks');

export const chooseStoryContinuationAction = (ctx: Ctx, continuation?: StoryChunk) => {
    if (continuation) {
        storyAtom(ctx, (prev) => {
            if (!prev) {
                return continuation.text;
            }

            return `${prev}\n${continuation.text}`;
        });
        storyChunkAtom(ctx, continuation);
    }

    const story = ctx.get(storyAtom);

    if (!story) {
        return;
    }

    nextStoryChunksResource(ctx);
};

export const resetStoryAction = (ctx: Ctx) => {
    nextStoryChunksResource.reset(ctx);
    storyChunkAtom(ctx, null);
    storyAtom(ctx, null);
};
