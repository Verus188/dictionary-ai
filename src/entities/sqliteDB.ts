import { SQLiteDatabase } from 'expo-sqlite';
import { DictionaryCardInfo } from '../model/types';

class SQLiteBD {
    getAllCards = async (db: SQLiteDatabase): Promise<DictionaryCardInfo[]> => {
        return db.getAllAsync('SELECT * FROM dictionaryCards order by card ');
    };

    saveCard = async (db: SQLiteDatabase, card: string): Promise<void> => {
        const normalizedCard = card.trim().toLowerCase();

        await db.runAsync(
            `
                INSERT INTO dictionaryCards (card)
                SELECT ?
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM dictionaryCards
                    WHERE TRIM(card) = ?
                )
            `,
            [normalizedCard, normalizedCard],
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
