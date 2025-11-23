import { reatomComponent } from '@reatom/npm-react';
import { useSQLiteContext } from 'expo-sqlite';
import { FC, useEffect } from 'react';
import { Alert, Platform, View, ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';
import sqliteBD from '../enteties/sqliteDB';
import { deleteDictionaryCardAction } from '../model/actions';
import { dictionaryCardsAtom } from '../model/atoms';
import { DictionaryCard } from './dictionary-card';

type DictionaryCardsListProps = {} & ViewProps;

export const DictionaryCardsList: FC<DictionaryCardsListProps> = reatomComponent(
    ({ ctx, className, ...rest }) => {
        const db = useSQLiteContext();
        const cardsList = ctx.spy(dictionaryCardsAtom);

        useEffect(() => {
            sqliteBD.getAllCards(db).then((cards) => {
                dictionaryCardsAtom(ctx, cards);
            });
        }, []);

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
                                if (!ok) return;
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
