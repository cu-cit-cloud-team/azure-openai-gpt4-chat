import { faEraser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';

export const ClearChatButton = ({ clearHistory, isLoading }) => {
  return (
    <>
      <button
        type="button"
        onClick={clearHistory}
        disabled={isLoading}
        className={isLoading ? 'btn-disabled' : ''}
      >
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
