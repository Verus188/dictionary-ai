# Frontend Sync Guide

## Purpose

This document explains how synchronization should work in the app after backend sync is added.

The app remains local-first:
- reads come from local SQLite
- writes go to local SQLite first
- network sync happens in the background

For the user this means:
- the app feels instant
- it works offline
- server sync eventually makes all devices converge

## What We Sync In V1

We sync only:

1. Dictionary cards
2. Persisted story settings

We do not sync in V1:
- generated story text
- current story progress
- transient UI state
- auth session beyond access token storage

## Main Principle

Frontend must never depend on immediate server success to show a change.

Correct flow:

1. User changes something.
2. Frontend writes it to local DB immediately.
3. Frontend records a pending sync operation in local outbox.
4. UI updates from local DB.
5. Sync engine later pushes operations to backend.
6. Sync engine pulls remote changes.
7. Local DB is updated to the converged state.

This is the core local-first contract.

## Local Data Model We Need

Current local schema is too small for sync. We need metadata.

## Dictionary Cards Table

Current table:
- `id`
- `card`

Needed V1 sync fields:
- `id TEXT PRIMARY KEY`
- `card TEXT NOT NULL`
- `normalizedCard TEXT NOT NULL`
- `createdAt TEXT NOT NULL`
- `updatedAt TEXT NOT NULL`
- `deletedAt TEXT NULL`
- `syncStatus TEXT NOT NULL`
- `serverRevision INTEGER NULL`

Recommended `syncStatus` values:
- `synced`
- `pending`
- `failed`

Notes:
- do not hard-delete immediately on user delete
- mark `deletedAt` locally and create delete operation in outbox
- physical cleanup can happen later after successful sync if desired

## Settings Table

Current table stores only:
- `setting`
- `value`

Needed V1 sync fields:
- `setting TEXT PRIMARY KEY`
- `value TEXT NULL`
- `updatedAt TEXT NOT NULL`
- `syncStatus TEXT NOT NULL`
- `serverRevision INTEGER NULL`

## Outbox Table

Need a dedicated table:

- `id TEXT PRIMARY KEY`
- `deviceId TEXT NOT NULL`
- `operationId TEXT NOT NULL`
- `entityType TEXT NOT NULL`
- `operationType TEXT NOT NULL`
- `entityId TEXT NOT NULL`
- `payload TEXT NULL`
- `createdAt TEXT NOT NULL`
- `lastAttemptAt TEXT NULL`
- `retryCount INTEGER NOT NULL DEFAULT 0`
- `status TEXT NOT NULL`

Recommended outbox statuses:
- `pending`
- `inFlight`
- `failed`

## Sync State Table

Need a tiny table for sync metadata:

- `key TEXT PRIMARY KEY`
- `value TEXT`

Keys we likely need:
- `deviceId`
- `lastPulledCursor`
- `lastSyncStartedAt`
- `lastSyncCompletedAt`

Because DB is already user-scoped, these values are automatically per user.

## How Local Writes Must Work

## Add Dictionary Card

When user adds a card:

1. Normalize card text.
2. Insert into local DB immediately with:
   - `syncStatus='pending'`
   - `deletedAt=null`
   - fresh `updatedAt`
3. Insert outbox operation:
   - `entityType='dictionaryCard'`
   - `operationType='upsert'`
4. Update in-memory atom from local DB.
5. Trigger background sync.

## Delete Dictionary Card

When user deletes a card:

1. Update local row:
   - set `deletedAt`
   - set `updatedAt`
   - set `syncStatus='pending'`
2. Insert outbox delete operation.
3. Remove card from visible UI query.
4. Trigger background sync.

Do not immediately destroy the row before sync, otherwise delete cannot be propagated safely.

## Update Setting

When user changes a setting:

1. Update local setting row immediately.
2. Set `syncStatus='pending'`.
3. Update `updatedAt`.
4. Add outbox upsert operation.
5. Trigger background sync.

## When Sync Runs

Sync should happen automatically in these moments:

1. Right after session restore succeeds
2. Right after login succeeds
3. Right after any local mutation, with debounce
4. When app returns to foreground
5. When network becomes available again
6. Periodically while app is open, for example every 60-120 seconds

Recommended immediate policy:
- mutation-triggered sync: debounce 1-3 seconds
- foreground sync: immediate
- periodic sync: every 90 seconds while authenticated

## When Sync Should Not Run

