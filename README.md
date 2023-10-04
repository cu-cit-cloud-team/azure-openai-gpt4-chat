# ct-azure-openai-gpt4-chat

ChatGPT-like streaming chat bot powered by Azure OpenAI and GPT-4

NOTE: project and documentation in progress

## About

This is a simple chat app that streams messages to and from an Azure OpenAI Services instance using a GPT-4 model deployment

### Prerequisites

- Node.js >= 20.x (with npm >= v9.x)
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

#### Roadmap

- [ ] Copy individual responses to clipboard
- [ ] Hosted via Azure App Service
  - [ ] Locked down via AD to just our team
- [ ] Dockerfile for local development
- [ ] Export current chat to JSON
- [ ] Import chat session from JSON
- [ ] Multiple chat sessions
  - [ ] Sidebar with scrollable and filterable list of chat sessions
  - [ ] Stateful via local storage
  - [ ] Delete individual chat sessions
  - [ ] Export individual chat sessions to JSON
  - [ ] Import chat sessions from JSON
- [ ] Relative time for timestamps in chat messages
- [ ] Help popup with basic info and keyboard shortcuts
  - [ ] `?` keyboard shortcut to open help popup
- [ ] Responsive design
- [ ] Settings (stateful via local storage)
  - [ ] Change UI Theme (dark/light)
  - [ ] Change Azure OpenAI model (GPT-4, GPT-3.5, etc)
  - [ ] Change additional parameters
    - [ ] temperature
    - [ ] max tokens
    - [ ] top p
    - [ ] frequency penalty
    - [ ] presence penalty

### Uses

- [Next.js](https://nextjs.org/docs)
- [OpenAI](https://platform.openai.com/docs/api-reference)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [daisyUI](https://daisyui.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
