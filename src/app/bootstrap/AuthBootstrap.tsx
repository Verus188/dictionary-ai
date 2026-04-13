import { useEffect, useRef } from 'react';
import { reatomComponent } from '@reatom/npm-react';
import {
    expireSessionAction,
    registerUnauthorizedSessionHandler,
    restoreAuthSessionAction,
} from '@/src/features/auth/model/actions';
import { reatomCtx } from '@/src/app/providers/reatom';

export const AuthBootstrap = reatomComponent(({ ctx }) => {
    const hasBootstrappedRef = useRef(false);

    useEffect(() => {
        if (hasBootstrappedRef.current) {
            return;
        }

        hasBootstrappedRef.current = true;

        registerUnauthorizedSessionHandler(() => expireSessionAction(reatomCtx));
        void restoreAuthSessionAction(ctx);
    }, [ctx]);

    return null;
});
