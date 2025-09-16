import { reatomContext } from "@reatom/npm-react";
import { Stack } from "expo-router";
import { reatomCtx } from "../model/atoms";

export default function RootLayout() {
  return (
    <reatomContext.Provider value={reatomCtx}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </reatomContext.Provider>
  );
}
