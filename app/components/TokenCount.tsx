import { encodingForModel } from 'js-tiktoken';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';

import { getItem } from '../utils/localStorage';

const tokenizer = encodingForModel('gpt-4-1106-preview');

export const TokenCount = ({
  input = '',
  systemMessage,
  display = 'input',
}) => {
  const systemMessageMaxTokens = 400;
  const [inputTokens, setInputTokens] = useState(0);
  const [systemMessageTokens, setSystemMessageTokens] = useState(0);
  const [model, setModel] = useState('');
  const [maxTokens, setMaxTokens] = useState(2048);
  const [remainingTokens, setRemainingTokens] = useLocalStorageState(
    'remainingTokens',
    {
      defaultValue: 2048,
    }
  );
  const [remainingSystemTokens, setRemainingSystemTokens] =
    useLocalStorageState('remainingSystemTokens', {
      defaultValue: systemMessageMaxTokens,
    });

  const [tokens, setTokens] = useLocalStorageState('tokens', {
    defaultValue: {
      input: inputTokens,
      systemMessage: systemMessageTokens,
    },
  });

  // get current model from local storage
  useEffect(() => {
    const savedModel = getItem('parameters').model;
    if (savedModel) {
      setModel(savedModel);
    }
  }, []);

  // update max tokens
  useEffect(() => {
    if (model === 'gpt-4') {
      setMaxTokens(16384);
    }

    return () => {
      setMaxTokens(2048);
    };
  }, [model]);

  // update token counts
  useEffect(() => {
    const systemMessageCount = tokenizer.encode(systemMessage).length;
    setSystemMessageTokens(systemMessageCount);
    const inputCount = tokenizer.encode(input).length;
    setInputTokens(inputCount);
  }, [input, systemMessage]);

  // update remaining tokens
  useEffect(() => {
    setRemainingSystemTokens(systemMessageMaxTokens - systemMessageTokens);
    setRemainingTokens(maxTokens - (inputTokens + systemMessageTokens));
  }, [
    inputTokens,
    maxTokens,
    setRemainingTokens,
    setRemainingSystemTokens,
    systemMessageTokens,
  ]);

  useEffect(() => {
    setTokens({
      input: inputTokens,
      systemMessage: systemMessageTokens,
    });
  }, [inputTokens, systemMessageTokens, setTokens]);

  return (
    <>
      <div
        className={`${
          display === 'systemMessage' ? '-mb-3' : 'mb-1'
        } text-xs text-base-content opacity-50 uppercase cursor-default`}
        key={`${display}-token-count`}
      >
        {/* Token{tokens === 1 ? '' : 's'}:{' '} */}
        <strong>
          {tokens[display]} <span className="font-normal">Tokens</span> /{' '}
          {display === 'systemMessage'
            ? remainingSystemTokens
            : remainingTokens}{' '}
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
