import Ionicons from '@expo/vector-icons/Ionicons';
import { reatomComponent } from '@reatom/npm-react';
import { useSQLiteContext } from 'expo-sqlite';
import { ScrollView, Text, View } from 'react-native';
import {
    addDictionaryCardAction,
    closeDictionaryCardModal,
} from '@/src/features/dictionary/model/actions';
import {
    dictionaryCardsAtom,
    isDictionaryCardModalVisibleAtom,
} from '@/src/features/dictionary/model/atoms';
import { getColor } from '@/src/shared/theme/getColor';
import { InputModal } from '@/src/shared/ui/InputModal';
import { DictionaryCardsList } from './parts/DictionaryCardsList';

export const DictionaryScreen = reatomComponent(({ ctx }) => {
    const db = useSQLiteContext();

    return (
        <View className="flex-1 items-center bg-main-bg">
            <ScrollView
                className="flex-1 w-full max-w-[800px]"
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                }}
            >
                <DictionaryCardsList />

                {ctx.spy(dictionaryCardsAtom).length === 0 && (
                    <View className="flex-1 items-center justify-center gap-4 bg-main-bg">
                        <Ionicons
                            name="search-outline"
                            size={100}
                            color={getColor('accent-color')}
                        />
                        <Text className="text-xl font-semibold text-accent-color">Empty</Text>
                    </View>
                )}
            </ScrollView>
            <InputModal
                header="Add new card"
                isVisible={ctx.spy(isDictionaryCardModalVisibleAtom)}
                onClose={() => closeDictionaryCardModal(ctx)}
                onSubmit={(card) => {
                    addDictionaryCardAction(ctx, db, card);
                }}
                submitButtonText="Add"
            />
        </View>
    );
});
