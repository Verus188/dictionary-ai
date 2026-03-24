import { reatomAsync } from '@reatom/async';
import { AtomMut } from '@reatom/core';
import { SQLiteDatabase } from 'expo-sqlite';
import { settingsRepository } from '@/src/shared/db/repositories/settings-repository';
import { defaultPersistedStorySettings, persistedStorySettingKeys } from './constants';
import { storySettingsAtoms } from './atoms';

export const hydrateSettingsAction = reatomAsync(async (ctx, db: SQLiteDatabase) => {
    await settingsRepository.ensureDefaults(db, defaultPersistedStorySettings);

    const settings = await settingsRepository.getAll(db);
    const {
        storyLanguageDifficultyAtom,
        educationLanguageAtom,
        chunkLengthAtom,
    } = storySettingsAtoms;

    const savedEducationLanguage = settings.educationLanguage ?? settings.educationlanguage;
    if (savedEducationLanguage !== undefined && savedEducationLanguage !== null) {
        educationLanguageAtom(ctx, savedEducationLanguage);
    }

    if (settings[persistedStorySettingKeys.chunkLength] !== undefined) {
        chunkLengthAtom(
            ctx,
            settings[persistedStorySettingKeys.chunkLength] ?? ctx.get(chunkLengthAtom),
        );
    }

    if (settings[persistedStorySettingKeys.storyLanguageDifficulty] !== undefined) {
        storyLanguageDifficultyAtom(
            ctx,
            settings[persistedStorySettingKeys.storyLanguageDifficulty] ??
                ctx.get(storyLanguageDifficultyAtom),
        );
    }
}, 'hydrateSettings');

export const updatePersistedSettingAction = reatomAsync(
    async (
        ctx,
        db: SQLiteDatabase,
        settingAtom: AtomMut<string>,
        setting: string,
        value: string,
    ) => {
        await settingsRepository.update(db, setting, value);
        settingAtom(ctx, value);
    },
    'updatePersistedSetting',
);
