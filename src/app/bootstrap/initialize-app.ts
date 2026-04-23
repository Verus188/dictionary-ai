import { hydrateDictionaryCardsAction } from '@/src/features/dictionary/model/actions';
import { hydrateSettingsAction } from '@/src/features/settings/model/actions';
import { reatomCtx } from '@/src/app/providers/reatom';
import { AppStorage } from '@/src/shared/storage/types';

export const initializeApp = async (storage: AppStorage) => {
    await storage.initialize();
    await hydrateSettingsAction(reatomCtx, storage);
    await hydrateDictionaryCardsAction(reatomCtx, storage);
};
