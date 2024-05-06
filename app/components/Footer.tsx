import PropTypes from 'prop-types';
import { memo, useEffect, useMemo, useState } from 'react';

import { TokenCount } from '@/app/components/TokenCount';

import { useRefsContext } from '@/app/contexts/RefsContext';
import { TokenStateProvider } from '@/app/contexts/TokenContext';

import { useDebounce } from '@/app/hooks/useDebounce';

export const Footer = memo(
  ({ handleInputChange, handleSubmit, input, isLoading }) => {
    const { textAreaRef, systemMessageRef, formRef } = useRefsContext();

    useEffect(() => {
      if (document?.activeElement !== systemMessageRef?.current && !isLoading) {
        textAreaRef?.current?.focus();
      }
    }, [isLoading, textAreaRef, systemMessageRef]);

    const [isMac, setIsMac] = useState(false);
    useEffect(() => {
      setIsMac(window?.navigator?.userAgent?.toLowerCase().includes('mac'));
    }, []);

    const modifierKey = useMemo(() => (isMac ? '⌘' : 'Ctrl'), [isMac]);

    const textAreaClasses = useMemo(() => {
      const defaultClasses =
        'w-full max-w-6xl p-2 overflow-x-hidden overflow-y-auto text-sm border border-gray-300 rounded shadow-xl min-h-14 h-14 lg:text-base lg:h-20 lg:min-h-20 max-h-75';
      const loadingClass = isLoading ? 'skeleton ' : '';

      return `${loadingClass}${defaultClasses}`;
    }, [isLoading]);

    const debouncedInput = useDebounce(input, 200);

    return (
      <footer className="fixed bottom-0 z-40 w-full px-4 py-2 text-center lg:p-4 bg-base-300">
        <form ref={formRef} onSubmit={handleSubmit} className="w-full">
          <TokenStateProvider>
            <TokenCount
              input={debouncedInput}
              systemMessage={systemMessageRef?.current?.value || ''}
              display={'input'}
            />
          </TokenStateProvider>
          <textarea
            autoFocus={true}
            className={textAreaClasses}
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
            for new line /<kbd className="kbd">{modifierKey}</kbd>+
            <kbd className="kbd">Esc</kbd> to clear history
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
  textAreaRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.object }),
  ]),
  handleSubmit: PropTypes.func.isRequired,
  input: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

export default Footer;
