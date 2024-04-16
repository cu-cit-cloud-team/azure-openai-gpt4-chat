import {
  faFloppyDisk,
  faRectangleXmark,
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { memo, useEffect, useState } from 'react';

import { TokenCount } from '@/app/components/TokenCount';

import { useDebounce } from '@/app/hooks/useDebounce';

export const SystemMessage = memo(
  ({
    clearHistory,
    input,
    setSystemMessage,
    systemMessage,
    systemMessageRef,
  }) => {
    const [localSystemMessage, setLocalSystemMessage] = useState('');
    const [originalSystemMessage, setOriginalSystemMessage] = useState('');

    const debouncedSystemMessage = useDebounce(systemMessage, 200);

    useEffect(() => {
      setOriginalSystemMessage(debouncedSystemMessage);
      setLocalSystemMessage(debouncedSystemMessage);
    }, [debouncedSystemMessage]);

    const cancelClickHandler = () => {
      setSystemMessage(originalSystemMessage);
      const systemMessageMenu = document.querySelectorAll(
        'details.system-message-dropdown'
      );
      for (const menu of systemMessageMenu) {
        if (menu) {
          menu.removeAttribute('open');
        }
      }
    };

    const resetClickHandler = () => {
      if (localSystemMessage !== originalSystemMessage) {
        if (confirm('Are you sure you want to reset your unsaved changes?')) {
          setSystemMessage(originalSystemMessage);
          setLocalSystemMessage(originalSystemMessage);
        }
      }
    };

    const saveClickHandler = () => {
      if (localSystemMessage !== originalSystemMessage) {
        if (
          confirm(
            'Are you sure you want to change the system message?\n\nNOTE: This will also clear your chat history and reload the app.'
          )
        ) {
          setLocalSystemMessage(localSystemMessage);
          setSystemMessage(localSystemMessage);
          clearHistory(false);
        }
      }
    };

    const handleSystemMessageChange = (e) => {
      setLocalSystemMessage(e.target.value);
    };

    const debouncedLocalSystemMessage = useDebounce(localSystemMessage, 200);

    return (
      <>
        <TokenCount
          input={input}
          systemMessage={debouncedLocalSystemMessage}
          display={'systemMessage'}
        />
        <textarea
          className="h-48 m-2 whitespace-pre-line w-52 lg:w-96"
          ref={systemMessageRef}
          onChange={handleSystemMessageChange}
          value={localSystemMessage}
        />
        <div className="join">
          <button
            className="btn btn-sm lg:btn-md join-item btn-info"
            type="button"
            onClick={cancelClickHandler}
          >
            <FontAwesomeIcon icon={faRectangleXmark} />
            <span className="hidden lg:flex">Close</span>
          </button>
          <button
            className={`btn btn-sm lg:btn-md join-item btn-error${
              localSystemMessage?.trim() === originalSystemMessage?.trim()
                ? ' btn-disabled'
                : ''
            }`}
            type="button"
            onClick={resetClickHandler}
          >
            <FontAwesomeIcon icon={faRotateLeft} />
            <span className="hidden lg:flex">Reset</span>
          </button>
          <button
            className={`btn btn-sm lg:btn-md join-item btn-success${
              localSystemMessage?.trim() === originalSystemMessage?.trim()
                ? ' btn-disabled'
                : ''
            }`}
            type="button"
            disabled={
              localSystemMessage?.trim() === originalSystemMessage?.trim()
            }
            onClick={saveClickHandler}
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
            <span className="hidden lg:flex">Save</span>
          </button>
        </div>
      </>
    );
  }
);

SystemMessage.displayName = 'SystemMessage';
SystemMessage.propTypes = {
  clearHistory: PropTypes.func.isRequired,
  input: PropTypes.string,
  setSystemMessage: PropTypes.func.isRequired,
  systemMessage: PropTypes.string.isRequired,
  systemMessageRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.object }),
  ]),
};

export default SystemMessage;
