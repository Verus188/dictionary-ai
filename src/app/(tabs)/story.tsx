import { Button } from "@/src/components/button";
import { continueStory } from "@/src/helpers/continue-story";
import { getStoryActions } from "@/src/helpers/init-story";
import {
  dictionaryCardsAtom,
  educationLanguageAtom,
  isStoryLoadingAtom,
  storyAtom,
  storyContinuationAtom,
  storyContinuationLengthAtom,
  storyLanguageDifficultyAtom,
} from "@/src/model/atoms";
import { StoryContinuation } from "@/src/model/types";
import { reatomComponent } from "@reatom/npm-react";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

const StoryScreen = reatomComponent(({ ctx }) => {
  // для отображения. История и возможные действия
  const [continuation, setContinuation] = useState<StoryContinuation | null>(
    null
  );
  const isStoryLoading = ctx.spy(isStoryLoadingAtom);

  // варинанты развития истории
  const continuationsInfo = ctx.spy(storyContinuationAtom);

  useEffect(() => {
    isStoryLoadingAtom(ctx, true);
    const story = ctx.get(storyAtom);
    if (!continuationsInfo && story) {
      getStoryActions(
        story,
        ctx.get(storyContinuationLengthAtom),
        undefined,
        ctx.get(educationLanguageAtom),
        ctx.get(storyLanguageDifficultyAtom)
      ).then((storyInfo) => {
        setContinuation({
          continuation: story,
          actions: storyInfo,
        });

        continueStory(
          story,
          continuation?.actions,
          ctx.get(storyContinuationLengthAtom),
          undefined,
          ctx.get(educationLanguageAtom),
          ctx.get(storyLanguageDifficultyAtom)
        )
          .then((storyContinuation) => {
            storyContinuationAtom(ctx, storyContinuation);
          })
          .finally(() => {
            isStoryLoadingAtom(ctx, false);
          });
      });
    } else {
      isStoryLoadingAtom(ctx, false);
    }
  }, []);

  const handlePressButton = () => {
    isStoryLoadingAtom(ctx, true);
    storyAtom(ctx, (prev) => prev + "\n" + continuation?.continuation);
    const story = ctx.get(storyAtom);

    if (!story) return;
    continueStory(
      story,
      continuation?.actions,
      ctx.get(storyContinuationLengthAtom),
      undefined,
      ctx.get(educationLanguageAtom),
      ctx.get(storyLanguageDifficultyAtom),
      ctx.get(dictionaryCardsAtom)
    )
      .then((storyContinuation) => {
        storyContinuationAtom(ctx, storyContinuation);
      })
      .finally(() => {
        isStoryLoadingAtom(ctx, false);
      });
  };

  if (!continuationsInfo || !continuation) {
    return (
      <View className="flex-1 w-full items-center bg-main-bg p-4 gap-4">
        <ScrollView className="bg-tabs-bg w-full h-[60%] border border-tabs-border-color rounded-lg"></ScrollView>
        <View className="flex flex-1 w-full flex-row gap-4 justify-between">
          <Button
            className={`flex-1 h-full ${
              isStoryLoading ? "opacity-50 pointer-events-none" : ""
            }`}
          ></Button>
          <Button
            className={`flex-1 h-full ${
              isStoryLoading ? "opacity-50 pointer-events-none" : ""
            }`}
          ></Button>
        </View>
      </View>
    );
  }
  return (
    <View className="flex-1 w-full items-center bg-main-bg p-4 gap-4">
      <ScrollView className="bg-tabs-bg w-full h-[60%] border border-tabs-border-color rounded-lg">
        <Text className="text-text-color text-base px-4 py-2">
          {continuation.continuation}
        </Text>
      </ScrollView>
      <View className="flex flex-1 w-full flex-row gap-4 justify-between">
        <Button
          onPress={() => {
            setContinuation(continuationsInfo.continuation1);
            handlePressButton();
          }}
          className={`flex-1 h-full ${
            isStoryLoading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <Text className="text-text-color text-base overflow-hidden">
            {continuation.actions.action1}
          </Text>
        </Button>
        <Button
          onPress={() => {
            setContinuation(continuationsInfo.continuation2);
            handlePressButton();
          }}
          className={`flex-1 h-full ${
            isStoryLoading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <Text className="text-text-color text-base overflow-hidden">
            {continuation.actions.action2}
          </Text>
        </Button>
      </View>
    </View>
  );
});

export default StoryScreen;
