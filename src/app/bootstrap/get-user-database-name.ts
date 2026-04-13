const DATABASE_NAME_PREFIX = 'dictionary-user';

const normalizeUserId = (userId: string) => {
    const normalizedUserId = userId.trim().replace(/[^a-zA-Z0-9_-]/g, '_');

    return normalizedUserId || 'unknown';
};

export const getUserDatabaseName = (userId: string) =>
    `${DATABASE_NAME_PREFIX}-${normalizeUserId(userId)}.db`;
