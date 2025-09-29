import { atom, createCtx } from "@reatom/core";
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
export const storyAtom = atom<string | null>(null, "storyInfoAtom");

// хранит варианты развития истории
export const storyContinuationAtom = atom<StoryContinuationsInfo | null>(
  null,
  "storyContinuationAtom"
);

export const isStoryLoadingAtom = atom<boolean>(false, "isStoryLoadingAtom");

// Атомы настроек
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
export const storyPromptAtom = atom<string>("", "storyPrompt");

// Атомы настроек сюжета
export const storyTagsAtoms = {
  character: atom<string>("Fantasy", "storyTagCharacter"),
  genres: atom<string[]>([], "storyTagGenre"),
  setting: atom<string>("Middle Ages", "storyTagSetting"),
  plotMotif: atom<string>("Betrayal", "storyTagPlotMotif"),
  tone: atom<string>("Dark story", "storyTagTone"),
  narrativeStyle: atom<string>("First person", "storyTagNarrativeStyle"),
};
