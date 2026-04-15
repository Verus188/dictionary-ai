import { SQLiteDatabase } from 'expo-sqlite';
import { dictionaryCardsRepository } from '@/src/shared/db/repositories/dictionary-cards-repository';
import { settingsRepository } from '@/src/shared/db/repositories/settings-repository';
import { syncOutboxRepository } from '@/src/shared/sync/db/outbox-repository';
import { syncStateRepository } from '@/src/shared/sync/db/sync-state-repository';

export const initializeDatabase = async (db: SQLiteDatabase) => {
    await db.execAsync(`
        PRAGMA journal_mode = WAL;
    `);

    await settingsRepository.ensureTable(db);
    await dictionaryCardsRepository.ensureTable(db);
    await syncOutboxRepository.ensureTable(db);
    await syncStateRepository.ensureTable(db);
};
