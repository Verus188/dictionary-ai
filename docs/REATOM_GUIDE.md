# Reatom Guide

## Purpose

This guide describes a practical, reusable way to organize application state with `reatom`.

It is intentionally written as a **portable working pattern** for an independent project:

- no references to a specific repository
- no dependency on local file paths
- no assumption that the reader has access to the original codebase

The goal is not to document every API in `reatom`, but to give a clear implementation style that works well for real product features: tables, filters, forms, drawers, async requests, mutations, presets, and derived state.

## Recommended stack

If you want to reproduce this style closely, a suitable stack is:

- `@reatom/framework`
- `@reatom/npm-react`
- `@reatom/persist-web-storage`
- optionally `@reatom/devtools`

Example abstract project structure:

- `src/shared/state/context.ts` - Reatom context
- `src/entities/<entity>/model/*.reatom.ts` - entity-level state
- `src/features/<feature>/model/*.reatom.ts` - feature-level state and logic
- `src/features/<feature>/ui/*.tsx` - UI connected through `reatomComponent`
- `src/shared/lib/reatom/*.ts` - reusable helpers like pagination and params merging

## Core architecture

This style is based on a few simple rules:

1. There is one shared Reatom context for the application.
2. State lives near the feature that owns it.
3. Reading and writing are separated:
   - reads: usually `reatomResource`
   - writes: usually `reatomAsync`
   - synchronous orchestration: `action`
4. Table/filter pages often use `URLSearchParams` as the main state container.
5. React components access state through `reatomComponent`.
6. Resources usually refresh automatically after successful mutations through `.onFulfill`.

## Context setup

Minimal setup:

```ts
import { createCtx } from '@reatom/framework';

export const ctx = createCtx();
```

And in React:

```tsx
import { reatomContext } from '@reatom/npm-react';

<reatomContext.Provider value={ctx}>
    <App />
</reatomContext.Provider>
```

Optional logging in development:

```ts
import { connectLogger } from '@reatom/framework';

connectLogger(ctx);
```

## Main primitives

### `atom`

Use `atom` for:

- primitive values
- arrays
- dictionaries
- `URLSearchParams`
- local editable data

Typical style:

```ts
import { atom } from '@reatom/framework';

export const queryParamsAtom = atom<URLSearchParams>(
    new URLSearchParams(),
    'queryParamsAtom',
);
```

Rule:

- always give atoms explicit names

This makes devtools, logs, and debugging much easier.

### `reatomBoolean`

Use `reatomBoolean` for simple UI state:

- drawer open/closed
- modal open/closed
- edit mode on/off
- drag mode on/off

Example:

```ts
import { reatomBoolean } from '@reatom/framework';

export const isDrawerOpenAtom = reatomBoolean(false, 'isDrawerOpenAtom');
```

Useful methods:

- `setTrue(ctx)`
- `setFalse(ctx)`
- `toggle(ctx)`

### `action`

Use `action` for synchronous business logic:

- updating atoms
- opening and closing UI state
- rebuilding `URLSearchParams`
- resetting feature state
- orchestrating several state changes at once

Example:

```ts
import { action } from '@reatom/framework';

export const resetFiltersAction = action((ctx) => {
    queryParamsAtom(ctx, new URLSearchParams());
}, 'resetFiltersAction');
```

### `reatomAsync`

Use `reatomAsync` for mutations:

- create
- update
- delete
- submit form
- confirm or publish action
- controlled async behavior triggered by user action

Typical pattern:

```ts
import { reatomAsync, withErrorAtom, withStatusesAtom } from '@reatom/framework';

export const updateItemAsync = reatomAsync((ctx, id: string, body: Body) => {
    return ctx.schedule(async () => {
        const { data } = await updateItem(id, body);
        return data;
    });
}, 'updateItemAsync').pipe(
    withStatusesAtom(),
    withErrorAtom((_, error) => normalizeError(error)),
);
```

Default recommendation:

- wrap the async body in `ctx.schedule(async () => ...)`
- attach `withStatusesAtom()`
- attach `withErrorAtom(...)` if UI needs normalized error handling

