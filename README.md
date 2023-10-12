# ct-azure-openai-gpt4-chat

[![Build & Deploy](https://github.com/CU-CommunityApps/ct-azure-openai-gpt4-chat/actions/workflows/build-and-deploy.yml/badge.svg)](https://github.com/CU-CommunityApps/ct-azure-openai-gpt4-chat/actions/workflows/build-and-deploy.yml)

ChatGPT-like streaming chat bot powered by Azure OpenAI and GPT-4

NOTE: project and documentation in progress

## About

This is a simple chat app that streams messages to and from an Azure OpenAI Services instance using a GPT-4 model deployment

### Prerequisites

- Node.js >= 18.x (with npm >= v8.x)
- Azure Subscription
  - Azure OpenAI access enabled
  - Azure OpenAI Services deployed along with a GPT-4 model
    - API key for deployed service

### Running Locally

1. Clone repo `git clone https://github.com/CU-CommunityApps/ct-azure-openai-gpt4-chat.git`
1. Enter directory `cd ct-azure-openai-gpt4-chat`
1. Copy `.env.local.example` to `.env.local` and fill in values
1. Install dependencies `npm install`
1. Run project locally `npm run dev`
1. Visit `http://localhost:3000` in your browser

### Features

- [x] Chat with an Azure OpenAI GPT-4 model
- [x] Chat responses stream in real-time for a ChatGPT-like experience
- [x] Uses `textarea` for input for multi-line support
  - [x] Keyboard shortcuts for sending messages (`cmd`+`enter`, `ctrl`+`enter`)
  - [x] Focus `textarea` on page load
- [x] Loading indicator under chat response until it's finished
- [x] Current chat history is stored in browser's local storage
- [x] Clear current chat history
  - [x] Keyboard shortcut (`cmd`+`esc`) when `textarea` has focus
- [x] Formats code blocks and other markdown inside of chat messages nicely
- [x] Hosted via Azure App Service
- [x] Azure App Service App locked down via AD to just our team
- [x] Built/deployed with GitHub Actions
- [x] Show date in chat messages timestamps older than "today"
- [x] Tries to identify user from login session and personalize chat session
- [x] View/edit system message for chat session (e.g. "You are a helpful AI assistant")
- [x] Toggle between dark/light mode (dark is default)
- [x] Responsive layout

### Roadmap

#### Planned

- [ ] View/edit chat session parameters (e.g. temperature, top p, etc)
- [ ] Copy individual responses to clipboard
- [ ] Dockerfile for local development
- [ ] Help popup with basic info and keyboard shortcuts
  - [ ] `?` keyboard shortcut to open help popup
- [ ] Responsive improvements
- [ ] Theme changer improvements

#### Potential

- [ ] Export current chat to JSON
- [ ] Import chat session from JSON
- [ ] Multiple chat sessions
  - [ ] Sidebar with scrollable and filterable list of chat sessions
  - [ ] Stateful via local storage
  - [ ] Delete individual chat sessions
  - [ ] Export individual chat sessions to JSON
  - [ ] Import chat sessions from JSON
- [ ] Change Azure OpenAI model (GPT-4, GPT-3.5, etc)

### Uses

- [React](https://react.dev/)
  - JavaScript framework
- [Next.js](https://nextjs.org/docs)
  - React framework
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
  - JS Library for AI-powered UIs
- [Tailwind CSS](https://tailwindcss.com/)
  - CSS framework
- [daisyUI](https://daisyui.com/)
  - Component library for Tailwind CSS
- [Azure OpenAI Service](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
  - GPT-4 model deployment and API
- [Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/)
  - Application hosting and user authentication
- [GitHub Actions/Workflows](https://docs.github.com/en/actions)
  - Build/publish to Azure App Service
  - Build notifications
  - Dependency updates
