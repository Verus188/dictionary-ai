import { Button } from '@/src/components/button';
import { nextStoryChunksResource, storyAtom, storyChunkAtom } from '@/src/model/atoms';
import { StoryChunk } from '@/src/model/types';
import { StorySettingsPage } from '@/src/pages/storySettingsPage';
import { reatomComponent } from '@reatom/npm-react';
import { ScrollView, Text, View } from 'react-native';

const StoryScreen = reatomComponent(({ ctx }) => {
    // хранит текущий отрывок истории и варианты действий
    const displayerChunk = ctx.spy(storyChunkAtom);
    console.log(displayerChunk);

    // загрузка истории
    const isStoryLoading = ctx.spy(nextStoryChunksResource.pendingAtom);

    // варинанты развития истории
    const continuationsInfo = ctx.spy(nextStoryChunksResource.dataAtom);

    const handlePressButton = async (continuation?: StoryChunk) => {
        if (continuation) {
            storyChunkAtom(ctx, continuation);
        }

        storyAtom(ctx, (prev) => prev + '\n' + displayerChunk?.text);
        const story = ctx.get(storyAtom);

        if (!story) return;
        nextStoryChunksResource(ctx);
    };

    if (!displayerChunk) return <StorySettingsPage />;

    return (
        <View className="flex-1 bg-main-bg items-center">
            <View className="flex-1 w-full max-w-[1200px] items-center p-4 gap-4">
                <ScrollView className="bg-tabs-bg w-full h-[60%] border border-tabs-border-color rounded-lg">
                    <Text className="text-text-color text-base px-4 py-2">
                        {displayerChunk?.text || ''}
                    </Text>
                </ScrollView>
                <View className="flex flex-1 w-full flex-row gap-4 justify-between">
                    <Button
                        onPress={() => {
                            handlePressButton(continuationsInfo?.chunk1);
                        }}
                        className={`flex-1 h-full ${
                            isStoryLoading ? 'opacity-50 pointer-events-none' : ''
                        }`}
                    >
                        <Text className="text-text-color text-base overflow-hidden">
                            {displayerChunk?.actions.action1 || ''}
                        </Text>
                    </Button>
                    <Button
                        onPress={() => {
                            handlePressButton(continuationsInfo?.chunk2);
                        }}
                        className={`flex-1 h-full ${
                            isStoryLoading ? 'opacity-50 pointer-events-none' : ''
                        }`}
                    >
                        <Text className="text-text-color text-base overflow-hidden">
                            {displayerChunk?.actions.action2 || ''}
                        </Text>
                    </Button>
                </View>
            </View>
        </View>
    );
});

export default StoryScreen;
