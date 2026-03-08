import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Not found' }} />
            <View className="flex-1 gap-4 items-center justify-center bg-main-bg">
                <Text className="text-xl font-semibold text-not-found-text-color">Not found</Text>
                <Link
                    href="/dictionary"
                    className="border-2 px-2 border-not-found-border-color bg-not-found-bg-color rounded-lg"
                >
                    <Text className="text-xl font-semibold text-not-found-text-color">
                        To dictionary screen
                    </Text>
                </Link>
            </View>
        </>
    );
}
