import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const {
  AZURE_OPENAI_BASE_PATH,
  AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_MODEL_DEPLOYMENT,
  AZURE_OPENAI_API_VERSION,
} = process.env;

const apiKey = AZURE_OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('AZURE_OPENAI_API_KEY is missing from the environment.');
}

const openai = new OpenAI({
  apiKey: AZURE_OPENAI_API_KEY,
  baseURL: `${AZURE_OPENAI_BASE_PATH}openai/deployments/${AZURE_OPENAI_MODEL_DEPLOYMENT}`,
  defaultQuery: { 'api-version': AZURE_OPENAI_API_VERSION },
  defaultHeaders: { 'api-key': AZURE_OPENAI_API_KEY },
});

export const runtime = 'edge';

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { messages } = await req.json();

  const urlParams = new URL(req.url).searchParams;

  // console.log(urlParams.get('systemMessage'));

  const systemMessage =
    urlParams.get('systemMessage') ||
    'You are a helpful AI assistant. Answer in markdown format.';

  const systemPrompt = {
    content: systemMessage,
    role: 'system',
  };

  let chatMessages = [...messages];

  interface Message {
    content: string;
    role: string;
  }

  const hasSystemPrompt = messages.some(
    (message: Message) => message.role === 'system'
  );
  if (!hasSystemPrompt) {
    chatMessages = [systemPrompt, ...messages];
  }

  const chatConfig: OpenAI.Chat.ChatCompletionCreateParams = {
    temperature: 1,
    top_p: 1,
    presence_penalty: 0.5,
    frequency_penalty: 0.5,
    max_tokens: 1024,
    model: 'gpt-4',
    messages: chatMessages,
    stream: true,
  };

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    ...chatConfig,
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}
