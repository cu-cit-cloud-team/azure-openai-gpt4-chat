import { encode } from 'gpt-tokenizer';

export const getTokenCount = (string): number => {
  const tokenCount = encode(string).length;
  return tokenCount;
};
