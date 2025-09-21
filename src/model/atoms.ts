import { atom, createCtx } from "@reatom/core";
import { plot1 } from "../prompts/plot-1";
import { DictionaryCardInfo, StoryContinuationsInfo } from "./types";

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
export const storyAtom = atom<string | null>(plot1, "storyInfoAtom");

// хранит варианты развития истории
export const storyContinuationAtom = atom<StoryContinuationsInfo | null>(
  null,
  "storyContinuationAtom"
);

export const isStoryLoadingAtom = atom<boolean>(false, "isStoryLoadingAtom");

// Атом настроек
/** Токен для openRouter */
export const openRouterTokenAtom = atom<string>("", "openRouterTokenAtom");
/** Выбранна модель нейросети для openRouter */
export const AIModelAtom = atom<string>("gemeni", "openRouterAIModelAtom");
/** язык, который изучается пользователем */
export const educationLanguageAtom = atom<string>(
  "English",
  "educationLanguageAtom"
);
/** насколько длинные варианты развития истории */
export const storyContinuationLengthAtom = atom<string>(
  "800",
  "storyContinuationLengthAtom"
);
/** насколько сложный язык истории */
export const storyLanguageDifficultyAtom = atom<string>(
  "2",
  "storyLanguageDifficultyAtom"
);
