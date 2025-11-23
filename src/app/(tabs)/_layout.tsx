import { SpinningIcon } from '@/src/components/spinning-icon';
import { getColor } from '@/src/helpers/tw-colors';
import {
    isCardModalVisibleAtom,
    nextStoryChunksResource,
    storyAtom,
    storyChunkAtom,
} from '@/src/model/atoms';
import Ionicons from '@expo/vector-icons/Ionicons';
import { reatomComponent } from '@reatom/npm-react';
import { Tabs } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import '../../global.css';

const TabLayout = reatomComponent(({ ctx }) => {
    const isStoryLoading = ctx.spy(nextStoryChunksResource.pendingAtom);

    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: getColor('tabs-bg'),
                    borderColor: getColor('tabs-border-color'),
                },
                headerStyle: {
                    backgroundColor: getColor('tabs-bg'),
                    borderBottomColor: getColor('tabs-border-color'),
                },
                headerTitleStyle: {
                    color: getColor('text-color'),
                },
                headerShadowVisible: false,
            }}
        >
            <Tabs.Screen
                name="dictionary"
                options={{
                    title: 'Dictionary',
                    headerRight: () => (
                        <Pressable
                            className="px-4"
                            onPress={() => {
                                isCardModalVisibleAtom(ctx, true);
                            }}
                        >
                            <Text className="text-blue-500 capitalize">add</Text>
                        </Pressable>
                    ),
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'book-sharp' : 'book-outline'}
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="story"
                options={{
                    headerShown: true,
                    title: 'Story',
                    headerRight: () => {
                        return (
                            <View className="flex flex-row gap-4 items-center">
                                <Pressable
                                    className="px-4"
                                    onPress={() => {
                                        nextStoryChunksResource.reset(ctx);
                                        storyChunkAtom(ctx, null);
                                        storyAtom(ctx, null);
                                    }}
                                >
                                    <Text className="text-blue-500 capitalize">reset</Text>
                                </Pressable>
                                {isStoryLoading && (
                                    <View className="flex justify-center items-center px-4">
                                        <SpinningIcon />
                                    </View>
                                )}
                            </View>
                        );
                    },
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'game-controller-sharp' : 'game-controller-outline'}
                            color={color}
                            size={24}
                        />
                    ),
                }}
            />
        </Tabs>
    );
});

export default TabLayout;
