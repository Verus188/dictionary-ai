import { reatomAsync } from '@reatom/async';
import { action, AtomMut } from '@reatom/core';
import { SQLiteDatabase } from 'expo-sqlite';
import { AIController } from '../enteties/AIController';
import sqliteBD from '../enteties/sqliteDB';
import { getStoryActionsPrompt } from '../prompts/get-story-actions-prompt';
import { getStoryContinuationPrompt } from '../prompts/get-story-continuation-prompt';
import { getStoryInitializationPrompt } from '../prompts/get-story-initialization-prompt';
import { storyActionsSystemPrompt } from '../prompts/story-actions-system-prompt';
import { storyContinuationSystemPrompt } from '../prompts/story-continuation-system-prompt';
import { storyInitializationSystemPrompt } from '../prompts/story-initialization-system-prompt';
import {
    dictionaryCardsAtom,
    storyAtom,
    storyChunkAtom,
    storySettingsAtoms,
    storyTagsAtoms,
} from './atoms';
import { ChunkActions, StoryChunk, StoryChunkVariants } from './types';

export const addDictionaryCardAction = action(async (ctx, db: SQLiteDatabase, card: string) => {
    await sqliteBD.saveCard(db, card);
    dictionaryCardsAtom(ctx, await sqliteBD.getAllCards(db));
});

export const deleteDictionaryCardAction = action(async (ctx, db: SQLiteDatabase, id: string) => {
    await sqliteBD.deleteCard(db, id);
    dictionaryCardsAtom(ctx, await sqliteBD.getAllCards(db));
});

export const setSettingAction = action(
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
    const response = (
        await AIController.generateAIText(
            getStoryInitializationPrompt(
                storyInitializationSystemPrompt,
                ctx.get(storySettingsAtoms.chunkLengthAtom),
                ctx.get(storySettingsAtoms.educationLanguageAtom),
                ctx.get(storySettingsAtoms.storyLanguageDifficultyAtom),
                ctx.get(dictionaryCardsAtom),
                ctx.get(storySettingsAtoms.storyPromptAtom),
                ctx.get(storyTagsAtoms.character),
                ctx.get(storyTagsAtoms.genres),
                ctx.get(storyTagsAtoms.setting),
                ctx.get(storyTagsAtoms.plotMotif),
                ctx.get(storyTagsAtoms.narrativeStyle),
                ctx.get(storyTagsAtoms.tone),
            ),
        )
    )
        .replace(/```json|```/g, '')
        .trim();

    try {
        const chunk = JSON.parse(response) as StoryChunk;
        storyAtom(ctx, chunk.text);
        storyChunkAtom(ctx, chunk);
    } catch (error) {
        console.error(error);
        throw new Error('Error generating story');
    }
}, 'initStory');

/**
 * Генерирует продложение истории на основе контекста
 */
export const generateStoryChunksAction = reatomAsync(async (ctx): Promise<StoryChunkVariants> => {
    const chunk = ctx.get(storyChunkAtom);

    if (!chunk) {
        throw new Error('No story found');
    }

    const response = (
        await AIController.generateAIText(
            getStoryContinuationPrompt(
                ctx.get(storyAtom) || '',
                storyContinuationSystemPrompt,
                chunk.actions,
                ctx.get(storySettingsAtoms.chunkLengthAtom),
                ctx.get(storySettingsAtoms.educationLanguageAtom),
                ctx.get(storySettingsAtoms.storyLanguageDifficultyAtom),
                ctx.get(dictionaryCardsAtom),
            ),
        )
    )
        .replace(/```json|```/g, '')
        .trim();

    try {
        return JSON.parse(response) as StoryChunkVariants;
    } catch (error) {
        console.error(error);
        throw new Error('Error generating story');
    }
});

/**
 * Генерирует два действия, которые может совершить читатель на основе переданного контекста
 * Работает только в рамка nextStoryChunksResource
 */
export const generateStoryActionsAction = reatomAsync(async (ctx): Promise<ChunkActions> => {
    const story = ctx.get(storyAtom);
    try {
        if (!story) {
            throw new Error('No story found');
        }

        const response = (
            await AIController.generateAIText(
                getStoryActionsPrompt(
                    story,
                    storyActionsSystemPrompt,
                    ctx.get(storySettingsAtoms.chunkLengthAtom),
                    ctx.get(storySettingsAtoms.educationLanguageAtom),
                    ctx.get(storySettingsAtoms.storyLanguageDifficultyAtom),
                    ctx.get(dictionaryCardsAtom),
                ),
            )
        )
            .replace(/```json|```/g, '')
            .trim();
        console.log('response', response);

        return JSON.parse(response) as ChunkActions;
    } catch (error) {
        console.error(error);
        throw new Error('Error generating actions');
    }
});
