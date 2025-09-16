import { getColor } from "@/src/helpers/twColors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import "../../global.css";

export default function TabLayout() {
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
          title: "Story",
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
    </Tabs>
  );
}
