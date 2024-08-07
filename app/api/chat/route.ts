import { AzureKeyCredential, OpenAIClient } from '@azure/openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// destructure env vars we need
const {
  AZURE_OPENAI_BASE_PATH,
  AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_MODEL_DEPLOYMENT,
  AZURE_OPENAI_GPT4_DEPLOYMENT,
  AZURE_OPENAI_GPT4O_DEPLOYMENT,
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
  throw new Error('Required variables are not defined in the environment.');
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
  model: 'gpt-4-turbo', // currently gpt-4-turbo, gpt-4, or gpt-35-turbo for aoai
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

  // helper function to check if system prompt is already in messages
  const hasSystemPrompt = messages.some((message) => message.role === 'system');

  // add system prompt to messages if not already there
  if (!hasSystemPrompt) {
    chatMessages = [systemPrompt, ...messages];
  }

  const openai = new OpenAIClient(
    AZURE_OPENAI_BASE_PATH,
    new AzureKeyCredential(AZURE_OPENAI_API_KEY),
    {
      apiVersion: AZURE_OPENAI_API_VERSION,
    }
  );

  const response = await openai.streamChatCompletions(
    model === 'gpt-35-turbo' && AZURE_OPENAI_GPT35_DEPLOYMENT
      ? AZURE_OPENAI_GPT35_DEPLOYMENT
      : model === 'gpt-4' && AZURE_OPENAI_GPT4_DEPLOYMENT
        ? AZURE_OPENAI_GPT4_DEPLOYMENT
        : model === 'gpt-4o' && AZURE_OPENAI_GPT4O_DEPLOYMENT
          ? AZURE_OPENAI_GPT4O_DEPLOYMENT
          : AZURE_OPENAI_MODEL_DEPLOYMENT,
    chatMessages,
    {
      frequencyPenalty: frequency_penalty,
      maxTokens: max_tokens,
      presencePenalty: presence_penalty,
      temperature,
      topP: top_p,
      user,
    }
  );

  // convert the response into a friendly text-stream
  const stream = OpenAIStream(response);

  // send the stream back to the client
  return new StreamingTextResponse(stream);
}
