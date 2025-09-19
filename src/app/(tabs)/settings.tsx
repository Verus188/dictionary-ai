import { Button } from "@/src/components/button";
import { AIController, setAIController } from "@/src/enteties/AIController";
import {
  educationLanguageAtom,
  openRouterAIModelAtom,
  openRouterTokenAtom,
} from "@/src/model/atoms";
import { Picker } from "@react-native-picker/picker";
import { reatomComponent } from "@reatom/npm-react";
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

const SettingsScreen = reatomComponent(({ ctx }) => {
  const [openRouterToken, setOpenRouterToken] = useState("");
  const token = ctx.spy(openRouterTokenAtom);
  const AIModel = ctx.spy(openRouterAIModelAtom);

  return (
    <ScrollView className="bg-main-bg p-4">
      <View className="flex flex-col gap-8">
        <View className="flex gap-2">
          <Text className="text-lg text-text-color">OpenRouter AI model</Text>
          <Picker<string | null>
            onValueChange={(value) => {
              setAIController(value);
              openRouterAIModelAtom(ctx, value);
            }}
            style={{
              color: "white",
              backgroundColor: "transparent",
              borderColor: "white",
              borderWidth: 1,
              borderRadius: 4,
              padding: 4,
            }}
          >
            <Picker.Item
              label="Google: Gemini-2.5-flash (free)"
              value="gemeni"
            />
            <Picker.Item
              label="DeepSeek: DeepSeek V3.1 (free)"
              value="deepseek/deepseek-chat-v3.1:free"
            />
            <Picker.Item
              label="Mistral: Mistral Small 3.2 24B (free)"
              value="mistralai/mistral-small-3.2-24b-instruct:free"
            />
            <Picker.Item
              label="NVIDIA: Nemotron Nano 9B V2 (free)"
              value="nvidia/nemotron-nano-9b-v2:free"
            />
            <Picker.Item
              label="Sonoma Sky Alpha"
              value="openrouter/sonoma-sky-alpha"
            />
            <Picker.Item
              label="Google: Gemma 3n 2B (free)"
              value="google/gemma-3n-e2b-it:free"
            />
          </Picker>
        </View>

        {AIModel !== "gemeni" && (
          <View className="flex gap-2">
            <Text className="text-lg text-text-color">OpenRouter token</Text>
            <TextInput
              className={`border border-text-color rounded ${
                token === openRouterToken ? "text-blue-400" : "text-text-color"
              } py-1 px-1`}
              onChangeText={setOpenRouterToken}
            />
            <Button onPress={() => openRouterTokenAtom(ctx, openRouterToken)}>
              <Text className="text-text-color">Set</Text>
            </Button>
          </View>
        )}

        <Button
          onPress={() => {
            console.log(`${ctx.get(openRouterAIModelAtom)} is thinking...`);

            AIController.generateAIText(
              "Расскажи небольшую историю о себе"
            ).then((text) => {
              console.log(text);
            });
          }}
        >
          <Text className="text-text-color">Test</Text>
        </Button>

        <View className="flex gap-2">
          <Text className="text-lg text-text-color">Story language</Text>
          <Picker<string>
            onValueChange={(value) => {
              educationLanguageAtom(ctx, value);
            }}
            style={{
              color: "white",
              backgroundColor: "transparent",
              borderColor: "white",
              borderWidth: 1,
              borderRadius: 4,
              padding: 4,
            }}
          >
            <Picker.Item label="English" value="English" />
            <Picker.Item label="Hindi" value="Hindi" />
            <Picker.Item label="Spanish" value="Spanish" />
            <Picker.Item label="French" value="French" />
            <Picker.Item label="Arabic" value="Arabic" />
            <Picker.Item label="Bengali" value="Bengali" />
            <Picker.Item label="Russian" value="Russian" />
            <Picker.Item label="Portuguese" value="Portuguese" />
            <Picker.Item label="Urdu" value="Urdu" />
            <Picker.Item label="German" value="German" />
            <Picker.Item label="Italian" value="Italian" />
            <Picker.Item label="Kazakh" value="Kazakh" />
            <Picker.Item label="Ukrainian" value="Ukrainian" />
            <Picker.Item label="Polish" value="Polish" />
          </Picker>
        </View>
      </View>
    </ScrollView>
  );
});

export default SettingsScreen;
