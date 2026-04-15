import { authStatusAtom, isAuthBootstrapPendingAtom } from '@/src/features/auth/model/atoms';
import { AuthLoadingScreen } from '@/src/features/auth/ui/parts/AuthLoadingScreen';
import { reatomComponent } from '@reatom/npm-react';
import { Redirect, useSegments } from 'expo-router';
import { PropsWithChildren } from 'react';

const AUTH_ROUTES = new Set(['login', 'register']);
const APP_HOME_ROUTE = '/(tabs)/dictionary' as const;
const GUEST_HOME_ROUTE = '/login' as const;

export const AuthGate = reatomComponent<PropsWithChildren>(({ children, ctx }) => {
    const authStatus = ctx.spy(authStatusAtom);
    const isAuthBootstrapPending = ctx.spy(isAuthBootstrapPendingAtom);
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

    if (isAuthBootstrapPending || authStatus === 'idle') {
        return <AuthLoadingScreen />;
    }

    if (redirectTo) {
        return <Redirect href={redirectTo} />;
    }

    if (authStatus === 'loading' && !isAuthRoute) {
        return <AuthLoadingScreen />;
    }

    return children;
});
