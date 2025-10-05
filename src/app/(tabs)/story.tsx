import { Button } from "@/src/components/button";
import { continueStory } from "@/src/functions/continue-story";
import {
  dictionaryCardsAtom,
  displayedChunkAtom,
  educationLanguageAtom,
  isStoryLoadingAtom,
  storyAtom,
  storyContinuationAtom,
  storyContinuationLengthAtom,
  storyLanguageDifficultyAtom,
} from "@/src/model/atoms";
import { StoryChunk } from "@/src/model/types";
import { StorySettingsPage } from "@/src/pages/storySettingsPage";
import { reatomComponent } from "@reatom/npm-react";
import { ScrollView, Text, View } from "react-native";

const StoryScreen = reatomComponent(({ ctx }) => {
  // хранит текущий отрывок истории и варианты действий
  const displayedContinuation = ctx.spy(displayedChunkAtom);

  // загрузка истории
  const isStoryLoading = ctx.spy(isStoryLoadingAtom);

  // варинанты развития истории
  const continuationsInfo = ctx.spy(storyContinuationAtom);

  const handlePressButton = async (continuation?: StoryChunk) => {
    if (continuation) {
      displayedChunkAtom(ctx, continuation);
    }

    isStoryLoadingAtom(ctx, true);
    storyAtom(ctx, (prev) => prev + "\n" + displayedContinuation?.chunk);
    const story = ctx.get(storyAtom);

    if (!story) return;
    const storyContinuation = await continueStory(
      story,
      displayedContinuation?.actions,
      ctx.get(storyContinuationLengthAtom),
      ctx.get(educationLanguageAtom),
      ctx.get(storyLanguageDifficultyAtom),
      ctx.get(dictionaryCardsAtom)
    );
    storyContinuationAtom(ctx, storyContinuation);
    isStoryLoadingAtom(ctx, false);
  };

  if (!displayedContinuation) return <StorySettingsPage />;

  return (
    <View className="flex-1 bg-main-bg items-center">
      <View className="flex-1 w-full max-w-[1200px] items-center p-4 gap-4">
        <ScrollView className="bg-tabs-bg w-full h-[60%] border border-tabs-border-color rounded-lg">
          <Text className="text-text-color text-base px-4 py-2">
            {displayedContinuation?.chunk || ""}
          </Text>
        </ScrollView>
        <View className="flex flex-1 w-full flex-row gap-4 justify-between">
          <Button
            onPress={() => {
              handlePressButton(continuationsInfo?.chunk1);
            }}
            className={`flex-1 h-full ${
              isStoryLoading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <Text className="text-text-color text-base overflow-hidden">
              {displayedContinuation?.actions.action1 || ""}
            </Text>
          </Button>
          <Button
            onPress={() => {
              handlePressButton(continuationsInfo?.chunk2);
            }}
            className={`flex-1 h-full ${
              isStoryLoading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <Text className="text-text-color text-base overflow-hidden">
              {displayedContinuation?.actions.action2 || ""}
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
});

export default StoryScreen;
