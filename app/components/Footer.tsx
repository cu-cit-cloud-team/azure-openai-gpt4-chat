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
          className="w-full h-12 max-w-6xl p-2 border border-gray-300 rounded shadow-xl lg:h-24"
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
        <small className="hidden bottom-8 lg:inline-block">
          <kbd className="kbd">{modifierKey}</kbd>+
          <kbd className="kbd">Enter</kbd> to send /
          <kbd className="kbd">{modifierKey}</kbd>+
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