### `reatomResource`

Use `reatomResource` for reads:

- table data
- detail page data
- filters metadata
- select options
- form bootstrap data
- data that should reactively reload when dependencies change

Typical pattern:

```ts
import {
    reatomResource,
    withDataAtom,
    withErrorAtom,
    withStatusesAtom,
} from '@reatom/framework';

export const getItemsResource = reatomResource((ctx) => {
    const query = ctx.spy(queryParamsAtom).toString();

    return ctx.schedule(async () => {
        const { data } = await getItems(query, ctx.controller.signal);
        return normalize(data);
    });
}, 'getItemsResource').pipe(
    withDataAtom({
        results: [],
        count: 0,
    }),
    withStatusesAtom(),
    withErrorAtom((_, error) => normalizeError(error)),
);
```

Important note:

`reatomResource` is not only for fetching. It often also:

- depends on other atoms through `ctx.spy`
- waits until required dependencies are ready
- writes normalized data into additional atoms
- refreshes itself after related mutations

Early return is completely normal:

```ts
if (!requiredId) {
    return Promise.resolve(initialValue);
}
```

or:

```ts
if (isDependencyLoading) {
    return Promise.resolve(fallbackData);
}
```

This is the preferred way to avoid unnecessary requests until the resource is actually ready to run.

### `reatomComponent`

Use `reatomComponent` instead of a plain React function component when the component directly works with Reatom state.

Example:

```tsx
import { reatomComponent } from '@reatom/npm-react';

export const ItemsPage = reatomComponent(({ ctx }) => {
    const data = ctx.spy(getItemsResource.dataAtom);
    const { isPending } = ctx.spy(getItemsResource.statusesAtom);

    return <div>{isPending ? 'Loading...' : data.results.length}</div>;
}, 'ItemsPage');
```

Practical rule:

- read reactive state at the top of the component
- keep JSX as simple as possible
- call actions and async operations directly with `ctx`

### `reaction`

Use `reaction` for background reactive logic that should not live in a component.

Good use cases:

- polling
- follow-up side effects
- orchestration that depends on current state but is not UI-owned

### `reatomMap`

Use `reatomMap` when state is naturally a dynamic key-value store.

It can be useful for:

- filter search text per field
- local caches by id
- dynamic per-key temporary state

## `ctx.spy` vs `ctx.get`

This is one of the most important rules.

### Use `ctx.spy(...)` when:

- the component should rerender on changes
- a resource should depend reactively on another atom
- a computed atom should recalculate reactively
- you want a resource to refresh after `asyncAction.onFulfill`

Examples:

```ts
const query = ctx.spy(queryParamsAtom).toString();
const { isPending } = ctx.spy(getItemsResource.statusesAtom);
ctx.spy(createItemAsync.onFulfill);
```

### Use `ctx.get(...)` when:

- you need a current snapshot once
- you are inside an action or handler
- you do not want a reactive subscription
- you are assembling a new value from current state

Examples:

```ts
const params = new URLSearchParams(ctx.get(queryParamsAtom));
const isOpen = ctx.get(isDrawerOpenAtom);
const rows = ctx.get(dataSourceAtom);
```

Short rule:

- `ctx.spy` = reactive dependency
- `ctx.get` = one-time read

If you accidentally use `ctx.spy` where `ctx.get` should be used, you can create extra rerenders or unwanted resource recalculations.

## Common `.pipe(...)` patterns

### `withDataAtom(initialValue)`

Creates `dataAtom` on a resource and gives it a stable initial value.

Recommended default for almost every resource.

Typical initial values:

- `[]`
- `null`
- `{ results: [], count: 0 }`
- `{ columns: [], results: [] }`
- a fully shaped object with empty collections

### `withStatusesAtom()`

Use it on almost every async resource or mutation.

This gives UI access to loading and status information such as:

- `isPending`
- `isFirstPending`
- `isError`

### `withErrorAtom(mapper?)`

Use it when UI needs explicit error handling.

Typical uses:

1. normalize raw error into UI-friendly data
2. open an error state atom
3. trigger a notification

