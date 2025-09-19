import { plot1 } from "@/src/prompts/plot-1";
import { atom, createCtx } from "@reatom/core";
import { DictionaryCard } from "../types";

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
export const plotPromptAtom = atom<string | null>(plot1, "plotPromptAtom");
