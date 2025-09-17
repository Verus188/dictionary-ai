import { Button } from "@/src/components/button";
import { reatomComponent } from "@reatom/npm-react";
import { ScrollView, Text, TextInput, View } from "react-native";

const SettingsScreen = reatomComponent(({ ctx }) => {
  return (
    <ScrollView className="bg-main-bg p-4">
      <View className="flex gap-2">
        <Text className="text-lg text-text-color">OpenRouter token</Text>
        <TextInput className="border border-text-color rounded text-text-color px-1" />
        <Button>
          <Text>Set</Text>
        </Button>
      </View>
    </ScrollView>
  );
});

export default SettingsScreen;
