import { AuthSession, AuthUser, LoginRequest, RegisterRequest } from '@/src/shared/types/auth';
import { httpClient } from '@/src/shared/api/http/client';

const REGISTER_PATH = '/auth/register';
const LOGIN_PATH = '/auth/login';
const ME_PATH = '/auth/me';

type GetCurrentUserOptions = {
    skipUnauthorizedHandler?: boolean;
};

export const register = async (payload: RegisterRequest): Promise<AuthSession> => {
    const response = await httpClient.post<AuthSession>(REGISTER_PATH, payload);

    return response.data;
};

export const login = async (payload: LoginRequest): Promise<AuthSession> => {
    const response = await httpClient.post<AuthSession>(LOGIN_PATH, payload);

    return response.data;
};

export const getCurrentUser = async (
    options?: GetCurrentUserOptions,
): Promise<AuthUser> => {
    const response = await httpClient.get<AuthUser>(ME_PATH, {
        skipUnauthorizedHandler: options?.skipUnauthorizedHandler,
    });

    return response.data;
};
