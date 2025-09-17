import { Button } from "@/src/components/button";
import { openRouterTokenAtom } from "@/src/model/atoms";
import { reatomComponent } from "@reatom/npm-react";
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

const SettingsScreen = reatomComponent(({ ctx }) => {
  const [inputText, setInputText] = useState("");
  const token = ctx.spy(openRouterTokenAtom);

  return (
    <ScrollView className="bg-main-bg p-4">
      <View className="flex gap-2">
        <Text className="text-lg text-text-color">OpenRouter token</Text>
        <TextInput
          className={`border border-text-color rounded ${
            token === inputText ? "text-blue-400" : "text-text-color"
          } py-1 px-1`}
          onChangeText={setInputText}
        />
        <Button onPress={() => openRouterTokenAtom(ctx, inputText)}>
          <Text className="text-text-color">Set</Text>
        </Button>
      </View>
    </ScrollView>
  );
});

export default SettingsScreen;
