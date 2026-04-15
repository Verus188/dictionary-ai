import { action, atom } from '@reatom/core';
import { authUserAtom } from '@/src/features/auth/model/atoms';
import { resetUserScopedState } from './reset-user-scoped-state';

const activeUserIdAtom = atom<string | null>(null, 'activeUserIdAtom');

export const isUserDatabaseLockedAtom = atom(false, 'isUserDatabaseLockedAtom');
export const isUserDatabaseReadyAtom = atom(false, 'isUserDatabaseReadyAtom');

export const setUserDatabaseLockedAction = action((ctx, isLocked: boolean) => {
    isUserDatabaseLockedAtom(ctx, isLocked);
}, 'setUserDatabaseLockedAction');

export const setUserDatabaseReadyAction = action((ctx, isReady: boolean) => {
    isUserDatabaseReadyAtom(ctx, isReady);
}, 'setUserDatabaseReadyAction');

const resetUserBootstrapStateAction = action((ctx) => {
    isUserDatabaseLockedAtom(ctx, false);
    isUserDatabaseReadyAtom(ctx, false);
}, 'resetUserBootstrapStateAction');

authUserAtom.onChange((ctx, authUser) => {
    const nextUserId = authUser?.id ?? null;
    const activeUserId = ctx.get(activeUserIdAtom);

    if (activeUserId === nextUserId) {
        return;
    }

    resetUserScopedState(ctx);
    resetUserBootstrapStateAction(ctx);
    activeUserIdAtom(ctx, nextUserId);
});
