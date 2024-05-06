import { OpenAIStream, StreamingTextResponse } from 'ai';
// import OpenAI from 'openai';
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');

// destructure env vars we need
const {
  AZURE_OPENAI_BASE_PATH,
  AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_MODEL_DEPLOYMENT,
  AZURE_OPENAI_GPT4_DEPLOYMENT,
  AZURE_OPENAI_GPT35_DEPLOYMENT,
  AZURE_OPENAI_API_VERSION,
  AZURE_AI_SEARCH_KEY,
  AZURE_AI_SEARCH_ENDPOINT,
  AZURE_AI_SEARCH_INDEX,
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
  model: 'gpt-4-turbo', // currently gpt-4-turbo, gpt-4, or gpt-35-turbo
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
  if (!hasSystemPrompt) {
    // add system prompt to messages if not already there
    chatMessages = [systemPrompt, ...messages];
  }

  // set up chat config
  const chatConfig = {
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
      : model === 'gpt-4' && AZURE_OPENAI_GPT4_DEPLOYMENT
        ? AZURE_OPENAI_GPT4_DEPLOYMENT
        : AZURE_OPENAI_MODEL_DEPLOYMENT;

  // instantiate the OpenAI client
  // const openai = new OpenAI({
  //   apiKey: AZURE_OPENAI_API_KEY,
  //   baseURL: `${AZURE_OPENAI_BASE_PATH}openai/deployments/${chatModelDeployment}`,
  //   defaultQuery: { 'api-version': AZURE_OPENAI_API_VERSION },
  //   defaultHeaders: { 'api-key': AZURE_OPENAI_API_KEY },
  // });

  const client = new OpenAIClient(
    AZURE_OPENAI_BASE_PATH,
    new AzureKeyCredential(AZURE_OPENAI_API_KEY)
  );

  // fetch a streaming chat completion using the given system prompt and messages
  // const response = await openai.chat.completions.create({
  //   ...chatConfig,
  // });
  const response = await client.streamChatCompletions(
    chatModelDeployment,
    messages,
    {
      ...chatConfig,
      azureExtensionOptions: {
        extensions: [
          {
            type: 'AzureCognitiveSearch',
            endpoint: AZURE_AI_SEARCH_ENDPOINT,
            key: AZURE_AI_SEARCH_KEY,
            indexName: AZURE_AI_SEARCH_INDEX,
            parameters: {
              endpoint: '$endpoint',
              indexName: '$indexName',
              semanticConfiguration: 'default',
              queryType: 'vectorSemanticHybrid',
              fieldsMapping: {
                contentFieldsSeparator: '\n',
                contentFields: ['content'],
                filepathField: 'filepath',
                titleField: 'title',
                urlField: 'url',
                vectorFields: ['contentVector'],
              },
              inScope: true,
              roleInformation: systemMessage,
              filter: null,
              strictness: 3,
              topNDocuments: 8,
              key: '$key',
            },
          },
        ],
      },
    }
  );

  // convert the response into a friendly text-stream
  const stream = OpenAIStream(response);

  // proof of concept to grab citations
  // NOTE: takes over response, can't be used as is and return the stream
  // const clonedResponse = structuredClone(response);
  // for await (const event of clonedResponse) {
  //   for (const choice of event.choices) {
  //     if (choice?.delta?.context?.messages[0]?.content) {
  //       console.log(
  //         JSON.parse(choice.delta.context.messages[0].content).citations
  //       );
  //     }
  //   }
  // }

  // send the stream back to the client
  return new StreamingTextResponse(stream);
}
