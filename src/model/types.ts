export type DictionaryCard = {
  card: string;
  id: string;
};

export type StoryActions = {
  action1: string;
  action2: string;
};
export type StoryContinuation = {
  continuation: string;
  actions: StoryActions;
};

export type StoryContinuationsInfo = {
  continuation1: StoryContinuation;
  continuation2: StoryContinuation;
};

export type InitStoryInfo = {
  story: string;
  continuationsInfo: StoryContinuationsInfo;
};
