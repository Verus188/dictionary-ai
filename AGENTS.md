# Repository Guidelines

## Project Structure & Module Organization
This repository is an Expo + React Native app with file-based routing. Route entry points live in `src/app/`, including the tab layout in `src/app/(tabs)/`. Reusable UI goes in `src/components/`, shared state and types in `src/model/`, API and persistence code in `src/entities/`, prompt builders in `src/prompts/`, and theme helpers in `src/theme/` and `src/helpers/`. Static assets are under `src/assets/`, and seed data currently lives in `src/data/story-tags.json`.

## Architecture
Prefer a feature-first architecture with a small shared/core layer. Keep Expo Router in `src/app/`, but move business logic out of route files and organize the rest of the code by product feature.

Target direction:
- `src/app`: routing, screen composition, app bootstrap, providers.
- `src/features/story`: story generation flow, story state, story-specific UI, and user actions such as init, continue, and reset.
- `src/features/dictionary`: dictionary card CRUD flow, modal state, and dictionary-specific UI.
- `src/features/settings`: story generation settings form, persistence orchestration, and settings-related state.
- `src/shared/ui`: reusable presentational components with no feature business logic.
- `src/shared/api`: HTTP clients, request mappers, and API configuration.
- `src/shared/db`: SQLite repositories, migrations, and persistence bootstrap.
- `src/shared/lib`: generic helpers and framework-agnostic utilities.
- `src/shared/theme`: colors, styling helpers, and design tokens.
- `src/shared/types`: shared domain types that must not depend on UI, routing, or persistence details.

Architecture rules:
- Route files should compose screens and connect providers, but should not contain business workflows or persistence code.
- Feature modules may depend on `shared/*`, but should not depend on other features unless the dependency is explicitly intentional and minimal.
- Shared modules must not import from `features/*` or `app/*`.
- Persistence and API code must not import from UI or route modules.
- In a feature `ui/` folder, keep the main screen or entry component at the top level. If the feature has additional UI pieces, place them in `ui/parts/`.
- Reatom atoms/actions should live inside the feature they belong to instead of a single global `src/model` module.
- Toasts, alerts, and other UI side effects should be triggered from presentation/feature boundaries, not from low-level API or DB helpers.
- Prefer repository-style adapters between feature logic and infrastructure so story and dictionary flows are easier to test and refactor.

When refactoring the current codebase:
- Move global story logic from `src/model` into `src/features/story/model`.
- Move dictionary CRUD state and actions into `src/features/dictionary/model`.
- Move settings state and persistence flows into `src/features/settings/model`.
- Keep `src/app/_layout.tsx` focused on provider wiring; extract SQLite initialization and settings hydration into shared bootstrap helpers.
- Remove dependencies where infrastructure imports feature or model types; shared domain types should live in a neutral layer.

## Build, Test, and Development Commands
Install dependencies with `bun install`.

- `bun run dev`: start the Expo dev server.
- `bun run android`: build and launch the Android app locally.
- `bun run ios`: build and launch the iOS app locally.
- `bun run web`: run the app in a browser.
- `bun run lint`: run Expo/ESLint checks.
- `bun run build:web`: export the web bundle to `dist/`.
- `bun run build:android`: trigger the EAS Android preview build.

## Coding Style & Naming Conventions
TypeScript is required, and `tsconfig.json` enables `strict` mode. Prettier rules use 4 spaces, semicolons, single quotes, trailing commas, and a 100-character line width. Run formatting before opening a PR.

Use PascalCase for React components and page-level classes (`AIController.ts`, `InputModal.tsx`), camelCase for helpers and model files (`generate-id.ts`, `atoms.ts`), and keep route filenames aligned with Expo Router conventions such as `index.tsx` and `_layout.tsx`. Prefer sorted imports; ESLint enforces `simple-import-sort`.

## Testing Guidelines
There is no dedicated automated test suite configured yet. At minimum, run `bun run lint` and smoke-test the affected flow in Expo on the target platform (`bun run web`, `bun run android`, or `bun run ios`). When adding tests, place them beside the feature as `*.test.ts` or `*.test.tsx` and favor React Native Testing Library for UI behavior.

## Commit & Pull Request Guidelines
Recent history follows short conventional prefixes such as `feat:`, `fix:`, and `ref:`. Keep commits focused and descriptive, for example `fix: normalize added dictionary cards`. PRs should include a brief summary, linked issue or task, affected platforms, and screenshots or recordings for UI changes.

## Security & Configuration Tips
Do not commit API secrets or local machine overrides. Review Expo, EAS, and Vercel config changes carefully in `app.json`, `eas.json`, and `vercel.json`, because they affect build and deployment behavior.
