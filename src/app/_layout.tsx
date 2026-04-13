import { reatomContext } from '@reatom/npm-react';
import { AuthBootstrap } from '@/src/app/bootstrap/AuthBootstrap';
import { UserScopedApp } from '@/src/app/bootstrap/UserScopedApp';
import { reatomCtx } from '@/src/app/providers/reatom';
import { AppToast } from '@/src/shared/ui/AppToast';
import '../global.css';

export default function RootLayout() {
    return (
        <reatomContext.Provider value={reatomCtx}>
            <AuthBootstrap />
            <UserScopedApp />
            <AppToast />
        </reatomContext.Provider>
    );
}
