import { DictionaryCardsList } from "@/src/components/ dictionary-cards-list";
import { InputModal } from "@/src/components/input-modal";
import { addDictionaryCardAction } from "@/src/model/actions";
import { dictionaryCardsAtom, isCardModalVisibleAtom } from "@/src/model/atoms";
import Ionicons from "@expo/vector-icons/Ionicons";
import { reatomComponent } from "@reatom/npm-react";
import { useSQLiteContext } from "expo-sqlite";
import { ScrollView, Text, View } from "react-native";

const DictionaryScreen = reatomComponent(({ ctx }) => {
  const db = useSQLiteContext();

  return (
    <>
      <ScrollView
        className="flex-1 bg-main-bg"
        contentContainerStyle={{
          flexGrow: 1,
          paddingVertical: 16,
          paddingHorizontal: 16,
        }}
      >
        <DictionaryCardsList />

        {ctx.spy(dictionaryCardsAtom).length === 0 && (
          <View className="flex-1 gap-4 items-center justify-center bg-main-bg">
            <Ionicons name="search-outline" size={100} color={"#60A5FA"} />
            <Text className="text-xl font-semibold text-blue-400">Empty</Text>
          </View>
        )}
      </ScrollView>
      <InputModal
        isVisible={ctx.spy(isCardModalVisibleAtom)}
        onClose={() => isCardModalVisibleAtom(ctx, false)}
        onSubmit={(card) => {
          addDictionaryCardAction(ctx, db, card);
        }}
        submitButtonText="Add"
      />
    </>
  );
});

export default DictionaryScreen;
