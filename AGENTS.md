## Overview

Monorepo (npm workspaces): `client` (Vite + React), `server` (Express + MongoDB), shared types in `model/`. Collects saved artists' new Spotify releases into a playlist; a GitHub Action (`.github/workflows/trigger.yml`) calls the server's scheduler endpoint daily.

- Commands (from the repo root): `npm run dev` (client + server), `npm run build`, `npm run lint` / `npm run lint:fix`.
- Env vars are validated in `server/utils/validateEnv.ts`; add new ones there.
- TypeScript is `strict` for both workspaces — no `any`, no unused variables.
- Formatting: Prettier (format on save). Lint with ESLint before finishing.
- File naming: match the neighbouring files. Components are `PascalCase.tsx`, hooks are `use-foo.hook.ts`, server files are `kebab-or-dot.case.ts`.

## Frontend (`client/`)

- Stack: Vite + React 18 with TanStack Router (file-based routes in `client/routes`, `routeTree.gen.ts` is generated — never edit it), TanStack Query for server state, Zustand for client state, axios for HTTP.
- Do not suggest Next.js APIs or React Router.
- Styling: Emotion (`@emotion/styled` and `css`). Co-locate styles with the component; shared mixins and animations live in `client/styles/abstracts`. Don't add Tailwind or other CSS frameworks.
- Imports: use the `@client/*`, `@server/*`, and `@model/*` aliases instead of deep relative paths.
- Structure: reusable components in `client/components` (icons in `Icons/`, cards in `Card/`, tables in `Table/`); hooks in `client/hooks`; shared state in `client/store`; context in `client/context`; Spotify/API calls in `client/lib`; helpers in `client/utils` — reuse them before writing new ones.
- Naming: `PascalCase` components, `use` prefix for hooks, `camelCase` vars/functions, `UPPER_SNAKE_CASE` constants.
- Functions: define functions outside components unless they need component scope.
- Error handling: show user-friendly feedback (`react-hot-toast` / `InfoToast`); keep API error parsing in `client/lib`, not in components.

## Backend (`server/`)

Layering: `router` → `controller` (handlers in `controller/spotify/`) → `service` → `repository` (MongoDB). Dependencies are wired in `server/container`.

- Services and repositories are factory functions that take their dependencies as arguments (`SpotifyService({ repository, env, api })`), not classes. Follow that pattern and register new ones in `container/index.ts` and `container/types.ts`.
- Spotify HTTP calls live in `service/spotify-api/`; business logic in `service/spotify-domain/`. Retry/backoff goes through `spotify-api/retry.ts`.
- Controllers only parse the request, call a service, and respond. Use `http-helpers.ts`, throw errors from `utils/exceptions.ts`, and let `middleware/error.middleware.ts` format them.
- Use `utils/logger.ts` for logging, never `console`. Log with context before re-raising.
- Catch specific errors, and prefer early returns.
- Shared request/response types go in `model/`, so client and server don't redefine them.
- MongoDB: collections are accessed only through the repositories. Don't query Mongo from services or controllers.
- Auth: Spotify OAuth tokens and the app JWT are handled in `service/spotify-domain/oauth.ts` and `utils/auth.ts`. Never log tokens or commit secrets (`.env` is local only).

## Testing

- Framework: `node:test` with `node:assert/strict`, in `*.test.ts` files next to the code (see `service/spotify-api/albums.test.ts`).
- Test business rules (release-window filtering, playlist de-duplication, scheduler logic), not wrappers around Spotify or Mongo.
- Test the boundaries where a rule flips (date edges, empty vs. one result, limits) and the guards the code adds itself. Don't test an error that is only passed through from another layer.
- Prefer fewer, high-signal tests. Tautological tests are harmful.
- One test per rule or workflow, not per input: loop over a table of cases when several inputs hit the same rule. Compare a whole result in one assertion.
- Mock the Spotify API and repositories at the factory-argument boundary, not with module patching.

## Design principles

- Avoid overly defensive code. Validate at the boundaries (incoming requests, Spotify responses, env). Inside the system, trust typed data. Use `assert` for impossible states, not redundant null/`typeof` checks. Fix data at the source instead of guarding every usage.
- This is a small personal app. Don't add backwards-compatibility layers, fallbacks, or mitigations for hypothetical scale. When changing a type or function, change it everywhere directly.
- Don't store state that can be derived from other state. Compute it.
- Let names carry the meaning. Rename or extract functions instead of writing comments. Comments are only for non-obvious reasoning, business rules, or constraints. No multi-line comments narrating what code does.

## MongoDB commands for the user

- When the user needs a manual database change (data migrations, fixes, lookups), give them as MongoDB Compass commands: statements to paste into Compass's embedded `>_MONGOSH` shell, one statement per line, starting with `use spotify`. Don't give `mongo` legacy-shell syntax, scripts, or Node/driver code.
- The database is `spotify` (collections: `users`, `saved_artists`, `seen_artists`); scheduler logs are in the separate `scheduler` database (`logs`).
- Put a read-only check (`find`/`countDocuments`) before every write, and another after it, so the result can be confirmed in Compass.
- Use the `userId` field to target a user, never `_id`.
