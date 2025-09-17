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

export const openRouterTokenAtom = atom<string>("", "openRouterTokenAtom");
