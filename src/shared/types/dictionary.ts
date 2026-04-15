export type DictionaryCard = {
    card: string;
    id: string;
    createdAt?: string;
    deletedAt?: string | null;
    normalizedCard?: string;
    serverRevision?: number | null;
    syncStatus?: 'synced' | 'pending' | 'failed';
    updatedAt?: string;
};
