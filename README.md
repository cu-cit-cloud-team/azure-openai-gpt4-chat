# ct-gpt-chat-app

ChatGPT-like streaming chat bot powered by Azure OpenAI and GPT-4

NOTE: project and documentation in progress

## About

This is a simple chat app that streams messages to and from an Azure OpenAI Services instance using a GPT-4 model deployment.

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
- [x] Formats code blocks and other markdown inside chat messages

### Roadmap

- [ ] Hosted via Azure App Services
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
- [ ] Responsive design

## Uses

- [Next.js](https://nextjs.org/docs)
- [OpenAI](https://platform.openai.com/docs/api-reference)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [daisyUI](https://daisyui.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
