import { FC } from 'react';
import Toast, { ErrorToast, ToastConfig } from 'react-native-toast-message';
import { colors } from '@/src/shared/theme/colors';

const DEFAULT_ERROR_TITLE = 'Ошибка';
const DEFAULT_ERROR_MESSAGE = 'Что-то пошло не так. Попробуйте еще раз.';

const getErrorMessage = (error: unknown) => {
    if (typeof error === 'string' && error.trim()) {
        return error;
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return DEFAULT_ERROR_MESSAGE;
};

const toastConfig: ToastConfig = {
    appError: (props) => (
        <ErrorToast
            {...props}
            text1NumberOfLines={2}
            text2NumberOfLines={4}
            style={{
                borderLeftColor: colors['toast-error-border-color'],
                backgroundColor: colors['toast-error-bg-color'],
                minHeight: 72,
            }}
            contentContainerStyle={{ paddingHorizontal: 12 }}
            text1Style={{
                fontSize: 14,
                fontWeight: '700',
                color: colors['toast-error-title-color'],
            }}
            text2Style={{ fontSize: 13, color: colors['toast-error-message-color'] }}
        />
    ),
};

export const showErrorToast = (error: unknown, title = DEFAULT_ERROR_TITLE) => {
    Toast.show({
        type: 'appError',
        text1: title,
        text2: getErrorMessage(error),
        visibilityTime: 4500,
        autoHide: true,
        position: 'top',
        bottomOffset: 28,
    });
};

export const AppToast: FC = () => <Toast config={toastConfig} />;
