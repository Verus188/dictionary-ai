import { atom } from '@reatom/core';

export const storySettingsAtoms = {
    educationLanguageAtom: atom<string>('English', 'educationLanguageAtom'),
    chunkLengthAtom: atom<string>('800', 'storyChunkLengthAtom'),
    storyLanguageDifficultyAtom: atom<string>('2', 'storyLanguageDifficultyAtom'),
    storyPromptAtom: atom<string>('', 'storyPromptAtom'),
};

export const storyTagsAtoms = {
    character: atom<string | null>('Male protagonist', 'storyTagCharacter'),
    genres: atom<string[]>(['Fantasy'], 'storyTagGenre'),
    setting: atom<string | null>('Middle Ages', 'storyTagSetting'),
    plotMotif: atom<string | null>('Betrayal', 'storyTagPlotMotif'),
    tone: atom<string | null>('Dark story', 'storyTagTone'),
    narrativeStyle: atom<string | null>('First person', 'storyTagNarrativeStyle'),
};
