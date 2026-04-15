import { persistedStorySettingKeys } from '@/src/shared/types/settings';
export { persistedStorySettingKeys } from '@/src/shared/types/settings';

export const defaultStorySettingsState = {
    chunkLength: '800',
    educationLanguage: 'English',
    storyLanguageDifficulty: '2',
    storyPrompt: '',
} as const;

export const defaultPersistedStorySettings: Record<string, string> = {
    [persistedStorySettingKeys.chunkLength]: defaultStorySettingsState.chunkLength,
    [persistedStorySettingKeys.educationLanguage]: defaultStorySettingsState.educationLanguage,
    [persistedStorySettingKeys.storyLanguageDifficulty]:
        defaultStorySettingsState.storyLanguageDifficulty,
};

export const defaultStoryTagsState = {
    character: 'Male protagonist',
    genres: ['Fantasy'],
    setting: 'Middle Ages',
    plotMotif: 'Betrayal',
    tone: 'Dark story',
    narrativeStyle: 'First person',
} as const;
