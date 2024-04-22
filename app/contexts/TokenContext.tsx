'use client';

import propTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';
import type React from 'react';
import useLocalStorageState from 'use-local-storage-state';

import { useDefaultsContext } from '@/app/contexts/DefaultsContext';

export const TokenStateContext = createContext(null);
export const TokenUpdaterContext = createContext(null);

export const useTokenStateContext = () => {
  const context = useContext(TokenStateContext);
  if (context === null) {
    throw new Error(
      'useTokenStateContext must be used within a TokenStateProvider'
    );
  }
  return context;
};

export const useTokenUpdaterContext = () => {
  const context = useContext(TokenUpdaterContext);
  if (context === null) {
    throw new Error(
      'useTokenUpdaterContext must be used within a TokenUpdaterProvider'
    );
  }
  return context;
};

export const TokenStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { maxTokens, systemMessageMaxTokens } = useDefaultsContext();
  const [inputTokens, setInputTokens] = useState(0);
  const [systemMessageTokens, setSystemMessageTokens] = useState(0);
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
    <TokenStateContext.Provider
      value={{
        inputTokens,
        maxTokens,
        remainingSystemTokens,
        remainingTokens,
        systemMessageMaxTokens,
        tokens,
      }}
    >
      <TokenUpdaterContext.Provider
        value={{
          setInputTokens,
          setRemainingSystemTokens,
          setRemainingTokens,
          setSystemMessageTokens,
          setTokens,
        }}
      >
        {children}
      </TokenUpdaterContext.Provider>
    </TokenStateContext.Provider>
  );
};

TokenStateContext.propTypes = {
  children: propTypes.node,
};
TokenStateContext.displayName = 'TokenStateContext';

export default TokenStateContext;
