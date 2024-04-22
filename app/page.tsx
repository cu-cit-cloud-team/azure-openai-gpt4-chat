'use client';

import { useChat } from 'ai/react';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import useLocalStorageState from 'use-local-storage-state';

import { Footer } from '@/app/components/Footer';
import { Header } from '@/app/components/Header';
import { Messages } from '@/app/components/Messages';

import { useRefsContext } from '@/app/contexts/RefsContext';
import { useUserMetaContext } from '@/app/contexts/UserMetaContext';

import { getItem, removeItem } from '@/app/utils/localStorage';

import { database } from '@/app/database/database.config';

dayjs.extend(timezone);

export const App = () => {
  const { userMeta } = useUserMetaContext();
  const { formRef, textAreaRef } = useRefsContext();

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
      } catch (error) {
        console.error(error);
      }
    };
    migrateLocalStorage();
  }, []);

  const [systemMessage, setSystemMessage] = useLocalStorageState(
    'systemMessage',
    {
      defaultValue: 'You are a helpful AI assistant.',
    }
  );

  const [parameters] = useLocalStorageState('parameters', {
    defaultValue: {
      model: 'gpt-4',
      temperature: '1',
      top_p: '1',
      frequency_penalty: '0',
      presence_penalty: '0',
    },
  });

  const [savedMessages, setSavedMessages] = useState([]);

  const dbMessages = useLiveQuery(async () => {
    let messages = await database.messages.toArray();
    messages = messages.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    return messages;
  }, [database.messages]);

  useEffect(() => {
    if (dbMessages?.length) {
      setSavedMessages(dbMessages);
    }
  }, [dbMessages]);

  const handleChatError = useCallback((error) => {
    console.error(error);
    throw error;
  }, []);

  const addMessage = useCallback(async (message) => {
    await database.messages.put(message);
  }, []);

  const {
    error,
    handleInputChange,
    handleSubmit,
    input,
    isLoading,
    messages,
    reload,
    stop,
  } = useChat({
    api: `/api/chat?systemMessage=${encodeURIComponent(
      systemMessage
    )}&temperature=${encodeURIComponent(
      parameters.temperature
    )}&top_p=${encodeURIComponent(
      parameters.top_p
    )}&frequency_penalty=${encodeURIComponent(
      parameters.frequency_penalty
    )}&presence_penalty=${encodeURIComponent(
      parameters.presence_penalty
    )}&model=${encodeURIComponent(parameters.model)}`,
    id: userMeta?.email ? btoa(userMeta?.email) : undefined,
    initialMessages: savedMessages,
    onError: handleChatError,
    onFinish: (message) => addMessage(message),
  });

  // update indexedDB when messages changes
  useEffect(() => {
    if (messages?.length !== savedMessages?.length) {
      if (messages[messages.length - 1].role === 'user' || !isLoading) {
        addMessage(messages[messages.length - 1]);
      }
    }
  }, [addMessage, messages, savedMessages, isLoading]);

  // subscribe to storage change events so multiple tabs stay in sync
  useEffect(() => {
    const handleStorageChanges = (e) => {
      const keysToHandle = [
        'editorTheme',
        'parameters',
        'remainingTokens',
        'systemMessage',
        'theme',
        'tokens',
        'userMeta',
      ];
      const { key } = e;
      if (key && keysToHandle.includes(key)) {
        window.dispatchEvent(new Event('storage'));
      }
    };

    window.addEventListener('storage', handleStorageChanges);

    return () => {
      window.removeEventListener('storage', handleStorageChanges);
    };
  }, []);

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

  const textareaElement = textAreaRef.current;

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      event.stopPropagation();
      if (event.key === 'Escape' && event.metaKey) {
        if (confirm('Are you sure you want to clear the chat history?')) {
          clearHistory(false);
          window.location.reload();
        }
      }
      // if (event.key === 'Enter' && event.shiftKey) {
      //   console.log('new line');
      // }
      if (event.key === 'Enter' && !event.shiftKey) {
        if (event.target.value.trim().length) {
          event.preventDefault();
          if (formRef.current) {
            formRef.current.dispatchEvent(
              new Event('submit', { cancelable: true, bubbles: true })
            );
          }
        } else {
          event.preventDefault();
          return false;
        }
      }
    };
    if (textareaElement) {
      textareaElement.addEventListener('keydown', listener);
    }

    return () => {
      if (textareaElement) {
        textareaElement.removeEventListener('keydown', listener);
      }
    };
  }, [formRef, textareaElement, clearHistory]);

  const ErrorFallback = ({ error, resetErrorBoundary }) => {
    return (
      <dialog className="modal modal-bottom sm:modal-middle errorModal">
        <div className="w-11/12 max-w-5xl modal-box bg-error-content">
          <h3 className="text-lg font-bold text-error">Error</h3>
          <p className="py-4 text-error">{error?.message}</p>
          <div className="modal-action">
            <button
              type="button"
              className="btn btnReload text-error-content btn-error"
              onClick={() => {
                // resetErrorBoundary();
                window.location.reload();
              }}
            >
              Reload and try again
            </button>
          </div>
        </div>
      </dialog>
    );
  };

  return (
    <>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Header
          isLoading={isLoading}
          systemMessage={systemMessage}
          setSystemMessage={setSystemMessage}
          input={input}
          clearHistory={clearHistory}
        />
        <Messages
          isLoading={isLoading}
          messages={messages}
          savedMessages={savedMessages}
          error={error}
          reload={reload}
          stop={stop}
        />
        <Footer
          handleSubmit={handleSubmit}
          input={input}
          isLoading={isLoading}
          handleInputChange={handleInputChange}
        />
      </ErrorBoundary>
    </>
  );
};

export default App;
