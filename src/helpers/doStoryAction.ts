import { AIController } from "../enteties/AIController";
import { StoryInfo } from "../model/types";
import { storySystemPrompt } from "../prompts/story-system-prompt";

export const doStoryAction = async (
  story: string,
  action: string
): Promise<StoryInfo> => {
  const response = (
    await AIController.generateAIText(
      `${story}\naction: ${action}\n${storySystemPrompt}`
    )
  )
    .replace(/```json|```/g, "")
    .trim();

  console.log(`${story}\naction: ${action}\n${storySystemPrompt}`);
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
