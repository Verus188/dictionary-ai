import { reatomResource, withDataAtom, withStatusesAtom } from '@reatom/async';
import { atom, createCtx } from '@reatom/core';
import { generateStoryChunksAction } from './actions';
import { DictionaryCardInfo, StoryChunk } from './types';

export const reatomCtx = createCtx();

export const dictionaryCardsAtom = atom<DictionaryCardInfo[]>([], 'dictionaryCardsAtom');

export const isCardModalVisibleAtom = atom<boolean>(false, 'isCardModalVisibleAtom');

// хранит всю истории и промпт сюжета
export const storyAtom = atom<string | null>(null, 'storyAtom');

/** Хрнаит отображаемы кусок истории */
export const storyChunkAtom = atom<StoryChunk | null>(null, 'storyChunkAtom');

// export const nextStoryChunksVariantsAtom = atom<StoryChunkVariants | null>(
//     null,
//     'nextStoryChunksVariantsAtom',
// );

/** Ресурс генерации следующих кусков истории */
export const nextStoryChunksResource = reatomResource(async (ctx) => {
    const story = ctx.spy(storyAtom);
    if (!story) return null;

    return ctx.schedule(() => {
        return generateStoryChunksAction(ctx);
    });
}, 'nextStoryChunksResource').pipe(withDataAtom(null), withStatusesAtom());

// Атомы настроек
export const storySettingsAtoms = {
    /** Токен для openRouter */
    openRouterTokenAtom: atom<string>('', 'openRouterTokenAtom'),
    /** Выбранна модель нейросети */
    AIModelAtom: atom<string>('gemeni', 'AIModelAtom'),
    /** язык, который изучается пользователем */
    educationLanguageAtom: atom<string>('English', 'educationLanguageAtom'),
    /** насколько длинные куски истории */
    chunkLengthAtom: atom<string>('800', 'storyChunkLengthAtom'),
    /** насколько сложный язык истории */
    storyLanguageDifficultyAtom: atom<string>('2', 'storyLanguageDifficultyAtom'),
    storyPromptAtom: atom<string>('', 'storyPrompt'),
};

// Атомы настроек сюжета
export const storyTagsAtoms = {
    character: atom<string>('Male protagonist', 'storyTagCharacter'),
    genres: atom<string[]>(['Fantasy'], 'storyTagGenre'),
    setting: atom<string>('Middle Ages', 'storyTagSetting'),
    plotMotif: atom<string>('Betrayal', 'storyTagPlotMotif'),
    tone: atom<string>('Dark story', 'storyTagTone'),
    narrativeStyle: atom<string>('First person', 'storyTagNarrativeStyle'),
};
