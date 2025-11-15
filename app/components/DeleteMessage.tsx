import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { nanoid } from 'nanoid';
import { memo, useCallback, useMemo } from 'react';

import { database } from '@/app/database/database.config';

interface DeleteMessageProps {
  isUser: boolean;
  messageId: string;
  focusTextarea: () => void;
}

export const DeleteMessage = memo(
  ({ isUser, messageId, focusTextarea }: DeleteMessageProps) => {
    const buttonId = useMemo(() => nanoid(), []);

    const deleteMessage = useCallback(async () => {
      if (confirm('Are you sure you want to delete this message?')) {
        await database.messages.where('id').equals(messageId).delete();
        // Dexie's useLiveQuery in page.tsx will automatically re-query and update messages
        focusTextarea();
      }
    }, [messageId, focusTextarea]);

    return (
      <div
        className={clsx('delete-container tooltip', {
          'float-left ml-3 tooltip-right tooltip-primary': isUser,
          'float-right mr-3 tooltip-left tooltip-secondary': !isUser,
        })}
        data-tip={`Delete ${isUser ? 'message' : 'response'}`}
      >
        <button
          key={buttonId}
          onClick={deleteMessage}
          type="button"
          className={clsx('w-6 h-6 p-0 m-0 mr-0 btn btn-xs', {
            'btn-primary text-primary-content': isUser,
            'btn-secondary text-secondary-content': !isUser,
          })}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    );
  }
);

DeleteMessage.displayName = 'DeleteMessage';

export default DeleteMessage;
