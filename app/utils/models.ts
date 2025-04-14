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
    displayName: 'GPT-4.5 Preview (2025-02-27)',
    maxInputTokens: 128000,
    maxOutputTokens: 16384,
    name: 'gpt-45-preview',
  },
  {
    displayName: 'GPT-4.1 (2025-04-14)',
    maxInputTokens: 1000000,
    maxOutputTokens: 16384,
    name: 'gpt-41',
  },
];

export const modelStringFromName: string = (name: string) =>
  models.find((model) => model.name === name)?.displayName ||
  models.find((model) => model?.default)?.displayName ||
  'GPT-4o (2024-11-20)';

export const modelFromName: string = (name: string) =>
  models.find((model) => model.name === name) ||
  models.find((model) => model.default);
