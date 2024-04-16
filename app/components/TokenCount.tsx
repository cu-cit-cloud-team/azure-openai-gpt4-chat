import PropTypes from 'prop-types';
import { memo, useEffect, useMemo, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';

import { useDebounce } from '@/app/hooks/useDebounce.tsx';

import { getTokenCount } from '@/app/utils/tokens.ts';

export const TokenCount = memo(
  ({ input = '', systemMessage, display = 'input' }) => {
    const systemMessageMaxTokens = 400;
    const [inputTokens, setInputTokens] = useState(0);
    const [systemMessageTokens, setSystemMessageTokens] = useState(0);

    const tokenInput = useDebounce(input, 200);

    const maxTokens = 16384;
    const [remainingTokens, setRemainingTokens] = useState(16384);
    const [remainingSystemTokens, setRemainingSystemTokens] = useState(
      systemMessageMaxTokens
    );

    const [tokens, setTokens] = useLocalStorageState('tokens', {
      defaultValue: {
        input: inputTokens,
        maximum: maxTokens,
        remaining: remainingTokens,
        systemMessage: systemMessageTokens,
        systemMessageRemaining: remainingSystemTokens,
      },
    });

    const updateSystemMessageCount = useMemo(() => {
      return getTokenCount(systemMessage);
    }, [systemMessage]);

    const updateInputCount = useMemo(() => {
      return getTokenCount(tokenInput);
    }, [tokenInput]);

    // update token counts
    useEffect(() => {
      const systemMessageCount = updateSystemMessageCount;
      setSystemMessageTokens(systemMessageCount);
      const inputCount = updateInputCount;
      setInputTokens(inputCount);
      setRemainingTokens(maxTokens - (systemMessageCount + inputCount));
      setRemainingSystemTokens(systemMessageMaxTokens - systemMessageCount);
    }, [updateInputCount, updateSystemMessageCount]);

    // set token counts
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
      remainingSystemTokens,
      remainingTokens,
      setTokens,
      systemMessageTokens,
    ]);

    return (
      <>
        <div
          className={`${
            display === 'systemMessage' ? '-mb-3' : 'mb-1'
          } text-xs text-base-content opacity-50 uppercase cursor-default`}
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

TokenCount.propTypes = {
  input: PropTypes.string,
  systemMessage: PropTypes.string.isRequired,
  display: PropTypes.oneOf(['input', 'systemMessage']),
};

export default TokenCount;