Examples:

```ts
withErrorAtom((_, error) => normalizeError(error))
```

```ts
withErrorAtom(isDrawerErrorAtom.setTrue)
```

### `withComputed(...)`

Use it for derived state.

It is especially useful when:

- multiple filter sources should be merged
- one table query depends on shared page filters plus local table filters
- you want a stable derived `URLSearchParams` atom

Example:

```ts
import { atom, withComputed } from '@reatom/framework';

export const generalFiltersAtom = atom<URLSearchParams>(
    new URLSearchParams(),
    'generalFiltersAtom',
);

export const tableQueryParamsAtom = atom<URLSearchParams>(
    new URLSearchParams(),
    'tableQueryParamsAtom',
).pipe(
    withComputed((ctx, state) => {
        const base = new URLSearchParams(ctx.spy(generalFiltersAtom));
        base.set('data_type', state.get('data_type') || 'default');
        return mergeParams(ctx.get(generalFiltersAtom), filtersMap(base));
    }),
);
```

### `withReset()`

Use it when state must be easily returned to initial value.

Very useful for:

- drawers and modals
- temporary form state
- temporary filter state
- selected items

Then you can call:

```ts
someAtom.reset(ctx);
```

### `withConcurrency()`

Use it for debounce-like or concurrency-sensitive logic.

Especially useful for:

- search input
- rapidly changing filters
- any async action that should ignore stale overlapping runs

### `withCache()`

Use when repeated calls to the same async logic should be cached.

Apply only when the scenario is well understood.

### `withRetry()`

Use when a resource needs controlled retry or polling behavior.

Typical pattern:

```ts
resource.retry(ctx, 3000);
```

### `withLocalStorage(...)`

Use for persisted lightweight state:

- auth token
- auth flag
- simple user preferences

Example:

```ts
import { atom } from '@reatom/framework';
import { withLocalStorage } from '@reatom/persist-web-storage';

export const tokenAtom = atom('', 'tokenAtom').pipe(withLocalStorage('token'));
```

## Auto-refresh pattern through `.onFulfill`

This is one of the strongest patterns in this style.

Instead of calling manual reload after every mutation, let the resource depend on async completion:

```ts
export const getItemsResource = reatomResource((ctx) => {
    ctx.spy(createItemAsync.onFulfill);
    ctx.spy(updateItemAsync.onFulfill);
    ctx.spy(deleteItemAsync.onFulfill);

    const query = ctx.spy(queryParamsAtom).toString();

    return ctx.schedule(async () => {
        const { data } = await getItems(query);
        return data;
    });
}, 'getItemsResource').pipe(withDataAtom([]), withStatusesAtom());
```

Why this is good:

- no manual refetch calls in UI
- no duplicated loading logic
- the model stays declarative
- mutation success automatically invalidates dependent reads

## `URLSearchParams` as page state

For table-heavy pages, `URLSearchParams` is a very good default container for:

- filters
- pagination
- sorting
- search
- preset/template id

Example:

```ts
export const queryParamsAtom = atom<URLSearchParams>(
    new URLSearchParams(),
    'queryParamsAtom',
);
```

Why this works well:

- easy to send as `params.toString()`
- easy to add and remove keys
- easy to merge multiple filter sources
- works well across many table scenarios

Important rule:

- do not mutate the existing instance directly
- always create a copy first

Correct pattern:

```ts
const params = new URLSearchParams(ctx.get(queryParamsAtom));
params.set('page', '2');
queryParamsAtom(ctx, params);
```

## Reusable helpers

It is useful to keep small generic helpers in something like:

- `src/shared/lib/reatom/merge-params.ts`
- `src/shared/lib/reatom/pagination.ts`

### `mergeParams`

Useful when you need to merge:

- base page params
- filter maps
- derived filter state

Example shape:

```ts
export const mergeParams = (
    base: URLSearchParams,
    filters: Map<string, string | string[]>,
): URLSearchParams => {
    const next = new URLSearchParams(base);

    filters.forEach((value, key) => {
        next.delete(key);

        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item !== '') next.append(key, item);
            });
            return;
        }

        if (value !== '') next.append(key, value);
    });

    return next;
};
```

