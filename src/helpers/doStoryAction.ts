import { AIController } from "../enteties/AIController";
import { StoryInfo } from "../model/types";
import { getStoryContinuationPrompt } from "../prompts/get-story-continuation-prompt";

export const doStoryAction = async (
  story: string,
  action?: string,
  continuationSize?: string,
  mood?: string,
  language?: string,
  languageDifficulty?: string
): Promise<StoryInfo> => {
  const response = (
    await AIController.generateAIText(
      getStoryContinuationPrompt(
        story,
        action,
        continuationSize,
        mood,
        language,
        languageDifficulty
      )
    )
  )
    .replace(/```json|```/g, "")
    .trim();

  console.log(getStoryContinuationPrompt(story, action));
  console.log(response);

  try {
    return JSON.parse(response) as StoryInfo;
  } catch (error) {
    return {
      story,
      continuation: "Error",
      firstAction: "",
      secondAction: "",
    };
  }
};
