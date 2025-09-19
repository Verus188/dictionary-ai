import { Button } from "@/src/components/button";
import { doStoryAction } from "@/src/helpers/doStoryAction";
import { storyInfoAtom } from "@/src/model/atoms";
import { reatomComponent } from "@reatom/npm-react";
import { ScrollView, Text, View } from "react-native";

const StoryScreen = reatomComponent(({ ctx }) => {
  const storyInfo = ctx.spy(storyInfoAtom);
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
            doStoryAction(story, firstAction).then((storyInfo) => {
              storyInfoAtom(ctx, storyInfo);
            });
          }}
          className="flex-1 h-full"
        >
          <Text className="text-text-color text-base overflow-hidden">
            {firstAction}
          </Text>
        </Button>
        <Button
          onPress={() => {
            doStoryAction(story, secondAction).then((storyInfo) => {
              storyInfoAtom(ctx, storyInfo);
            });
          }}
          className="flex-1 h-full"
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
