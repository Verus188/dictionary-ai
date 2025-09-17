import Ionicons from "@expo/vector-icons/Ionicons";
import { FC } from "react";
import { Pressable, Text, View } from "react-native";

type DictionaryCardProps = {
  id: string;
  card: string;
  onDelete?: (id: string) => void;
};

export const DictionaryCard: FC<DictionaryCardProps> = ({
  card,
  id,
  onDelete,
}) => {
  return (
    <View className="flex flex-row w-full px-2 py-4 border-2 border-card-border-color bg-card-bg rounded-lg justify-between">
      <Text className="text-text-color text-xl">{card}</Text>
      <Pressable
        onPress={() => {
          onDelete?.(id);
        }}
      >
        <Ionicons name="close-outline" size={24} color="white" />
      </Pressable>
    </View>
  );
};
