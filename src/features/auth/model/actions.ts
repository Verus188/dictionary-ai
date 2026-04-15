import { reatomAsync } from '@reatom/async';
import { Ctx } from '@reatom/core';
import { getCurrentUser, login, register } from '@/src/shared/api/auth/client';
import {
    setHttpClientAccessToken,
    setUnauthorizedHandler,
} from '@/src/shared/api/http/client';
import { AuthSession, LoginRequest, RegisterRequest } from '@/src/shared/types/auth';
import { showErrorToast } from '@/src/shared/ui/AppToast';
import {
    getSessionRestoreErrorMessage,
    isUnauthorizedError,
} from './errors';
import {
    authAccessTokenAtom,
    authStatusAtom,
    authUserAtom,
    isAuthBootstrapPendingAtom,
} from './atoms';
import { authSessionStorage } from './session-storage';

const resetInMemorySession = (ctx: Ctx) => {
    authAccessTokenAtom(ctx, null);
    authUserAtom(ctx, null);
    authStatusAtom(ctx, 'guest');
    setHttpClientAccessToken(null);
};

const applyAuthenticatedSession = async (
    ctx: Ctx,
    session: AuthSession,
    persistAccessToken = true,
) => {
    authAccessTokenAtom(ctx, session.accessToken);
    authUserAtom(ctx, session.user);
    authStatusAtom(ctx, 'authenticated');
    setHttpClientAccessToken(session.accessToken);

    if (persistAccessToken) {
        await authSessionStorage.setAccessToken(session.accessToken);
    }
};

const clearPersistedSession = async (ctx: Ctx) => {
    await authSessionStorage.clearAccessToken();
    resetInMemorySession(ctx);
};

export const registerUnauthorizedSessionHandler = (handler: (() => Promise<void> | void) | null) => {
    setUnauthorizedHandler(handler);
};

export const loginAction = reatomAsync(async (ctx, payload: LoginRequest) => {
    authStatusAtom(ctx, 'loading');

    try {
        const session = await login(payload);
        await applyAuthenticatedSession(ctx, session);

        return session;
    } catch (error) {
        resetInMemorySession(ctx);
        throw error;
    }
}, 'login');

export const registerAction = reatomAsync(async (ctx, payload: RegisterRequest) => {
    authStatusAtom(ctx, 'loading');

    try {
        const session = await register(payload);
        await applyAuthenticatedSession(ctx, session);

        return session;
    } catch (error) {
        resetInMemorySession(ctx);
        throw error;
    }
}, 'register');

export const restoreAuthSessionAction = reatomAsync(async (ctx) => {
    isAuthBootstrapPendingAtom(ctx, true);
    authStatusAtom(ctx, 'loading');

    const storedAccessToken = await authSessionStorage.getAccessToken();

    if (!storedAccessToken) {
        resetInMemorySession(ctx);
        isAuthBootstrapPendingAtom(ctx, false);
        return null;
    }

    authAccessTokenAtom(ctx, storedAccessToken);
    setHttpClientAccessToken(storedAccessToken);

    try {
        const user = await getCurrentUser({ skipUnauthorizedHandler: true });

        authUserAtom(ctx, user);
        authStatusAtom(ctx, 'authenticated');
        isAuthBootstrapPendingAtom(ctx, false);

        return user;
    } catch (error) {
        if (isUnauthorizedError(error)) {
            await clearPersistedSession(ctx);
            isAuthBootstrapPendingAtom(ctx, false);
            return null;
        }

        resetInMemorySession(ctx);
        isAuthBootstrapPendingAtom(ctx, false);
        showErrorToast(getSessionRestoreErrorMessage(error), 'Сессия не восстановлена');

        return null;
    }
}, 'restoreAuthSession');

export const logoutAction = reatomAsync(async (ctx) => {
    authStatusAtom(ctx, 'loading');
    await clearPersistedSession(ctx);
}, 'logout');

export const expireSessionAction = reatomAsync(async (ctx) => {
    await clearPersistedSession(ctx);
    showErrorToast('Сессия истекла. Войдите снова.', 'Нужно войти снова');
}, 'expireSession');
