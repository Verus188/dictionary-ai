import { SQLiteDatabase } from 'expo-sqlite';
import { generateId } from '@/src/shared/lib/generate-id';
import { DictionaryCardSyncEntity, SyncStatus } from '@/src/shared/sync/types';
import { DictionaryCard } from '@/src/shared/types/dictionary';

const DICTIONARY_CARDS_TABLE = 'dictionaryCards';
const DEFAULT_SYNC_STATUS: SyncStatus = 'pending';

const normalizeDictionaryCard = (card: string) => card.trim().replace(/\s+/g, ' ').toLowerCase();

const getCurrentTimestamp = () => new Date().toISOString();

const hasExpectedSchema = (
    tableInfo: Array<{
        name: string;
        pk: number;
        type: string;
    }>,
) => {
    const requiredColumns = new Map([
        ['id', { type: 'TEXT', pk: 1 }],
        ['card', { type: 'TEXT', pk: 0 }],
        ['normalizedCard', { type: 'TEXT', pk: 0 }],
        ['createdAt', { type: 'TEXT', pk: 0 }],
        ['updatedAt', { type: 'TEXT', pk: 0 }],
        ['deletedAt', { type: 'TEXT', pk: 0 }],
        ['syncStatus', { type: 'TEXT', pk: 0 }],
        ['serverRevision', { type: 'INTEGER', pk: 0 }],
    ]);

    return Array.from(requiredColumns.entries()).every(([name, expected]) => {
        const column = tableInfo.find((item) => item.name === name);
        const normalizedType = column?.type?.toUpperCase() ?? '';

        return normalizedType === expected.type && (expected.pk === 0 || column?.pk === expected.pk);
    });
};

