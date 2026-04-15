import { SQLiteDatabase } from 'expo-sqlite';

const SYNC_STATE_TABLE = 'syncState';
const LAST_SYNC_COMPLETED_AT_KEY = 'lastSyncCompletedAt';
const LAST_SYNC_CURSOR_KEY = 'lastSyncCursor';
const LAST_SYNC_STARTED_AT_KEY = 'lastSyncStartedAt';

const getValue = async (db: SQLiteDatabase, key: string) => {
    const row = await db.getFirstAsync<{ value: string | null }>(
        `SELECT value FROM ${SYNC_STATE_TABLE} WHERE key = ?`,
        [key],
    );

    return row?.value ?? null;
};

const setValue = async (db: SQLiteDatabase, key: string, value: string | null) => {
    await db.runAsync(
        `
            INSERT INTO ${SYNC_STATE_TABLE} (key, value)
            VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `,
        [key, value],
    );
};

export const syncStateRepository = {
    async ensureTable(db: SQLiteDatabase): Promise<void> {
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS ${SYNC_STATE_TABLE} (
                key TEXT PRIMARY KEY NOT NULL,
                value TEXT
            );
        `);
    },

    async getLastSyncCursor(db: SQLiteDatabase): Promise<number | null> {
        const value = await getValue(db, LAST_SYNC_CURSOR_KEY);

        if (!value) {
            return null;
        }

        const parsed = Number(value);

        return Number.isFinite(parsed) ? parsed : null;
    },

    async markSyncCompleted(db: SQLiteDatabase): Promise<void> {
        await setValue(db, LAST_SYNC_COMPLETED_AT_KEY, new Date().toISOString());
    },

    async markSyncStarted(db: SQLiteDatabase): Promise<void> {
        await setValue(db, LAST_SYNC_STARTED_AT_KEY, new Date().toISOString());
    },

    async setLastSyncCursor(db: SQLiteDatabase, cursor: number): Promise<void> {
        await setValue(db, LAST_SYNC_CURSOR_KEY, String(cursor));
    },
};
