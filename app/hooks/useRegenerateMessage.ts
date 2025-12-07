import type { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { useCallback } from 'react';
import { database } from '@/app/database/database.config';

export const useRegenerateMessage = (
  messages: UIMessage[],
  setMessages: React.Dispatch<React.SetStateAction<UIMessage[]>>,
  sendMessage: UseChatHelpers['append']
) => {
  const handleRegenerateResponse = useCallback(
    async (messageId: string) => {
      try {
        const messageIndex = messages.findIndex((m) => m.id === messageId);
        if (messageIndex === -1) {
          return;
        }

        const message = messages[messageIndex];
        const isUserMessage = message.role === 'user';

        if (isUserMessage) {
          const messagesToKeep = messages.slice(0, messageIndex);
          const messageIdsToDelete = messages
            .slice(messageIndex)
            .map((m) => m.id);
          await database.messages.bulkDelete(messageIdsToDelete);
          setMessages(messagesToKeep);

          setTimeout(() => {
            if (message.parts && Array.isArray(message.parts)) {
              sendMessage({ parts: message.parts });
            }
          }, 10);
        } else {
          let lastUserIndex = -1;
          for (let i = messageIndex - 1; i >= 0; i -= 1) {
            if (messages[i].role === 'user') {
              lastUserIndex = i;
              break;
            }
          }
          if (lastUserIndex === -1) {
            return;
          }

          const messagesToKeep = messages.slice(0, lastUserIndex);
          const userMessage = messages[lastUserIndex];
          const messageIdsToDelete = messages
            .slice(lastUserIndex)
            .map((m) => m.id);
          await database.messages.bulkDelete(messageIdsToDelete);
          setMessages(messagesToKeep);

          setTimeout(() => {
            if (userMessage.parts && Array.isArray(userMessage.parts)) {
              sendMessage({ parts: userMessage.parts });
            }
          }, 10);
        }
      } catch (error) {
        console.error('Error regenerating response:', error);
      }
    },
    [messages, sendMessage, setMessages]
  );

  return { handleRegenerateResponse } as const;
};
