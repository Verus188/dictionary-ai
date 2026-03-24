import { SQLiteDatabase } from 'expo-sqlite';
import { hydrateDictionaryCardsAction } from '@/src/features/dictionary/model/actions';
import { hydrateSettingsAction } from '@/src/features/settings/model/actions';
import { reatomCtx } from '@/src/app/providers/reatom';
import { initializeDatabase } from '@/src/shared/db/bootstrap';

export const initializeApp = async (db: SQLiteDatabase) => {
    await initializeDatabase(db);

    await hydrateSettingsAction(reatomCtx, db);
    await hydrateDictionaryCardsAction(reatomCtx, db);
};
