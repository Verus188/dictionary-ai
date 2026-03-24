import { reatomComponent } from '@reatom/npm-react';
import { ScrollView, Text, View } from 'react-native';
import { StorySettingsScreen } from '@/src/features/settings/ui/StorySettingsScreen';
import {
    chooseStoryContinuationAction,
} from '@/src/features/story/model/actions';
import { nextStoryChunksResource, storyChunkAtom } from '@/src/features/story/model/atoms';
import { Button } from '@/src/shared/ui/Button';

export const StoryScreen = reatomComponent(({ ctx }) => {
    const displayedChunk = ctx.spy(storyChunkAtom);
    const isStoryLoading = ctx.spy(nextStoryChunksResource.pendingAtom);
    const continuationsInfo = ctx.spy(nextStoryChunksResource.dataAtom);

    if (!displayedChunk) {
        return <StorySettingsScreen />;
    }

    return (
        <View className="flex-1 items-center bg-main-bg">
            <View className="flex-1 w-full max-w-[1200px] items-center gap-4 p-4">
                <ScrollView className="h-[60%] w-full rounded-lg border border-tabs-border-color bg-tabs-bg">
                    <Text className="px-4 py-2 text-base text-text-color">
                        {displayedChunk.text}
                    </Text>
                </ScrollView>
                <View className="flex w-full flex-1 flex-row justify-between gap-4">
                    <Button
                        onPress={() => {
                            chooseStoryContinuationAction(ctx, continuationsInfo?.chunk1);
                        }}
                        className={`flex-1 h-full ${
                            isStoryLoading ? 'pointer-events-none opacity-50' : ''
                        }`}
                    >
                        <Text className="overflow-hidden text-base text-text-color">
                            {displayedChunk.actions.action1}
                        </Text>
                    </Button>
                    <Button
                        onPress={() => {
                            chooseStoryContinuationAction(ctx, continuationsInfo?.chunk2);
                        }}
                        className={`flex-1 h-full ${
                            isStoryLoading ? 'pointer-events-none opacity-50' : ''
                        }`}
                    >
                        <Text className="overflow-hidden text-base text-text-color">
                            {displayedChunk.actions.action2}
                        </Text>
                    </Button>
                </View>
            </View>
        </View>
    );
});
