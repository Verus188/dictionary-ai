import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { AuthScreenLayout } from '@/src/features/auth/ui/parts/AuthScreenLayout';
import { AuthTextField } from '@/src/features/auth/ui/parts/AuthTextField';
import { Button } from '@/src/shared/ui/Button';

export function RegisterScreen() {
    return (
        <AuthScreenLayout
            title="Регистрация"
            subtitle="Собрал базовую форму, чтобы потом можно было спокойно подключить API и валидацию."
            footer={
                <Text className="text-sm text-neutral-300">
                    Уже есть аккаунт?{' '}
                    <Link href="/login" className="font-semibold text-accent-color">
                        Войти
                    </Link>
                </Text>
            }
        >
            <View className="gap-4">
                <AuthTextField
                    autoCapitalize="words"
                    autoComplete="name"
                    label="Имя"
                    placeholder="Как вас зовут"
                />
                <AuthTextField
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    label="Email"
                    placeholder="you@example.com"
                />
                <AuthTextField
                    autoComplete="new-password"
                    label="Пароль"
                    placeholder="Придумайте пароль"
                    secureTextEntry
                />
            </View>

            <Button className="w-full rounded-2xl py-3">
                <Text className="text-base font-semibold text-main-bg">Зарегистрироваться</Text>
            </Button>
        </AuthScreenLayout>
    );
}
