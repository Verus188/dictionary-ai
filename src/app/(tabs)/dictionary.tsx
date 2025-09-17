import { DictionaryCard } from "@/src/components/dictionary-card";
import { getColor } from "@/src/helpers/twColors";
import { dictionaryCardsAtom } from "@/src/model/atoms";
import Ionicons from "@expo/vector-icons/Ionicons";
import { reatomComponent } from "@reatom/npm-react";
import { ScrollView, Text, View } from "react-native";

const DictionaryScreen = reatomComponent(({ ctx }) => {
  const cards = ctx.spy(dictionaryCardsAtom);

  if (cards.length <= 0) {
    return (
      <View className="flex flex-col h-full gap-4 items-center justify-center bg-main-bg">
        <Ionicons
          name="search-outline"
          size={100}
          color={getColor("text-blue-400")}
        />
        <Text className="text-xl font-semibold text-blue-400">Empty</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-main-bg"
      contentContainerStyle={{
        paddingVertical: 16,
        paddingHorizontal: 16,
      }}
    >
      <View className="flex flex-col gap-4">
        {cards.map((card, index) => (
          <DictionaryCard
            key={`${card}-${index + 1}`}
            card={`${card}-${index + 1}`}
          />
        ))}
      </View>
    </ScrollView>
  );
});

export default DictionaryScreen;
