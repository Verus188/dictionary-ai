type SyncRunner = () => Promise<void>;

let isSyncRunning = false;
let pendingTimeout: ReturnType<typeof setTimeout> | null = null;
let registeredRunner: SyncRunner | null = null;
let shouldRunAgain = false;

const clearPendingTimeout = () => {
    if (!pendingTimeout) {
        return;
    }

    clearTimeout(pendingTimeout);
    pendingTimeout = null;
};

const executeRegisteredSync = async () => {
    if (!registeredRunner) {
        return;
    }

    if (isSyncRunning) {
        shouldRunAgain = true;
        return;
    }

    isSyncRunning = true;

    try {
        await registeredRunner();
    } finally {
        isSyncRunning = false;

        if (shouldRunAgain) {
            shouldRunAgain = false;
            await executeRegisteredSync();
        }
    }
};

export const registerSyncRunner = (runner: SyncRunner) => {
    registeredRunner = runner;

    return () => {
        if (registeredRunner === runner) {
            registeredRunner = null;
        }

        clearPendingTimeout();
        shouldRunAgain = false;
    };
};

export const runSyncNow = async () => {
    clearPendingTimeout();
    await executeRegisteredSync();
};

export const scheduleSync = (delayMs = 1500) => {
    if (!registeredRunner) {
        return;
    }

    clearPendingTimeout();
    pendingTimeout = setTimeout(() => {
        pendingTimeout = null;
        void executeRegisteredSync();
    }, delayMs);
};
