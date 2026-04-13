import { LoginRequest, RegisterRequest } from '@/src/shared/types/auth';

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export const getLoginValidationError = (payload: LoginRequest) => {
    if (!payload.email || !payload.password) {
        return 'Заполните email и пароль.';
    }

    if (!isValidEmail(payload.email)) {
        return 'Введите корректный email.';
    }

    return null;
};

export const getRegisterValidationError = (payload: RegisterRequest) => {
    if (!payload.name || !payload.email || !payload.password) {
        return 'Заполните имя, email и пароль.';
    }

    if (!isValidEmail(payload.email)) {
        return 'Введите корректный email.';
    }

    if (payload.password.length < 6) {
        return 'Пароль должен содержать минимум 6 символов.';
    }

    return null;
};
