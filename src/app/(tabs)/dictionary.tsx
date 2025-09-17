import { DictionaryCard } from "@/src/components/dictionary-card";
import { InputModal } from "@/src/components/input-modal";
import { generateId } from "@/src/helpers/generateId";
import { dictionaryCardsAtom, isCardModalVisibleAtom } from "@/src/model/atoms";
import Ionicons from "@expo/vector-icons/Ionicons";
import { reatomComponent } from "@reatom/npm-react";
import { ScrollView, Text, View } from "react-native";

const DictionaryScreen = reatomComponent(({ ctx }) => {
  const cards = ctx.spy(dictionaryCardsAtom);

  return (
    <>
      {cards.length > 0 ? (
        <ScrollView
          className="flex-1 bg-main-bg"
          contentContainerStyle={{
            paddingVertical: 16,
            paddingHorizontal: 16,
          }}
        >
          <View className="flex flex-col gap-4">
            {cards.map((card) => (
              <DictionaryCard
                key={card.id}
                card={card.card}
                id={card.id}
                onDelete={(id) =>
                  dictionaryCardsAtom(ctx, (cards) =>
                    cards.filter((card) => card.id !== id)
                  )
                }
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <View className="flex flex-col h-full gap-4 items-center justify-center bg-main-bg">
          <Ionicons name="search-outline" size={100} color={"#60A5FA"} />
          <Text className="text-xl font-semibold text-blue-400">Empty</Text>
        </View>
      )}
      <InputModal
        isVisible={ctx.spy(isCardModalVisibleAtom)}
        onClose={() => isCardModalVisibleAtom(ctx, false)}
        onSubmit={(card) =>
          dictionaryCardsAtom(ctx, (cards) => [
            ...cards,
            { card, id: generateId() },
          ])
        }
        submitButtonText="Add"
      />
    </>
  );
});

export default DictionaryScreen;