### `createPaginationAction`

Useful as a reusable action factory:

```ts
import type { AtomMut } from '@reatom/framework';
import { action } from '@reatom/framework';

export const createPaginationAction = (queryParamsAtom: AtomMut<URLSearchParams>) =>
    action((ctx, page: number, pageSize?: number) => {
        const params = new URLSearchParams(ctx.get(queryParamsAtom));
        params.set('page', String(page));

        if (pageSize) {
            params.set('page_size', String(pageSize));
        }

        queryParamsAtom(ctx, params);
    }, 'createPaginationAction');
```

## Canonical scenario: table page

This is the most common feature pattern.

### Step 1. Create query params state

```ts
export const INITIAL_QUERY = new URLSearchParams({
    format: 'json',
    page: '1',
    page_size: '20',
});

export const queryParamsAtom = atom<URLSearchParams>(
    INITIAL_QUERY,
    'queryParamsAtom',
);
```

### Step 2. Create the resource

```ts
export const getTableResource = reatomResource((ctx) => {
    const query = ctx.spy(queryParamsAtom).toString();

    return ctx.schedule(async () => {
        const { data } = await getTable(query, ctx.controller.signal);
        return tableMapper(data);
    });
}, 'getTableResource').pipe(
    withDataAtom({
        columns: [],
        results: [],
        count: 0,
    }),
    withStatusesAtom(),
    withErrorAtom((_, error) => normalizeError(error)),
);
```

### Step 3. Add actions for pagination and reset

```ts
export const handleChangePageAction = createPaginationAction(queryParamsAtom);

export const resetQueryParamsAction = action((ctx) => {
    queryParamsAtom(ctx, INITIAL_QUERY);
}, 'resetQueryParamsAction');
```

### Step 4. Connect UI with `reatomComponent`

```tsx
export const FeaturePage = reatomComponent(({ ctx }) => {
    const tableData = ctx.spy(getTableResource.dataAtom);
    const { isPending } = ctx.spy(getTableResource.statusesAtom);
    const error = ctx.spy(getTableResource.errorAtom);
    const query = ctx.spy(queryParamsAtom);

    return (
        <>
            <Table
                data={tableData.results}
                columns={tableData.columns}
                loading={isPending}
                error={error}
            />
            <Pagination
                current={Number(query.get('page')) || 1}
                pageSize={Number(query.get('page_size')) || 20}
                total={tableData.count}
                onChange={(page, pageSize) => handleChangePageAction(ctx, page, pageSize)}
            />
        </>
    );
}, 'FeaturePage');
```

## Canonical scenario: derived query params

Use this when a page has:

- shared top-level filters
- local filters for multiple tables or blocks
- search overlays
- presets or templates

Pattern:

```ts
export const generalFiltersAtom = atom<URLSearchParams>(
    new URLSearchParams(),
    'generalFiltersAtom',
);

export const localTableParamsAtom = atom<URLSearchParams>(
    new URLSearchParams(),
    'localTableParamsAtom',
).pipe(
    withComputed((ctx, state) => {
        const merged = new URLSearchParams(ctx.spy(generalFiltersAtom));
        merged.set('data_type', state.get('data_type') || 'default');
        return mergeParams(ctx.get(generalFiltersAtom), filtersMap(merged));
    }),
);
```

Use this pattern when you want a single stable derived source for API requests instead of manually assembling params in components.

## Canonical scenario: mutation + auto-refresh

```ts
export const updateItemAsync = reatomAsync((ctx, body: Body) => {
    return ctx.schedule(async () => {
        const { data } = await updateItem(body);
        return data;
    });
}, 'updateItemAsync').pipe(
    withStatusesAtom(),
    withErrorAtom((_, error) => normalizeError(error)),
);

export const getItemsResource = reatomResource((ctx) => {
    ctx.spy(updateItemAsync.onFulfill);
    const query = ctx.spy(queryParamsAtom).toString();

    return ctx.schedule(async () => {
        const { data } = await getItems(query);
        return data;
    });
}, 'getItemsResource').pipe(withDataAtom([]), withStatusesAtom());
```

