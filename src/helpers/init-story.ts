import { AIController } from "../enteties/AIController";
import { StoryActions } from "../model/types";
import { getStoryActionsPrompt } from "../prompts/get-story-actions-prompt";
import { getStoryContinuationPrompt } from "../prompts/get-story-continuation-prompt";

export const getStoryActions = async (
  story: string,
  continuationSize?: string,
  mood?: string,
  language?: string,
  languageDifficulty?: string
): Promise<StoryActions> => {
  const response = (
    await AIController.generateAIText(
      getStoryContinuationPrompt(
        story,
        getStoryActionsPrompt,
        undefined,
        continuationSize,
        mood,
        language,
        languageDifficulty
      )
    )
  )
    .replace(/```json|```/g, "")
    .trim();

  try {
    return JSON.parse(response) as StoryActions;
  } catch (error) {
    console.log("response", response);
    console.error(error);
    return {
      action1: "Error",
      action2: "Error",
    };
  }
};
