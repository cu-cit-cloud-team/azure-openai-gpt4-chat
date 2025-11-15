import { createAzure } from '@ai-sdk/azure';
import {
  convertToModelMessages,
  generateId,
  type LanguageModelUsage,
  smoothStream,
  streamText,
  type UIMessage,
} from 'ai';

// Custom message type with usage metadata
type MyMetadata = {
  totalUsage?: LanguageModelUsage;
};

export type MyUIMessage = UIMessage<unknown, MyMetadata>;

// destructure env vars we need
const {
  AZURE_OPENAI_DEPLOYMENT_NAME,
  AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_API_VERSION,
  AZURE_OPENAI_GPT41_DEPLOYMENT,
  AZURE_OPENAI_GPT41_MINI_DEPLOYMENT,
  AZURE_OPENAI_GPT41_NANO_DEPLOYMENT,
  AZURE_OPENAI_GPT5_DEPLOYMENT,
  AZURE_OPENAI_GPT5_CHAT_DEPLOYMENT,
  AZURE_OPENAI_GPT5_CODEX_DEPLOYMENT,
  AZURE_OPENAI_GPT5_MINI_DEPLOYMENT,
  AZURE_OPENAI_GPT5_NANO_DEPLOYMENT,
  AZURE_OPENAI_GPT51_DEPLOYMENT,
  AZURE_OPENAI_GPT51_CHAT_DEPLOYMENT,
  AZURE_OPENAI_GPT51_CODEX_DEPLOYMENT,
  AZURE_OPENAI_GPT51_CODEX_MINI_DEPLOYMENT,
  AZURE_OPENAI_O3_DEPLOYMENT,
  AZURE_OPENAI_O3_MINI_DEPLOYMENT,
  AZURE_OPENAI_O4_MINI_DEPLOYMENT,
} = process.env;

// tell next.js to use the edge runtime
export const runtime = 'edge';

// set up defaults for chat config
const defaults = {
  systemMessage: 'You are a helpful AI assistant.',
  temperature: 1, // 0.0 to 2.0
  top_p: 1, // 0.0 to 1.0
  frequency_penalty: 0, // -2.0 to 2.0
  presence_penalty: 0, // -2.0 to 2.0
  max_tokens: 4096,
  model: 'gpt-41', // currently gpt-4o, gpt-4-turbo, gpt-4, or gpt-35-turbo for aoai
  user: 'Cloud Team Chat User',
};

// main route handler
export async function POST(req: Request) {
  // New v5 body contract: messages (UIMessage[]), systemMessage, parameters
  const {
    messages,
    systemMessage: systemMessageRaw,
    parameters: parameterOverrides,
  } = await req.json();

  const systemMessage = systemMessageRaw || defaults.systemMessage;
  const temperature = parameterOverrides?.temperature
    ? Number(parameterOverrides.temperature)
    : defaults.temperature;
  const top_p = parameterOverrides?.top_p
    ? Number(parameterOverrides.top_p)
    : defaults.top_p;
  const frequency_penalty = parameterOverrides?.frequency_penalty
    ? Number(parameterOverrides.frequency_penalty)
    : defaults.frequency_penalty;
  const presence_penalty = parameterOverrides?.presence_penalty
    ? Number(parameterOverrides.presence_penalty)
    : defaults.presence_penalty;
  const model = parameterOverrides?.model || defaults.model;
  const user = defaults.user; // could be enhanced with auth context
  const max_tokens = model === 'gpt-35-turbo' ? 2048 : defaults.max_tokens;

  // v5 UIMessage system prompt part
  const systemPrompt = {
    id: `system-${generateId()}`,
    role: 'system',
    parts: [
      {
        type: 'text',
        text: systemMessage,
      },
    ],
  };

  // ensure system prompt included once
  const hasSystemPrompt = messages.some((m) => m.role === 'system');
  const uiMessages = hasSystemPrompt ? messages : [systemPrompt, ...messages];

  const useWebSearch = false; // model.includes('gpt-4o') && model.includes('web-search');
  const useResponsesApi =
    model.includes('gpt-4o') ||
    model === 'gpt-41' ||
    model.includes('gpt-5') ||
    model.startsWith('o');

  // create azure client
  const azure = createAzure({
    resourceName: AZURE_OPENAI_DEPLOYMENT_NAME,
    apiKey: AZURE_OPENAI_API_KEY,
    apiVersion: AZURE_OPENAI_API_VERSION,
  });

  // Map model names to their deployment environment variables
  const modelDeploymentMap: Record<string, string | undefined> = {
    'gpt-41-mini': AZURE_OPENAI_GPT41_MINI_DEPLOYMENT,
    'gpt-41': AZURE_OPENAI_GPT41_DEPLOYMENT,
    'gpt-41-nano': AZURE_OPENAI_GPT41_NANO_DEPLOYMENT,
    'gpt-5': AZURE_OPENAI_GPT5_DEPLOYMENT,
    'gpt-5-mini': AZURE_OPENAI_GPT5_MINI_DEPLOYMENT,
    'gpt-5-nano': AZURE_OPENAI_GPT5_NANO_DEPLOYMENT,
    'gpt-5-chat': AZURE_OPENAI_GPT5_CHAT_DEPLOYMENT,
    'gpt-5-codex': AZURE_OPENAI_GPT5_CODEX_DEPLOYMENT,
    'gpt-5.1': AZURE_OPENAI_GPT51_DEPLOYMENT,
    'gpt-5.1-chat': AZURE_OPENAI_GPT51_CHAT_DEPLOYMENT,
    'gpt-5.1-codex': AZURE_OPENAI_GPT51_CODEX_DEPLOYMENT,
    'gpt-5.1-codex-mini': AZURE_OPENAI_GPT51_CODEX_MINI_DEPLOYMENT,
    'o3': AZURE_OPENAI_O3_DEPLOYMENT,
    'o3-mini': AZURE_OPENAI_O3_MINI_DEPLOYMENT,
    'o4-mini': AZURE_OPENAI_O4_MINI_DEPLOYMENT,
  };

  const llm = modelDeploymentMap[model] || AZURE_OPENAI_GPT5_DEPLOYMENT;

  // instantiate azure openai model
  const azureModel =
    useWebSearch || useResponsesApi
      ? azure.responses(llm, {
          user,
        })
      : azure(llm, {
          user,
        });

  // set up streaming options
  const streamTextOptions = useWebSearch
    ? {
        model: azureModel,
        messages: convertToModelMessages(uiMessages),
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
      }
    : {
        model: azureModel,
        messages: convertToModelMessages(uiMessages),
        temperature,
        topP: top_p,
        frequencyPenalty: frequency_penalty,
        presencePenalty: presence_penalty,
        maxTokens: max_tokens,
        experimental_transform: smoothStream(),
      };

  if (!model.startsWith('gpt-4')) {
    delete streamTextOptions.frequencyPenalty;
    delete streamTextOptions.presencePenalty;
    delete streamTextOptions.temperature;
    delete streamTextOptions.topP;
  }

  // send the request and store the response
  const response = streamText(streamTextOptions);

  // v5 streaming response with usage metadata
  return response.toUIMessageStreamResponse({
    originalMessages: uiMessages,
    generateMessageId: () => generateId(),
    messageMetadata: ({ part }) => {
      // Attach usage information when generation finishes
      if (part.type === 'finish') {
        return { totalUsage: part.totalUsage };
      }
    },
    onError: (_error) => {
      // sanitize error forwarded to client
      return {
        message: 'An error occurred processing your request.',
        errorCode: 'STREAM_ERROR',
      };
    },
  });
}
