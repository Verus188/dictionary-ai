export type DictionaryCardInfo = {
  card: string;
  id: string;
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
