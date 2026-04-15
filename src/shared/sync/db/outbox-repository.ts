import { SQLiteDatabase } from 'expo-sqlite';
import { PendingSyncOperation, PushSyncRequestOperation, SyncEntityType } from '@/src/shared/sync/types';

const OUTBOX_TABLE = 'syncOutbox';
const SELECTABLE_OUTBOX_STATUSES = ['pending', 'failed'] as const;

const toSqlPlaceholders = (items: readonly string[]) => items.map(() => '?').join(', ');

export const syncOutboxRepository = {
    async ensureTable(db: SQLiteDatabase): Promise<void> {
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS ${OUTBOX_TABLE} (
                id TEXT PRIMARY KEY NOT NULL,
                deviceId TEXT NOT NULL,
                operationId TEXT NOT NULL UNIQUE,
                entityType TEXT NOT NULL,
                operationType TEXT NOT NULL,
                entityId TEXT NOT NULL,
                payload TEXT,
                clientUpdatedAt TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                lastAttemptAt TEXT,
                retryCount INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_${OUTBOX_TABLE}_status_createdAt
            ON ${OUTBOX_TABLE} (status, createdAt);

            CREATE INDEX IF NOT EXISTS idx_${OUTBOX_TABLE}_entity
            ON ${OUTBOX_TABLE} (entityType, entityId);

            UPDATE ${OUTBOX_TABLE}
            SET status = 'failed'
            WHERE status = 'inFlight';
        `);
    },

    async deleteByOperationIds(db: SQLiteDatabase, operationIds: string[]): Promise<void> {
        if (operationIds.length === 0) {
            return;
        }

        const placeholders = toSqlPlaceholders(operationIds);

        await db.runAsync(
            `DELETE FROM ${OUTBOX_TABLE} WHERE operationId IN (${placeholders})`,
            operationIds,
        );
    },

    async getNextBatch(db: SQLiteDatabase, limit: number): Promise<PendingSyncOperation[]> {
        const placeholders = toSqlPlaceholders(SELECTABLE_OUTBOX_STATUSES);

        return db.getAllAsync<PendingSyncOperation>(
            `
                SELECT
                    id,
                    deviceId,
                    operationId,
                    entityType,
                    operationType,
                    entityId,
                    payload,
                    clientUpdatedAt,
                    createdAt,
                    lastAttemptAt,
                    retryCount,
                    status
                FROM ${OUTBOX_TABLE}
                WHERE status IN (${placeholders})
                ORDER BY createdAt, rowid
                LIMIT ?
            `,
            [...SELECTABLE_OUTBOX_STATUSES, limit],
        );
    },

    async hasUnsettledOperationForEntity(
        db: SQLiteDatabase,
        entityType: SyncEntityType,
        entityId: string,
    ): Promise<boolean> {
        const row = await db.getFirstAsync<{ hasOperation: number }>(
            `
                SELECT 1 as hasOperation
                FROM ${OUTBOX_TABLE}
                WHERE entityType = ? AND entityId = ?
                LIMIT 1
            `,
            [entityType, entityId],
        );

        return Boolean(row?.hasOperation);
    },

    async insertOperation(
        db: SQLiteDatabase,
        operation: PushSyncRequestOperation & {
            createdAt: string;
            deviceId: string;
            id: string;
            payload: string | null;
        },
    ): Promise<void> {
        await db.runAsync(
            `
                INSERT OR IGNORE INTO ${OUTBOX_TABLE} (
                    id,
                    deviceId,
                    operationId,
                    entityType,
                    operationType,
                    entityId,
                    payload,
                    clientUpdatedAt,
                    createdAt,
                    lastAttemptAt,
                    retryCount,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, 'pending')
            `,
            [
                operation.id,
                operation.deviceId,
                operation.operationId,
                operation.entityType,
                operation.operationType,
                operation.entityId,
                operation.payload,
                operation.clientUpdatedAt,
                operation.createdAt,
            ],
        );
    },

    async markBatchFailed(db: SQLiteDatabase, operationIds: string[]): Promise<void> {
        if (operationIds.length === 0) {
            return;
        }

        const placeholders = toSqlPlaceholders(operationIds);

        await db.runAsync(
            `UPDATE ${OUTBOX_TABLE} SET status = 'failed' WHERE operationId IN (${placeholders})`,
            operationIds,
        );
    },

    async markBatchInFlight(db: SQLiteDatabase, operationIds: string[]): Promise<void> {
        if (operationIds.length === 0) {
            return;
        }

        const placeholders = toSqlPlaceholders(operationIds);
        const now = new Date().toISOString();

        await db.runAsync(
            `
                UPDATE ${OUTBOX_TABLE}
                SET
                    status = 'inFlight',
                    lastAttemptAt = ?,
                    retryCount = retryCount + 1
                WHERE operationId IN (${placeholders})
            `,
            [now, ...operationIds],
        );
    },
};
