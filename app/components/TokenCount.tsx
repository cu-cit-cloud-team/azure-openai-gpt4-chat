import PropTypes from 'prop-types';
import { memo, useEffect, useMemo } from 'react';

import { useDebounce } from '@/app/hooks/useDebounce';

import {
  useTokenStateContext,
  useTokenUpdaterContext,
} from '../contexts/TokenContext';

import { getTokenCount } from '@/app/utils/tokens';

export const TokenCount = ({
  input = '',
  systemMessage,
  display = 'input',
}) => {
  const { maxTokens, systemMessageMaxTokens, tokens } = useTokenStateContext();
  const {
    setInputTokens,
    setRemainingSystemTokens,
    setRemainingTokens,
    setSystemMessageTokens,
  } = useTokenUpdaterContext();

  const tokenInput = useDebounce(input, 200);

  const updateSystemMessageCount = useMemo(() => {
    return getTokenCount(systemMessage);
  }, [systemMessage]);

  const updateInputCount = useMemo(() => {
    return getTokenCount(tokenInput);
  }, [tokenInput]);

  // update token counts
  useEffect(() => {
    setSystemMessageTokens(updateSystemMessageCount);
    setInputTokens(updateInputCount);
    setRemainingTokens(
      maxTokens - (updateSystemMessageCount + updateInputCount)
    );
    setRemainingSystemTokens(systemMessageMaxTokens - updateSystemMessageCount);
  }, [
    maxTokens,
    setInputTokens,
    setRemainingSystemTokens,
    setRemainingTokens,
    setSystemMessageTokens,
    systemMessageMaxTokens,
    updateInputCount,
    updateSystemMessageCount,
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
