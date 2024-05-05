import { faArrowRotateForward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { nanoid } from 'nanoid';
import { memo, useCallback } from 'react';

import { database } from '@/app/database/database.config';

export const ReloadMessage = memo(({ isUser, message, reload }) => {
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
      className={clsx('reload-container float-right mr-10 tooltip', {
        'tooltip-right tooltip-primary': isUser,
        'tooltip-left tooltip-secondary': !isUser,
      })}
      data-tip={'Regenerate response'}
    >
      <button
        key={nanoid()}
        onClick={reloadMessage}
        type="button"
        className={clsx('w-6 h-6 p-0 m-0 mr-0 btn btn-xs', {
          'btn-primary text-primary-content': isUser,
          'btn-secondary text-secondary-content': !isUser,
        })}
      >
        <FontAwesomeIcon icon={faArrowRotateForward} />
      </button>
    </div>
  ) : null;
});

ReloadMessage.displayName = 'ReloadMessage';

export default ReloadMessage;
