'use client';

import { useChat } from 'ai/react';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { useLiveQuery } from 'dexie-react-hooks';
import { memo, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { Footer } from '@/app/components/Footer';
import { Header } from '@/app/components/Header';
import { Messages } from '@/app/components/Messages';

import {
  useDefaultsContext,
  useDefaultsUpdaterContext,
} from '@/app/contexts/DefaultsContext';
import { useRefsContext } from '@/app/contexts/RefsContext';
import { useUserMetaContext } from '@/app/contexts/UserMetaContext';

import { database } from '@/app/database/database.config';

dayjs.extend(timezone);

export const App = () => {
  const { parameters, systemMessage } = useDefaultsContext();
  const { addMessage, clearHistory, handleChatError, setSystemMessage } =
    useDefaultsUpdaterContext();
  const { userMeta } = useUserMetaContext();
  const { formRef, textAreaRef } = useRefsContext();

  const savedMessages = useLiveQuery(async () => {
    let messages = await database.messages.toArray();
    messages = messages.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    return messages;
  }, [database.messages]);

  const {
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
    onFinish: addMessage,
  });

  // update indexedDB when messages changes
  useEffect(() => {
    if (savedMessages && savedMessages?.length !== messages?.length) {
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

  const ErrorFallback = memo(({ error, resetErrorBoundary }) => {
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
                resetErrorBoundary();
                window.location.reload();
              }}
            >
              Reload and try again
            </button>
          </div>
        </div>
      </dialog>
    );
  });

  return (
    <>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Header
          isLoading={isLoading}
          systemMessage={systemMessage}
          setSystemMessage={setSystemMessage}
          input={input}
        />
        <Messages
          isLoading={isLoading}
          messages={messages}
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
