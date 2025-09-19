import { plot1 } from "@/src/prompts/plot-1";
import { atom, createCtx } from "@reatom/core";
import { DictionaryCard, StoryInfo } from "./types";

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
export const storyInfoAtom = atom<StoryInfo | null>(plot1, "storyInfoAtom");

export const educationLanguageAtom = atom<string>(
  "English",
  "educationLanguageAtom"
);

export const isStoryLoadingAtom = atom<boolean>(false, "isStoryLoadingAtom");
