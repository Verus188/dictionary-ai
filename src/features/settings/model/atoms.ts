import { atom } from '@reatom/core';
import { defaultStorySettingsState, defaultStoryTagsState } from './constants';

export const storySettingsAtoms = {
    educationLanguageAtom: atom<string>(
        defaultStorySettingsState.educationLanguage,
        'educationLanguageAtom',
    ),
    chunkLengthAtom: atom<string>(defaultStorySettingsState.chunkLength, 'storyChunkLengthAtom'),
    storyLanguageDifficultyAtom: atom<string>(
        defaultStorySettingsState.storyLanguageDifficulty,
        'storyLanguageDifficultyAtom',
    ),
    storyPromptAtom: atom<string>(defaultStorySettingsState.storyPrompt, 'storyPromptAtom'),
};

export const storyTagsAtoms = {
    character: atom<string | null>(defaultStoryTagsState.character, 'storyTagCharacter'),
    genres: atom<string[]>([...defaultStoryTagsState.genres], 'storyTagGenre'),
    setting: atom<string | null>(defaultStoryTagsState.setting, 'storyTagSetting'),
    plotMotif: atom<string | null>(defaultStoryTagsState.plotMotif, 'storyTagPlotMotif'),
    tone: atom<string | null>(defaultStoryTagsState.tone, 'storyTagTone'),
    narrativeStyle: atom<string | null>(
        defaultStoryTagsState.narrativeStyle,
        'storyTagNarrativeStyle',
    ),
};
