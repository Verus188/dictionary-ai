import { SQLiteDatabase } from 'expo-sqlite';

export type PersistedSettingsRecord = Record<string, string | null>;

export const settingsRepository = {
    async ensureDefaults(db: SQLiteDatabase, defaults: Record<string, string>) {
        for (const [setting, value] of Object.entries(defaults)) {
            await db.runAsync(
                `
                    INSERT INTO settings (setting, value)
                    VALUES (?, ?)
                    ON CONFLICT(setting) DO NOTHING
                `,
                [setting, value],
            );
        }
    },

    async update(db: SQLiteDatabase, setting: string, value: string | null) {
        await db.runAsync('UPDATE settings SET value = ? WHERE setting = ?', [value, setting]);
    },

    async getAll(db: SQLiteDatabase): Promise<PersistedSettingsRecord> {
        const rows = await db.getAllAsync<{
            setting: string;
            value: string | null;
        }>('SELECT setting, value FROM settings');

        return rows.reduce<PersistedSettingsRecord>((acc, { setting, value }) => {
            acc[setting] = value;
            return acc;
        }, {});
    },
};
