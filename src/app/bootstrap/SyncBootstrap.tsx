import { PropsWithChildren } from 'react';
import { reatomComponent } from '@reatom/npm-react';
import { useAppStorage } from '@/src/shared/storage/context';
import { getSyncBootstrapAtom } from '@/src/shared/sync/model/bootstrap';

export const SyncBootstrap = reatomComponent<PropsWithChildren>(({ children, ctx }) => {
    const storage = useAppStorage();
    ctx.spy(getSyncBootstrapAtom(storage));

    return children;
});
