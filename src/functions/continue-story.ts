import { AIController } from "../enteties/AIController";
import {
  DictionaryCardInfo,
  StoryActions,
  StoryContinuationsInfo,
} from "../model/types";
import { getStoryContinuationPrompt } from "../prompts/get-story-continuation-prompt";
import { storySystemPrompt } from "../prompts/story-system-prompt";

/**
 * Генерирует продложение истории на основе переданного контекста
 * @param story - история
 * @param actions - действия, которые может совершить читатель
 * @param continuationSize - размер продолжения
 * @param language - язык повествования
 * @param languageDifficulty - сложность языка повествования
 * @param dictionaryCards - карточки из словаря, которые будут использоваться в истории
 * @returns - продолжение истории в json. Содержит 2 варианта продолжения истории для выбранных actions и 2 actions для каждого из продолжений
 */
export const continueStory = async (
  story: string,
  actions?: StoryActions,
  continuationSize?: string,
  language?: string,
  languageDifficulty?: string,
  dictionaryCards?: DictionaryCardInfo[]
): Promise<StoryContinuationsInfo> => {
  const response = (
    await AIController.generateAIText(
      getStoryContinuationPrompt(
        story,
        storySystemPrompt,
        actions,
        continuationSize,
        language,
        languageDifficulty,
        dictionaryCards
      )
    )
  )
    .replace(/```json|```/g, "")
    .trim();

  try {
    return JSON.parse(response) as StoryContinuationsInfo;
  } catch (error) {
    console.log("response", response);
    console.error(error);
    return {
      continuation1: {
        continuation: "Error",
        actions: {
          action1: "Error",
          action2: "Error",
        },
      },
      continuation2: {
        continuation: "Error",
        actions: {
          action1: "Error",
          action2: "Error",
        },
      },
    };
  }
};
