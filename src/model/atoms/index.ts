import { atom, createCtx } from "@reatom/core";

export const reatomCtx = createCtx();

export const dictionaryCardsAtom = atom<string[]>([], "dictionaryCardsAtom");