Preferred rule:

- do not manually refetch from UI when the resource can just depend on `.onFulfill`

## Canonical scenario: drawer or modal

Recommended building blocks:

- `reatomBoolean` for visibility
- `atom` for initial values
- optional temporary atoms with `withReset()`
- `action` for open/close/reset
- `reatomAsync` for submit

Example:

```ts
export const isDrawerOpenAtom = reatomBoolean(false, 'isDrawerOpenAtom');
export const initialValuesAtom = atom<FormValues | null>(null, 'initialValuesAtom');

export const openDrawerAction = action((ctx, values: FormValues | null) => {
    initialValuesAtom(ctx, values);
    isDrawerOpenAtom.setTrue(ctx);
}, 'openDrawerAction');

export const closeDrawerAction = action((ctx) => {
    initialValuesAtom(ctx, null);
    isDrawerOpenAtom.setFalse(ctx);
    isDrawerErrorAtom?.setFalse?.(ctx);
}, 'closeDrawerAction');
```

## Canonical scenario: debounced search

Recommended pattern:

```ts
import { action, sleep, withConcurrency } from '@reatom/framework';

export const handleSearchAction = action(async (ctx, value: string) => {
    await ctx.schedule(() => sleep(300));

    const params = new URLSearchParams(ctx.get(queryParamsAtom));
    params.set('search', value);
    queryParamsAtom(ctx, params);
}, 'handleSearchAction').pipe(withConcurrency());
```

Why this works well:

- debounce logic stays in the model
- components stay dumb
- stale overlapping runs are controlled

## Canonical scenario: polling

Use this combination:

- `reatomResource`
- `withRetry()`
- optionally `reaction(...)`

Example idea:

```ts
export const reportsResource = reatomResource((ctx) => {
    return ctx.schedule(async () => {
        const { data } = await getReports();

        if (data.results.some((item) => item.status === 'processing')) {
            reportsResource.retry(ctx, 3000);
        }

        return data;
    });
}, 'reportsResource').pipe(
    withDataAtom({
        results: [],
        count: 0,
    }),
    withStatusesAtom(),
    withRetry(),
);
```

Good fit for:

- report generation
- import pipelines
- long-running jobs
- background server processing

## Canonical scenario: local mirror of resource data

Sometimes `resource.dataAtom` is not enough.

If loaded data will be further changed locally in UI, mirror it into dedicated atoms such as:

- `columnsAtom`
- `dataSourceAtom`
- `currentQueryAtom`
- `expandingRowsAtom`

Typical reasons:

- tree expansion
- local row patching
- drag and drop column order
- infinite scroll or incremental pagination

Rule:

- if data is only displayed, `resource.dataAtom` is usually enough
- if data has its own local lifecycle after load, split it into dedicated atoms

## Cleanup and lifecycle

### `onDisconnect(...)`

Use `onDisconnect` for cleanup when state should reset after unmount or lost subscriptions.

Examples:

```ts
onDisconnect(itemsResource, itemsResource.reset);
onDisconnect(selectedFiltersAtom, selectedFiltersAtom.reset);
```

Good use cases:

- reset resources
- clear temporary state
- reset selected filters
- reset per-feature derived state

### `ctx.controller.signal`

If your API layer supports `AbortSignal`, always pass it for fast-changing requests.

Example:

```ts
await getItems(query, ctx.controller.signal);
```

Especially important for:

- filters
- search
- rapidly changing pages
- request race prevention

## Presets and templates

There are two useful higher-level scenarios that often appear in admin-style products.

### Presets

Presets usually store page query/filter state.

Recommended flow:

1. load available presets through a resource
2. sync active preset into `queryParamsAtom`
3. only after that run the main page data resource

Typical parts:

- `currentPageAtom`
- `getPresetsResource`
- `syncPresetAction`

This keeps preset behavior deterministic and avoids fetching the main page with incomplete state.

### Templates

