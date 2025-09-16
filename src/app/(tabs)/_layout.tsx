import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "var(--tabs-bg)",
          borderColor: "var(--tabs-border-color)",
        },
        headerStyle: {
          backgroundColor: "var(--tabs-bg)",
          borderBottomColor: "var(--tabs-bg)",
        },
        headerTitleStyle: {
          color: "var(--text-color)",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
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
    </Tabs>
  );
}
