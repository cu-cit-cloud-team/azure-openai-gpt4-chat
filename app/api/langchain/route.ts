import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { AzureChatOpenAI } from '@langchain/openai';
import { LangChainAdapter } from 'ai';

// destructure env vars we need
const {
  AZURE_OPENAI_BASE_PATH,
  AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_MODEL_DEPLOYMENT,
  AZURE_OPENAI_GPT35_DEPLOYMENT,
  AZURE_OPENAI_GPT4_DEPLOYMENT,
  AZURE_OPENAI_GPT4O_DEPLOYMENT,
  AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT,
  AZURE_OPENAI_API_VERSION,
} = process.env;

// make sure env vars are set
if (
  !AZURE_OPENAI_API_KEY ||
  !AZURE_OPENAI_BASE_PATH ||
  !AZURE_OPENAI_MODEL_DEPLOYMENT ||
  !AZURE_OPENAI_API_VERSION
) {
  throw new Error('AZURE_OPENAI_API_KEY is missing from the environment.');
}

// tell next.js to use the edge runtime
export const runtime = 'edge';

// set up defaults for chat config
const defaults = {
  systemMessage: 'You are a helpful AI assistant.',
  temperature: 1, // 0.0 to 2.0
  top_p: 1, // 0.0 to 1.0
  frequency_penalty: 0, // -2.0 to 2.0
  presence_penalty: 0, // -2.0 to 2.0
  max_tokens: 1024,
  model: 'gpt-4o', // currently gpt-4o, gpt-4-turbo, gpt-4, or gpt-35-turbo
  user: 'Cloud Team GPT Chat User',
};

// main route handler
export async function POST(req: Request) {
  // extract chat messages from the body of the request
  const body = await req.json();
  const messages = body?.messages || [];

  // extract the query params
  const urlParams = new URL(req.url).searchParams;

  // set to defaults if not provided
  const systemMessage =
    urlParams.get('systemMessage') || defaults.systemMessage;
  const temperature =
    Number(urlParams.get('temperature')) === 0
      ? 0
      : Number(urlParams.get('temperature')) || defaults.temperature;
  const top_p =
    Number(urlParams.get('top_p')) === 0
      ? 0
      : Number(urlParams.get('top_p')) || defaults.top_p;
  const frequency_penalty =
    Number(urlParams.get('frequency_penalty')) === 0
      ? 0
      : Number(urlParams.get('frequency_penalty')) ||
        defaults.frequency_penalty;
  const presence_penalty =
    Number(urlParams.get('presence_penalty')) === 0
      ? 0
      : Number(urlParams.get('presence_penalty')) || defaults.presence_penalty;
  const model = urlParams.get('model') || defaults.model;
  const user = urlParams.get('user') || defaults.user;
  const max_tokens = model === 'gpt-35-turbo' ? 2048 : defaults.max_tokens;

  // set up chat config
  const chatConfig = {
    temperature,
    top_p,
    presence_penalty,
    frequency_penalty,
    max_tokens,
    model,
    stream: true,
    user,
  };

  const chatModelDeployment =
    model === 'gpt-35-turbo' && AZURE_OPENAI_GPT35_DEPLOYMENT
      ? AZURE_OPENAI_GPT35_DEPLOYMENT
      : model === 'gpt-4' && AZURE_OPENAI_GPT4_DEPLOYMENT
        ? AZURE_OPENAI_GPT4_DEPLOYMENT
        : model === 'gpt-4-turbo' && AZURE_OPENAI_MODEL_DEPLOYMENT
          ? AZURE_OPENAI_MODEL_DEPLOYMENT
          : model === 'gpt-4o' && AZURE_OPENAI_GPT4O_DEPLOYMENT
            ? AZURE_OPENAI_GPT4O_DEPLOYMENT
            : model === 'gpt-4o-mini' && AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT
              ? AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT
              : AZURE_OPENAI_GPT4O_DEPLOYMENT;

  const chatModel = new AzureChatOpenAI({
    azureOpenAIApiKey: AZURE_OPENAI_API_KEY,
    azureOpenAIBasePath: `${AZURE_OPENAI_BASE_PATH}openai/deployments/`,
    azureOpenAIApiVersion: AZURE_OPENAI_API_VERSION,
    azureOpenAIApiDeploymentName: chatModelDeployment,
    ...chatConfig,
  });

  // put messages into temp variable
  let chatMessages = [...messages];

  // helper function to check if system prompt is already in messages
  const hasSystemPrompt = messages.some((message) => message.role === 'system');

  if (!hasSystemPrompt) {
    // add system prompt to messages if not already there and not an o1 model
    chatMessages = [new SystemMessage(systemMessage)];
  }

  // add user and assistant messages to chatMessages array with LangChain helpers
  for (const message of messages) {
    if (message.role === 'user') {
      chatMessages.push(new HumanMessage(message.content));
    }
    if (message.role === 'assistant') {
      chatMessages.push(new AIMessage(message.content));
    }
  }

  // get the stream of messages
  const stream = await chatModel.stream(chatMessages);

  // return messages stream
  return LangChainAdapter.toDataStreamResponse(stream);
}