Do not run sync:
- before authentication is restored
- while another sync is already in progress
- when there is no authenticated user

If a sync is in progress and new local operations appear:
- set a flag like `syncRequestedAgain=true`
- rerun once after current sync finishes

## Sync Order

Always use this order:

1. Push local outbox
2. Pull remote changes

Why:
- push first reduces immediate conflicts
- pull after push gives the latest server truth

## Push Phase

Push algorithm:

1. Read pending outbox records ordered by `createdAt`.
2. Send them in batches.
3. Backend responds with:
   - applied operations
   - conflicts
4. Mark successful operations as synced.
5. Update related local entities with returned `serverRevision` and server timestamps if provided.
6. Remove or archive applied outbox rows.

If push fails:
- keep outbox records
- increase retry count
- mark sync as failed
- retry later

## Pull Phase

Pull algorithm:

1. Read `lastPulledCursor`.
2. Request remote changes after that cursor.
3. Apply changes to local DB in a transaction.
4. Advance `lastPulledCursor` only after successful apply.
5. If `hasMore=true`, repeat until caught up.

## Merge Rules On Frontend

Frontend must treat server as the convergence source after pull.

That means:
- if server sends a newer setting value, local DB must accept it
- if server sends a delete tombstone, local row must become deleted locally
- if server sends a canonical dictionary card after duplicate merge, frontend must replace local duplicate state with server state

## Conflict Policy

V1 conflict policy should be simple and deterministic.

## Settings

Rule:
- last server-accepted write wins

What this means in practice:
- two devices can overwrite the same setting
- whichever mutation is accepted later by the server becomes final
- frontend silently updates local DB on next pull

This is acceptable because settings are preferences, not user-authored documents.

## Dictionary Cards

Rule:
- dictionary cards are unique by normalized text per user

Cases:

1. Same card added on two devices
   - backend merges duplicates
   - frontend accepts canonical server card

2. Card deleted on one device while still present on another
   - delete arrives via pull
   - frontend marks it deleted locally

3. Duplicate local add retried many times
   - backend treats operation idempotently

Important frontend behavior:
- after conflict response or pull response, local SQLite must converge to backend canonical state
- do not try to preserve both duplicates locally

## Why We Do Not Need Manual Conflict UI In V1

Because current synced entities are simple:
- dictionary cards
- settings

There is no rich text document or collaborative editor.
For now, deterministic silent resolution is better than a complex merge UI.

## UX States For Sync

Frontend should expose lightweight sync state, even if not yet shown everywhere.

Recommended states:
- `idle`
- `syncing`
- `failed`
- `offline`

Recommended UX:
- no blocking loaders for normal background sync
- optional tiny status indicator in settings/profile later
- optional manual "sync now" action later

## Error Handling

Rules:

1. Local write must still succeed even if network fails.
2. Sync failure must not roll back successful local changes.
3. Outbox is the source of pending work.
4. Retry must be automatic on next trigger.
5. Authentication failure during sync should stop sync and go through normal session expiration flow.

## Suggested Frontend Implementation Plan

1. Extend local SQLite schema for sync metadata.
2. Add `outbox` and `syncState` tables.
3. Change dictionary and settings repositories so writes also create outbox records.
4. Add shared sync engine in something like `src/shared/sync`.
5. Add a bootstrap hook that starts sync after authenticated app mount.
6. Add app lifecycle triggers: foreground, reconnect, periodic timer.
7. Add pull apply logic using SQLite transactions.

## Recommended Module Shape

Suggested structure:

- `src/shared/sync/model`
- `src/shared/sync/api`
- `src/shared/sync/db`
- `src/shared/sync/lib`

Example responsibilities:

- `api`: push/pull HTTP client
- `db`: outbox and sync state repositories
- `model`: runSync, scheduleSync, sync status atoms
- `lib`: merge helpers, entity mappers

## First Version We Should Implement

The safest first release is:

1. sync only dictionary cards and persisted settings
2. use outbox + push-then-pull
3. use cursor-based pull
4. use tombstones for deletes
5. use last-write-wins for settings
6. use duplicate merge by normalized card for dictionary

This gives a reliable local-first foundation without overengineering.

## What Success Looks Like

If the sync design is working correctly:

1. User adds a card offline on phone.
2. Phone later reconnects and syncs.
3. Tablet logs in with same account and pulls the card.
4. User changes a setting on tablet.
5. Phone later pulls and gets the new setting.
6. If both devices added the same card text, only one canonical card remains after sync.
