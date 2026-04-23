import Ionicons from '@expo/vector-icons/Ionicons';
import { reatomComponent } from '@reatom/npm-react';
import { ScrollView, Text, View } from 'react-native';
import { authStatusAtom } from '@/src/features/auth/model/atoms';
import {
    addDictionaryCardAction,
    closeDictionaryCardModal,
} from '@/src/features/dictionary/model/actions';
import {
    dictionaryCardsAtom,
    isDictionaryCardModalVisibleAtom,
} from '@/src/features/dictionary/model/atoms';
import { useAppStorage } from '@/src/shared/storage/context';
import { getColor } from '@/src/shared/theme/getColor';
import { InputModal } from '@/src/shared/ui/InputModal';
import { DictionaryCardsList } from './parts/DictionaryCardsList';

const DictionaryScreenContent = reatomComponent(({ ctx }) => {
    const storage = useAppStorage();

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
                    addDictionaryCardAction(ctx, storage, card);
                }}
                submitButtonText="Add"
            />
        </View>
    );
});

export const DictionaryScreen = reatomComponent(({ ctx }) => {
    const isAuthenticated = ctx.spy(authStatusAtom) === 'authenticated';

    if (!isAuthenticated) {
        return null;
    }

    return <DictionaryScreenContent />;
});
