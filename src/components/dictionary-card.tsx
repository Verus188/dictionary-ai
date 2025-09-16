import { FC } from "react";
import { Text, View } from "react-native";

type DictionaryCardProps = {
  card: string;
};

export const DictionaryCard: FC<DictionaryCardProps> = ({ card }) => {
  return (
    <View className="flex w-full px-2 py-4 border-2 border-card-border-color bg-card-bg rounded-lg">
      <Text className="text-text-color text-xl">{card}</Text>
    </View>
  );
};
