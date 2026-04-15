import { PropsWithChildren, useEffect } from 'react';
import { reatomComponent } from '@reatom/npm-react';
import { useRouter, useSegments } from 'expo-router';
import { authStatusAtom, isAuthBootstrapPendingAtom } from '@/src/features/auth/model/atoms';
import { AuthLoadingScreen } from '@/src/features/auth/ui/parts/AuthLoadingScreen';

const AUTH_ROUTES = new Set(['login', 'register']);
const APP_HOME_ROUTE = '/(tabs)/dictionary' as const;
const GUEST_HOME_ROUTE = '/login' as const;

export const AuthGate = reatomComponent<PropsWithChildren>(({ children, ctx }) => {
    const authStatus = ctx.spy(authStatusAtom);
    const isAuthBootstrapPending = ctx.spy(isAuthBootstrapPendingAtom);
    const router = useRouter();
    const segments = useSegments();
    const currentSegment = segments[0];
    const isAuthRoute = currentSegment ? AUTH_ROUTES.has(currentSegment) : false;
    const isTabsRoute = currentSegment === '(tabs)';

    let redirectTo: typeof APP_HOME_ROUTE | typeof GUEST_HOME_ROUTE | null = null;

    if (authStatus === 'authenticated' && !isTabsRoute) {
        redirectTo = APP_HOME_ROUTE;
    }

    if (authStatus === 'guest' && !isAuthRoute) {
        redirectTo = GUEST_HOME_ROUTE;
    }

    useEffect(() => {
        if (!redirectTo) {
            return;
        }

        router.replace(redirectTo);
    }, [redirectTo, router]);

    if (isAuthBootstrapPending || authStatus === 'idle' || redirectTo) {
        return <AuthLoadingScreen />;
    }

    if (authStatus === 'loading' && !isAuthRoute) {
        return <AuthLoadingScreen />;
    }

    return children;
});
