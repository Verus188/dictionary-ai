import { reatomContext } from '@reatom/npm-react';
import { UserScopedApp } from '@/src/app/bootstrap/UserScopedApp';
import { reatomCtx } from '@/src/app/providers/reatom';
import { AppToast } from '@/src/shared/ui/AppToast';
import '../global.css';

export default function RootLayout() {
    return (
        <reatomContext.Provider value={reatomCtx}>
            <UserScopedApp />
            <AppToast />
        </reatomContext.Provider>
    );
}
