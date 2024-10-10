import clsx from 'clsx';
import { atom, useAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { memo, useEffect, useMemo } from 'react';

import { getTokenCount } from '@/app/utils/tokens';

import { parametersAtom } from '@/app/components/Parameters';

const systemMessageMaxTokens = 400;

export const tokensAtom = atomWithStorage('tokens', {
  input: 0,
  maximum: 16384,
  remaining: 16384,
  systemMessage: 0,
  systemMessageRemaining: systemMessageMaxTokens,
});

interface TokenCountProps {
  input?: string;
  systemMessage: string;
  display?: "input" | "systemMessage";
}

export const TokenCount = memo(
  ({
    input = '',
    systemMessage,
    display = 'input'
  }: TokenCountProps) => {
    const inputTokensAtom = atom(0);
    const systemMessageTokensAtom = atom(0);
    const remainingTokensAtom = atom(16384);
    const remainingSystemTokensAtom = atom(systemMessageMaxTokens);

    const [inputTokens, setInputTokens] = useAtom(inputTokensAtom);
    const [systemMessageTokens, setSystemMessageTokens] = useAtom(
      systemMessageTokensAtom
    );
    const [remainingTokens, setRemainingTokens] = useAtom(remainingTokensAtom);
    const [remainingSystemTokens, setRemainingSystemTokens] = useAtom(
      remainingSystemTokensAtom
    );
    const parameters = useAtomValue(parametersAtom);
    const maxTokens = parameters.model.includes('gpt-4') ? 128000 : 16384;
    const [tokens, setTokens] = useAtom(tokensAtom);

    useEffect(() => {
      setTokens({
        input: inputTokens,
        maximum: maxTokens,
        remaining: remainingTokens,
        systemMessage: systemMessageTokens,
        systemMessageRemaining: remainingSystemTokens,
      });
    }, [
      inputTokens,
      maxTokens,
      remainingSystemTokens,
      remainingTokens,
      setTokens,
      systemMessageTokens,
    ]);

    const updateSystemMessageCount = useMemo(() => {
      if (!systemMessage) {
        return 0;
      }
      return getTokenCount(systemMessage);
    }, [systemMessage]);

    const updateInputCount = useMemo(() => {
      if (!input) {
        return 0;
      }
      return getTokenCount(input);
    }, [input]);

    // update token counts
    useEffect(() => {
      setSystemMessageTokens(updateSystemMessageCount);
      setInputTokens(updateInputCount);
      setRemainingTokens(
        maxTokens - (updateSystemMessageCount + updateInputCount)
      );
      setRemainingSystemTokens(
        systemMessageMaxTokens - updateSystemMessageCount
      );
    }, [
      maxTokens,
      setInputTokens,
      setRemainingSystemTokens,
      setRemainingTokens,
      setSystemMessageTokens,
      updateInputCount,
      updateSystemMessageCount,
    ]);

    return (
      <>
        <div
          className={clsx('text-xs text-base-content opacity-50 uppercase', {
            '-mb-3': display === 'systemMessage',
            'mb-1': display !== 'systemMessage',
          })}
          key={`${display}-token-count`}
        >
          <strong>
            {tokens[display]}{' '}
            <span className="font-normal">
              Token{tokens.input === 1 ? '' : 's '}
            </span>{' '}
            /{' '}
            {display === 'systemMessage'
              ? tokens.systemMessageRemaining
              : tokens.remaining}{' '}
            <span className="font-normal">Remaining</span>
          </strong>
        </div>
      </>
    );
  }
);

TokenCount.displayName = 'TokenCount';

export default TokenCount;
