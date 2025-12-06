export interface Model {
  default?: boolean;
  displayName: string;
  maxInputTokens: number;
  maxOutputTokens: number;
  name: string;
}

export type Models = Model[];

export const models: Models = [
  // {
  //   displayName: 'GPT-5 w/ Web Search (2025-08-07)',
  //   maxInputTokens: 272000,
  //   maxOutputTokens: 128000,
  //   name: 'gpt-5-web-search',
  // },
  // {
  //   displayName: 'GPT-5 Mini w/ Web Search (2025-08-07)',
  //   maxInputTokens: 272000,
  //   maxOutputTokens: 128000,
  //   name: 'gpt-5-mini-web-search',
  // },
  {
    displayName: 'GPT-4.1 (2025-04-14)',
    maxInputTokens: 1047576,
    maxOutputTokens: 32768,
    name: 'gpt-41',
  },
  {
    displayName: 'GPT-4.1 Mini (2025-04-14)',
    maxInputTokens: 1047576,
    maxOutputTokens: 32768,
    name: 'gpt-41-mini',
  },
  {
    displayName: 'GPT-4.1 Nano (2025-04-14)',
    maxInputTokens: 1047576,
    maxOutputTokens: 32768,
    name: 'gpt-41-nano',
  },
  {
    displayName: 'GPT-5 (2025-08-07)',
    maxInputTokens: 272000,
    maxOutputTokens: 128000,
    name: 'gpt-5',
  },
  {
    displayName: 'GPT-5 Chat (2025-08-07)',
    maxInputTokens: 128000,
    maxOutputTokens: 16384,
    name: 'gpt-5-chat',
  },
  {
    displayName: 'GPT-5 Codex (2025-09-11)',
    maxInputTokens: 272000,
    maxOutputTokens: 128000,
    name: 'gpt-5-codex',
  },
  {
    displayName: 'GPT-5 Mini (2025-08-07)',
    maxInputTokens: 272000,
    maxOutputTokens: 128000,
    name: 'gpt-5-mini',
  },
  {
    displayName: 'GPT-5 Nano (2025-08-07)',
    maxInputTokens: 272000,
    maxOutputTokens: 128000,
    name: 'gpt-5-nano',
  },
  {
    displayName: 'GPT-5.1 (2025-11-13)',
    maxInputTokens: 272000,
    maxOutputTokens: 128000,
    name: 'gpt-5.1',
    default: true,
  },
  {
    displayName: 'GPT-5.1 Chat (2025-11-13)',
    maxInputTokens: 111616,
    maxOutputTokens: 16384,
    name: 'gpt-5.1-chat',
  },
  {
    displayName: 'GPT-5.1 Codex (2025-11-13)',
    maxInputTokens: 272000,
    maxOutputTokens: 128000,
    name: 'gpt-5.1-codex',
  },
  {
    displayName: 'GPT-5.1 Codex Mini (2025-11-13)',
    maxInputTokens: 272000,
    maxOutputTokens: 128000,
    name: 'gpt-5.1-codex-mini',
  },
  {
    displayName: 'o3 (2025-04-16)',
    maxInputTokens: 200000,
    maxOutputTokens: 100000,
    name: 'o3',
  },
  {
    displayName: 'o3 Mini (2025-01-31)',
    maxInputTokens: 200000,
    maxOutputTokens: 100000,
    name: 'o3-mini',
  },
  {
    displayName: 'o4 Mini (2025-04-16)',
    maxInputTokens: 200000,
    maxOutputTokens: 100000,
    name: 'o4-mini',
  },
];

export const DEFAULT_MODEL_NAME = 'gpt-5.1';
export const DEFAULT_MAX_INPUT_TOKENS = 272000;
export const DEFAULT_MAX_OUTPUT_TOKENS = 128000;

export const defaultModel = models.find((model) => model.default);

export const modelStringFromName = (name: string): string => {
  const model = models.find((model) => model.name === name);
  return model?.displayName || defaultModel?.displayName || 'Unknown Model';
};

export const modelFromName = (name: string): Model | undefined =>
  models.find((model) => model.name === name) || defaultModel;
