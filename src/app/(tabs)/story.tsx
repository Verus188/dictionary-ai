import { Button } from "@/src/components/button";
import { continueStory } from "@/src/functions/continue-story";
import { getStoryActions } from "@/src/functions/get-story-actions";
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
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

const StoryScreen = reatomComponent(({ ctx }) => {
  // для отображения. История и возможные действия
  const [continuation, setContinuation] = useState<StoryContinuation | null>(
    null
  );
  const isStoryLoading = ctx.spy(isStoryLoadingAtom);

  // варинанты развития истории
  const continuationsInfo = ctx.spy(storyContinuationAtom);
  const story = ctx.get(storyAtom);

  const handlePressButton = () => {
    isStoryLoadingAtom(ctx, true);
    storyAtom(ctx, (prev) => prev + "\n" + continuation?.continuation);
    const story = ctx.get(storyAtom);

    if (!story) return;
    continueStory(
      story,
      continuation?.actions,
      ctx.get(storyContinuationLengthAtom),
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

  if (!continuation)
    return (
      <View className="flex-1 bg-main-bg justify-center items-center">
        <Button
          onPress={async () => {
            isStoryLoadingAtom(ctx, true);
            const actions = await getStoryActions(ctx);
            setContinuation({
              continuation: story || "",
              actions,
            });

            isStoryLoadingAtom(ctx, false);
          }}
          className={`w-1/2 py-10 max-w-[600px] ${
            isStoryLoading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <Text className="text-text-color text-center text-base overflow-hidden">
            Start story
          </Text>
        </Button>
      </View>
    );

  return (
    <View className="flex-1 bg-main-bg items-center">
      <View className="flex-1 w-full max-w-[1200px] items-center p-4 gap-4">
        <ScrollView className="bg-tabs-bg w-full h-[60%] border border-tabs-border-color rounded-lg">
          <Text className="text-text-color text-base px-4 py-2">
            {continuation?.continuation || ""}
          </Text>
        </ScrollView>
        <View className="flex flex-1 w-full flex-row gap-4 justify-between">
          <Button
            onPress={() => {
              setContinuation(continuationsInfo?.continuation1 || null);
              handlePressButton();
            }}
            className={`flex-1 h-full ${
              isStoryLoading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <Text className="text-text-color text-base overflow-hidden">
              {continuation?.actions.action1 || ""}
            </Text>
          </Button>
          <Button
            onPress={() => {
              setContinuation(continuationsInfo?.continuation2 || null);
              handlePressButton();
            }}
            className={`flex-1 h-full ${
              isStoryLoading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <Text className="text-text-color text-base overflow-hidden">
              {continuation?.actions.action2 || ""}
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
});

export default StoryScreen;
