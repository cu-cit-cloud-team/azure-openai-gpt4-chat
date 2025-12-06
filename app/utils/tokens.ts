import { encode } from 'gpt-tokenizer';

export const getTokenCount = (string: string): number => {
  const tokenCount = encode(string).length;
  return tokenCount;
};
