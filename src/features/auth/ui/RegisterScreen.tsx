import { useState } from 'react';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { reatomComponent } from '@reatom/npm-react';
import { registerAction } from '@/src/features/auth/model/actions';
import { authStatusAtom } from '@/src/features/auth/model/atoms';
import { getRegisterErrorMessage } from '@/src/features/auth/model/errors';
import { AuthScreenLayout } from '@/src/features/auth/ui/parts/AuthScreenLayout';
import { AuthTextField } from '@/src/features/auth/ui/parts/AuthTextField';
import { getRegisterValidationError } from '@/src/features/auth/model/validation';
import { Button } from '@/src/shared/ui/Button';
import { showErrorToast } from '@/src/shared/ui/AppToast';

export const RegisterScreen = reatomComponent(({ ctx }) => {
    const authStatus = ctx.spy(authStatusAtom);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const isSubmitting = authStatus === 'loading';

    const clearFormError = () => {
        if (formError) {
            setFormError(null);
        }
    };

    const handleSubmit = async () => {
        const payload = {
            name: name.trim(),
            email: email.trim(),
            password,
        };
        const validationError = getRegisterValidationError(payload);

        if (validationError) {
            setFormError(validationError);
            showErrorToast(validationError, 'Проверьте форму');
            return;
        }

        setFormError(null);

        try {
            await registerAction(ctx, payload);
        } catch (error) {
            const errorMessage = getRegisterErrorMessage(error);

            setFormError(errorMessage);
        }
    };

    return (
        <AuthScreenLayout
            title="Регистрация"
            subtitle="Создайте аккаунт, чтобы сохранить сессию и открыть основной flow приложения."
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
                    autoCorrect={false}
                    label="Имя"
                    placeholder="Как вас зовут"
                    value={name}
                    onChangeText={(nextName) => {
                        setName(nextName);
                        clearFormError();
                    }}
                    editable={!isSubmitting}
                />
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
                        clearFormError();
                    }}
                    editable={!isSubmitting}
                />
                <AuthTextField
                    autoComplete="new-password"
                    autoCorrect={false}
                    label="Пароль"
                    placeholder="Придумайте пароль"
                    secureTextEntry
                    value={password}
                    onChangeText={(nextPassword) => {
                        setPassword(nextPassword);
                        clearFormError();
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
                    {isSubmitting ? 'Создаем аккаунт...' : 'Зарегистрироваться'}
                </Text>
            </Button>
        </AuthScreenLayout>
    );
});
