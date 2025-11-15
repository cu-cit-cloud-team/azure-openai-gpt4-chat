import { faArrowRotateForward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { nanoid } from 'nanoid';
import { memo, useCallback, useMemo } from 'react';

import { database } from '@/app/database/database.config';

interface ReloadMessageProps {
  isUser: boolean;
  messageId: string;
  regenerate(...args: unknown[]): unknown;
}

export const ReloadMessage = memo(
  ({ isUser, messageId, regenerate }: ReloadMessageProps) => {
    const buttonKey = useMemo(() => nanoid(), []);

    const reloadMessage = useCallback(async () => {
      const deleteFromDb = async () => {
        await database.messages.where('id').equals(messageId).delete();
      };

      const confirmMessage = isUser
        ? 'Are you sure you want to regenerate from this message? This will resend your message and generate a new response.'
        : 'Are you sure you want to regenerate this response? Doing so will remove the current response from the chat history.';

      if (confirm(confirmMessage)) {
        // Only delete assistant messages from DB; user messages should be kept
        if (!isUser) {
          await deleteFromDb();
        }
        regenerate();
      }
    }, [messageId, regenerate, isUser]);

    return (
      <div
        className={clsx('reload-container tooltip', {
          'tooltip-right tooltip-primary float-left ml-10': isUser,
          'tooltip-left tooltip-secondary float-right mr-10': !isUser,
        })}
        data-tip={'Regenerate response'}
      >
        <button
          key={buttonKey}
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
    );
  }
);

ReloadMessage.displayName = 'ReloadMessage';

export default ReloadMessage;
