import { reatomAsync } from '@reatom/async';
import { AtomMut, Ctx } from '@reatom/core';
import { SQLiteDatabase } from 'expo-sqlite';
import { continueStory, initStory } from '../entities/api/story/story';
import sqliteBD from '../entities/sqliteDB';
import { showErrorToast } from '../components/app-toast';
import {
    dictionaryCardsAtom,
    isInitStoryLoadingAtom,
    nextStoryChunksResource,
    storyAtom,
    storyChunkAtom,
    storySettingsAtoms,
    storyTagsAtoms,
} from './atoms';
import {
    ContinueStoryRequest,
    DictionaryCardInfo,
    DictionaryCardDto,
    InitStoryRequest,
    StorySettings,
    StoryChunkVariants,
} from './types';

const buildStorySettings = (ctx: Ctx): StorySettings => ({
    chunkLength: Number(ctx.get(storySettingsAtoms.chunkLengthAtom)),
    educationLanguage: ctx.get(storySettingsAtoms.educationLanguageAtom),
    storyLanguageDifficulty: Number(ctx.get(storySettingsAtoms.storyLanguageDifficultyAtom)),
    prompt: ctx.get(storySettingsAtoms.storyPromptAtom) || undefined,
    character: ctx.get(storyTagsAtoms.character),
    genres: ctx.get(storyTagsAtoms.genres),
    setting: ctx.get(storyTagsAtoms.setting),
    plotMotif: ctx.get(storyTagsAtoms.plotMotif),
    narrativeStyle: ctx.get(storyTagsAtoms.narrativeStyle),
    tone: ctx.get(storyTagsAtoms.tone),
});

const mapDictionaryCardsToDto = (dictionaryCards: DictionaryCardInfo[]): DictionaryCardDto[] => {
    return dictionaryCards.map((card) => ({
        id: card.id,
        text: card.card,
    }));
};

export const addDictionaryCardAction = reatomAsync(
    async (ctx, db: SQLiteDatabase, card: string) => {
        await sqliteBD.saveCard(db, card);
        dictionaryCardsAtom(ctx, await sqliteBD.getAllCards(db));
    },
);

export const deleteDictionaryCardAction = reatomAsync(
    async (ctx, db: SQLiteDatabase, id: string) => {
        await sqliteBD.deleteCard(db, id);
        dictionaryCardsAtom(ctx, await sqliteBD.getAllCards(db));
    },
);

export const setSettingAction = reatomAsync(
    async (
        ctx,
        db: SQLiteDatabase,
        settingAtom: AtomMut<string>,
        setting: string,
        value: string,
    ) => {
        await sqliteBD.setSetting(db, setting, value);
        settingAtom(ctx, value);
    },
);

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

/**
 * Генерирует продложение истории на основе контекста
 */
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
});
