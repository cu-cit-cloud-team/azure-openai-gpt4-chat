import clsx from 'clsx';
import PropTypes from 'prop-types';
import { memo, useEffect, useMemo } from 'react';

import {
  useTokenStateContext,
  useTokenUpdaterContext,
} from '@/app/contexts/TokenContext';

import { getTokenCount } from '@/app/utils/tokens';

export const TokenCount = memo(
  ({ input = '', systemMessage, display = 'input' }) => {
    const { maxTokens, systemMessageMaxTokens, tokens } =
      useTokenStateContext();
    const {
      setInputTokens,
      setRemainingSystemTokens,
      setRemainingTokens,
      setSystemMessageTokens,
    } = useTokenUpdaterContext();

    const updateSystemMessageCount = useMemo(() => {
      return getTokenCount(systemMessage);
    }, [systemMessage]);

    const updateInputCount = useMemo(() => {
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
      systemMessageMaxTokens,
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

TokenCount.propTypes = {
  input: PropTypes.string,
  systemMessage: PropTypes.string.isRequired,
  display: PropTypes.oneOf(['input', 'systemMessage']),
};

export default TokenCount;
