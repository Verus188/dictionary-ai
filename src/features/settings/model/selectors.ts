import { Ctx } from '@reatom/core';
import { StorySettings } from '@/src/shared/types/story';
import { storySettingsAtoms, storyTagsAtoms } from './atoms';

const normalizeOptionalSetting = (value: string | null): string | null => {
    const normalizedValue = value?.trim() ?? '';

    return normalizedValue === '' ? null : normalizedValue;
};

export const buildStorySettings = (ctx: Ctx): StorySettings => ({
    chunkLength: Number(ctx.get(storySettingsAtoms.chunkLengthAtom)),
    educationLanguage: ctx.get(storySettingsAtoms.educationLanguageAtom),
    storyLanguageDifficulty: Number(ctx.get(storySettingsAtoms.storyLanguageDifficultyAtom)),
    prompt: ctx.get(storySettingsAtoms.storyPromptAtom) || undefined,
    character: normalizeOptionalSetting(ctx.get(storyTagsAtoms.character)),
    genres: ctx.get(storyTagsAtoms.genres),
    setting: normalizeOptionalSetting(ctx.get(storyTagsAtoms.setting)),
    plotMotif: normalizeOptionalSetting(ctx.get(storyTagsAtoms.plotMotif)),
    narrativeStyle: normalizeOptionalSetting(ctx.get(storyTagsAtoms.narrativeStyle)),
    tone: normalizeOptionalSetting(ctx.get(storyTagsAtoms.tone)),
});
