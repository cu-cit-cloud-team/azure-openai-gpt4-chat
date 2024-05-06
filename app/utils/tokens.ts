import { encodingForModel } from 'js-tiktoken';

const tokenizer = encodingForModel('gpt-4-turbo');

export const getTokenCount = (string): number => {
  const tokenCount = tokenizer.encode(string).length;
  return tokenCount;
};
