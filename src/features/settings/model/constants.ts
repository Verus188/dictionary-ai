export const persistedStorySettingKeys = {
    chunkLength: 'storyContinuationLength',
    educationLanguage: 'educationLanguage',
    storyLanguageDifficulty: 'storyLanguageDifficulty',
} as const;

export const defaultPersistedStorySettings: Record<string, string> = {
    [persistedStorySettingKeys.chunkLength]: '800',
    [persistedStorySettingKeys.educationLanguage]: 'English',
    [persistedStorySettingKeys.storyLanguageDifficulty]: '2',
};
