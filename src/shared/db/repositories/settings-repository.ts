import { SQLiteDatabase } from 'expo-sqlite';
import { SettingSyncEntity, SyncStatus } from '@/src/shared/sync/types';
import { PersistedStorySettingKey } from '@/src/shared/types/settings';

export type PersistedSettingsRecord = Record<string, string | null>;
export type PersistedSettingEntry = {
    deletedAt: string | null;
    serverRevision: number | null;
    setting: PersistedStorySettingKey;
    syncStatus: SyncStatus;
    updatedAt: string;
    value: string | null;
};

const SETTINGS_TABLE = 'settings';
const DEFAULT_SYNC_STATUS: SyncStatus = 'pending';
const getCurrentTimestamp = () => new Date().toISOString();

const hasExpectedSchema = (
    tableInfo: Array<{
        name: string;
        pk: number;
        type: string;
    }>,
) => {
    const requiredColumns = new Map([
        ['setting', { type: 'TEXT', pk: 1 }],
        ['value', { type: 'TEXT', pk: 0 }],
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

export const settingsRepository = {
    async applyRemoteEntity(db: SQLiteDatabase, entity: SettingSyncEntity): Promise<void> {
        const normalizedValue = entity.value === null ? null : String(entity.value);

        await db.runAsync(
            `
                INSERT INTO ${SETTINGS_TABLE} (
                    setting,
                    value,
                    updatedAt,
                    deletedAt,
                    syncStatus,
                    serverRevision
                )
                VALUES (?, ?, ?, ?, 'synced', ?)
                ON CONFLICT(setting) DO UPDATE SET
                    value = excluded.value,
                    updatedAt = excluded.updatedAt,
                    deletedAt = excluded.deletedAt,
                    syncStatus = 'synced',
                    serverRevision = excluded.serverRevision
            `,
            [
                entity.key,
                normalizedValue,
                entity.updatedAt,
                entity.deletedAt,
                entity.serverRevision,
            ],
        );
    },

    async ensureTable(db: SQLiteDatabase): Promise<void> {
        const tableInfo = await db.getAllAsync<{
            name: string;
            pk: number;
            type: string;
        }>(`PRAGMA table_info(${SETTINGS_TABLE})`);

        if (tableInfo.length === 0) {
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS ${SETTINGS_TABLE} (
                    setting TEXT PRIMARY KEY NOT NULL,
                    value TEXT,
                    updatedAt TEXT NOT NULL,
                    deletedAt TEXT,
                    syncStatus TEXT NOT NULL,
                    serverRevision INTEGER
                );
            `);

            return;
        }

        if (hasExpectedSchema(tableInfo)) {
            return;
        }

        const legacyRows = await db.getAllAsync<{
            deletedAt?: string | null;
            serverRevision?: number | null;
            setting: PersistedStorySettingKey;
            syncStatus?: SyncStatus | null;
            updatedAt?: string | null;
            value: string | null;
        }>(`SELECT * FROM ${SETTINGS_TABLE}`);

        await db.withTransactionAsync(async () => {
            await db.execAsync(`
                ALTER TABLE ${SETTINGS_TABLE} RENAME TO ${SETTINGS_TABLE}_old;

                CREATE TABLE ${SETTINGS_TABLE} (
                    setting TEXT PRIMARY KEY NOT NULL,
                    value TEXT,
                    updatedAt TEXT NOT NULL,
                    deletedAt TEXT,
                    syncStatus TEXT NOT NULL,
                    serverRevision INTEGER
                );
            `);

            for (const row of legacyRows) {
                const now = getCurrentTimestamp();

                await db.runAsync(
                    `
                        INSERT INTO ${SETTINGS_TABLE} (
                            setting,
                            value,
                            updatedAt,
                            deletedAt,
                            syncStatus,
                            serverRevision
                        )
                        VALUES (?, ?, ?, ?, ?, ?)
                    `,
                    [
                        row.setting,
                        row.value,
                        row.updatedAt ?? now,
                        row.deletedAt ?? null,
                        row.syncStatus ?? DEFAULT_SYNC_STATUS,
                        row.serverRevision ?? null,
                    ],
                );
            }

            await db.execAsync(`DROP TABLE ${SETTINGS_TABLE}_old;`);
        });
    },

    async ensureDefaults(db: SQLiteDatabase, defaults: Record<string, string>) {
        const now = getCurrentTimestamp();

        for (const [setting, value] of Object.entries(defaults)) {
            await db.runAsync(
                `
                    INSERT INTO ${SETTINGS_TABLE} (
                        setting,
                        value,
                        updatedAt,
                        deletedAt,
                        syncStatus,
                        serverRevision
                    )
                    SELECT ?, ?, ?, NULL, ?, NULL
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM ${SETTINGS_TABLE}
                        WHERE setting = ?
                    )
                `,
                [setting, value, now, DEFAULT_SYNC_STATUS, setting],
            );
        }
    },

    async getAll(db: SQLiteDatabase): Promise<PersistedSettingsRecord> {
        const rows = await db.getAllAsync<{
            setting: string;
            value: string | null;
        }>(
            `
                SELECT setting, value
                FROM ${SETTINGS_TABLE}
                WHERE deletedAt IS NULL
            `,
        );

        return rows.reduce<PersistedSettingsRecord>((acc, { setting, value }) => {
            acc[setting] = value;
            return acc;
        }, {});
    },

    async getPendingSyncCandidates(db: SQLiteDatabase): Promise<PersistedSettingEntry[]> {
        return db.getAllAsync<PersistedSettingEntry>(
            `
                SELECT
                    setting,
                    value,
                    updatedAt,
                    deletedAt,
                    syncStatus,
                    serverRevision
                FROM ${SETTINGS_TABLE}
                WHERE syncStatus = 'pending'
                ORDER BY updatedAt, rowid
            `,
        );
    },

    async markSyncSettled(
        db: SQLiteDatabase,
        setting: PersistedStorySettingKey,
        serverRevision?: number,
    ): Promise<void> {
        await db.runAsync(
            `
                UPDATE ${SETTINGS_TABLE}
                SET
                    syncStatus = 'synced',
                    serverRevision = COALESCE(?, serverRevision)
                WHERE setting = ?
            `,
            [serverRevision ?? null, setting],
        );
    },

    async update(
        db: SQLiteDatabase,
        setting: PersistedStorySettingKey,
        value: string | null,
    ): Promise<boolean> {
        const existingRow = await db.getFirstAsync<{
            deletedAt: string | null;
            value: string | null;
        }>(`SELECT value, deletedAt FROM ${SETTINGS_TABLE} WHERE setting = ?`, [setting]);

        if (existingRow && existingRow.value === value && existingRow.deletedAt === null) {
            return false;
        }

        const now = getCurrentTimestamp();

        await db.runAsync(
            `
                INSERT INTO ${SETTINGS_TABLE} (
                    setting,
                    value,
                    updatedAt,
                    deletedAt,
                    syncStatus,
                    serverRevision
                )
                VALUES (?, ?, ?, NULL, 'pending', NULL)
                ON CONFLICT(setting) DO UPDATE SET
                    value = excluded.value,
                    updatedAt = excluded.updatedAt,
                    deletedAt = NULL,
                    syncStatus = 'pending'
            `,
            [setting, value, now],
        );

        return true;
    },
};
