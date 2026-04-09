import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { AuthScreenLayout } from '@/src/features/auth/ui/parts/AuthScreenLayout';
import { AuthTextField } from '@/src/features/auth/ui/parts/AuthTextField';
import { Button } from '@/src/shared/ui/Button';

export function LoginScreen() {
    return (
        <AuthScreenLayout
            title="Вход в аккаунт"
            subtitle="Пока это только интерфейс. Здесь позже подключим настоящую авторизацию."
            footer={
                <Text className="text-sm text-neutral-300">
                    Еще нет аккаунта?{' '}
                    <Link href="/register" className="font-semibold text-accent-color">
                        Зарегистрироваться
                    </Link>
                </Text>
            }
        >
            <View className="gap-4">
                <AuthTextField
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    label="Email"
                    placeholder="you@example.com"
                />
                <AuthTextField
                    autoComplete="current-password"
                    label="Пароль"
                    placeholder="Введите пароль"
                    secureTextEntry
                />
            </View>

            <Button className="w-full rounded-2xl py-3">
                <Text className="text-base font-semibold text-main-bg">Войти</Text>
            </Button>
        </AuthScreenLayout>
    );
}
