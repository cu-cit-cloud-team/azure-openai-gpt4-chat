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
  {
    displayName: 'GPT-5 (2025-08-07)',
    maxInputTokens: 272000,
    maxOutputTokens: 128000,
    name: 'gpt-5',
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
    displayName: 'o1 (2024-12-17)',
    maxInputTokens: 200000,
    maxOutputTokens: 100000,
    name: 'o1',
  },
  {
    displayName: 'o1 Mini (2024-09-12)',
    maxInputTokens: 128000,
    maxOutputTokens: 65536,
    name: 'o1-mini',
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

export const modelStringFromName = (name: string): string =>
  models.find((model) => model.name === name)?.displayName ||
  models.find((model) => model?.default)?.displayName ||
  'GPT-4o (2024-11-20)';

export const modelFromName = (name: string): Model | undefined =>
  models.find((model) => model.name === name) ||
  models.find((model) => model.default);
