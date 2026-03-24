import Ionicons from '@expo/vector-icons/Ionicons';
import { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import { getColor } from '@/src/shared/theme/getColor';

type DictionaryCardProps = {
    id: string;
    card: string;
    onDelete?: (id: string) => void;
};

export const DictionaryCard: FC<DictionaryCardProps> = ({ card, id, onDelete }) => {
    return (
        <View className="flex w-full flex-row gap-2 rounded-lg border-2 border-card-border-color bg-card-bg px-4 py-4">
            <Text className="flex-1 text-xl text-text-color">{card}</Text>
            <Pressable
                onPress={() => {
                    onDelete?.(id);
                }}
            >
                <Ionicons name="close-outline" size={24} color={getColor('text-color')} />
            </Pressable>
        </View>
    );
};
