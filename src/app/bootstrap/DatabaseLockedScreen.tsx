import { Text, View } from 'react-native';
import { Button } from '@/src/shared/ui/Button';

export const DatabaseLockedScreen = () => {
    const handleReload = () => {
        if (typeof window === 'undefined') {
            return;
        }

        window.location.reload();
    };

    return (
        <View className="flex-1 items-center justify-center bg-main-bg px-6">
            <View className="w-full max-w-[560px] gap-4 rounded-3xl border border-tabs-border-color bg-tabs-bg px-6 py-8">
                <Text className="text-2xl font-semibold text-text-color">
                    Приложение уже открыто в другой вкладке
                </Text>
                <Text className="text-base leading-6 text-neutral-300">
                    Для web-версии локальная база данных может быть открыта только в одной вкладке
                    браузера одновременно. Закройте другую вкладку с приложением и попробуйте
                    снова.
                </Text>
                <Button className="mt-2 self-start px-5 py-3" onPress={handleReload}>
                    <Text className="text-base font-semibold text-main-bg">Обновить страницу</Text>
                </Button>
            </View>
        </View>
    );
};
