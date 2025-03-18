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
    displayName: 'GPT-3.5 Turbo (0125)',
    maxInputTokens: 16384,
    maxOutputTokens: 4096,
    name: 'gpt-35-turbo',
  },
  {
    displayName: 'GPT-4 (1106)',
    maxInputTokens: 128000,
    maxOutputTokens: 4096,
    name: 'gpt-4',
  },
  {
    displayName: 'GPT-4 Turbo (2024-04-09)',
    maxInputTokens: 128000,
    maxOutputTokens: 4096,
    name: 'gpt-4-turbo',
  },
  {
    default: true,
    displayName: 'GPT-4o (2024-11-20)',
    maxInputTokens: 128000,
    maxOutputTokens: 16384,
    name: 'gpt-4o',
  },
  {
    displayName: 'GPT-4o Mini (2024-07-18)',
    maxInputTokens: 128000,
    maxOutputTokens: 16384,
    name: 'gpt-4o-mini',
  },
  {
    displayName: 'GPT-4.5 Preview (2025-02-27)',
    maxInputTokens: 128000,
    maxOutputTokens: 16384,
    name: 'gpt-45-preview',
  },
];

export const modelStringFromName: string = (name: string) =>
  models.find((model) => model.name === name)?.displayName ||
  models.find((model) => model?.default)?.displayName ||
  'GPT-4o (2024-11-20)';
