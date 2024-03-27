import { faArrowRotateForward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { nanoid } from 'nanoid';
import { useCallback } from 'react';

import { database } from '../database/database.config';

export const ReloadMessage = ({ isUser, message, reload }) => {
  const reloadMessage = useCallback(async () => {
    const deleteFromDb = async () => {
      await database.messages.where('id').equals(message.id).delete();
    };
    if (
      confirm(
        'Are you sure you want to regenerate this response? Doing so will remove the current response from the chat history.'
      )
    ) {
      await deleteFromDb();
      reload();
    }
  }, [message, reload]);

  return !isUser ? (
    <div
      className={`reload-container float-right mr-10 tooltip ${
        isUser
          ? 'tooltip-right tooltip-primary'
          : 'tooltip-left tooltip-secondary'
      }`}
      data-tip={'Regenerate response'}
    >
      <button
        key={nanoid()}
        onClick={reloadMessage}
        type="button"
        className={`w-6 h-6 p-0 m-0 mr-0 btn btn-xs ${
          isUser
            ? 'btn-primary text-primary-content'
            : 'btn-secondary text-secondary-content'
        }`}
      >
        <FontAwesomeIcon icon={faArrowRotateForward} />
      </button>
    </div>
  ) : null;
};

export default ReloadMessage;
