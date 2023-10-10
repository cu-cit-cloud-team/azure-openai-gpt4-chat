import PropTypes from 'prop-types';
import React from 'react';

export const Footer = ({
  formRef,
  textAreaRef,
  handleSubmit,
  input,
  handleInputChange,
}) => (
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
      <br />
      <small className="bottom-8">
        <kbd className="kbd">⌘</kbd>+<kbd className="kbd">Enter</kbd> to send /
        <kbd className="kbd">⌘</kbd>+<kbd className="kbd">Esc</kbd> to clear
        history
      </small>
    </form>
    {textAreaRef?.current?.focus()}
  </footer>
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
