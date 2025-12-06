# azure-openai-gpt4-chat

[![Build & Deploy](https://github.com/cu-cit-cloud-team/azure-openai-gpt4-chat/actions/workflows/build-and-deploy.yml/badge.svg)](https://github.com/cu-cit-cloud-team/azure-openai-gpt4-chat/actions/workflows/build-and-deploy.yml)

ChatGPT-like streaming chat interface powered by Azure OpenAI with support for GPT-4.1, GPT-5, GPT-5.1, and o-series models

## About

A modern Next.js 16 chat application featuring real-time streaming responses from Azure OpenAI Services. Built with the latest web technologies including React 19, AI SDK v5, and Edge Runtime for optimal performance.

### Privacy-Focused Design

All data stays in your browser - chat history, uploaded files, preferences, and settings are stored locally via IndexedDB and localStorage. The app connects directly to your own Azure OpenAI endpoint with no third-party data sharing.

### Key Features

- 💬 Real-time streaming chat with multiple GPT models (GPT-4.1, GPT-5, GPT-5.1, o3, o4)
- 📎 File upload support (images, PDFs, text files)
- 🔒 Privacy-first: all data stored client-side in your browser
- 🎨 Light and dark themes
- 💾 Persistent chat history via IndexedDB
- 🔢 Live token counting with model-aware limits
- 📱 Responsive design

### Prerequisites

- Node.js >= 24.x (npm >= 11.x recommended)
- Azure Subscription with:
  - Azure OpenAI Service access
  - Deployed model(s) (GPT-4.1, GPT-5, GPT-5.1, or o-series)
  - API key and endpoint

## Getting Started

1. **Clone and install**

   ```bash
   git clone https://github.com/cu-cit-cloud-team/azure-openai-gpt4-chat.git
   cd azure-openai-gpt4-chat
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Azure OpenAI credentials
   ```

3. **Run development server**

   ```bash
   npm run dev
   # Visit http://localhost:3001
   ```

**Using DevContainer:** Open in VS Code with Dev Containers extension - dependencies install automatically.

## Configuration

Required environment variables (see `.env.local.example`):

- `AZURE_OPENAI_BASE_PATH` - Your Azure OpenAI endpoint
- `AZURE_OPENAI_API_KEY` - API key for authentication
- `AZURE_OPENAI_API_VERSION` - API version (e.g., "preview")
- `AZURE_OPENAI_<MODEL>_DEPLOYMENT` - Deployment name for each model you want to use

Supported models: GPT-4.1, GPT-5, GPT-5.1, o3, o3-mini, o4-mini (and their variants)

## Features

### Chat Interface

- Real-time streaming responses with smooth token delivery
- Multi-line input with auto-resize textarea
- Markdown rendering with syntax highlighting for code blocks
- LaTeX math equation support
- Copy messages and code snippets to clipboard

### File Support

- Attach images, PDFs, and text-based files
  - PNG (.png)
  - JPG (.jpg, .jpeg)
  - WEBP (.webp)
  - PDF (.pdf)
  - Text (.txt, .csv, .tsv)
  - Markdown (.md)
  - HTML (.html, .htm)
  - Yaml (.yaml, .yml)
  - XML (.xml)
  - JSON (.json, .jsonc)
  - TypeScript (.ts, .tsx)
  - JavaScript (.js, .jsx)
  - CSS (.css)
  - Sass (.sass, .scss)
  - Shell (.sh)
  - Golang (.go)
  - Java (.java)
  - PHP (.php)
  - Ruby (.rb)
  - Python (.py)
- Up to 3 files per message (25MB each)
- Inline preview and modal display for images, PDFs, and text files

### Customization

- Light/dark theme toggle
- Custom system prompts
- Model selection with automatic token limit adjustment
- Adjustable model parameters (temperature, top_p, penalties) for models that support them

### Message Management

- Delete individual messages
- Regenerate last response
- Stop ongoing responses
- Export chat history to JSON
- Clear all messages

### Privacy & Data

- All chat history stored locally in your browser (IndexedDB)
- File attachments stored client-side only (IndexedDB)
- User preferences persisted in localStorage
- Direct connection to your Azure OpenAI endpoint
- No third-party data sharing or external logging

## Development

```bash
npm run dev          # Start dev server (webpack)
npm run dev:turbo    # Start dev server (turbopack - experimental)
npm run build        # Production build
npm run lint         # Run ESLint
npm run biome        # Run Biome linter
```

The project uses:

- **React Compiler** is enabled for automatic optimizations (no manual memoization needed except at component boundaries)
- **Conventional Commits** for changelog generation
- **GitHub Actions** for CI/CD to Azure App Service

## Built With

### Frontend

- [Next.js 16](https://nextjs.org/) - React framework with App Router
- [React 19](https://react.dev/) - UI library with React Compiler
- [Vercel AI SDK v5](https://sdk.vercel.ai/) - AI streaming primitives
- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Component library built on Radix UI
- [AI Elements](https://ui.shadcn.com/docs/components/ai-elements) - Chat UI primitives (Conversation, Message, PromptInput)

### State & Data

- [Jotai](https://jotai.org/) - Atomic state management
- [Dexie](https://dexie.org/) - IndexedDB wrapper for chat persistence

### Markdown & Syntax

- [Streamdown](https://github.com/vercel-labs/streamdown) - Markdown and code rendering with syntax highlighting

### Backend & Hosting

- [Azure OpenAI Service](https://azure.microsoft.com/en-us/products/ai-services/openai-service) - Model deployments
- [Azure App Service](https://azure.microsoft.com/en-us/products/app-service/) - Hosting & authentication
