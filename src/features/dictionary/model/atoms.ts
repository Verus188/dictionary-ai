import { atom } from '@reatom/core';
import { DictionaryCard } from '@/src/shared/types/dictionary';

export const dictionaryCardsAtom = atom<DictionaryCard[]>([], 'dictionaryCardsAtom');

export const isDictionaryCardModalVisibleAtom = atom<boolean>(
    false,
    'isDictionaryCardModalVisibleAtom',
);
