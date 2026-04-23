import { atom } from '@reatom/core';
import { authUserAtom } from '@/src/features/auth/model/atoms';
import { resetUserScopedState } from './reset-user-scoped-state';
import { clearWebStoragePromises } from './web-storage-cache';

const activeUserIdAtom = atom<string | null>(null, 'activeUserIdAtom');

authUserAtom.onChange((ctx, authUser) => {
    const nextUserId = authUser?.id ?? null;
    const activeUserId = ctx.get(activeUserIdAtom);

    if (activeUserId === nextUserId) {
        return;
    }

    clearWebStoragePromises();
    resetUserScopedState(ctx);
    activeUserIdAtom(ctx, nextUserId);
});
