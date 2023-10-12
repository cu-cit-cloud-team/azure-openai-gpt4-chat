import { faEraser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';

export const ClearChatButton = ({ clearHistory }) => {
  const clearHistoryHandler = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      clearHistory();
    }
  };

  return (
    <>
      <button type="button" onClick={clearHistoryHandler}>
        <FontAwesomeIcon icon={faEraser} />
        Clear Chat
      </button>
    </>
  );
};

ClearChatButton.displayName = 'ClearChatButton';
ClearChatButton.propTypes = {
  clearHistory: PropTypes.func.isRequired,
};

export default ClearChatButton;
