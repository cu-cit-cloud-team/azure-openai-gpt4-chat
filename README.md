# ct-aoai-gpt-chat-demo

[![Build & Deploy](https://github.com/CU-CommunityApps/ct-aoai-gpt-chat-demo/actions/workflows/build-and-deploy.yml/badge.svg)](https://github.com/CU-CommunityApps/ct-aoai-gpt-chat-demo/actions/workflows/build-and-deploy.yml)

ChatGPT-like streaming chat bot powered by Azure OpenAI and GPT-4

NOTE: project and documentation in progress

## About

This is a simple chat app that streams messages to and from an Azure OpenAI Services instance using a GPT-4 model deployment

### Prerequisites

- Node.js >= 20.x (with npm >= v10.x)
- Azure Subscription
  - Azure OpenAI access enabled
  - Azure OpenAI Services deployed along with a GPT-4 model
    - API key for deployed service

### Running Locally

1. Clone repo `git clone https://github.com/CU-CommunityApps/ct-aoai-gpt-chat-demo.git`
1. Enter directory `cd ct-aoai-gpt-chat-demo`
1. Copy `.env.local.example` to `.env.local` and fill in values
1. If using locally installed Node.js:
    1. Install dependencies `npm install`
    1. Run project locally `npm run dev`
1. If using Docker:
    1. Run `docker-compose up dev`
1. Visit `http://localhost:3000` in your browser
1. `ctrl`+`c` to stop
    1. If using Docker, optionally run `docker-compose down --rmi 'all'` to clean up

### Features

- [x] Chat with an Azure OpenAI GPT-4 model
- [x] Chat responses stream in real-time for a ChatGPT-like experience
- [x] Uses `textarea` for input for multi-line support
  - [x] Focus `textarea` on page load
  - [x] `textarea` auto-resizes as you type
  - [x] `enter` key to submit message
  - [x] `shift`+`enter` for new line
- [x] Loading indicator next to chat response until it's finished
- [x] Formats code blocks and other markdown inside of chat messages nicely
- [x] Current chat history is stored in browser's local storage
- [x] View/edit system message for chat session (e.g. "You are a helpful AI assistant")
- [x] View/edit chat session parameters (e.g. temperature, top p, etc)
- [x] Live token count (used/remaining) displayed for message and system message
- [x] Change Azure OpenAI model (GPT-4, GPT-3.5, etc)
- [x] Download current chat history as JSON
- [x] Clear current chat history
  - [x] Keyboard shortcut (`cmd`+`esc`) when `textarea` has focus
- [x] Copy full messages and responses to clipboard
  - [x] Copy individual code snippets (within responses) to clipboard
- [x] Delete individual messages and responses from chat history
- [x] Stop response that's currently streaming in (useful for long responses that aren't necessary)
- [x] Regenerate last response
- [x] Hosted via Azure App Service
  - [x] Built/deployed with GitHub Actions
  - [x] Azure App Service App locked down via AD to just our team
  - [x] Tries to identify user from login session and personalize chat session
- [x] Uses relative time for chat message timestamps
  - [x] Relative time has tooltip with full timestamp
  - [x] Tooltip shows time for same day and full date/time if older than "today"
- [x] Theme changer with several light and dark themes
  - [x] Defaults to `light` or `dark` based on system preference
- [x] Responsive layout
- [x] Dockerfile and docker-compose for local development

### Roadmap

#### Planned

- no new features currently under development

#### Potential

- [ ] Import chat session from JSON
- [ ] Multiple chat sessions
  - [ ] Sidebar with scrollable and filterable list of chat sessions
  - [ ] Stateful via local storage
  - [ ] Delete individual chat sessions
  - [ ] Export individual chat sessions to JSON
  - [ ] Import chat sessions from JSON

### Uses

- [React](https://react.dev/)
  - JavaScript framework
- [Next.js](https://nextjs.org/docs)
  - React framework
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
  - JS Library for AI-powered UIs
- [LangChain.js](https://github.com/langchain-ai/langchainjs)
  - JS Library for interacting with LLMs (e.g. GPT-4)
- [Tailwind CSS](https://tailwindcss.com/)
  - CSS framework
- [daisyUI](https://daisyui.com/)
  - Component library for Tailwind CSS
- [Azure OpenAI Service](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
  - API and model deployments (GPT-4 and GPT-3.5)
- [Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/)
  - Application hosting and user authentication
- [GitHub Actions/Workflows](https://docs.github.com/en/actions)
  - Build/publish to Azure App Service
  - Build notifications
  - Create GH Release
  - Dependency updates
