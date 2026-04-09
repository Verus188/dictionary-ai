import { FC, PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthScreenLayoutProps = PropsWithChildren<{
    title: string;
    subtitle: string;
    footer: ReactNode;
}>;

export const AuthScreenLayout: FC<AuthScreenLayoutProps> = ({
    children,
    title,
    subtitle,
    footer,
}) => {
    return (
        <SafeAreaView className="flex-1 bg-main-bg">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'center',
                        paddingHorizontal: 24,
                        paddingVertical: 32,
                    }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="mx-auto w-full max-w-[420px] gap-8">
                        <View className="gap-2">
                            <Text className="text-4xl font-semibold leading-tight text-text-color">
                                {title}
                            </Text>
                            <Text className="text-base leading-6 text-neutral-300">
                                {subtitle}
                            </Text>
                        </View>

                        <View className="gap-6 rounded-3xl border border-tabs-border-color bg-card-bg p-6">
                            {children}
                        </View>

                        <View className="items-center">{footer}</View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
