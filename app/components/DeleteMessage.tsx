import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { nanoid } from 'nanoid';
import { useCallback, useState } from 'react';

import { database } from '../database/database.config';

export const DeleteMessage = ({ isUser, message }) => {
  const [buttonId] = useState(nanoid());

  const deleteMessage = useCallback(async () => {
    const deleteFromDb = async () => {
      await database.messages.where('id').equals(message.id).delete();
    };
    if (confirm('Are you sure you want to delete this message?')) {
      await deleteFromDb();
      window.location.reload();
    }
  }, [message]);

  return (
    <div
      className={`delete-container tooltip ${
        isUser
          ? 'float-left ml-3 tooltip-right tooltip-primary'
          : 'float-right mr-3 tooltip-left tooltip-secondary'
      }`}
      data-tip={`Delete ${isUser ? 'message' : 'response'}`}
    >
      <button
        key={buttonId}
        onClick={deleteMessage}
        type="button"
        className={`w-6 h-6 p-0 m-0 mr-0 btn btn-xs ${
          isUser
            ? 'btn-primary text-primary-content'
            : 'btn-secondary text-secondary-content'
        }`}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  );
};

export default DeleteMessage;
