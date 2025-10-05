import { setAIController } from "@/src/enteties/AIController";
import { setSettingAction } from "@/src/model/actions";
import {
  AIModelAtom,
  dictionaryCardsAtom,
  displayedChunkAtom,
  educationLanguageAtom,
  isStoryLoadingAtom,
  openRouterTokenAtom,
  storyContinuationAtom,
  storyContinuationLengthAtom,
  storyLanguageDifficultyAtom,
  storyPromptAtom,
  storyTagsAtoms,
} from "@/src/model/atoms";
import { StoryTagsType } from "@/src/model/types";
import { Picker } from "@react-native-picker/picker";
import { reatomComponent } from "@reatom/npm-react";
import { Checkbox } from "expo-checkbox";
import { useSQLiteContext } from "expo-sqlite";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/button";
import storyTagsJson from "../data/story-tags.json";
import { continueStory } from "../functions/continue-story";
import { genereateStory } from "../functions/generate-story";

export const StorySettingsPage = reatomComponent(({ ctx }) => {
  const db = useSQLiteContext();
  const token = ctx.spy(openRouterTokenAtom);
  const AIModel = ctx.spy(AIModelAtom);
  const storyTags: StoryTagsType = storyTagsJson as StoryTagsType;

  return (
    <View className="flex-1 bg-main-bg items-center">
      <ScrollView className="flex-1 w-full px-8 py-4 max-w-[800px]">
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <View className="flex flex-col gap-8">
              {/* Выбор модели */}
              <View className="flex gap-2">
                <Text className="text-lg text-text-color">
                  OpenRouter AI model
                </Text>
                <View className="rounded border border-white px-2">
                  <Picker<string>
                    onValueChange={(value) => {
                      setSettingAction(ctx, db, AIModelAtom, "AIModel", value);
                      setAIController(value);
                    }}
                    className="py-1"
                    style={{
                      height: "auto",
                      color: "white",
                      backgroundColor: "transparent",
                      paddingVertical: 4,
                    }}
                    dropdownIconColor="white"
                    mode="dropdown"
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
              </View>

              {/* Токен */}
              {AIModel !== "gemeni" && (
                <View className="flex gap-2">
                  <Text className="text-lg text-text-color">
                    OpenRouter token
                  </Text>
                  <TextInput
                    className={`border border-text-color rounded text-blue-400 py-1 px-1`}
                    onChange={(e) => {
                      setSettingAction(
                        ctx,
                        db,
                        openRouterTokenAtom,
                        "openRouterToken",
                        e.nativeEvent.text
                      );
                    }}
                    value={token}
                  />
                </View>
              )}

              {/* настройка длинны продолжений */}
              <View className="flex gap-2">
                <Text className="text-lg text-text-color">
                  Насколько длинные кусочки истории
                </Text>
                <View className="rounded border border-white px-2">
                  <Picker<string>
                    selectedValue={ctx.spy(storyContinuationLengthAtom)}
                    onValueChange={(value) => {
                      setSettingAction(
                        ctx,
                        db,
                        storyContinuationLengthAtom,
                        "storyContinuationLength",
                        value
                      );
                    }}
                    className="py-1"
                    style={{
                      height: "auto",
                      color: "white",
                      backgroundColor: "transparent",
                    }}
                    dropdownIconColor="white"
                    mode="dropdown"
                  >
                    <Picker.Item label="Короткие" value="400" />
                    <Picker.Item label="Средние (по умолчанию)" value="800" />
                    <Picker.Item label="Длинные" value="1200" />
                    <Picker.Item label="Очень длинные" value="1600" />
                  </Picker>
                </View>
              </View>

              {/* Выбор языка повествования */}
              <View className="flex gap-2">
                <Text className="text-lg text-text-color">
                  Язык повествования
                </Text>
                <View className="rounded border border-white px-2">
                  <Picker<string>
                    selectedValue={ctx.spy(educationLanguageAtom)}
                    onValueChange={(value) => {
                      setSettingAction(
                        ctx,
                        db,
                        educationLanguageAtom,
                        "educationLanguage",
                        value
                      );
                    }}
                    className="py-1"
                    style={{
                      height: "auto",
                      color: "white",
                      backgroundColor: "transparent",
                    }}
                    dropdownIconColor="white"
                    mode="dropdown"
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

              {/* Сложность языка повествования */}
              <View className="flex gap-2">
                <Text className="text-lg text-text-color">
                  Сложность языка истории
                </Text>
                <View className="rounded border border-white px-2">
                  <Picker<string>
                    selectedValue={ctx.spy(storyLanguageDifficultyAtom)}
                    onValueChange={(value) => {
                      setSettingAction(
                        ctx,
                        db,
                        storyLanguageDifficultyAtom,
                        "storyLanguageDifficulty",
                        value
                      );
                    }}
                    className="py-1"
                    style={{
                      height: "auto",
                      color: "white",
                      backgroundColor: "transparent",
                    }}
                    dropdownIconColor="white"
                    mode="dropdown"
                  >
                    <Picker.Item label="Очень простая" value="1" />
                    <Picker.Item label="Простая (по умолчанию)" value="2" />
                    <Picker.Item label="Срядняя" value="3" />
                    <Picker.Item label="Продвинутая" value="4" />
                    <Picker.Item label="Сложная" value="5" />
                    <Picker.Item label="Очень сложная" value="6" />
                  </Picker>
                </View>
              </View>

              <View className="flex gap-8">
                <View className="flex gap-2">
                  <Text className="text-lg text-text-color">
                    Настройки сюжета
                  </Text>

                  {/* Промт сюжета */}
                  <Text className="text-lg text-text-color">Промт сюжета</Text>
                  <Text className="text-sm text-text-color">
                    Здесь можно задать дополнительный контекст для генерации или
                    написать свой собственный сюжет.
                  </Text>
                  <TextInput
                    multiline
                    value={ctx.spy(storyPromptAtom) || ""}
                    className="h-40 text-orange-400 border border-text-color rounded py-1 px-1"
                    onChange={(e) => {
                      storyPromptAtom(ctx, e.nativeEvent.text);
                    }}
                  />
                </View>

                {/* Главный герой */}
                <View className="flex gap-2">
                  <Text className="text-lg text-text-color">Главный герой</Text>
                  <View className="rounded border border-white px-2">
                    <Picker<string>
                      selectedValue={ctx.spy(storyTagsAtoms.character)}
                      onValueChange={(value) => {
                        storyTagsAtoms.setting(ctx, value);
                      }}
                      className="py-1"
                      style={{
                        height: "auto",
                        color: "white",
                        backgroundColor: "transparent",
                      }}
                      dropdownIconColor="white"
                      mode="dropdown"
                    >
                      <Picker.Item key={"none"} label={"none"} value={""} />
                      {storyTags.characters.map((character) => (
                        <Picker.Item
                          key={character}
                          label={character}
                          value={character}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Жанры */}
                <View className="flex gap-2">
                  <Text className="text-lg text-text-color">Жанры</Text>
                  <View className="flex gap-2 p-2">
                    {storyTags.genres.map((genre) => (
                      <View
                        className="flex gap-2 flex-row items-center"
                        key={genre}
                      >
                        <Checkbox
                          className="size-5"
                          value={ctx.spy(storyTagsAtoms.genres).includes(genre)}
                          onValueChange={(value) => {
                            if (value) {
                              storyTagsAtoms.genres(ctx, [
                                ...ctx.get(storyTagsAtoms.genres),
                                genre,
                              ]);
                            } else {
                              storyTagsAtoms.genres(ctx, [
                                ...ctx
                                  .get(storyTagsAtoms.genres)
                                  .filter((g) => g !== genre),
                              ]);
                            }
                          }}
                        />
                        <Text className="text-text-color text-lg">{genre}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Сеттинги */}
                <View className="flex gap-2">
                  <Text className="text-lg text-text-color">Сеттинг</Text>
                  <View className="rounded border border-white px-2">
                    <Picker<string>
                      selectedValue={ctx.spy(storyTagsAtoms.setting)}
                      onValueChange={(value) => {
                        storyTagsAtoms.setting(ctx, value);
                      }}
                      className="py-1"
                      style={{
                        height: "auto",
                        color: "white",
                        backgroundColor: "transparent",
                      }}
                      dropdownIconColor="white"
                      mode="dropdown"
                    >
                      <Picker.Item key={"none"} label={"none"} value={""} />
                      {storyTags.settings.map((setting) => (
                        <Picker.Item
                          key={setting}
                          label={setting}
                          value={setting}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Мотивы сюжета */}
                <View className="flex gap-2">
                  <Text className="text-lg text-text-color">Мотив</Text>
                  <View className="rounded border border-white px-2">
                    <Picker<string>
                      selectedValue={ctx.spy(storyTagsAtoms.plotMotif)}
                      onValueChange={(value) => {
                        storyTagsAtoms.plotMotif(ctx, value);
                      }}
                      className="py-1"
                      style={{
                        height: "auto",
                        color: "white",
                        backgroundColor: "transparent",
                      }}
                      dropdownIconColor="white"
                      mode="dropdown"
                    >
                      <Picker.Item key={"none"} label={"none"} value={""} />
                      {storyTags.plotMotifs.map((motif) => (
                        <Picker.Item key={motif} label={motif} value={motif} />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Нарративный стиль */}
                <View className="flex gap-2">
                  <Text className="text-lg text-text-color">
                    Нарративный стиль
                  </Text>
                  <View className="rounded border border-white px-2">
                    <Picker<string>
                      selectedValue={ctx.spy(storyTagsAtoms.narrativeStyle)}
                      onValueChange={(value) => {
                        storyTagsAtoms.narrativeStyle(ctx, value);
                      }}
                      className="py-1"
                      style={{
                        height: "auto",
                        color: "white",
                        backgroundColor: "transparent",
                      }}
                      dropdownIconColor="white"
                      mode="dropdown"
                    >
                      <Picker.Item key={"none"} label={"none"} value={""} />
                      {storyTags.narrativeStyle.map((style) => (
                        <Picker.Item key={style} label={style} value={style} />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Тон истории */}
                <View className="flex gap-2">
                  <Text className="text-lg text-text-color">Тон</Text>
                  <View className="rounded border border-white px-2">
                    <Picker<string>
                      selectedValue={ctx.spy(storyTagsAtoms.tone)}
                      onValueChange={(value) => {
                        storyTagsAtoms.tone(ctx, value);
                      }}
                      className="py-1"
                      style={{
                        height: "auto",
                        color: "white",
                        backgroundColor: "transparent",
                      }}
                      dropdownIconColor="white"
                      mode="dropdown"
                    >
                      <Picker.Item key={"none"} label={"none"} value={""} />
                      {storyTags.tone.map((tone) => (
                        <Picker.Item key={tone} label={tone} value={tone} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
              <Button
                onPress={async () => {
                  isStoryLoadingAtom(ctx, true);
                  const story = await genereateStory(ctx);
                  displayedChunkAtom(ctx, story);
                  const storyContinuation = await continueStory(
                    story.chunk,
                    story.actions,
                    ctx.get(storyContinuationLengthAtom),
                    ctx.get(educationLanguageAtom),
                    ctx.get(storyLanguageDifficultyAtom),
                    ctx.get(dictionaryCardsAtom)
                  );
                  storyContinuationAtom(ctx, storyContinuation);
                  isStoryLoadingAtom(ctx, false);
                }}
                className={`py-2 ${
                  ctx.spy(isStoryLoadingAtom)
                    ? "opacity-50 pointer-events-none"
                    : ""
                }`}
              >
                <Text className="text-text-color text-lg">
                  Сгенерировать историю
                </Text>
              </Button>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
});
