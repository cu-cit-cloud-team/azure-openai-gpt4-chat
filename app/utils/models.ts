export interface Model {
  default: boolean | undefined;
  displayName: string;
  maxInputTokens: number;
  maxOutputTokens: number;
  name: string;
}

export interface Models {
  models: Model[];
}

export const models: Models = [
  {
    default: true,
    displayName: 'GPT-4o (2024-11-20)',
    maxInputTokens: 128000,
    maxOutputTokens: 16384,
    name: 'gpt-4o',
  },
  // {
  //   displayName: 'GPT-4o w/ Web Search (2024-11-20)',
  //   maxInputTokens: 128000,
  //   maxOutputTokens: 16384,
  //   name: 'gpt-4o-web-search',
  // },
  {
    displayName: 'GPT-4o Mini (2024-07-18)',
    maxInputTokens: 128000,
    maxOutputTokens: 16384,
    name: 'gpt-4o-mini',
  },
  // {
  //   displayName: 'GPT-4o Mini w/ Web Search (2024-07-18)',
  //   maxInputTokens: 128000,
  //   maxOutputTokens: 16384,
  //   name: 'gpt-4o-mini-web-search',
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
];

export const modelStringFromName = (name: string): string =>
  models.find((model) => model.name === name)?.displayName ||
  models.find((model) => model?.default)?.displayName ||
  'GPT-4o (2024-11-20)';

export const modelFromName = (name: string): Model | undefined =>
  models.find((model) => model.name === name) ||
  models.find((model) => model.default);
