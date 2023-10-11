import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

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
  });

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
          className="btn-block btn btn-xs btn-primary lg:hidden mb-2"
          onClick={handleSubmit}
        >
          send message
        </button>
        <br />
        <small className="bottom-8 lg:inline-block hidden">
          <kbd className="kbd">⌘</kbd>+<kbd className="kbd">Enter</kbd> to send
          /<kbd className="kbd">⌘</kbd>+<kbd className="kbd">Esc</kbd> to clear
          history
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
