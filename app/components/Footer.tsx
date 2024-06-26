import clsx from 'clsx';
import PropTypes from 'prop-types';
import { memo, useEffect } from 'react';

import { TokenCount } from '@/app/components/TokenCount';

export const Footer = memo(
  ({
    formRef,
    handleInputChange,
    handleSubmit,
    input,
    isLoading,
    systemMessageRef,
    textAreaRef,
  }) => {
    useEffect(() => {
      if (document?.activeElement !== systemMessageRef?.current && !isLoading) {
        textAreaRef?.current?.focus();
      }
    }, [isLoading, textAreaRef, systemMessageRef]);

    return (
      <footer className="fixed bottom-0 z-40 w-full px-4 py-2 text-center lg:p-4 bg-base-300">
        <form ref={formRef} onSubmit={handleSubmit} className="w-full">
          <TokenCount
            input={input}
            systemMessage={systemMessageRef?.current?.value || ''}
            display={'input'}
          />
          <textarea
            autoFocus={true}
            className={clsx(
              'w-full max-w-6xl p-2 overflow-x-hidden overflow-y-auto text-sm border border-gray-300 rounded shadow-xl min-h-14 h-14 lg:text-base lg:h-20 lg:min-h-20 max-h-75',
              {
                // biome-ignore lint/complexity/useLiteralKeys: <explanation>
                'skeleton': isLoading,
              }
            )}
            disabled={isLoading}
            placeholder={
              isLoading ? 'Loading response...' : 'Type a message...'
            }
            onChange={handleInputChange}
            ref={textAreaRef}
            value={input}
          />
          <button
            type="button"
            className="mb-2 btn-block btn btn-xs btn-primary lg:hidden"
            onClick={handleSubmit}
          >
            send message
          </button>
          <br />
          <small className="hidden text-xs bottom-8 lg:inline-block">
            <kbd className="kbd">Enter</kbd> to send /
            <kbd className="kbd">Shift</kbd>+<kbd className="kbd">Enter</kbd>{' '}
            for new line
          </small>
        </form>
      </footer>
    );
  }
);

Footer.displayName = 'Footer';
Footer.propTypes = {
  formRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.object }),
  ]),
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  input: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  systemMessageRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.object }),
  ]),
  textAreaRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.object }),
  ]),
};

export default Footer;
