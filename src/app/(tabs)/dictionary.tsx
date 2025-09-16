import { DictionaryCard } from "@/src/components/dictionary-card";
import { dictionaryCardsAtom } from "@/src/model/atoms";
import { reatomComponent } from "@reatom/npm-react";
import { Button, Text, View } from "react-native";

const DictionaryScreen = reatomComponent(({ ctx }) => {
  const cards = ctx.spy(dictionaryCardsAtom);

  if (cards.length <= 0) {
    return (
      <View className="flex flex-col h-full gap-4 items-center justify-center bg-main-bg">
        <Text className="text-xl font-semibold text-blue-400">Empty</Text>
        <Button
          title="Add card"
          onPress={() => {
            console.log(cards);

            dictionaryCardsAtom(ctx, (cards) => [...cards, "card"]);
          }}
        />
      </View>
    );
  }

  return (
    <View className="flex flex-col py-4 px-4 h-full gap-4 bg-main-bg overflow-y-auto">
      {cards.map((card, index) => (
        <DictionaryCard
          key={`${card}-${index + 1}`}
          card={`${card}-${index + 1}`}
        />
      ))}
      <Button
        title="Add card"
        onPress={() => {
          console.log(cards);

          dictionaryCardsAtom(ctx, (cards) => [...cards, "card"]);
        }}
      />
    </View>
  );
});

export default DictionaryScreen;
