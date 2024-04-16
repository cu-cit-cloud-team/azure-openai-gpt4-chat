import { faEraser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { memo } from 'react';

export const ClearChatButton = memo(
  ({ clearHistory, isLoading, buttonText = 'Clear Chat' }) => {
    return (
      <>
        <button
          type="button"
          onClick={clearHistory}
          disabled={isLoading}
          className={isLoading ? 'btn-disabled' : ''}
        >
          <FontAwesomeIcon icon={faEraser} />
          {buttonText}
        </button>
      </>
    );
  }
);

ClearChatButton.displayName = 'ClearChatButton';
ClearChatButton.propTypes = {
  clearHistory: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  buttonText: PropTypes.string,
};

export default ClearChatButton;
