import { reatomAsync } from '@reatom/async';
import { AtomMut } from '@reatom/core';
import { generateId } from '@/src/shared/lib/generate-id';
import { AppStorage } from '@/src/shared/storage/types';
import { enqueueSyncOperation } from '@/src/shared/sync/model/enqueue-sync-operation';
import { scheduleSync } from '@/src/shared/sync/model/sync-scheduler';
import { PersistedStorySettingKey } from '@/src/shared/types/settings';
import {
    defaultPersistedStorySettings,
    defaultStorySettingsState,
    persistedStorySettingKeys,
} from './constants';
import { storySettingsAtoms } from './atoms';

export const hydrateSettingsAction = reatomAsync(async (ctx, storage: AppStorage) => {
    await storage.settings.ensureDefaults(defaultPersistedStorySettings);

    const settings = await storage.settings.getAll();
    const {
        storyLanguageDifficultyAtom,
        educationLanguageAtom,
        chunkLengthAtom,
    } = storySettingsAtoms;

    educationLanguageAtom(ctx, defaultStorySettingsState.educationLanguage);
    chunkLengthAtom(ctx, defaultStorySettingsState.chunkLength);
    storyLanguageDifficultyAtom(ctx, defaultStorySettingsState.storyLanguageDifficulty);

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
        storage: AppStorage,
        settingAtom: AtomMut<string>,
        setting: PersistedStorySettingKey,
        value: string,
    ) => {
        const didUpdate = await storage.settings.update(setting, value);
        settingAtom(ctx, value);

        if (!didUpdate) {
            return;
        }

        await enqueueSyncOperation(storage, {
            clientUpdatedAt: new Date().toISOString(),
            entityId: setting,
            entityType: 'setting',
            operationId: generateId(),
            operationType: 'upsert',
            payload: {
                key: setting,
                value,
            },
        });
        scheduleSync();
    },
    'updatePersistedSetting',
);
