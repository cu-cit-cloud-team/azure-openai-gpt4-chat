import { faEraser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { memo, useCallback } from 'react';

import { database } from '@/app/database/database.config';

interface ClearChatButtonProps {
  buttonText?: string;
  isLoading: boolean;
}

export const ClearChatButton = memo(
  ({ buttonText = 'Clear Chat', isLoading }: ClearChatButtonProps) => {
    const clearHistory = useCallback(async (doConfirm = true) => {
      const clearMessages = async () => {
        try {
          await database.messages.clear();
        } catch (error) {
          console.error(error);
        }
      };

      if (!doConfirm) {
        await clearMessages();
        window.location.reload();
      } else if (confirm('Are you sure you want to clear the chat history?')) {
        await clearMessages();
        window.location.reload();
      }
    }, []);

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

export default ClearChatButton;
