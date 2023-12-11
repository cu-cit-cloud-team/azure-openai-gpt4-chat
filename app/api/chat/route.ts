import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

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
  systemMessage: 'You are a helpful AI assistant. Answer in markdown format.',
  temperature: 1, // 0.0 to 2.0
  top_p: 1, // 0.0 to 1.0
  frequency_penalty: 0, // -2.0 to 2.0
  presence_penalty: 0, // -2.0 to 2.0
  max_tokens: 1024,
  model: 'gpt-4', // currently gpt-4 or gpt-35-turbo
  user: 'Cloud Team GPT Chat User',
};

// main route handler
export async function POST(req: Request) {
  // extract chat messages from the body of the request
  const { messages } = await req.json();

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

  // set up system prompt
  const systemPrompt = {
    content: systemMessage,
    role: 'system',
  };

  // put messages into temp variable
  let chatMessages = [...messages];

  interface Message {
    content: string;
    role: string;
  }

  // helper function to check if system prompt is already in messages
  const hasSystemPrompt = messages.some(
    (message: Message) => message.role === 'system'
  );
  // add system prompt to messages if not already there
  if (!hasSystemPrompt) {
    chatMessages = [systemPrompt, ...messages];
  }

  // set up chat config
  const chatConfig: OpenAI.Chat.ChatCompletionCreateParams = {
    temperature,
    top_p,
    presence_penalty,
    frequency_penalty,
    max_tokens,
    model,
    messages: chatMessages,
    stream: true,
    user,
  };

  const chatModelDeployment =
    model === 'gpt-35-turbo' && AZURE_OPENAI_GPT35_DEPLOYMENT
      ? AZURE_OPENAI_GPT35_DEPLOYMENT
      : AZURE_OPENAI_MODEL_DEPLOYMENT;

  // instantiate the OpenAI client
  const openai = new OpenAI({
    apiKey: AZURE_OPENAI_API_KEY,
    baseURL: `${AZURE_OPENAI_BASE_PATH}openai/deployments/${chatModelDeployment}`,
    defaultQuery: { 'api-version': AZURE_OPENAI_API_VERSION },
    defaultHeaders: { 'api-key': AZURE_OPENAI_API_KEY },
  });

  // fetch a streaming chat completion using the given system prompt and messages
  const response = await openai.chat.completions.create({
    ...chatConfig,
  });

  // convert the response into a friendly text-stream
  const stream = OpenAIStream(response);

  // send the stream back to the client
  return new StreamingTextResponse(stream);
}
