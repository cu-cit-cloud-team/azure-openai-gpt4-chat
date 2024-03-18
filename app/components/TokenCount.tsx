// import { encodingForModel } from 'js-tiktoken';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';

import { getItem } from '../utils/localStorage.ts';
import { getTokenCount } from '../utils/tokens.ts';

export const TokenCount = ({
  input = '',
  systemMessage,
  display = 'input',
}) => {
  const systemMessageMaxTokens = 400;
  const [inputTokens, setInputTokens] = useState(0);
  const [systemMessageTokens, setSystemMessageTokens] = useState(0);

  const [maxTokens, setMaxTokens] = useState(2048);

  const [maxTokens, setMaxTokens] = useState(16384);
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

  // update max tokens
  useEffect(() => {
    setMaxTokens(16384);

    return () => {
      setMaxTokens(16384);
    };
  }, []);

  // update token counts
  useEffect(() => {
    const systemMessageCount = getTokenCount(systemMessage);
    setSystemMessageTokens(systemMessageCount);
    const inputCount = getTokenCount(input);
    setInputTokens(inputCount);
    setRemainingTokens(maxTokens - (systemMessageCount + inputCount));
    setRemainingSystemTokens(systemMessageMaxTokens - systemMessageCount);
  }, [input, systemMessage, maxTokens]);

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
    maxTokens,
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
};

TokenCount.displayName = 'TokenCount';

TokenCount.propTypes = {
  input: PropTypes.string,
  systemMessage: PropTypes.string.isRequired,
  display: PropTypes.oneOf(['input', 'systemMessage']),
};

export default TokenCount;
