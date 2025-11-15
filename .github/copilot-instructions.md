# Azure OpenAI GPT-4 Chat - AI Agent Instructions

## Architecture Overview

This is a **Next.js 16 App Router** application providing a ChatGPT-like streaming interface powered by **Azure OpenAI Services**. The app uses **AI SDK v5** (`ai` package) with a hybrid v4/v5 message format strategy that is being migrated to pure v5. The app uses DaisyUI and Tailwind CSS for theming, and Jotai for state management.

### Critical Design Decisions

- **AI SDK v5 Migration In Progress**: Currently maintains v4 compatibility for IndexedDB via conversion functions in `app/utils/conversion.ts`. **MIGRATION GOAL**: Remove all v4 legacy code and conversion utilities, migrate to pure v5 message format throughout
- **Client-Side State**: Chat history persists in **Dexie (IndexedDB)**, not server-side. Each message stores its model name for context
- **Edge Runtime**: API route (`app/api/chat/route.ts`) runs on Vercel Edge Runtime for optimal streaming performance
- **Jotai for State**: Global atoms (in `app/page.tsx`) manage system message, parameters, tokens, themes - all synced to localStorage with `atomWithStorage`
- **Message ID Tracking**: `messageModelsRef` and `savedMessageIdsRef` prevent duplicate saves when loading from IndexedDB
- **Authentication**: Handled externally by Azure App Service - user context available in app but auth flow managed at platform level

## Available MCP Servers

It's important to always use the latest best practices and standards when developing features.

Use the tools available from the following MCP servers as needed:

- **ai-sdk-5-migration**: Assists in migrating from AI SDK v4 to v5 message formats
- **context7**: General-purpose MCP endpoint for various coding documentation and examples
  - use this when you need current documentation for DaisyUI, Tailwind CSS, Jotai, Dexie, etc.
  - start by searching for the library or framework name
- **next-devtools** : Helps with Next.js App Router and Edge Runtime questions

## Project-Specific Patterns

### Component Structure

- **Always use functional components with React 19** - no class components
- **Add JSDoc or inline comments** explaining business logic
- **Use `memo()` for performance** - see `Messages.tsx`, `ChatBubble.tsx`
- **Display names required**: Set `ComponentName.displayName = 'ComponentName'` for debugging

### Message Format Migration (Critical - In Progress!)

**CURRENT STATE**: Hybrid v4/v5 with conversion utilities for backward compatibility:

```typescript
// Loading from DB (v4) → App (v5)
import { convertV4MessageToV5 } from "@/app/utils/conversion";
const v5Message = convertV4MessageToV5(dbMessage, index);

// Saving to DB: App (v5) → DB (v4)
import { convertV5MessageToV4 } from "@/app/utils/conversion";
const v4Message = convertV5MessageToV4(uiMessage);
```

**MIGRATION TARGET**: Remove conversion layer entirely:

- Migrate IndexedDB schema to store v5 `parts` array natively
- Remove `app/utils/conversion.ts` and `ai-legacy` dependency
- Update all message handling to use pure v5 format (`UIMessage` with `parts`)
- Provide migration path for existing user data in IndexedDB

### State Management with Jotai

Global atoms defined in `app/page.tsx`:

- `parametersAtom` - model, temperature, top_p, penalties (synced to localStorage)
- `systemMessageAtom` - system prompt for chat session
- `tokensAtom` - live token counts for input/system message
- `themeAtom` / `editorThemeAtom` - UI theming (daisyUI themes)

```typescript
import { useAtom, useAtomValue } from "jotai";
import { parametersAtom } from "@/app/page";

// Read-only
const params = useAtomValue(parametersAtom);

// Read/write
const [params, setParams] = useAtom(parametersAtom);
```

### Azure OpenAI Model Configuration

Models defined in `app/utils/models.ts` with token limits. Environment variables map model names to Azure deployment names:

```typescript
// .env.local
AZURE_OPENAI_GPT5_DEPLOYMENT="your-azure-deployment-name"

// route.ts selects deployment based on model parameter
const llm = model === 'gpt-5' ? AZURE_OPENAI_GPT5_DEPLOYMENT : /* fallback */;
```

