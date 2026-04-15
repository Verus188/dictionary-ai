import { PropsWithChildren } from 'react';
import { reatomComponent } from '@reatom/npm-react';
import { useSQLiteContext } from 'expo-sqlite';
import { getSyncBootstrapAtom } from '@/src/shared/sync/model/bootstrap';

export const SyncBootstrap = reatomComponent<PropsWithChildren>(({ children, ctx }) => {
    const db = useSQLiteContext();
    ctx.spy(getSyncBootstrapAtom(db));

    return children;
});
