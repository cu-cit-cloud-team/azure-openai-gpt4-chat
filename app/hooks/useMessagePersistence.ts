import type { UIMessage } from 'ai';
import { useCallback, useEffect, useRef } from 'react';
import { database } from '@/app/database/database.config';

/**
 * Extended UIMessage type with additional metadata we store
 */
type StoredMessage = UIMessage & {
  model: string;
  createdAt: string;
};

interface UseMessagePersistenceProps {
  messages: UIMessage[];
  isLoading: boolean;
  currentModel: string;
  savedMessages?: StoredMessage[];
}

export function useMessagePersistence({
  messages,
  isLoading,
  currentModel,
  savedMessages,
}: UseMessagePersistenceProps) {
  // Track model per message ID
  const messageModelsRef = useRef<Map<string, string>>(new Map());
  // Track which message IDs have been saved to avoid re-saving on load
  const savedMessageIdsRef = useRef<Set<string>>(new Set());
  // Track saved message count to avoid re-saving on load
  const savedMessageCountRef = useRef(0);

  // Track models for messages loaded from DB
  useEffect(() => {
    if (savedMessages) {
      savedMessages.forEach((msg) => {
        if (msg.model && msg.id) {
          messageModelsRef.current.set(msg.id, msg.model);
          savedMessageIdsRef.current.add(msg.id);
        }
      });
    }
  }, [savedMessages]);

  const addMessage = useCallback(async (message: StoredMessage) => {
    await database.messages.put({
      id: message.id,
      role: message.role,
      parts: message.parts,
      model: message.model,
      createdAt: message.createdAt,
    });
  }, []);

  // Save new messages to indexedDB when messages change
  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const isNewMessage = !savedMessageIdsRef.current.has(lastMessage.id);

    // Save user messages immediately, assistant messages after loading completes
    if (
      isNewMessage &&
      (lastMessage.role === 'user' ||
        (lastMessage.role === 'assistant' && !isLoading))
    ) {
      // Create StoredMessage with model and createdAt
      const storedMessage: StoredMessage = {
        ...lastMessage,
        model: currentModel,
        createdAt: new Date().toISOString(),
      };
      addMessage(storedMessage);
      savedMessageIdsRef.current.add(lastMessage.id);
      savedMessageCountRef.current = messages.length;
    }
  }, [addMessage, messages, isLoading, currentModel]);

  return {
    addMessage,
    messageModelsRef,
  };
}
