import { reatomResource } from "@reatom/async";
import { atom, createCtx } from "@reatom/core";
import { DictionaryCardInfo, StoryChunk } from "./types";

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

// // хранит варианты развития истории
// export const storyContinuationAtom = atom<StoryChunkVariants | null>(
//   null,
//   "storyContinuationAtom"
// );

export const displayedChunkAtom = atom<StoryChunk | null>(
  null,
  "displayedChunkAtom"
);

// export const isStoryLoadingAtom = atom<boolean>(false, "isStoryLoadingAtom");

export const storyPartResource = reatomResource(async (ctx) => {
  ctx.spy(storyAtom);
  ctx.spy(displayedChunkAtom);

  return await ctx.schedule(() => {});
}, "storyPartAtom");

// Атомы настроек
export const storySettingsAtoms = {
  /** Токен для openRouter */
  openRouterToken: atom<string>("", "openRouterTokenAtom"),
  /** Выбранна модель нейросети */
  AIModel: atom<string>("gemeni", "AIModelAtom"),
  /** язык, который изучается пользователем */
  educationLanguage: atom<string>("English", "educationLanguageAtom"),
  /** насколько длинные куски истории */
  partLength: atom<string>("800", "storyContinuationLengthAtom"),
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
