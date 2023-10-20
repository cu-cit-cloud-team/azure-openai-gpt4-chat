import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

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
    <footer className="fixed bottom-0 z-40 w-full px-4 py-8 text-center bg-base-200">
      <form ref={formRef} onSubmit={handleSubmit} className="w-full">
        <textarea
          autoFocus={true}
          ref={textAreaRef}
          className="w-full max-w-6xl p-2 border border-gray-300 rounded shadow-xl"
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
