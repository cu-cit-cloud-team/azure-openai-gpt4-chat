import type { UIMessage } from 'ai';
import { useCallback } from 'react';

import { database } from '@/app/database/database.config';

/**
 * Hook to clear all messages from both IndexedDB and UI state
 * Provides a consistent way to clear messages across the app
 */
export function useClearMessages(
  setMessages: (messages: UIMessage[]) => void,
  chatId?: string
) {
  return useCallback(async () => {
    try {
      if (chatId) {
        // Delete only messages for the given chatId
        await database.messages.where('chatId').equals(chatId).delete();
      } else {
        await database.messages.clear();
      }

      // Dexie's useLiveQuery will update, but we also clear immediately for instant feedback
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear messages:', error);
      throw error;
    }
  }, [setMessages, chatId]);
}
