import { Button } from "@/src/components/button";
import { doStoryAction } from "@/src/helpers/doStoryAction";
import {
  educationLanguageAtom,
  isStoryLoadingAtom,
  storyInfoAtom,
} from "@/src/model/atoms";
import { reatomComponent } from "@reatom/npm-react";
import { ScrollView, Text, View } from "react-native";

const StoryScreen = reatomComponent(({ ctx }) => {
  const isStoryLoading = ctx.spy(isStoryLoadingAtom);
  const storyInfo = ctx.spy(storyInfoAtom);
  const language = ctx.spy(educationLanguageAtom);
  if (!storyInfo) {
    return null;
  }
  const story = storyInfo.story || "";
  const continuation = storyInfo.continuation || "";
  const firstAction = storyInfo.firstAction || "";
  const secondAction = storyInfo.secondAction || "";

  return (
    <View className="flex-1 w-full items-center bg-main-bg p-4 gap-4">
      <ScrollView className="bg-tabs-bg w-full h-[60%] border border-tabs-border-color rounded-lg">
        <Text className="text-text-color text-base px-4 py-2">
          {continuation}
        </Text>
      </ScrollView>
      <View className="flex flex-1 w-full flex-row gap-4 justify-between">
        <Button
          onPress={() => {
            isStoryLoadingAtom(ctx, true);
            doStoryAction(story, firstAction, undefined, undefined, language)
              .then((storyInfo) => {
                storyInfoAtom(ctx, storyInfo);
              })
              .finally(() => {
                isStoryLoadingAtom(ctx, false);
              });
          }}
          className={`flex-1 h-full ${
            isStoryLoading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <Text className="text-text-color text-base overflow-hidden">
            {firstAction}
          </Text>
        </Button>
        <Button
          onPress={() => {
            isStoryLoadingAtom(ctx, true);
            doStoryAction(story, secondAction, undefined, undefined, language)
              .then((storyInfo) => {
                storyInfoAtom(ctx, storyInfo);
              })
              .finally(() => {
                isStoryLoadingAtom(ctx, false);
              });
          }}
          className={`flex-1 h-full ${
            isStoryLoading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <Text className="text-text-color text-base overflow-hidden">
            {secondAction}
          </Text>
        </Button>
      </View>
    </View>
  );
});

export default StoryScreen;
