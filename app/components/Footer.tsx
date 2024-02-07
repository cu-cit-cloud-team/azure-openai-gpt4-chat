import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { TokenCount } from './TokenCount.tsx';

export const Footer = ({
  formRef,
  textAreaRef,
  handleSubmit,
  input,
  handleInputChange,
  systemMessageRef,
}) => {
  useEffect(() => {
    if (document?.activeElement !== systemMessageRef?.current) {
      textAreaRef?.current?.focus();
    }
  }, [textAreaRef, systemMessageRef]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: this is intentional to force resize on input change
  useEffect(() => {
    if (textAreaRef?.current) {
      textAreaRef.current.style.height = '';
      textAreaRef.current.style.overflow = 'scroll';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [input, textAreaRef]);

  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(navigator?.userAgent?.toLowerCase().includes('mac'));
  }, []);

  const [modifierKey, setModifierKey] = useState('⌘');
  useEffect(() => {
    setModifierKey(isMac ? '⌘' : 'Ctrl');
  }, [isMac]);

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
          ref={textAreaRef}
          className="w-full h-10 max-w-6xl p-2 overflow-hidden text-sm border border-gray-300 rounded shadow-xl lg:text-base max-h-24 lg:h-11 lg:max-h-80"
          value={input}
          placeholder="Type a message..."
          onChange={handleInputChange}
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
          <kbd className="kbd">Shift</kbd>+<kbd className="kbd">Enter</kbd> for
          new line /<kbd className="kbd">{modifierKey}</kbd>+
          <kbd className="kbd">Esc</kbd> to clear history
        </small>
      </form>
    </footer>
  );
};

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
