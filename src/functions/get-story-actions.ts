import { Ctx } from "@reatom/core";
import { AIController } from "../enteties/AIController";
import {
  dictionaryCardsAtom,
  educationLanguageAtom,
  storyAtom,
  storyContinuationLengthAtom,
  storyLanguageDifficultyAtom,
} from "../model/atoms";
import { StoryActions } from "../model/types";
import { getStoryActionsPrompt } from "../prompts/get-story-actions-prompt";
import { storyActionsSystemPrompt } from "../prompts/story-actions-system-prompt";

/**
 * Генерирует два действия, которые может совершить читатель на основе переданного контекста
 * @param story - история
 * @param continuationSize  - размер продолжения истории
 * @param language - язык истории
 * @param languageDifficulty - сложность повествования
 * @returns - json с двумя полями: action1 и action2
 */
export const getStoryActions = async (ctx: Ctx): Promise<StoryActions> => {
  const story = ctx.get(storyAtom);
  try {
    if (!story) {
      throw new Error("No story found");
    }

    const response = (
      await AIController.generateAIText(
        getStoryActionsPrompt(
          story,
          storyActionsSystemPrompt,
          ctx.get(storyContinuationLengthAtom),
          ctx.get(educationLanguageAtom),
          ctx.get(storyLanguageDifficultyAtom),
          ctx.get(dictionaryCardsAtom)
        )
      )
    )
      .replace(/```json|```/g, "")
      .trim();
    console.log("response", response);

    return JSON.parse(response) as StoryActions;
  } catch (error) {
    console.error(error);
    return {
      action1: "Error",
      action2: "Error",
    };
  }
};
