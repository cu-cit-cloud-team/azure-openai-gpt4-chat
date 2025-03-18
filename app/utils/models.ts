export interface Model {
  name: string;
  displayName: string;
  default: boolean | undefined;
}

export interface Models {
  models: Model[];
}

export const models: Models = [
  { name: 'gpt-35-turbo', displayName: 'GPT-3.5 Turbo (0125)' },
  { name: 'gpt-4', displayName: 'GPT-4 (1106)' },
  {
    name: 'gpt-4-turbo',
    displayName: 'GPT-4 Turbo (2024-04-09)',
  },
  { name: 'gpt-4o', displayName: 'GPT-4o (2024-11-20)', default: true },
  {
    name: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini (2024-07-18)',
  },
  {
    name: 'gpt-45-preview',
    displayName: 'GPT-4.5 Preview (2025-02-27)',
  },
];

export const modelStringFromName: string = (name: string) =>
  models.find((model) => model.name === name)?.displayName ||
  models.find((model) => model?.default)?.displayName ||
  'GPT-4o (2024-08-06)';
