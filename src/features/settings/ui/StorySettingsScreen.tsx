import { Picker } from '@react-native-picker/picker';
import { reatomComponent } from '@reatom/npm-react';
import { Checkbox } from 'expo-checkbox';
import { useSQLiteContext } from 'expo-sqlite';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { initStoryAction } from '@/src/features/story/model/actions';
import { storyTagsAtoms, storySettingsAtoms } from '@/src/features/settings/model/atoms';
import { persistedStorySettingKeys } from '@/src/features/settings/model/constants';
import { updatePersistedSettingAction } from '@/src/features/settings/model/actions';
import storyTagsJson from '@/src/data/story-tags.json';
import { getColor } from '@/src/shared/theme/getColor';
import { StoryTagsCatalog } from '@/src/shared/types/story';
import { Button } from '@/src/shared/ui/Button';
import { isInitStoryLoadingAtom } from '@/src/features/story/model/atoms';

export const StorySettingsScreen = reatomComponent(({ ctx }) => {
    const db = useSQLiteContext();
    const {
        storyPromptAtom,
        chunkLengthAtom,
        storyLanguageDifficultyAtom,
        educationLanguageAtom,
    } = storySettingsAtoms;
    const isInitLoading = ctx.spy(isInitStoryLoadingAtom);
    const storyTags = storyTagsJson as StoryTagsCatalog;
    const pickerStyle = {
        height: 'auto' as const,
        color: getColor('text-color'),
        backgroundColor: getColor('transparent'),
    };

    return (
        <View className="flex-1 items-center bg-main-bg">
            <ScrollView className="flex-1 w-full max-w-[800px] px-8 py-4">
                <SafeAreaView className="flex-1">
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ flex: 1 }}
                    >
                        <View className="flex flex-col gap-8">
                            <View className="flex gap-2">
                                <Text className="text-lg text-text-color">
                                    Насколько длинные кусочки истории
                                </Text>
                                <View className="rounded border border-text-color px-2">
                                    <Picker<string>
                                        selectedValue={ctx.spy(chunkLengthAtom)}
                                        onValueChange={(value) => {
                                            updatePersistedSettingAction(
                                                ctx,
                                                db,
                                                chunkLengthAtom,
                                                persistedStorySettingKeys.chunkLength,
                                                value,
                                            );
                                        }}
                                        className="py-1"
                                        style={pickerStyle}
                                        dropdownIconColor={getColor('text-color')}
                                        mode="dropdown"
                                    >
                                        <Picker.Item label="Короткие" value="400" />
                                        <Picker.Item label="Средние (по умолчанию)" value="800" />
                                        <Picker.Item label="Длинные" value="1200" />
                                        <Picker.Item label="Очень длинные" value="1600" />
                                    </Picker>
                                </View>
                            </View>

                            <View className="flex gap-2">
                                <Text className="text-lg text-text-color">Язык повествования</Text>
                                <View className="rounded border border-text-color px-2">
                                    <Picker<string>
                                        selectedValue={ctx.spy(educationLanguageAtom)}
                                        onValueChange={(value) => {
                                            updatePersistedSettingAction(
                                                ctx,
                                                db,
                                                educationLanguageAtom,
                                                persistedStorySettingKeys.educationLanguage,
                                                value,
                                            );
                                        }}
                                        className="py-1"
                                        style={pickerStyle}
                                        dropdownIconColor={getColor('text-color')}
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

                            <View className="flex gap-2">
                                <Text className="text-lg text-text-color">
                                    Сложность языка истории
                                </Text>
                                <View className="rounded border border-text-color px-2">
                                    <Picker<string>
                                        selectedValue={ctx.spy(storyLanguageDifficultyAtom)}
                                        onValueChange={(value) => {
                                            updatePersistedSettingAction(
                                                ctx,
                                                db,
                                                storyLanguageDifficultyAtom,
                                                persistedStorySettingKeys.storyLanguageDifficulty,
                                                value,
                                            );
                                        }}
                                        className="py-1"
                                        style={pickerStyle}
                                        dropdownIconColor={getColor('text-color')}
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

                                    <Text className="text-lg text-text-color">Промт сюжета</Text>
                                    <Text className="text-sm text-text-color">
                                        Здесь можно задать дополнительный контекст для генерации или
                                        написать свой собственный сюжет.
                                    </Text>
                                    <TextInput
                                        multiline
                                        value={ctx.spy(storyPromptAtom) || ''}
                                        className="h-40 rounded border border-text-color px-1 py-1 text-warning-color"
                                        onChange={(event) => {
                                            storyPromptAtom(ctx, event.nativeEvent.text);
                                        }}
                                    />
                                </View>

                                <View className="flex gap-2">
                                    <Text className="text-lg text-text-color">Главный герой</Text>
                                    <View className="rounded border border-text-color px-2">
                                        <Picker<string | null>
                                            selectedValue={ctx.spy(storyTagsAtoms.character)}
                                            onValueChange={(value) => {
                                                storyTagsAtoms.character(ctx, value);
                                            }}
                                            className="py-1"
                                            style={pickerStyle}
                                            dropdownIconColor={getColor('text-color')}
                                            mode="dropdown"
                                        >
                                            <Picker.Item key="none" label="none" value={null} />
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

                                <View className="flex gap-2">
                                    <Text className="text-lg text-text-color">Жанры</Text>
                                    <View className="flex gap-2 p-2">
                                        {storyTags.genres.map((genre) => (
                                            <View
                                                className="flex flex-row items-center gap-2"
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
                                                            return;
                                                        }

                                                        storyTagsAtoms.genres(
                                                            ctx,
                                                            ctx
                                                                .get(storyTagsAtoms.genres)
                                                                .filter((item) => item !== genre),
                                                        );
                                                    }}
                                                />
                                                <Text className="text-lg text-text-color">
                                                    {genre}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                <View className="flex gap-2">
                                    <Text className="text-lg text-text-color">Сеттинг</Text>
                                    <View className="rounded border border-text-color px-2">
                                        <Picker<string | null>
                                            selectedValue={ctx.spy(storyTagsAtoms.setting)}
                                            onValueChange={(value) => {
                                                storyTagsAtoms.setting(ctx, value);
                                            }}
                                            className="py-1"
                                            style={pickerStyle}
                                            dropdownIconColor={getColor('text-color')}
                                            mode="dropdown"
                                        >
                                            <Picker.Item key="none" label="none" value={null} />
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

                                <View className="flex gap-2">
                                    <Text className="text-lg text-text-color">Мотив</Text>
                                    <View className="rounded border border-text-color px-2">
                                        <Picker<string | null>
                                            selectedValue={ctx.spy(storyTagsAtoms.plotMotif)}
                                            onValueChange={(value) => {
                                                storyTagsAtoms.plotMotif(ctx, value);
                                            }}
                                            className="py-1"
                                            style={pickerStyle}
                                            dropdownIconColor={getColor('text-color')}
                                            mode="dropdown"
                                        >
                                            <Picker.Item key="none" label="none" value={null} />
                                            {storyTags.plotMotifs.map((motif) => (
                                                <Picker.Item key={motif} label={motif} value={motif} />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>

                                <View className="flex gap-2">
                                    <Text className="text-lg text-text-color">
                                        Нарративный стиль
                                    </Text>
                                    <View className="rounded border border-text-color px-2">
                                        <Picker<string | null>
                                            selectedValue={ctx.spy(storyTagsAtoms.narrativeStyle)}
                                            onValueChange={(value) => {
                                                storyTagsAtoms.narrativeStyle(ctx, value);
                                            }}
                                            className="py-1"
                                            style={pickerStyle}
                                            dropdownIconColor={getColor('text-color')}
                                            mode="dropdown"
                                        >
                                            <Picker.Item key="none" label="none" value={null} />
                                            {storyTags.narrativeStyle.map((style) => (
                                                <Picker.Item key={style} label={style} value={style} />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>

                                <View className="flex gap-2">
                                    <Text className="text-lg text-text-color">Тон</Text>
                                    <View className="rounded border border-text-color px-2">
                                        <Picker<string | null>
                                            selectedValue={ctx.spy(storyTagsAtoms.tone)}
                                            onValueChange={(value) => {
                                                storyTagsAtoms.tone(ctx, value);
                                            }}
                                            className="py-1"
                                            style={pickerStyle}
                                            dropdownIconColor={getColor('text-color')}
                                            mode="dropdown"
                                        >
                                            <Picker.Item key="none" label="none" value={null} />
                                            {storyTags.tone.map((tone) => (
                                                <Picker.Item key={tone} label={tone} value={tone} />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>
                            </View>
                            <Button
                                onPress={async () => {
                                    try {
                                        await initStoryAction(ctx);
                                    } catch (error) {
                                        void error;
                                    }
                                }}
                                disabled={isInitLoading}
                                className={`py-2 ${
                                    isInitLoading ? 'pointer-events-none opacity-50' : ''
                                }`}
                            >
                                <Text className="text-lg text-text-color">
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
