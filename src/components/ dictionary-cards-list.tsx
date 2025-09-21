import { reatomComponent } from "@reatom/npm-react";
import { useSQLiteContext } from "expo-sqlite";
import { FC, useEffect } from "react";
import { View, ViewProps } from "react-native";
import { twMerge } from "tailwind-merge";
import sqliteBD from "../enteties/sqliteDB";
import { deleteDictionaryCardAction } from "../model/actions";
import { dictionaryCardsAtom } from "../model/atoms";
import { DictionaryCard } from "./dictionary-card";

type DictionaryCardsListProps = {} & ViewProps;

export const DictionaryCardsList: FC<DictionaryCardsListProps> =
  reatomComponent(({ ctx, className, ...rest }) => {
    const db = useSQLiteContext();
    const cardsList = ctx.spy(dictionaryCardsAtom);

    useEffect(() => {
      sqliteBD.getAllCards(db).then((cards) => {
        dictionaryCardsAtom(ctx, cards);
      });
    }, []);

    return (
      <View {...rest} className={twMerge("flex flex-col gap-4", className)}>
        {cardsList.map((card) => (
          <DictionaryCard
            key={card.id}
            card={card.card}
            id={card.id}
            onDelete={(id) => deleteDictionaryCardAction(ctx, db, id)}
          />
        ))}
      </View>
    );
  });
