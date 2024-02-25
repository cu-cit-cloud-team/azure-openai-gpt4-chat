import { encodingForModel } from 'js-tiktoken';

export const getTokenCount = (string, model = 'gpt-4-1106-preview'): number => {
  const tokenizer = encodingForModel(model);
  const tokenCount = tokenizer.encode(string).length;
  return tokenCount;
};
