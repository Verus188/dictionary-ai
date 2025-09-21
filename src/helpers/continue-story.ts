import { AIController } from "../enteties/AIController";
import {
  DictionaryCardInfo,
  StoryActions,
  StoryContinuationsInfo,
} from "../model/types";
import { getStoryContinuationPrompt } from "../prompts/get-story-continuation-prompt";
import { storySystemPrompt } from "../prompts/story-system-prompt";

export const continueStory = async (
  story: string,
  actions?: StoryActions,
  continuationSize?: string,
  mood?: string,
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
        mood,
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
