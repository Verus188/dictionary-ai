import { Ctx } from '@reatom/core';
import { dictionaryCardsAtom, isDictionaryCardModalVisibleAtom } from '@/src/features/dictionary/model/atoms';
import {
    defaultStorySettingsState,
    defaultStoryTagsState,
} from '@/src/features/settings/model/constants';
import { storySettingsAtoms, storyTagsAtoms } from '@/src/features/settings/model/atoms';
import {
    isInitStoryLoadingAtom,
    nextStoryChunksResource,
    storyAtom,
    storyChunkAtom,
} from '@/src/features/story/model/atoms';

export const resetUserScopedState = (ctx: Ctx) => {
    dictionaryCardsAtom(ctx, []);
    isDictionaryCardModalVisibleAtom(ctx, false);

    storySettingsAtoms.educationLanguageAtom(ctx, defaultStorySettingsState.educationLanguage);
    storySettingsAtoms.chunkLengthAtom(ctx, defaultStorySettingsState.chunkLength);
    storySettingsAtoms.storyLanguageDifficultyAtom(
        ctx,
        defaultStorySettingsState.storyLanguageDifficulty,
    );
    storySettingsAtoms.storyPromptAtom(ctx, defaultStorySettingsState.storyPrompt);

    storyTagsAtoms.character(ctx, defaultStoryTagsState.character);
    storyTagsAtoms.genres(ctx, [...defaultStoryTagsState.genres]);
    storyTagsAtoms.setting(ctx, defaultStoryTagsState.setting);
    storyTagsAtoms.plotMotif(ctx, defaultStoryTagsState.plotMotif);
    storyTagsAtoms.tone(ctx, defaultStoryTagsState.tone);
    storyTagsAtoms.narrativeStyle(ctx, defaultStoryTagsState.narrativeStyle);

    nextStoryChunksResource.reset(ctx);
    storyChunkAtom(ctx, null);
    storyAtom(ctx, null);
    isInitStoryLoadingAtom(ctx, false);
};
