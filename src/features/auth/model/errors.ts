import axios from 'axios';

const DEFAULT_NETWORK_ERROR =
    'Не удалось связаться с сервером. Проверьте соединение и попробуйте снова.';
const DEFAULT_LOGIN_ERROR = 'Не удалось выполнить вход. Попробуйте еще раз.';
const DEFAULT_REGISTER_ERROR = 'Не удалось завершить регистрацию. Попробуйте еще раз.';
const DEFAULT_SESSION_ERROR = 'Не удалось восстановить сессию. Попробуйте войти снова.';

type ApiErrorPayload = {
    message?: string | string[];
    error?: string;
    statusCode?: number;
};

const normalizeMessage = (message: string) => message.trim().replace(/\s+/g, ' ');

const getMessageFromPayload = (payload: unknown) => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const { error, message } = payload as ApiErrorPayload;

    if (Array.isArray(message)) {
        return message.find((item) => typeof item === 'string' && item.trim()) ?? null;
    }

    if (typeof message === 'string' && message.trim()) {
        return message;
    }

    if (typeof error === 'string' && error.trim()) {
        return error;
    }

    return null;
};

const getNormalizedPayloadMessage = (payload: unknown) => {
    const message = getMessageFromPayload(payload);

    if (!message) {
        return null;
    }

    return normalizeMessage(message);
};

const includesAny = (value: string, patterns: string[]) =>
    patterns.some((pattern) => value.toLowerCase().includes(pattern.toLowerCase()));

const isNetworkError = (error: unknown) => axios.isAxiosError(error) && !error.response;

export const isUnauthorizedError = (error: unknown) =>
    axios.isAxiosError(error) && error.response?.status === 401;

export const getLoginErrorMessage = (error: unknown) => {
    if (isNetworkError(error)) {
        return DEFAULT_NETWORK_ERROR;
    }

    if (axios.isAxiosError(error)) {
        const payloadMessage = getNormalizedPayloadMessage(error.response?.data);

        if (
            error.response?.status === 401 ||
            (payloadMessage &&
                includesAny(payloadMessage, [
                    'invalid credentials',
                    'invalid password',
                    'invalid email',
                    'user not found',
                    'wrong password',
                    'unauthorized',
                ]))
        ) {
            return 'Неверный email или пароль.';
        }

        if (payloadMessage) {
            return payloadMessage;
        }
    }

    return DEFAULT_LOGIN_ERROR;
};

export const getRegisterErrorMessage = (error: unknown) => {
    if (isNetworkError(error)) {
        return DEFAULT_NETWORK_ERROR;
    }

    if (axios.isAxiosError(error)) {
        const payloadMessage = getNormalizedPayloadMessage(error.response?.data);

        if (
            error.response?.status === 409 ||
            (payloadMessage &&
                includesAny(payloadMessage, [
                    'already exists',
                    'already registered',
                    'already taken',
                    'email already',
                    'user already',
                ]))
        ) {
            return 'Пользователь с таким email уже зарегистрирован.';
        }

        if (payloadMessage) {
            return payloadMessage;
        }
    }

    return DEFAULT_REGISTER_ERROR;
};

export const getSessionRestoreErrorMessage = (error: unknown) => {
    if (isNetworkError(error)) {
        return DEFAULT_NETWORK_ERROR;
    }

    if (axios.isAxiosError(error)) {
        return getMessageFromPayload(error.response?.data) ?? DEFAULT_SESSION_ERROR;
    }

    return DEFAULT_SESSION_ERROR;
};
