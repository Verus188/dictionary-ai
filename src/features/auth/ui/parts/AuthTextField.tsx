import { ComponentPropsWithoutRef, FC } from 'react';
import { Text, TextInput, View } from 'react-native';

type AuthTextFieldProps = ComponentPropsWithoutRef<typeof TextInput> & {
    label: string;
};

export const AuthTextField: FC<AuthTextFieldProps> = ({ label, ...props }) => {
    return (
        <View className="gap-2">
            <Text className="text-sm font-medium text-text-color">{label}</Text>
            <TextInput
                className="rounded-2xl border border-tabs-border-color bg-tabs-bg px-4 py-3 text-base text-text-color"
                placeholderTextColor="rgba(255, 255, 255, 0.45)"
                {...props}
            />
        </View>
    );
};
