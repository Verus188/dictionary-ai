import { Button } from "@/src/components/button";
import { storyInfoAtom } from "@/src/model/atoms";
import { reatomComponent } from "@reatom/npm-react";
import { ScrollView, Text, View } from "react-native";

const StoryScreen = reatomComponent(({ ctx }) => {
  const story = ctx.spy(storyInfoAtom);

  return (
    <View className="flex-1 w-full items-center bg-main-bg p-4 gap-4">
      <ScrollView className="bg-tabs-bg w-full h-[60%] border border-tabs-border-color rounded-lg">
        <Text className="text-text-color text-base px-4 py-2">
          {story?.story}
        </Text>
      </ScrollView>
      <View className="flex flex-1 w-full flex-row gap-4 justify-between">
        <Button className="flex-1 h-full">
          <Text className="text-text-color text-base overflow-hidden">
            {story?.firstAction}
          </Text>
        </Button>
        <Button className="flex-1 h-full">
          <Text className="text-text-color text-base overflow-hidden">
            {story?.secondAction}
          </Text>
        </Button>
      </View>
    </View>
  );
});

export default StoryScreen;
