import { faEraser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { UIMessage } from 'ai';
import clsx from 'clsx';
import { memo, useCallback } from 'react';

import { database } from '@/app/database/database.config';

interface ClearChatButtonProps {
  buttonText?: string;
  isLoading: boolean;
  setMessages: (messages: UIMessage[]) => void;
}

export const ClearChatButton = memo(
  ({
    buttonText = 'Clear Chat',
    isLoading,
    setMessages,
  }: ClearChatButtonProps) => {
    const clearHistory = useCallback(
      async (doConfirm = true) => {
        const clearMessages = async () => {
          try {
            await database.messages.clear();
            // Dexie's useLiveQuery will update, but we also clear immediately for instant feedback
            setMessages([]);
          } catch (error) {
            console.error(error);
          }
        };

        if (!doConfirm) {
          await clearMessages();
        } else if (
          confirm('Are you sure you want to clear the chat history?')
        ) {
          await clearMessages();
        }
      },
      [setMessages]
    );

    return (
      <>
        <button
          type="button"
          onClick={clearHistory}
          className={clsx({
            'pointer-events-none opacity-50': isLoading,
          })}
        >
          <FontAwesomeIcon icon={faEraser} />
          {buttonText}
        </button>
      </>
    );
  }
);

ClearChatButton.displayName = 'ClearChatButton';

export default ClearChatButton;
