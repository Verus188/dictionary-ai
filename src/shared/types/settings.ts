export const persistedStorySettingKeys = {
    chunkLength: 'storyContinuationLength',
    educationLanguage: 'educationLanguage',
    storyLanguageDifficulty: 'storyLanguageDifficulty',
} as const;

export type PersistedStorySettingKey =
    (typeof persistedStorySettingKeys)[keyof typeof persistedStorySettingKeys];

export const persistedStorySettingKeyList = Object.values(persistedStorySettingKeys);