Add new models: Update `models` array in `models.ts` + add env var + extend conditional in `route.ts`.

### Streaming Chat Pattern

API route uses `streamText()` from AI SDK with `smoothStream()` transform:

```typescript
const response = streamText({
  model: azureModel,
  messages: convertToModelMessages(uiMessages),
  experimental_transform: smoothStream(), // Gradual token release
});

return response.toUIMessageStreamResponse({
  messageMetadata: ({ part }) => {
    if (part.type === "finish") {
      return { totalUsage: part.totalUsage }; // Attach usage stats
    }
  },
});
```

Frontend `useChat` auto-updates when messages stream in.

## Developer Workflows

### Local Development

```bash
npm install
cp .env.local.example .env.local  # Fill in Azure OpenAI credentials
npm run dev        # Webpack mode on port 3001
npm run dev:turbo  # Turbopack mode (faster, experimental)
```

**DevContainer**: Fully configured in `.devcontainer/` - dependencies auto-install on container creation.

### Environment Variables (Required)

- `AZURE_OPENAI_BASE_PATH` - Azure OpenAI endpoint URL
- `AZURE_OPENAI_API_KEY` - Service API key
- `AZURE_OPENAI_API_VERSION` - API version (e.g., "preview")
- `AZURE_OPENAI_<MODEL>_DEPLOYMENT` - Deployment name for each model (see `.env.local.example`)

### Build & Deploy

- **Build**: `npm run build` (Next.js outputs to `.next/`)
- **Lint**: `npm run lint` (ESLint), `npm run biome` (Biome linter)
- **CI/CD**: GitHub Actions workflow `.github/workflows/build-and-deploy.yml` builds and deploys to Azure App Service on push to `main`

### Versioning

- Uses **Conventional Changelog**: `npm run changelog` auto-generates `CHANGELOG.md` from git commits
- Commit format: `feat:`, `fix:`, `chore:`, etc. (Conventional Commits spec)

## Key Integration Points

### LangChain Route (Experimental)

`app/api/langchain/route.ts` is an **example implementation** showing LangChain.js integration. Not currently used in production but maintained for reference. Do not remove without explicit instruction.

### Azure OpenAI Web Search

Commented-out code in `app/api/chat/route.ts` for web search functionality exists but **is not currently supported** by AI SDK for Azure OpenAI. Feature is on hold pending upstream SDK support.

### IndexedDB (Dexie)

Schema in `app/database/database.config.ts`:

- **Version 4 (current)**: `messages` table with `id`, `role`, `content`, `createdAt`, `model`, `parts`
- Schema migrations handle upgrades (e.g., v2 added `model` column, v4 added `parts`)

### Token Counting

`app/utils/tokens.ts` uses `gpt-tokenizer` library. Token counts update reactively in `useEffect` when input/system message changes.

### Markdown Rendering

Chat responses render markdown with `react-markdown` + plugins:

- `remark-gfm` - GitHub Flavored Markdown (tables, strikethrough)
- `remark-math` / `rehype-katex` - LaTeX math rendering
- `react-syntax-highlighter` - Code block syntax highlighting

### Theme System

Built on **daisyUI** themes (Tailwind CSS). Available themes defined in `app/utils/themes.ts`. Toggle via `ThemeChanger.tsx` component, persisted to localStorage via `themeAtom`.

## Common Gotchas

1. **TypeScript Build Errors Ignored**: `next.config.mjs` sets `ignoreBuildErrors: true` - fix types proactively, don't rely on this
2. **Edge Runtime Limits**: API route can't use Node.js APIs (fs, path, etc.) - only Web APIs
3. **Message Model Tracking**: `messageModelsRef` in `app/page.tsx` stores model-per-message because it's not automatically persisted
4. **Storage Events**: Multi-tab sync via `storage` event listener in `useEffect` - changes in one tab update others
5. **Turbopack vs Webpack**: Default dev uses `--webpack` flag for stability. Remove for Turbopack (faster but experimental)
6. **AI SDK Migration**: When modifying message handling, consider the v5 migration plan - avoid deepening v4 dependencies, prefer patterns that align with pure v5 format
