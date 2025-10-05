import { Ctx } from "@reatom/core";
import { AIController } from "../enteties/AIController";
import {
  dictionaryCardsAtom,
  educationLanguageAtom,
  storyContinuationLengthAtom,
  storyLanguageDifficultyAtom,
  storyPromptAtom,
  storyTagsAtoms,
} from "../model/atoms";
import { StoryChunk } from "../model/types";
import { getStoryInitializationPrompt } from "../prompts/get-story-initialization-prompt";
import { storyInitializationSystemPrompt } from "../prompts/story-initialization-system-prompt";

export const genereateStory = async (ctx: Ctx): Promise<StoryChunk> => {
  const response = (
    await AIController.generateAIText(
      getStoryInitializationPrompt(
        storyInitializationSystemPrompt,
        ctx.get(storyContinuationLengthAtom),
        ctx.get(educationLanguageAtom),
        ctx.get(storyLanguageDifficultyAtom),
        ctx.get(dictionaryCardsAtom),
        ctx.get(storyPromptAtom),
        ctx.get(storyTagsAtoms.character),
        ctx.get(storyTagsAtoms.genres),
        ctx.get(storyTagsAtoms.setting),
        ctx.get(storyTagsAtoms.plotMotif),
        ctx.get(storyTagsAtoms.narrativeStyle),
        ctx.get(storyTagsAtoms.tone)
      )
    )
  )
    .replace(/```json|```/g, "")
    .trim();

  try {
    return JSON.parse(response) as StoryChunk;
  } catch (error) {
    console.log("response", response);
    console.error(error);
    return {
      chunk: "Error",
      actions: {
        action1: "Error",
        action2: "Error",
      },
    };
  }
};
