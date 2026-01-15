# Frontend Architecture Guidelines

These guidelines document how this repository is built today. Keep changes aligned with the existing stack and patterns. If you want to introduce a new major library or architectural approach, do it deliberately and update this file in the same PR.

## Core Stack (This Repo)

- **Framework:** Next.js 16+ using the **App Router only** (no Pages Router).
- **React:** React 19.x.
- **Language:** TypeScript with `strict: true` (see `tsconfig.json`).
- **AI / Streaming:** Vercel **AI SDK v6** (`ai`, `@ai-sdk/*`, `@ai-sdk/react`) for streaming chat responses and tools.
- **UI:** shadcn/ui + Radix UI primitives (compose rather than reinvent).
- **Styling:** Tailwind CSS (repo uses Tailwind v4 toolchain).
- **State:** **Jotai** for cross-component state and persisted UI preferences.
- **Persistence:** **Dexie** (IndexedDB) for local message storage.

## What We Do NOT Standardize On (Right Now)

Unless you’re adding them intentionally (and updating docs), assume these are **not** part of the architecture:

- TanStack Query / React Query
- Zustand
- React Hook Form (there are no form-heavy flows today)
- OpenAPI-generated API clients as a requirement

## App Router & Component Boundaries

- Prefer **Server Components** by default; use `'use client'` only where you need browser APIs, event handlers, streaming UI hooks, IndexedDB, etc.
- Keep client components focused: UI + interactions. Avoid moving business logic into deeply nested components when it can live in a hook or utility.
- Use `@/*` path aliases consistently.

## Chat + Streaming Architecture

### API Route Expectations

- Chat is implemented via an App Router route (e.g. `app/api/chat/route.ts`).
- The route uses **Node.js runtime** (this repo explicitly configures this via `export const runtime = 'nodejs'`).
- Streaming responses should follow AI SDK v6 patterns (`streamText`, `smoothStream`, `toUIMessageStreamResponse`, etc.).
- Validate required environment variables early and fail with clear errors (the existing route does this).

### Client Chat Hook

- The UI uses `useChat` from `@ai-sdk/react`.
- Keep the message format aligned with AI SDK UI messages (`UIMessage` with `parts`).
- Message metadata (model name, createdAt, usage) should be attached in a consistent, machine-readable way.

## Persistence (Dexie / IndexedDB)

- Messages are persisted locally in IndexedDB using Dexie.
- Schema migrations must be:
  - **Non-destructive** where possible
  - Forward-only with clear versioning
  - Resilient to legacy shapes (e.g. migrating legacy `content` to `parts`)
- Do not index large/complex fields (e.g. arrays of message parts). Index primitives used for filtering (e.g. `chatId`, `createdAt`, `role`, `model`).

## State Management (Jotai)

- Use Jotai for cross-component state like:
  - selected model
  - system message
  - UI preferences (theme, toggles)
  - simple persisted values (via `atomWithStorage`)
- Use React local state (`useState`, `useReducer`, refs) for strictly component-local concerns.
- Prefer derived data to be computed from source atoms/state rather than manually synchronized copies.

## Uploads & Message Parts

- Message content should be represented as **parts** (text and file parts).
- Text files may be represented as text parts with a clear prefix convention (this repo uses the `[File: name]` prefix style).
- Non-text uploads (e.g. images) should be represented as file parts with `url` values (often `data:` URLs).
- Be mindful of payload size: avoid unnecessary base64 duplication and avoid logging raw file payloads.

## TypeScript Rules

- Avoid `any`. If you must use it temporarily, isolate it, comment it, and remove it as soon as practical.
- Prefer `unknown` + narrowing to maintain safety at boundaries.
- Use discriminated unions for message parts and metadata shapes.
- Keep types close to usage, but avoid circular imports between UI and data layers.

## UI & Accessibility

- Build UI by composing shadcn/ui components.
- Maintain accessibility:
  - keyboard navigation
  - focus management
  - labels for inputs
  - semantic HTML where possible
- Prefer consistent styling via Tailwind utilities and existing component variants.

## Security & Operational Guidelines

- Never commit secrets. Use environment variables and keep `.env.local.example` up to date when adding new required configuration.
- Avoid logging sensitive user input, file contents, or full request/response payloads.
- Treat persisted chat history as sensitive. Store only what the app needs to function locally.

## Code Quality & Tooling

- Follow repo lint/format tooling (ESLint, Prettier, Biome configuration where applicable).
- Keep PRs small and focused; include updates to this document when you change architecture.

## When Adding a Model / Provider

- Add the model to the repo’s centralized model configuration (see existing utilities, e.g. `app/utils/models.ts`).
- Add any required deployment environment variables to `.env.local.example`.
- Ensure the API route maps model names to provider/deployment identifiers consistently and fails loudly when misconfigured.