import { reatomResource, withDataAtom, withStatusesAtom } from "@reatom/async";
import { atom, createCtx } from "@reatom/core";
import { generateStoryChunksAction } from "./actions";
import { DictionaryCardInfo, StoryChunk, StoryChunkVariants } from "./types";

export const reatomCtx = createCtx();

export const dictionaryCardsAtom = atom<DictionaryCardInfo[]>(
  [],
  "dictionaryCardsAtom"
);

export const isCardModalVisibleAtom = atom<boolean>(
  false,
  "isCardModalVisibleAtom"
);

// хранит всю истории и промпт сюжета
export const storyAtom = atom<string | null>(null, "storyAtom");

export const storyChunkAtom = atom<StoryChunk | null>(null, "storyChunkAtom");

export const nextStoryChunksVariantsAtom = atom<StoryChunkVariants | null>(
  null,
  "nextStoryChunksVariantsAtom"
);

export const nextStoryChunksResource = reatomResource(async (ctx) => {
  const story = ctx.spy(storyAtom);
  if (!story) return null;

  return ctx.schedule(() => {
    return generateStoryChunksAction(ctx);
  });
}, "nextStoryChunksResource").pipe(withDataAtom(null), withStatusesAtom());

// Атомы настроек
export const storySettingsAtoms = {
  /** Токен для openRouter */
  openRouterToken: atom<string>("", "openRouterTokenAtom"),
  /** Выбранна модель нейросети */
  AIModel: atom<string>("gemeni", "AIModelAtom"),
  /** язык, который изучается пользователем */
  educationLanguage: atom<string>("English", "educationLanguageAtom"),
  /** насколько длинные куски истории */
  chunkLength: atom<string>("800", "storyChunkLengthAtom"),
  /** насколько сложный язык истории */
  storyLanguageDifficulty: atom<string>("2", "storyLanguageDifficultyAtom"),
  storyPrompt: atom<string>("", "storyPrompt"),
};

// Атомы настроек сюжета
export const storyTagsAtoms = {
  character: atom<string>("Male protagonist", "storyTagCharacter"),
  genres: atom<string[]>(["Fantasy"], "storyTagGenre"),
  setting: atom<string>("Middle Ages", "storyTagSetting"),
  plotMotif: atom<string>("Betrayal", "storyTagPlotMotif"),
  tone: atom<string>("Dark story", "storyTagTone"),
  narrativeStyle: atom<string>("First person", "storyTagNarrativeStyle"),
};
