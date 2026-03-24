import { reatomComponent } from '@reatom/npm-react';
import { useSQLiteContext } from 'expo-sqlite';
import { FC } from 'react';
import { Alert, Platform, View, ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { deleteDictionaryCardAction } from '@/src/features/dictionary/model/actions';
import { dictionaryCardsAtom } from '@/src/features/dictionary/model/atoms';
import { DictionaryCard } from './DictionaryCard';

type DictionaryCardsListProps = ViewProps & {
    className?: string;
};

export const DictionaryCardsList: FC<DictionaryCardsListProps> = reatomComponent(
    ({ ctx, className, ...rest }) => {
        const db = useSQLiteContext();
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

                                deleteDictionaryCardAction(ctx, db, id);
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
                                            deleteDictionaryCardAction(ctx, db, id);
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
