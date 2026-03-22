# Repository Guidelines

## Project Structure & Module Organization
This repository is an Expo + React Native app with file-based routing. Route entry points live in `src/app/`, including the tab layout in `src/app/(tabs)/`. Reusable UI goes in `src/components/`, shared state and types in `src/model/`, API and persistence code in `src/entities/`, prompt builders in `src/prompts/`, and theme helpers in `src/theme/` and `src/helpers/`. Static assets are under `src/assets/`, and seed data currently lives in `src/data/story-tags.json`.

## Build, Test, and Development Commands
Install dependencies with `npm install` or `bun install`.

- `npm run dev`: start the Expo dev server.
- `npm run android`: build and launch the Android app locally.
- `npm run ios`: build and launch the iOS app locally.
- `npm run web`: run the app in a browser.
- `npm run lint`: run Expo/ESLint checks.
- `npm run build:web`: export the web bundle to `dist/`.
- `npm run build:android`: trigger the EAS Android preview build.

## Coding Style & Naming Conventions
TypeScript is required, and `tsconfig.json` enables `strict` mode. Prettier rules use 4 spaces, semicolons, single quotes, trailing commas, and a 100-character line width. Run formatting before opening a PR.

Use PascalCase for React components and page-level classes (`AIController.ts`, `InputModal.tsx`), camelCase for helpers and model files (`generate-id.ts`, `atoms.ts`), and keep route filenames aligned with Expo Router conventions such as `index.tsx` and `_layout.tsx`. Prefer sorted imports; ESLint enforces `simple-import-sort`.

## Testing Guidelines
There is no dedicated automated test suite configured yet. At minimum, run `npm run lint` and smoke-test the affected flow in Expo on the target platform (`npm run web`, `npm run android`, or `npm run ios`). When adding tests, place them beside the feature as `*.test.ts` or `*.test.tsx` and favor React Native Testing Library for UI behavior.

## Commit & Pull Request Guidelines
Recent history follows short conventional prefixes such as `feat:`, `fix:`, and `ref:`. Keep commits focused and descriptive, for example `fix: normalize added dictionary cards`. PRs should include a brief summary, linked issue or task, affected platforms, and screenshots or recordings for UI changes.

## Security & Configuration Tips
Do not commit API secrets or local machine overrides. Review Expo, EAS, and Vercel config changes carefully in `app.json`, `eas.json`, and `vercel.json`, because they affect build and deployment behavior.
