import { useState } from 'react';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { reatomComponent } from '@reatom/npm-react';
import { loginAction } from '@/src/features/auth/model/actions';
import { authStatusAtom } from '@/src/features/auth/model/atoms';
import { getLoginErrorMessage } from '@/src/features/auth/model/errors';
import { AuthScreenLayout } from '@/src/features/auth/ui/parts/AuthScreenLayout';
import { AuthTextField } from '@/src/features/auth/ui/parts/AuthTextField';
import { getLoginValidationError } from '@/src/features/auth/model/validation';
import { Button } from '@/src/shared/ui/Button';
import { showErrorToast } from '@/src/shared/ui/AppToast';

export const LoginScreen = reatomComponent(({ ctx }) => {
    const authStatus = ctx.spy(authStatusAtom);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const isSubmitting = authStatus === 'loading';

    const handleSubmit = async () => {
        const payload = {
            email: email.trim(),
            password,
        };
        const validationError = getLoginValidationError(payload);

        if (validationError) {
            setFormError(validationError);
            showErrorToast(validationError, 'Проверьте форму');
            return;
        }

        setFormError(null);

        try {
            await loginAction(ctx, payload);
        } catch (error) {
            const errorMessage = getLoginErrorMessage(error);

            setFormError(errorMessage);
        }
    };

    return (
        <AuthScreenLayout
            title="Вход в аккаунт"
            subtitle="Войдите, чтобы продолжить историю и работать со своим словарём."
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
                    autoCorrect={false}
                    keyboardType="email-address"
                    label="Email"
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={(nextEmail) => {
                        setEmail(nextEmail);
                        if (formError) {
                            setFormError(null);
                        }
                    }}
                    editable={!isSubmitting}
                />
                <AuthTextField
                    autoComplete="current-password"
                    autoCorrect={false}
                    label="Пароль"
                    placeholder="Введите пароль"
                    secureTextEntry
                    value={password}
                    onChangeText={(nextPassword) => {
                        setPassword(nextPassword);
                        if (formError) {
                            setFormError(null);
                        }
                    }}
                    editable={!isSubmitting}
                />
                {formError ? <Text className="text-sm text-red-300">{formError}</Text> : null}
            </View>

            <Button
                className="w-full rounded-2xl py-3 disabled:opacity-60"
                disabled={isSubmitting}
                onPress={() => {
                    void handleSubmit();
                }}
            >
                <Text className="text-base font-semibold text-main-bg">
                    {isSubmitting ? 'Входим...' : 'Войти'}
                </Text>
            </Button>
        </AuthScreenLayout>
    );
});