export const dictionaryCardsRepository = {
    async applyRemoteEntity(db: SQLiteDatabase, entity: DictionaryCardSyncEntity): Promise<void> {
        const normalizedCard = normalizeDictionaryCard(entity.card);

        await db.runAsync(
            `
                INSERT INTO ${DICTIONARY_CARDS_TABLE} (
                    id,
                    card,
                    normalizedCard,
                    createdAt,
                    updatedAt,
                    deletedAt,
                    syncStatus,
                    serverRevision
                )
                VALUES (?, ?, ?, ?, ?, ?, 'synced', ?)
                ON CONFLICT(id) DO UPDATE SET
                    card = excluded.card,
                    normalizedCard = excluded.normalizedCard,
                    updatedAt = excluded.updatedAt,
                    deletedAt = excluded.deletedAt,
                    syncStatus = 'synced',
                    serverRevision = excluded.serverRevision
            `,
            [
                entity.id,
                normalizedCard,
                normalizedCard,
                entity.updatedAt,
                entity.updatedAt,
                entity.deletedAt,
                entity.serverRevision,
            ],
        );
    },

    async createLocal(db: SQLiteDatabase, card: string): Promise<DictionaryCard | null> {
        const normalizedCard = normalizeDictionaryCard(card);

        if (!normalizedCard) {
            return null;
        }

        const existingCard = await db.getFirstAsync<{ id: string }>(
            `
                SELECT id
                FROM ${DICTIONARY_CARDS_TABLE}
                WHERE normalizedCard = ? AND deletedAt IS NULL
                LIMIT 1
            `,
            [normalizedCard],
        );

        if (existingCard) {
            return null;
        }

        const now = getCurrentTimestamp();
        const nextCardId = generateId();
        const nextCard: DictionaryCard = {
            card: normalizedCard,
            createdAt: now,
            deletedAt: null,
            id: nextCardId,
            normalizedCard,
            serverRevision: null,
            syncStatus: DEFAULT_SYNC_STATUS,
            updatedAt: now,
        };

        await db.runAsync(
            `
                INSERT INTO ${DICTIONARY_CARDS_TABLE} (
                    id,
                    card,
                    normalizedCard,
                    createdAt,
                    updatedAt,
                    deletedAt,
                    syncStatus,
                    serverRevision
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                nextCardId,
                normalizedCard,
                normalizedCard,
                now,
                now,
                null,
                DEFAULT_SYNC_STATUS,
                null,
            ],
        );

        return nextCard;
    },

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
                    card TEXT NOT NULL,
                    normalizedCard TEXT NOT NULL,
                    createdAt TEXT NOT NULL,
                    updatedAt TEXT NOT NULL,
                    deletedAt TEXT,
                    syncStatus TEXT NOT NULL,
                    serverRevision INTEGER
                );

                CREATE INDEX IF NOT EXISTS idx_${DICTIONARY_CARDS_TABLE}_normalizedCard
                ON ${DICTIONARY_CARDS_TABLE} (normalizedCard);
            `);

            return;
        }

        if (hasExpectedSchema(tableInfo)) {
            return;
        }

        const legacyRows = await db.getAllAsync<{
            card: string;
            createdAt?: string | null;
            deletedAt?: string | null;
            id: string | number;
            serverRevision?: number | null;
            syncStatus?: string | null;
            updatedAt?: string | null;
        }>(`SELECT * FROM ${DICTIONARY_CARDS_TABLE}`);

        await db.withTransactionAsync(async () => {
            await db.execAsync(`
                ALTER TABLE ${DICTIONARY_CARDS_TABLE} RENAME TO ${DICTIONARY_CARDS_TABLE}_old;

                CREATE TABLE ${DICTIONARY_CARDS_TABLE} (
                    id TEXT PRIMARY KEY NOT NULL,
                    card TEXT NOT NULL,
                    normalizedCard TEXT NOT NULL,
                    createdAt TEXT NOT NULL,
                    updatedAt TEXT NOT NULL,
                    deletedAt TEXT,
                    syncStatus TEXT NOT NULL,
                    serverRevision INTEGER
                );

                CREATE INDEX IF NOT EXISTS idx_${DICTIONARY_CARDS_TABLE}_normalizedCard
                ON ${DICTIONARY_CARDS_TABLE} (normalizedCard);
            `);

            for (const row of legacyRows) {
                const normalizedCard = normalizeDictionaryCard(row.card);
                const now = getCurrentTimestamp();

                await db.runAsync(
                    `
                        INSERT INTO ${DICTIONARY_CARDS_TABLE} (
                            id,
                            card,
                            normalizedCard,
                            createdAt,
                            updatedAt,
                            deletedAt,
                            syncStatus,
                            serverRevision
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        String(row.id),
                        normalizedCard,
                        normalizedCard,
                        row.createdAt ?? now,
                        row.updatedAt ?? row.createdAt ?? now,
                        row.deletedAt ?? null,
                        row.syncStatus ?? DEFAULT_SYNC_STATUS,
                        row.serverRevision ?? null,
                    ],
                );
            }

            await db.execAsync(`DROP TABLE ${DICTIONARY_CARDS_TABLE}_old;`);
        });
    },

    async getPendingSyncCandidates(db: SQLiteDatabase): Promise<DictionaryCard[]> {
        return db.getAllAsync<DictionaryCard>(
            `
                SELECT
                    id,
                    card,
                    normalizedCard,
                    createdAt,
                    updatedAt,
                    deletedAt,
                    syncStatus,
                    serverRevision
                FROM ${DICTIONARY_CARDS_TABLE}
                WHERE syncStatus = 'pending'
                ORDER BY updatedAt, rowid
            `,
        );
    },

    async getAll(db: SQLiteDatabase): Promise<DictionaryCard[]> {
        const rows = await db.getAllAsync<DictionaryCard>(
            `
                SELECT
                    id,
                    card,
                    normalizedCard,
                    createdAt,
                    updatedAt,
                    deletedAt,
                    syncStatus,
                    serverRevision
                FROM ${DICTIONARY_CARDS_TABLE}
                WHERE deletedAt IS NULL
                ORDER BY card
            `,
        );

        return rows.map((row) => ({
            ...row,
            id: String(row.id),
        }));
    },

    async hardDeleteLocal(db: SQLiteDatabase, id: string): Promise<void> {
        await db.runAsync(`DELETE FROM ${DICTIONARY_CARDS_TABLE} WHERE id = ?`, [id]);
    },

    async markDeletedLocally(db: SQLiteDatabase, id: string): Promise<boolean> {
        const now = getCurrentTimestamp();
        await db.runAsync(
            `
                UPDATE ${DICTIONARY_CARDS_TABLE}
                SET
                    deletedAt = ?,
                    updatedAt = ?,
                    syncStatus = 'pending'
                WHERE id = ? AND deletedAt IS NULL
            `,
            [now, now, id],
        );

        const row = await db.getFirstAsync<{ deletedAt: string | null }>(
            `SELECT deletedAt FROM ${DICTIONARY_CARDS_TABLE} WHERE id = ?`,
            [id],
        );

        return row?.deletedAt === now;
    },

    async markSyncSettled(
        db: SQLiteDatabase,
        id: string,
        serverRevision?: number,
    ): Promise<void> {
        await db.runAsync(
            `
                UPDATE ${DICTIONARY_CARDS_TABLE}
                SET
                    syncStatus = 'synced',
                    serverRevision = COALESCE(?, serverRevision)
                WHERE id = ?
            `,
            [serverRevision ?? null, id],
        );
    },
};
