import type { UIMessage } from 'ai';
import { useCallback, useEffect, useRef } from 'react';
import { database } from '@/app/database/database.config';
import { hasMessageContent } from '@/app/utils/messageHelpers';

/**
 * Extended UIMessage type with additional metadata we store when persisting.
 * This internal type always has model and createdAt defined.
 */
type PersistedMessage = UIMessage & {
  model: string;
  createdAt: string;
};

// External stored message shape coming from callers (e.g. page.tsx)
// where model/createdAt may be missing on older rows.
export type StoredMessage = UIMessage & {
  model?: string;
  createdAt?: string;
  chatId?: string;
};

interface UseMessagePersistenceProps {
  messages: UIMessage[];
  isLoading: boolean;
  currentModel: string;
  savedMessages?: StoredMessage[];
  chatId?: string;
}

export function useMessagePersistence({
  messages,
  isLoading,
  currentModel,
  savedMessages,
  chatId = 'local-chat',
}: UseMessagePersistenceProps) {
  // Track model per message ID (for messages already in IndexedDB)
  const messageModelsRef = useRef<Map<string, string>>(new Map());
  // Track which message IDs have been saved to avoid re-saving
  const savedMessageIdsRef = useRef<Set<string>>(new Set());
  // Ensure we only seed from savedMessages once
  const hasSeededFromSavedRef = useRef(false);

  // Seed tracking state from messages loaded from IndexedDB once on mount
  useEffect(() => {
    if (!savedMessages || hasSeededFromSavedRef.current) {
      return;
    }

    for (const msg of savedMessages) {
      if (msg.id) {
        savedMessageIdsRef.current.add(msg.id);
        if (msg.model) {
          messageModelsRef.current.set(msg.id, msg.model);
        }
      }
    }

    hasSeededFromSavedRef.current = true;
  }, [savedMessages]);

  const addMessage = useCallback(
    async (message: PersistedMessage) => {
      if (!message.id) {
        return;
      }

      // Skip if we've already persisted this message
      if (savedMessageIdsRef.current.has(message.id)) {
        return;
      }

      // Validate message has actual content before persisting
      // This prevents empty/failed messages from being saved to IndexedDB
      if (!hasMessageContent(message)) {
        console.warn('Skipping persistence of empty message:', message.id);
        return;
      }

      // Mark as saved to prevent re-entrancy while persisting
      savedMessageIdsRef.current.add(message.id);

      try {
        await database.messages.put({
          id: message.id,
          chatId,
          role: message.role,
          parts: message.parts,
          model: message.model,
          createdAt: message.createdAt,
        });
        messageModelsRef.current.set(message.id, message.model);
      } catch (error) {
        // Roll back the optimistic "saved" flag on failure
        savedMessageIdsRef.current.delete(message.id);
        throw error;
      }
    },
    [chatId]
  );

  // Save new messages to IndexedDB when messages change
  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const isNewMessage = lastMessage?.id
      ? !savedMessageIdsRef.current.has(lastMessage.id)
      : false;

    if (!isNewMessage) {
      return;
    }

    // Save user messages immediately, assistant messages only after loading completes
    if (
      lastMessage.role === 'user' ||
      (lastMessage.role === 'assistant' && !isLoading)
    ) {
      const storedMessage: PersistedMessage = {
        ...lastMessage,
        model: currentModel,
        createdAt: new Date().toISOString(),
      };
      void addMessage(storedMessage);
    }
  }, [addMessage, messages, isLoading, currentModel]);

  return {
    addMessage,
    messageModelsRef,
  };
}
