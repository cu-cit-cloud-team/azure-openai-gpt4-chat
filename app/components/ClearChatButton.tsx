import { faEraser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { UIMessage } from 'ai';
import clsx from 'clsx';
import { memo, useCallback } from 'react';

import { useClearMessages } from '@/app/hooks/useClearMessages';

interface ClearChatButtonProps {
  buttonText?: string;
  isLoading: boolean;
  setMessages: (messages: UIMessage[]) => void;
  focusTextarea: () => void;
}

export const ClearChatButton = memo(
  ({
    buttonText = 'Clear Chat',
    isLoading,
    setMessages,
    focusTextarea,
  }: ClearChatButtonProps) => {
    const clearMessages = useClearMessages(setMessages);

    const clearHistory = useCallback(
      async (doConfirm = true) => {
        if (!doConfirm) {
          await clearMessages();
          focusTextarea();
        } else if (
          confirm('Are you sure you want to clear the chat history?')
        ) {
          await clearMessages();
          focusTextarea();
        }
      },
      [clearMessages, focusTextarea]
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
