import { SQLiteDatabase } from 'expo-sqlite';
import { generateId } from '@/src/shared/lib/generate-id';
import { DictionaryCard } from '@/src/shared/types/dictionary';

const DICTIONARY_CARDS_TABLE = 'dictionaryCards';

export const dictionaryCardsRepository = {
    async ensureTable(db: SQLiteDatabase): Promise<void> {
        const tableInfo = await db.getAllAsync<{
            name: string;
            pk: number;
            type: string;
        }>(`PRAGMA table_info(${DICTIONARY_CARDS_TABLE})`);

        if (tableInfo.length === 0) {
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS ${DICTIONARY_CARDS_TABLE} (
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
            ALTER TABLE ${DICTIONARY_CARDS_TABLE} RENAME TO ${DICTIONARY_CARDS_TABLE}_old;

            CREATE TABLE ${DICTIONARY_CARDS_TABLE} (
                id TEXT PRIMARY KEY NOT NULL,
                card TEXT NOT NULL
            );

            INSERT INTO ${DICTIONARY_CARDS_TABLE} (id, card)
            SELECT CAST(id AS TEXT), card
            FROM ${DICTIONARY_CARDS_TABLE}_old;

            DROP TABLE ${DICTIONARY_CARDS_TABLE}_old;
        `);
    },

    async getAll(db: SQLiteDatabase): Promise<DictionaryCard[]> {
        const rows = await db.getAllAsync<{
            id: string | number;
            card: string;
        }>(`SELECT id, card FROM ${DICTIONARY_CARDS_TABLE} ORDER BY card`);

        return rows.map((row) => ({
            ...row,
            id: String(row.id),
        }));
    },

    async save(db: SQLiteDatabase, card: string): Promise<void> {
        const normalizedCard = card.trim().toLowerCase();

        await db.runAsync(
            `
                INSERT INTO ${DICTIONARY_CARDS_TABLE} (id, card)
                SELECT ?, ?
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM ${DICTIONARY_CARDS_TABLE}
                    WHERE TRIM(card) = ?
                )
            `,
            [generateId(), normalizedCard, normalizedCard],
        );
    },

    async delete(db: SQLiteDatabase, id: string): Promise<void> {
        await db.runAsync(`DELETE FROM ${DICTIONARY_CARDS_TABLE} WHERE id = ?`, [id]);
    },
};
