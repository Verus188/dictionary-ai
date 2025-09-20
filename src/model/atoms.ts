import { atom, createCtx } from "@reatom/core";
import { DictionaryCard, StoryContinuationsInfo } from "./types";

export const reatomCtx = createCtx();

export const dictionaryCardsAtom = atom<DictionaryCard[]>(
  [],
  "dictionaryCardsAtom"
);

export const isCardModalVisibleAtom = atom<boolean>(
  false,
  "isCardModalVisibleAtom"
);

export const openRouterTokenAtom = atom<string | null>(
  null,
  "openRouterTokenAtom"
);
export const openRouterAIModelAtom = atom<string | null>(
  "gemeni",
  "openRouterAIModelAtom"
);
// хранит всю истории и промпт сюжета
export const storyAtom = atom<string | null>(null, "storyInfoAtom");

export const storyContinuationAtom = atom<StoryContinuationsInfo | null>(
  null,
  "storyContinuationAtom"
);

export const educationLanguageAtom = atom<string>(
  "English",
  "educationLanguageAtom"
);

export const isStoryLoadingAtom = atom<boolean>(false, "isStoryLoadingAtom");

export const storyContinuationLengthAtom = atom<string>(
  "800",
  "storyContinuationLengthAtom"
);

export const storyLanguageDifficultyAtom = atom<string>(
  "3",
  "storyLanguageDifficultyAtom"
);
