# Azure OpenAI GPT-4 Chat - AI Agent Instructions

## Architecture

Next.js 16 App Router with Azure OpenAI streaming chat. Tech stack: AI SDK v5, React 19 + React Compiler, Jotai state, Dexie (IndexedDB), DaisyUI/Tailwind.

### Key Design Decisions

- **AI SDK v5 (Pure)**: Messages use v5 `parts` array format. IndexedDB stores: `id`, `role`, `parts`, `createdAt`, `model`
- **Client-Side Storage**: All chat history in IndexedDB. `useMessagePersistence` hook prevents duplicate saves via `savedMessageIdsRef`
- **Edge Runtime**: API route uses `smoothStream()` for gradual token release
- **State**: Jotai atoms in `app/page.tsx` sync to localStorage. `tokensAtom` is derived (don't update manually)
- **React Compiler**: Enabled - use `memo()` only at component boundaries
- **File Uploads**: 3 files max, 25MB each. Text files → text parts with `[File: name]` prefix. Images/PDFs → file parts with base64 url

## MCP Servers

Use the following MCP servers for current documentation and best practices:

- **context7**: Multi-library documentation server. Use for DaisyUI, Tailwind CSS, Jotai, Dexie, React, Next.js, etc.
  - Start by resolving library name to get the Context7-compatible library ID
  - Then fetch docs for specific topics or general usage
- **next-devtools**: Next.js and Edge Runtime assistance
- **ai-elements**: AI Elements documentation, code examples, and best practices

## Patterns

### Messages (AI SDK v5)

```typescript
type StoredMessage = UIMessage & { model: string; createdAt: string };

// Text part
{ type: "text", text: "Hello!" }

// File part (image/PDF)
{ type: "file", mediaType: "image/png", url: "data:...", name: "image.png" }

// Text file (stored as text with prefix)
{ type: "text", text: "[File: code.ts]\nconst x = 1;" }
```

**Helpers** (`app/utils/messageHelpers.ts`): `getMessageText()`, `getMessageFiles()`

### Models

Models in `app/utils/models.ts`. Add new ones:

1. Add to `models` array with token limits
2. Add env var to `.env.local.example`
3. Map in `route.ts` `modelDeploymentMap`

Current: GPT-4.1 (41, 41-mini, 41-nano), GPT-5 (5, 5-mini, 5-nano, 5-chat, 5-codex), GPT-5.1 (5.1, 5.1-chat, 5.1-codex, 5.1-codex-mini), o-series (o3, o3-mini, o4-mini)

### Streaming

```typescript
// API route pattern
const response = streamText({
  model: azureModel,
  messages: convertToModelMessages(uiMessages),
  experimental_transform: smoothStream(),
});

return response.toUIMessageStreamResponse({
  originalMessages: uiMessages,
  generateMessageId: () => generateId(),
  messageMetadata: ({ part }) =>
    part.type === "finish" ? { totalUsage: part.totalUsage } : undefined,
});
```

Frontend uses `useChat` with `DefaultChatTransport` for dynamic parameter injection.

## Key Integrations

### IndexedDB (Dexie)

- Schema v5: `messages` table with `&id, role, parts, createdAt, model`
- `useMessagePersistence` hook saves messages, tracks via `messageModelsRef`, prevents duplicates with `savedMessageIdsRef`

### Markdown & Themes

- `react-markdown` with `remark-gfm`, `remark-math`, `rehype-katex`, `react-syntax-highlighter`
- daisyUI themes in `app/utils/themes.ts`, persisted via `themeAtom`/`editorThemeAtom`

## Important Notes

- **Edge Runtime**: No Node.js APIs (fs, path) - Web APIs only
- **tokensAtom**: Auto-derived via useMemo - don't update manually
- **React Compiler**: Avoid manual optimizations - use `memo()` at component boundaries only
- **TypeScript errors**: Build ignores them (`next.config.mjs`) - fix proactively
