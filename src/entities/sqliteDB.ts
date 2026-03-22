import { SQLiteDatabase } from 'expo-sqlite';
import { generateId } from '../helpers/generate-id';
import { DictionaryCardInfo } from '../model/types';

class SQLiteBD {
    ensureDictionaryCardsTable = async (db: SQLiteDatabase): Promise<void> => {
        const tableInfo = await db.getAllAsync<{
            name: string;
            pk: number;
            type: string;
        }>('PRAGMA table_info(dictionaryCards)');

        if (tableInfo.length === 0) {
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS dictionaryCards (
                    id TEXT PRIMARY KEY NOT NULL,
                    card TEXT NOT NULL
                );
            `);

            return;
        }

        const idColumn = tableInfo.find((column) => column.name === 'id');
        const normalizedIdType = idColumn?.type?.toUpperCase() ?? '';

        if (normalizedIdType === 'TEXT' && idColumn?.pk === 1) {
            return;
        }

        await db.execAsync(`
            ALTER TABLE dictionaryCards RENAME TO dictionaryCards_old;

            CREATE TABLE dictionaryCards (
                id TEXT PRIMARY KEY NOT NULL,
                card TEXT NOT NULL
            );

            INSERT INTO dictionaryCards (id, card)
            SELECT CAST(id AS TEXT), card
            FROM dictionaryCards_old;

            DROP TABLE dictionaryCards_old;
        `);
    };

    getAllCards = async (db: SQLiteDatabase): Promise<DictionaryCardInfo[]> => {
        const rows = await db.getAllAsync<{
            id: string | number;
            card: string;
        }>('SELECT id, card FROM dictionaryCards ORDER BY card');

        return rows.map((row) => ({
            ...row,
            id: String(row.id),
        }));
    };

    saveCard = async (db: SQLiteDatabase, card: string): Promise<void> => {
        const normalizedCard = card.trim().toLowerCase();

        await db.runAsync(
            `
                INSERT INTO dictionaryCards (id, card)
                SELECT ?, ?
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM dictionaryCards
                    WHERE TRIM(card) = ?
                )
            `,
            [generateId(), normalizedCard, normalizedCard],
        );
    };

    deleteCard = async (db: SQLiteDatabase, id: string): Promise<void> => {
        await db.runAsync('DELETE FROM dictionaryCards WHERE id = ?', [id]);
    };

    setSetting = async (db: SQLiteDatabase, setting: string, value: string | null) => {
        await db.runAsync('UPDATE settings SET value = ? WHERE setting = ?', [value, setting]);
    };

    getSettings = async (db: SQLiteDatabase): Promise<Record<string, string | null>> => {
        const rows = await db.getAllAsync<{
            setting: string;
            value: string | null;
        }>('SELECT setting, value FROM settings');

        return rows.reduce<Record<string, string | null>>((acc, { setting, value }) => {
            acc[setting] = value;
            return acc;
        }, {});
    };
}

const sqliteBD = new SQLiteBD();

export default sqliteBD;
