export const modelStringFromName = (name: string) =>
  name === 'gpt-35-turbo'
    ? 'GPT-3.5 Turbo (1106)'
    : name === 'gpt-4'
      ? 'GPT-4 (1106)'
      : name === 'gpt-4-turbo'
        ? 'GPT-4 Turbo (2024-04-09)'
        : name === 'gpt-4o'
          ? 'GPT-4o (2024-08-06)'
          : name === 'gpt-4o-mini'
            ? 'GPT-4o Mini (2024-07-18)'
            : 'GPT-4o (2024-08-06)';
