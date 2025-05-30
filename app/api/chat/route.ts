import { createAzure } from '@ai-sdk/azure';
import { smoothStream, streamText } from 'ai';

// destructure env vars we need
const {
  AZURE_OPENAI_DEPLOYMENT_NAME,
  AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_API_VERSION,
  AZURE_OPENAI_GPT4O_DEPLOYMENT,
  AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT,
  AZURE_OPENAI_GPT41_DEPLOYMENT,
  AZURE_OPENAI_GPT41_MINI_DEPLOYMENT,
  AZURE_OPENAI_GPT41_NANO_DEPLOYMENT,
} = process.env;

// make sure env vars are set
// if (
//   !AZURE_OPENAI_API_KEY ||
//   !AZURE_OPENAI_DEPLOYMENT_NAME ||
//   !AZURE_OPENAI_GPT4O_DEPLOYMENT
// ) {
//   throw new Error('Required variables are not defined in the environment.');
// }

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
  model: 'gpt-4o', // currently gpt-4o, gpt-4-turbo, gpt-4, or gpt-35-turbo for aoai
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

  const useWebSearch = false; // model.includes('gpt-4o') && model.includes('web-search');
  const useResponsesApi = model.includes('gpt-4o') || model === 'gpt-41';

  // create azure client
  const azure = createAzure({
    resourceName: AZURE_OPENAI_DEPLOYMENT_NAME,
    apiKey: AZURE_OPENAI_API_KEY,
    apiVersion: AZURE_OPENAI_API_VERSION,
  });

  // instantiate azure openai model
  const azureModel =
    useWebSearch || useResponsesApi
      ? azure.responses(
          model === 'gpt-4o' && AZURE_OPENAI_GPT4O_DEPLOYMENT
            ? AZURE_OPENAI_GPT4O_DEPLOYMENT
            : model === 'gpt-4o-mini' && AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT
              ? AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT
              : model === 'gpt-41' && AZURE_OPENAI_GPT41_DEPLOYMENT
                ? AZURE_OPENAI_GPT41_DEPLOYMENT
                : AZURE_OPENAI_GPT4O_DEPLOYMENT,
          {
            user,
          }
        )
      : azure(
          model === 'gpt-41-mini' && AZURE_OPENAI_GPT41_MINI_DEPLOYMENT
            ? AZURE_OPENAI_GPT41_MINI_DEPLOYMENT
            : model === 'gpt-41-nano' && AZURE_OPENAI_GPT41_NANO_DEPLOYMENT
              ? AZURE_OPENAI_GPT41_NANO_DEPLOYMENT
              : AZURE_OPENAI_GPT41_MINI_DEPLOYMENT,
          {
            user,
          }
        );

  // send the request and store the response
  const response = useWebSearch
    ? streamText({
        model: azureModel,
        messages: chatMessages,
        temperature,
        topP: top_p,
        frequencyPenalty: frequency_penalty,
        presencePenalty: presence_penalty,
        maxTokens: max_tokens,
        toolCallStreaming: true,
        tools: {
          web_search_preview: azure.tools.webSearchPreview({
            searchContextSize: 'high',
          }),
        },
        toolChoice: { type: 'tool', toolName: 'web_search_preview' },
        experimental_transform: smoothStream(),
      })
    : streamText({
        model: azureModel,
        messages: chatMessages,
        temperature,
        topP: top_p,
        frequencyPenalty: frequency_penalty,
        presencePenalty: presence_penalty,
        maxTokens: max_tokens,
        experimental_transform: smoothStream(),
      });

  // convert the response into a friendly text-stream and return to client
  return response.toDataStreamResponse();
}
