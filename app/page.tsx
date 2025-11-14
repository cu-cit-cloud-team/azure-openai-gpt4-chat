'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { Footer } from '@/app/components/Footer';
import { Header } from '@/app/components/Header';
import { Messages } from '@/app/components/Messages';

import { database } from '@/app/database/database.config';

import {
  convertV4MessageToV5,
  convertV5MessageToV4,
  type MyUIMessage,
} from '@/app/utils/conversion';
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

export const isLoadingAtom = atomWithStorage('isLoading', false);

export const App = () => {
  const systemMessageRef = useRef<HTMLTextAreaElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const parameters = useAtomValue(parametersAtom);
  const systemMessage = useAtomValue(systemMessageAtom);
  const userMeta = useAtomValue(userMetaAtom);

  const savedMessages = useLiveQuery(async () => {
    const messages = await database.messages.toArray();
    const sorted = messages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    // Convert v4 messages from database to v5 format
    return sorted.map((msg, index) =>
      // @ts-expect-error - Converting from Dexie schema to AI SDK types
      convertV4MessageToV5(msg, index)
    ) as MyUIMessage[];
  }, []);

  const handleChatError = useCallback((error) => {
    console.error(error);
    // throw error;
  }, []);

  const addMessage = useCallback(
    async (message) => {
      // Convert v5 message to v4 format for database storage
      const v4Message = convertV5MessageToV4(message as MyUIMessage);
      await database.messages.put({
        ...v4Message,
        model: parameters.model,
        createdAt: message.createdAt || new Date().toISOString(),
      });
    },
    [parameters.model]
  );

  const userId = useMemo(
    () => (userMeta?.email ? btoa(userMeta?.email) : undefined),
    [userMeta]
  );
  const [input, setInput] = useState('');

  // Create transport that updates when parameters change
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        prepareSendMessagesRequest: ({ messages }) => {
          return {
            body: {
              messages,
              systemMessage,
              parameters,
              id: userId,
            },
          };
        },
      }),
    [parameters, systemMessage, userId]
  );

  const { messages, setMessages, sendMessage, regenerate, stop, status } =
    useChat({
      id: `${userId}-chat-${parameters.model}-${parameters.temperature}-${parameters.top_p}-${parameters.frequency_penalty}-${parameters.presence_penalty}`,
      initialMessages: savedMessages || [],
      transport,
      onError: handleChatError,
      onFinish: ({ message }) => {
        addMessage(message);
      },
    });

  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);

  setIsLoading(status === 'streaming' || status === 'submitted');

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

  const handleInputChangeCb = useCallback((value: string) => {
    setInput(value);
  }, []);

  const handleSubmitCb = useCallback(
    (event) => {
      event.preventDefault();
      if (!input.trim()) {
        return;
      }
      sendMessage({ text: input });
      setInput('');
    },
    [input, sendMessage]
  );

  const memoizedMessages = useMemo(() => messages, [messages]);

  // Load saved messages into chat when they're available
  useEffect(() => {
    if (savedMessages && savedMessages.length > 0 && messages.length === 0) {
      setMessages(savedMessages);
    }
  }, [savedMessages, messages.length, setMessages]);

  // Save new messages to indexedDB when messages change
  // Track saved message count to avoid re-saving on load
  const savedMessageCountRef = useRef(0);
  useEffect(() => {
    if (messages.length > savedMessageCountRef.current) {
      const lastMessage = messages[messages.length - 1];
      // Save user messages immediately, assistant messages after loading completes
      if (
        lastMessage.role === 'user' ||
        (lastMessage.role === 'assistant' && !isLoading)
      ) {
        addMessage(lastMessage);
        savedMessageCountRef.current = messages.length;
      }
    }
  }, [addMessage, messages, isLoading]);

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
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Header
        input={input}
        isLoading={isLoading}
        systemMessageRef={systemMessageRef}
      />
      <Messages
        isLoading={isLoading}
        messages={memoizedMessages}
        regenerate={regenerate}
        stop={stop}
        textAreaRef={textAreaRef}
      />
      <Footer
        formRef={formRef}
        onInputChange={handleInputChangeCb}
        onSubmit={handleSubmitCb}
        input={input}
        isLoading={isLoading}
        systemMessageRef={systemMessageRef}
        textAreaRef={textAreaRef}
      />
    </ErrorBoundary>
  );
};

App.displayName = 'App';

export default App;