Templates usually store visual table configuration:

- visible columns
- hidden columns
- column order
- optional colors or separators

Recommended flow:

- keep active template data in atoms
- load templates through a resource
- refresh template resource after create/update/delete/set-default operations through `.onFulfill`

## Dynamic atoms inside normalized data

Sometimes it is useful to create atoms inside normalized structures.

Example pattern:

```ts
const normalizedColumns = rawColumns.map((column) => ({
    ...column,
    values: column.values.map((value) => ({
        ...value,
        separatorLeftAtom: atom(false, 'separatorLeftAtom'),
        separatorRightAtom: atom(false, 'separatorRightAtom'),
    })),
}));
```

This is useful when:

- each item has its own small local state
- keeping everything in one giant object atom becomes awkward
- the state naturally belongs to the item itself

Use carefully when:

- the collection is extremely large
- items are frequently recreated
- full reset of nested state becomes difficult

## When to use React state vs Reatom

Use React local state such as `useState` when state is:

- owned by a single component
- not part of request logic
- not needed by other components
- not important for feature-level orchestration

Use Reatom when state:

- affects requests
- is shared across components
- must survive internal component restructuring
- is tied to async flow
- needs centralized reset and orchestration

## Recommended blueprint for a new feature

### Variant A. Simple CRUD table

1. Create `queryParamsAtom`
2. Create `reatomResource` for the list
3. Create `reatomAsync` for create/update/delete
4. Make the list resource depend on those `.onFulfill`
5. Create actions for pagination and reset
6. Connect UI through `reatomComponent`

### Variant B. Complex page with filters and derived query

1. Create `generalFiltersAtom`
2. Create local query atoms per block or table
3. Build derived params through `withComputed`
4. Build resources on top of those derived atoms
5. Keep all filter mutation logic inside `action`

### Variant C. Form inside drawer or modal

1. `reatomBoolean` for open state
2. `atom` for initial values
3. `reatomAsync` for submit
4. `withStatusesAtom` for loading
5. `withErrorAtom` for user-friendly error handling
6. explicit close/reset actions

## Universal skeleton

```ts
import {
    action,
    atom,
    onDisconnect,
    reatomAsync,
    reatomBoolean,
    reatomResource,
    withDataAtom,
    withErrorAtom,
    withStatusesAtom,
} from '@reatom/framework';

const INITIAL_QUERY = new URLSearchParams({
    page: '1',
    page_size: '20',
});

export const queryParamsAtom = atom<URLSearchParams>(INITIAL_QUERY, 'queryParamsAtom');
export const isDrawerOpenAtom = reatomBoolean(false, 'isDrawerOpenAtom');
export const selectedItemAtom = atom<Item | null>(null, 'selectedItemAtom');

export const createItemAsync = reatomAsync((ctx, body: CreateBody) => {
    return ctx.schedule(async () => {
        const { data } = await createItem(body);
        return data;
    });
}, 'createItemAsync').pipe(
    withStatusesAtom(),
    withErrorAtom((_, error) => normalizeError(error)),
);

export const updateItemAsync = reatomAsync((ctx, id: string, body: UpdateBody) => {
    return ctx.schedule(async () => {
        const { data } = await updateItem(id, body);
        return data;
    });
}, 'updateItemAsync').pipe(
    withStatusesAtom(),
    withErrorAtom((_, error) => normalizeError(error)),
);

export const deleteItemAsync = reatomAsync((ctx, id: string) => {
    return ctx.schedule(async () => {
        await deleteItem(id);
    });
}, 'deleteItemAsync').pipe(withStatusesAtom());

export const itemsResource = reatomResource((ctx) => {
    ctx.spy(createItemAsync.onFulfill);
    ctx.spy(updateItemAsync.onFulfill);
    ctx.spy(deleteItemAsync.onFulfill);

    const query = ctx.spy(queryParamsAtom).toString();

    return ctx.schedule(async () => {
        const { data } = await getItems(query, ctx.controller.signal);
        return data;
    });
}, 'itemsResource').pipe(
    withDataAtom({
        results: [],
        count: 0,
    }),
    withStatusesAtom(),
    withErrorAtom((_, error) => normalizeError(error)),
);

export const resetQueryParamsAction = action((ctx) => {
    queryParamsAtom(ctx, INITIAL_QUERY);
}, 'resetQueryParamsAction');

export const openDrawerAction = action((ctx, item: Item | null = null) => {
    selectedItemAtom(ctx, item);
    isDrawerOpenAtom.setTrue(ctx);
}, 'openDrawerAction');

export const closeDrawerAction = action((ctx) => {
    selectedItemAtom(ctx, null);
    isDrawerOpenAtom.setFalse(ctx);
}, 'closeDrawerAction');

onDisconnect(itemsResource, itemsResource.reset);
```

