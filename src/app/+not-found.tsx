import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View className="flex-1 gap-4 items-center justify-center bg-[var(--main-bg)]">
        <Text className="text-xl font-semibold text-purple-300">Not found</Text>
        <Link
          href="/dictionary"
          className="border-2 px-2 border-purple-400 bg-purple-600 rounded-lg"
        >
          <Text className="text-xl font-semibold text-purple-300">
            To dictionary screen
          </Text>
        </Link>
      </View>
    </>
  );
}
