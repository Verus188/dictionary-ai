import { AIController } from "../enteties/AIController";
import { InitStoryInfo } from "../model/types";
import { getStoryContinuationPrompt } from "../prompts/get-story-continuation-prompt";
import { initStoryPrompt } from "../prompts/init-story-prompt";

export const initStory = async (
  story: string,
  continuationSize?: string,
  mood?: string,
  language?: string,
  languageDifficulty?: string
): Promise<InitStoryInfo> => {
  console.log(
    getStoryContinuationPrompt(
      story,
      initStoryPrompt,
      undefined,
      continuationSize,
      mood,
      language,
      languageDifficulty
    )
  );
  const response = (
    await AIController.generateAIText(
      getStoryContinuationPrompt(
        story,
        initStoryPrompt,
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
    return JSON.parse(response) as InitStoryInfo;
  } catch (error) {
    return {
      story: "Error",
      continuationsInfo: {
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
      },
    };
  }
};