And UI:

```tsx
import { reatomComponent } from '@reatom/npm-react';

export const ItemsPage = reatomComponent(({ ctx }) => {
    const data = ctx.spy(itemsResource.dataAtom);
    const { isPending } = ctx.spy(itemsResource.statusesAtom);
    const isDrawerOpen = ctx.spy(isDrawerOpenAtom);

    return (
        <>
            <Table rows={data.results} loading={isPending} />
            <Button onClick={() => openDrawerAction(ctx)}>Create</Button>
            <Drawer open={isDrawerOpen} onClose={() => closeDrawerAction(ctx)} />
        </>
    );
}, 'ItemsPage');
```

## Practical rules worth repeating

### 1. Always name atoms and async operations

This is essential for readable debugging.

### 2. Keep the model declarative

A good sign is when the component does not know when to refetch, merge, or reset. The model already defines that behavior.

### 3. Centralize query/filter state

For table pages, `URLSearchParams` is often the best default.

### 4. Prefer `.onFulfill` dependencies over manual reload calls

This makes mutation-driven refresh predictable and easy to maintain.

### 5. Pass `ctx.controller.signal` for fast-changing requests

Especially for filters and search.

### 6. Mirror loaded data into dedicated atoms only when it needs a local lifecycle

Do not create extra atoms if `resource.dataAtom` is enough.

### 7. Keep debounce logic in the model, not in JSX

Use `ctx.schedule + sleep + withConcurrency`.

### 8. Make cleanup explicit

Use:

- `withReset()`
- `atom.reset(ctx)`
- `onDisconnect(...)`
- close/reset actions

## Anti-patterns to avoid

### 1. Too much logic directly inside JSX

Better:

- read atoms at the top of the component
- keep render output simple

### 2. Using `ctx.spy` for snapshot reads

If you only need the current value once, use `ctx.get`.

### 3. Mutating `URLSearchParams` in place

Always create a fresh copy before updating.

### 4. Calling API directly from a component

Keep API calls in model-level logic.

### 5. Leaving resources without stable initial shape

Without `withDataAtom(initialValue)`, UI becomes noisier because every consumer must constantly defend against missing structure.

## Checklist before finishing a feature

- all atoms and async operations are named
- reads use `reatomResource`
- writes use `reatomAsync`
- async/resource objects expose `withStatusesAtom()`
- resources expose `withDataAtom(...)`
- errors are normalized where UI needs them
- `ctx.spy` is used only for reactive dependencies
- `ctx.get` is used for snapshot reads
- list/detail resources refresh after related successful mutations
- temporary state has explicit reset/cleanup

## Final summary

This working style can be reduced to a simple formula:

- **atoms** hold local and derived state
- **`URLSearchParams`** is a strong default for table page state
- **`reatomResource`** reads and reactively refreshes data
- **`reatomAsync`** performs mutations
- **`action`** orchestrates local transitions and state assembly
- **`reatomComponent`** connects model and UI
- **`.onFulfill` + `ctx.spy`** replaces manual refetch calls

If you need a safe default for a new independent project, use this sequence:

1. store page state in named atoms
2. read through `reatomResource`
3. mutate through `reatomAsync`
4. keep filters in `URLSearchParams`
5. refresh resources via `.onFulfill` dependencies
6. keep UI thin and connect it through `reatomComponent`

