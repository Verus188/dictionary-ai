import { reatomComponent } from '@reatom/npm-react';
import { FC } from 'react';
import { Alert, Platform, View, ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { deleteDictionaryCardAction } from '@/src/features/dictionary/model/actions';
import { dictionaryCardsAtom } from '@/src/features/dictionary/model/atoms';
import { useAppStorage } from '@/src/shared/storage/context';
import { DictionaryCard } from './DictionaryCard';

type DictionaryCardsListProps = ViewProps & {
    className?: string;
};

export const DictionaryCardsList: FC<DictionaryCardsListProps> = reatomComponent(
    ({ ctx, className, ...rest }) => {
        const storage = useAppStorage();
        const cardsList = ctx.spy(dictionaryCardsAtom);

        return (
            <View {...rest} className={twMerge('flex flex-col gap-4', className)}>
                {cardsList.map((card) => (
                    <DictionaryCard
                        key={card.id}
                        card={card.card}
                        id={card.id}
                        onDelete={(id) => {
                            if (Platform.OS === 'web') {
                                const ok = window.confirm(
                                    `Are you sure you want to delete '${card.card}' card?`,
                                );
                                if (!ok) {
                                    return;
                                }

                                deleteDictionaryCardAction(ctx, storage, id);
                                return;
                            }

                            Alert.alert(
                                'Delete card',
                                `Are you sure you want to delete '${card.card}' card?`,
                                [
                                    {
                                        text: 'Cancel',
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'Delete',
                                        onPress: () => {
                                            deleteDictionaryCardAction(ctx, storage, id);
                                        },
                                        style: 'destructive',
                                    },
                                ],
                            );
                        }}
                    />
                ))}
            </View>
        );
    },
);
