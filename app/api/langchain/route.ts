import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { Message as ChatMessage, StreamingTextResponse } from 'ai';
import { HttpResponseOutputParser } from 'langchain/output_parsers';

// destructure env vars we need
const {
  AZURE_OPENAI_BASE_PATH,
  AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_MODEL_DEPLOYMENT,
  AZURE_OPENAI_GPT35_DEPLOYMENT,
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
  model: 'gpt-4', // currently gpt-4 or gpt-35-turbo
  user: 'Cloud Team GPT Chat User',
};

const formatMessage = (message: ChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const chatTemplate = (systemMessage) => `${systemMessage}

Current conversation:
{chat_history}

User: {input}
AI:`;

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

  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
  const currentMessageContent = messages[messages.length - 1].content;

  const prompt = PromptTemplate.fromTemplate(chatTemplate(systemMessage));

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
      : AZURE_OPENAI_MODEL_DEPLOYMENT;

  const chatModel = new ChatOpenAI({
    azureOpenAIApiKey: AZURE_OPENAI_API_KEY,
    azureOpenAIBasePath: `${AZURE_OPENAI_BASE_PATH}openai/deployments/`,
    azureOpenAIApiVersion: AZURE_OPENAI_API_VERSION,
    azureOpenAIApiDeploymentName: chatModelDeployment,
    ...chatConfig,
  });

  const outputParser = new HttpResponseOutputParser();

  const chain = prompt.pipe(chatModel).pipe(outputParser);

  const stream = await chain.stream({
    chat_history: formattedPreviousMessages.join('\n'),
    input: currentMessageContent,
  });

  return new StreamingTextResponse(stream);
}
