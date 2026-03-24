import { SQLiteDatabase } from 'expo-sqlite';
import { dictionaryCardsRepository } from '@/src/shared/db/repositories/dictionary-cards-repository';

export const initializeDatabase = async (db: SQLiteDatabase) => {
    await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS settings (
            setting TEXT PRIMARY KEY NOT NULL,
            value TEXT
        );
    `);

    await dictionaryCardsRepository.ensureTable(db);
};
