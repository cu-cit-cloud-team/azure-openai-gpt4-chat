export interface Model {
  default?: boolean;
  displayName: string;
  modelVersion: string;
  maxInputTokens: number;
  maxOutputTokens: number;
  name: string;
  capabilities?: ('web-search' | 'reasoning')[];
}

export type Models = Model[];

export const models: Models = [
  {
    displayName: 'GPT-4.1',
    modelVersion: '2025-04-14',
    maxInputTokens: 1047576,
    maxOutputTokens: 32768,
    name: 'gpt-41',
    capabilities: ['web-search', 'reasoning'],
  },
  {
    displayName: 'GPT-4.1 Mini',
    modelVersion: '2025-04-14',
    maxInputTokens: 1047576,
    maxOutputTokens: 32768,
    name: 'gpt-41-mini',
    capabilities: ['web-search', 'reasoning'],
  },
  {
    displayName: 'GPT-4.1 Nano',
    modelVersion: '2025-04-14',
    maxInputTokens: 1047576,
    maxOutputTokens: 32768,
    name: 'gpt-41-nano',
    capabilities: ['web-search', 'reasoning'],
  },
  {
    displayName: 'GPT-5',
    modelVersion: '2025-08-07',
    maxInputTokens: 272000,
    maxOutputTokens: 128000,
    name: 'gpt-5',
    capabilities: ['web-search', 'reasoning'],
  },
  {
    displayName: 'GPT-5 Chat',
    modelVersion: '2025-08-07',
    maxInputTokens: 128000,
    maxOutputTokens: 16384,
    name: 'gpt-5-chat',
    capabilities: ['web-search', 'reasoning'],
  },
  {
    displayName: 'GPT-5 Codex',
    modelVersion: '2025-09-11',
    maxInputTokens: 272000,
    maxOutputTokens: 128000,
    name: 'gpt-5-codex',
    capabilities: ['web-search', 'reasoning'],
  },
  {
    displayName: 'GPT-5 Mini',
    modelVersion: '2025-08-07',
    maxInputTokens: 272000,
    maxOutputTokens: 128000,
    name: 'gpt-5-mini',
    capabilities: ['web-search', 'reasoning'],
  },
  {
    displayName: 'GPT-5 Nano',
    modelVersion: '2025-08-07',
    maxInputTokens: 272000,
    maxOutputTokens: 128000,
    name: 'gpt-5-nano',
    capabilities: ['web-search', 'reasoning'],
  },
  {
    displayName: 'GPT-5.1',
    modelVersion: '2025-11-13',
    maxInputTokens: 272000,
    maxOutputTokens: 128000,
    name: 'gpt-5.1',
    default: true,
    capabilities: ['web-search', 'reasoning'],
  },
  {
    displayName: 'GPT-5.1 Chat',
    modelVersion: '2025-11-13',
    maxInputTokens: 111616,
    maxOutputTokens: 16384,
    name: 'gpt-5.1-chat',
    capabilities: ['web-search', 'reasoning'],
  },
  {
    displayName: 'GPT-5.1 Codex',
    modelVersion: '2025-11-13',
    maxInputTokens: 272000,
    maxOutputTokens: 128000,
    name: 'gpt-5.1-codex',
    capabilities: ['web-search', 'reasoning'],
  },
  {
    displayName: 'GPT-5.1 Codex Max',
    modelVersion: '2025-12-04',
    maxInputTokens: 272000,
    maxOutputTokens: 128000,
    name: 'gpt-5.1-codex-max',
    capabilities: ['web-search', 'reasoning'],
  },
  {
    displayName: 'GPT-5.1 Codex Mini',
    modelVersion: '2025-11-13',
    maxInputTokens: 272000,
    maxOutputTokens: 128000,
    name: 'gpt-5.1-codex-mini',
    capabilities: ['web-search', 'reasoning'],
  },
  {
    displayName: 'o3',
    modelVersion: '2025-04-16',
    maxInputTokens: 200000,
    maxOutputTokens: 100000,
    name: 'o3',
    capabilities: ['reasoning'],
  },
  {
    displayName: 'o3 Mini',
    modelVersion: '2025-01-31',
    maxInputTokens: 200000,
    maxOutputTokens: 100000,
    name: 'o3-mini',
    capabilities: ['reasoning'],
  },
  {
    displayName: 'o4 Mini',
    modelVersion: '2025-04-16',
    maxInputTokens: 200000,
    maxOutputTokens: 100000,
    name: 'o4-mini',
    capabilities: ['reasoning'],
  },
];

// constants to use as fallbacks when no model is found
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
