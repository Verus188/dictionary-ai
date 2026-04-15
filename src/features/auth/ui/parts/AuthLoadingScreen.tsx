import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getColor } from '@/src/shared/theme/getColor';

export function AuthLoadingScreen() {
    return (
        <SafeAreaView className="flex-1 bg-main-bg">
            <View className="flex-1 items-center justify-center gap-4 px-6">
                <ActivityIndicator size="small" color={getColor('text-color')} />
                <Text className="text-base text-neutral-300">Проверяем сессию...</Text>
            </View>
        </SafeAreaView>
    );
}
