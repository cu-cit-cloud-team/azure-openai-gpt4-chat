import { faEraser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { memo } from 'react';

import { useDefaultsUpdaterContext } from '@/app/contexts/DefaultsContext';

export const ClearChatButton = memo(
  ({ buttonText = 'Clear Chat', isLoading }) => {
    const { clearHistory } = useDefaultsUpdaterContext();

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
  buttonText: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
};

export default ClearChatButton;
