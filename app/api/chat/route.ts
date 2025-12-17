import { createAnthropic } from '@ai-sdk/anthropic';
import { createAzure } from '@ai-sdk/azure';
import { createDeepSeek } from '@ai-sdk/deepseek';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  extractReasoningMiddleware,
  generateId,
  type LanguageModelUsage,
  smoothStream,
  streamText,
  type UIMessage,
  wrapLanguageModel,
} from 'ai';
import {
  DEFAULT_MAX_OUTPUT_TOKENS,
  DEFAULT_MODEL_NAME,
} from '@/app/utils/models';

// Helper to validate required environment variables
function validateEnvVars() {
  const required = {
    AZURE_OPENAI_DEPLOYMENT_NAME,
    AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_API_VERSION,
    AZURE_OPENAI_GPT_IMAGE_DEPLOYMENT,
    AZURE_OPENAI_GPT51_DEPLOYMENT,
    AZURE_ANTHROPIC_API_VERSION,
    AZURE_ANTHROPIC_BASE_PATH,
    AZURE_DEEPSEEK_BASE_PATH,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. Please check your .env.local file.`
    );
  }
}

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
  AZURE_OPENAI_GPT_IMAGE_DEPLOYMENT,
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
  AZURE_OPENAI_GPT51_CODEX_MAX_DEPLOYMENT,
  AZURE_OPENAI_GPT52_DEPLOYMENT,
  AZURE_OPENAI_GPT52_CHAT_DEPLOYMENT,
  AZURE_OPENAI_O3_DEPLOYMENT,
  AZURE_OPENAI_O3_MINI_DEPLOYMENT,
  AZURE_OPENAI_O4_MINI_DEPLOYMENT,
  AZURE_ANTHROPIC_API_VERSION,
  AZURE_ANTHROPIC_BASE_PATH,
  AZURE_ANTHROPIC_CLAUDE_SONNET_45_DEPLOYMENT,
  AZURE_ANTHROPIC_CLAUDE_OPUS_45_DEPLOYMENT,
  AZURE_ANTHROPIC_CLAUDE_HAIKU_45_DEPLOYMENT,
  AZURE_DEEPSEEK_BASE_PATH,
  AZURE_DEEPSEEK_V31_DEPLOYMENT,
  AZURE_DEEPSEEK_R1_0528_DEPLOYMENT,
} = process.env;

// tell next.js to use the edge runtime
export const runtime = 'nodejs';

// set up defaults for chat config
const defaults = {
  systemMessage: 'You are a helpful AI assistant.',
  max_tokens: DEFAULT_MAX_OUTPUT_TOKENS,
  model: DEFAULT_MODEL_NAME, // see utils/models.ts for available models
  user: 'Cloud Team Chat User',
};

// main route handler
export async function POST(req: Request) {
  try {
    // Validate environment variables first
    validateEnvVars();

    // New v5 body contract: messages (UIMessage[]), systemMessage, model
    const {
      messages,
      model: modelName,
      systemMessage: systemMessageRaw,
      webSearch,
    } = await req.json();

    const systemMessage = systemMessageRaw || defaults.systemMessage;
    const model = modelName || defaults.model;
    const max_tokens = defaults.max_tokens;

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
    const hasSystemPrompt = messages.some(
      (m: UIMessage) => m.role === 'system'
    );
    const uiMessages = hasSystemPrompt ? messages : [systemPrompt, ...messages];

    // determine if the model supports the images tool
    const useImageTool =
      model.startsWith('gpt-41') || model.startsWith('gpt-5');

    // create azure client
    const azure = createAzure({
      resourceName: AZURE_OPENAI_DEPLOYMENT_NAME,
      apiKey: AZURE_OPENAI_API_KEY,
      apiVersion: AZURE_OPENAI_API_VERSION,
      headers: {
        'x-ms-oai-image-generation-deployment':
          AZURE_OPENAI_GPT_IMAGE_DEPLOYMENT as string,
      },
    });

    const anthropic = createAnthropic({
      baseURL: AZURE_ANTHROPIC_BASE_PATH,
      apiKey: AZURE_OPENAI_API_KEY,
      headers: {
        'anthropic-version': (AZURE_ANTHROPIC_API_VERSION ??
          '2023-06-01') as string,
        'x-api-key': AZURE_OPENAI_API_KEY as string,
      },
    });

    const deepseek = createDeepSeek({
      baseURL: AZURE_DEEPSEEK_BASE_PATH,
      apiKey: AZURE_OPENAI_API_KEY,
      headers: {
        'Authorization': `Bearer ${AZURE_OPENAI_API_KEY}`,
      },
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
      'gpt-5.1-codex-max': AZURE_OPENAI_GPT51_CODEX_MAX_DEPLOYMENT,
      'gpt-5.2': AZURE_OPENAI_GPT52_DEPLOYMENT,
      'gpt-5.2-chat': AZURE_OPENAI_GPT52_CHAT_DEPLOYMENT,
      'o3': AZURE_OPENAI_O3_DEPLOYMENT,
      'o3-mini': AZURE_OPENAI_O3_MINI_DEPLOYMENT,
      'o4-mini': AZURE_OPENAI_O4_MINI_DEPLOYMENT,
      'claude-sonnet-4-5': AZURE_ANTHROPIC_CLAUDE_SONNET_45_DEPLOYMENT,
      'claude-opus-4-5': AZURE_ANTHROPIC_CLAUDE_OPUS_45_DEPLOYMENT,
      'claude-haiku-4-5': AZURE_ANTHROPIC_CLAUDE_HAIKU_45_DEPLOYMENT,
      'DeepSeek-V3.1': AZURE_DEEPSEEK_V31_DEPLOYMENT,
      'DeepSeek-R1-0528': AZURE_DEEPSEEK_R1_0528_DEPLOYMENT,
    };

    const deploymentName = modelDeploymentMap[model];

    if (!deploymentName) {
      throw new Error(
        `No deployment configured for model: ${model}. Please set the AZURE_OPENAI_${model.toUpperCase().replace(/[.-]/g, '_')}_DEPLOYMENT environment variable.`
      );
    }

    // instantiate azure openai model with responses api
    const azureModel = deploymentName.startsWith('claude')
      ? anthropic(deploymentName)
      : deploymentName.toLowerCase().startsWith('deepseek')
        ? wrapLanguageModel({
            model: deepseek(deploymentName),
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
          })
        : azure.responses(deploymentName);

    // set up streaming options
    const convertedMessages = convertToModelMessages(uiMessages);

    const baseStreamTextOptions = {
      model: azureModel,
      messages: convertedMessages,
      maxTokens: max_tokens,
      experimental_transform: smoothStream(),
    };

    const response = streamText({
      ...baseStreamTextOptions,
      ...(webSearch
        ? {
            tools: {
              web_search_preview: azure.tools.webSearchPreview({
                searchContextSize: 'medium',
              }),
            },
            toolChoice: {
              type: 'tool',
              toolName: 'web_search_preview' as const,
            },
          }
        : {}),
      ...(useImageTool
        ? {
            tools: {
              image_generation: azure.tools.imageGeneration({
                outputFormat: 'png',
              }),
            },
          }
        : {}),
    });

    let base64Image: string | undefined;
    console.log(await response.staticToolResults);
    for (const toolResult of await response.staticToolResults) {
      if (toolResult.toolName === 'image_generation') {
        base64Image = toolResult.output.result;
      }
    }

    // Use createUIMessageStream to emit a `file` part (if image exists) and merge the text stream
    const stream = createUIMessageStream({
      originalMessages: uiMessages,
      generateId: () => generateId(),
      async execute({ writer }) {
        // Start a server-generated response message (persisted id)
        writer.write({ type: 'start', messageId: generateId() });

        // If image was produced by the tool, write it as a file part so it appears in message.parts
        if (base64Image) {
          writer.write({
            type: 'file',
            mediaType: 'image/png',
            url: `data:image/png;base64,${base64Image}`,
          });
        }

        // Merge the AI text stream into the same message (omit its start so we keep our messageId)
        writer.merge(response.toUIMessageStream({ sendStart: false }));
      },
      onError: (error: unknown) => {
        const err = error as Error;
        console.error('Chat stream error:', {
          message: err.message,
          name: err.name,
          model,
          timestamp: new Date().toISOString(),
        });
        if (err.message?.includes('deployment')) {
          return 'Model deployment not found. Please contact your administrator.';
        }
        if (err.message?.includes('quota')) {
          return 'API quota exceeded. Please try again later.';
        }
        if (err.message?.includes('authentication')) {
          return 'Authentication failed. Please contact your administrator.';
        }
        return 'An error occurred processing your request. Please try again.';
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error: unknown) {
    console.error('API route error:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
