'use client';

import { useChat } from 'ai/react';
import axios from 'axios';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import useLocalStorageState from 'use-local-storage-state';

import { Footer } from './components/Footer.tsx';
import { Header } from './components/Header.tsx';
import { Messages } from './components/Messages.tsx';

import { getItem, removeItem, setItem } from './utils/localStorage.ts';

import { messagesTable } from './database/database.config';

dayjs.extend(timezone);

export const App = () => {
  // migrate localStorage to indexedDB
  useEffect(() => {
    const migrateLocalStorage = async () => {
      try {
        const messages = getItem('messages');
        if (messages) {
          for await (const message of messages) {
            messagesTable.put(message);
          }
          removeItem('messages');
        }
      } catch (error) {
        console.error(error);
      }
    };
    migrateLocalStorage();
  }, []);

  const [userMeta, setUserMeta] = useLocalStorageState('userMeta', {
    defaultValue: {},
  });

  useEffect(() => {
    if (userMeta?.email && userMeta?.name) {
      return;
    }
    const getUserMeta = async () => {
      await axios
        .get('/.auth/me', {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0',
          },
        })
        .then((response) => {
          const email = response?.data[0]?.user_claims.find(
            (item) => item.typ === 'preferred_username'
          ).val;

          const name = response?.data[0]?.user_claims.find(
            (item) => item.typ === 'name'
          ).val;

          const user_id = response?.data[0]?.user_id;

          const expires_on = response?.data[0]?.expires_on;

          setUserMeta({
            email,
            name,
            user_id,
            expires_on,
          });
        })
        // biome-ignore lint/correctness/noUnusedVariables: used for debugging
        .catch((error) => {
          // console.error(error);
        });
    };
    getUserMeta();
  }, [userMeta, setUserMeta]);

  const systemMessageRef = useRef<HTMLTextAreaElement>(null);

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

  const dbMessages = useLiveQuery(
    () => messagesTable.toArray(),
    [messagesTable]
  );

  useEffect(() => {
    if (dbMessages) {
      setSavedMessages(
        dbMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      );
    }
  }, [dbMessages]);

  const handleChatError = (error) => {
    console.error(error);
    throw error;
  };

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
  });

  // update indexedDB when messages changes
  useEffect(() => {
    if (messages?.length !== savedMessages?.length) {
      if (messages[messages.length - 1].role === 'user' || !isLoading) {
        messagesTable.put(messages[messages.length - 1]);
      }
    }
  }, [messages, savedMessages, isLoading]);

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

  const formRef = useRef<HTMLFormElement>(null);
  const submitForm = useCallback(() => {
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }
  }, []);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const textareaElement = textAreaRef.current;

  const clearHistory = useCallback((doConfirm = true) => {
    const clearMessages = async () => {
      try {
        const messages = await messagesTable.toArray();
        for await (const message of messages) {
          messagesTable.delete(message.id);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (!doConfirm) {
      clearMessages();
      window.location.reload();
    } else if (confirm('Are you sure you want to clear the chat history?')) {
      clearMessages();
      window.location.reload();
    }
  }, []);

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
          submitForm();
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
  }, [textareaElement, submitForm, clearHistory]);

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
          systemMessageRef={systemMessageRef}
          input={input}
          userMeta={userMeta}
          clearHistory={clearHistory}
        />
        <Messages
          isLoading={isLoading}
          messages={messages}
          userMeta={userMeta}
          savedMessages={savedMessages}
          error={error}
          reload={reload}
          stop={stop}
        />
        <Footer
          formRef={formRef}
          systemMessageRef={systemMessageRef}
          textAreaRef={textAreaRef}
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
