import { SpinningIcon } from "@/src/components/spinning-icon";
import { storage } from "@/src/enteties/strorage-controller";
import { getColor } from "@/src/helpers/twColors";
import { isCardModalVisibleAtom, isStoryLoadingAtom } from "@/src/model/atoms";
import Ionicons from "@expo/vector-icons/Ionicons";
import { reatomComponent } from "@reatom/npm-react";
import { Tabs } from "expo-router";
import { Pressable, Text, View } from "react-native";
import "../../global.css";

const TabLayout = reatomComponent(({ ctx }) => {
  const isStoryLoading = ctx.spy(isStoryLoadingAtom);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: getColor("tabs-bg"),
          borderColor: getColor("tabs-border-color"),
        },
        headerStyle: {
          backgroundColor: getColor("tabs-bg"),
          borderBottomColor: getColor("tabs-border-color"),
        },
        headerTitleStyle: {
          color: getColor("text-color"),
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="dictionary"
        options={{
          title: "Dictionary",
          headerRight: () => (
            <Pressable
              className="px-4"
              onPress={() => {
                isCardModalVisibleAtom(ctx, true);
                console.log(storage.getAllCards());
              }}
            >
              <Text className="text-blue-500 capitalize">add</Text>
            </Pressable>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "book-sharp" : "book-outline"}
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
          title: "Story",
          headerRight: () => {
            if (isStoryLoading) {
              return (
                <View className="flex justify-center items-center px-4">
                  <SpinningIcon />
                </View>
              );
            }
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused ? "game-controller-sharp" : "game-controller-outline"
              }
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings-sharp" : "settings-outline"}
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
