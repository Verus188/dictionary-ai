import { atom } from '@reatom/core';
import { onConnect } from '@reatom/hooks';
import {
    expireSessionAction,
    registerUnauthorizedSessionHandler,
    restoreAuthSessionAction,
} from './actions';

export const authBootstrapAtom = atom(null, 'authBootstrapAtom');

onConnect(authBootstrapAtom, (ctx) => {
    registerUnauthorizedSessionHandler(() => expireSessionAction(ctx));
    void restoreAuthSessionAction(ctx);

    return () => {
        registerUnauthorizedSessionHandler(null);
    };
});
