'use client';

import { useChat } from '@ai-sdk/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { Footer } from '@/app/components/Footer';
import { Header } from '@/app/components/Header';
import { Messages } from '@/app/components/Messages';

import { database } from '@/app/database/database.config';

import { modelFromName } from '@/app/utils/models';
import { getEditorTheme } from '@/app/utils/themes';
import { getTokenCount } from '@/app/utils/tokens';

export const editorThemeAtom = atomWithStorage(
  'editorTheme',
  getEditorTheme('dark')
);
export const themeAtom = atomWithStorage('theme', 'dark');

export const systemMessageAtom = atomWithStorage(
  'systemMessage',
  'You are a helpful AI assistant.'
);

export const systemMessageMaxTokens = 4096;

export const parametersAtom = atomWithStorage('parameters', {
  model: 'gpt-4o',
  temperature: '1',
  top_p: '1',
  frequency_penalty: '0',
  presence_penalty: '0',
});

export const tokensAtom = atomWithStorage('tokens', {
  input: 0,
  maximum: 16384,
  remaining: 16384,
  systemMessage: 0,
  systemMessageRemaining: systemMessageMaxTokens,
});

export const userMetaAtom = atomWithStorage('userMeta', {});

export const App = () => {
  const systemMessageRef = useRef<HTMLTextAreaElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const parameters = useAtomValue(parametersAtom);
  const systemMessage = useAtomValue(systemMessageAtom);
  const userMeta = useAtomValue(userMetaAtom);

  const savedMessages = useLiveQuery(async () => {
    const messages = await database.messages.toArray();
    return messages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [database.messages]);

  const handleChatError = useCallback((error) => {
    console.error(error);
    // throw error;
  }, []);

  const addMessage = useCallback(
    async (message) => {
      await database.messages.put({
        ...message,
        model: parameters.model,
      });
    },
    [parameters.model]
  );

  const apiUrl = useMemo(
    () =>
      `/api/chat?systemMessage=${encodeURIComponent(
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
    [parameters, systemMessage]
  );

  const userId = useMemo(
    () => (userMeta?.email ? btoa(userMeta?.email) : undefined),
    [userMeta]
  );

  const {
    handleInputChange,
    handleSubmit,
    input,
    isLoading,
    messages,
    reload,
    stop,
  } = useChat({
    api: apiUrl,
    id: userId,
    initialMessages: savedMessages,
    onError: handleChatError,
    onFinish: addMessage,
  });

  // Derive token counts (stateless TokenCount reads these)
  const [tokens, setTokens] = useAtom(tokensAtom);
  useEffect(() => {
    const model = modelFromName(parameters.model);
    const maxTokens = model?.maxInputTokens || 16384;
    const inputCount = input ? getTokenCount(input) : 0;
    const systemMessageCount = systemMessage ? getTokenCount(systemMessage) : 0;
    const remaining = maxTokens - (inputCount + systemMessageCount);
    const systemRemaining = systemMessageMaxTokens - systemMessageCount;
    const shouldUpdate =
      tokens.input !== inputCount ||
      tokens.maximum !== maxTokens ||
      tokens.remaining !== remaining ||
      tokens.systemMessage !== systemMessageCount ||
      tokens.systemMessageRemaining !== systemRemaining;
    if (shouldUpdate) {
      setTokens({
        input: inputCount,
        maximum: maxTokens,
        remaining,
        systemMessage: systemMessageCount,
        systemMessageRemaining: systemRemaining,
      });
    }
  }, [input, systemMessage, parameters.model, tokens, setTokens]);

  const handleInputChangeCb = useCallback(
    (event) => {
      handleInputChange(event);
    },
    [handleInputChange]
  );

  const handleSubmitCb = useCallback(
    (event) => {
      handleSubmit(event);
    },
    [handleSubmit]
  );

  const reloadCb = useCallback(() => {
    reload();
  }, [reload]);

  const stopCb = useCallback(() => {
    stop();
  }, [stop]);

  const memoizedMessages = useMemo(() => messages, [messages]);

  // update indexedDB when messages changes
  useEffect(() => {
    if (savedMessages && savedMessages?.length !== messages?.length) {
      if (messages[messages.length - 1]?.role === 'user' || !isLoading) {
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
  }, [textareaElement]);

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

  ErrorFallback.displayName = 'ErrorFallback';

  return (
    <>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Header
          input={input}
          isLoading={isLoading}
          systemMessageRef={systemMessageRef}
        />
        <Messages
          isLoading={isLoading}
          messages={memoizedMessages}
          reload={reloadCb}
          stop={stopCb}
          textAreaRef={textAreaRef}
        />
        <Footer
          formRef={formRef}
          handleInputChange={handleInputChangeCb}
          handleSubmit={handleSubmitCb}
          input={input}
          isLoading={isLoading}
          systemMessageRef={systemMessageRef}
          textAreaRef={textAreaRef}
        />
      </ErrorBoundary>
    </>
  );
};

App.displayName = 'App';

export default App;
