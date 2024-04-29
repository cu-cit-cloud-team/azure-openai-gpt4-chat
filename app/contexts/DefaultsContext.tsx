'use client';

import { useTheme } from 'next-themes';
import propTypes from 'prop-types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import useLocalStorageState from 'use-local-storage-state';

import { getItem, removeItem } from '@/app/utils/localStorage';
import { getEditorTheme } from '@/app/utils/themes';

import { database } from '@/app/database/database.config';

export const DefaultsContext = createContext(null);
export const DefaultsUpdaterContext = createContext(null);

export const useDefaultsContext = () => {
  const context = useContext(DefaultsContext);
  if (context === null) {
    throw new Error(
      'useDefaultsContext must be used within a DefaultsProvider'
    );
  }
  return context;
};

export const useDefaultsUpdaterContext = () => {
  const context = useContext(DefaultsUpdaterContext);
  if (context === null) {
    throw new Error(
      'useDefaultsUpdaterContext must be used within a DefaultsProvider'
    );
  }
  return context;
};

export const DefaultsProvider = ({ children }) => {
  const { theme, setTheme } = useTheme();

  // migrate localStorage to indexedDB
  useEffect(() => {
    const migrateLocalStorage = async () => {
      try {
        const messages = getItem('messages');
        if (messages) {
          await database.transaction('rw', database.messages, async () => {
            for await (const message of messages) {
              await database.messages.put(message);
            }
            removeItem('messages');
          });
        }
        return;
      } catch (error) {
        console.error(error);
      }
    };
    migrateLocalStorage();
  }, []);

  const [editorTheme, setEditorTheme] = useLocalStorageState('editorTheme', {
    defaultValue: getEditorTheme(theme),
  });

  const [systemMessage, setSystemMessage] = useLocalStorageState(
    'systemMessage',
    {
      defaultValue: 'You are a helpful AI assistant.',
    }
  );

  const [parameters, setParameters] = useLocalStorageState('parameters', {
    defaultValue: {
      model: 'gpt-4',
      temperature: '1',
      top_p: '1',
      frequency_penalty: '0',
      presence_penalty: '0',
    },
  });

  const maxTokens = useMemo(() => {
    return parameters?.model === 'gpt-4' ? 128000 : 16384;
  }, [parameters]);

  const systemMessageMaxTokens = 400;

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

  const handleChatError = useCallback((error) => {
    console.error(error);
    // throw error;
  }, []);

  const addMessage = useCallback(async (message) => {
    await database.messages.put(message);
  }, []);

  return (
    <DefaultsContext.Provider
      value={{
        editorTheme,
        maxTokens,
        parameters,
        systemMessage,
        systemMessageMaxTokens,
        theme,
      }}
    >
      <DefaultsUpdaterContext.Provider
        value={{
          addMessage,
          clearHistory,
          handleChatError,
          setEditorTheme,
          setParameters,
          setSystemMessage,
          setTheme,
        }}
      >
        {children}
      </DefaultsUpdaterContext.Provider>
    </DefaultsContext.Provider>
  );
};

DefaultsProvider.displayName = 'DefaultsProvider';
DefaultsProvider.propTypes = {
  children: propTypes.node.isRequired,
};

export default DefaultsProvider;
