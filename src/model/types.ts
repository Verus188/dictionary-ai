export type DictionaryCardInfo = {
    card: string;
    id: string;
};

export type StorySettings = {
    educationLanguage: string;
    chunkLength: number;
    storyLanguageDifficulty: number;
    prompt?: string;
    character: string | null;
    genres: string[];
    setting: string | null;
    plotMotif: string | null;
    narrativeStyle: string | null;
    tone: string | null;
};

export type DictionaryCardDto = {
    id: string;
    text: string;
};

export type ChunkActions = {
    action1: string;
    action2: string;
};

export type StoryChunk = {
    text: string;
    actions: ChunkActions;
};

export type StoryChunkVariants = {
    chunk1: StoryChunk;
    chunk2: StoryChunk;
};

export type InitStoryRequest = {
    settings: StorySettings;
    cards: DictionaryCardDto[];
};

export type InitStoryResponse = StoryChunk;

export type ContinueStoryRequest = {
    story: string;
    actions: ChunkActions;
    settings: StorySettings;
    cards: DictionaryCardDto[];
};

export type ContinueStoryResponse = StoryChunkVariants;

export type InitStoryInfo = {
    story: string;
    chunks: StoryChunkVariants;
};

export type StoryTagsType = {
    characters: string[];
    genres: string[];
    settings: string[];
    plotMotifs: string[];
    tone: string[];
    narrativeStyle: string[];
};
