'use client';

import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track model per message ID
  const messageModelsRef = useRef<Map<string, string>>(new Map());
  // Track which message IDs have been saved to avoid re-saving on load
  const savedMessageIdsRef = useRef<Set<string>>(new Set());

  const parameters = useAtomValue(parametersAtom);
  const systemMessage = useAtomValue(systemMessageAtom);
  const userMeta = useAtomValue(userMetaAtom);

  const savedMessages = useLiveQuery(async () => {
    const messages = await database.messages.toArray();
    const sorted = messages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    // Store model in ref map for each message
    return sorted.map((msg) => {
      if (msg.model && msg.id) {
        messageModelsRef.current.set(msg.id, msg.model);
        savedMessageIdsRef.current.add(msg.id);
      }
      return msg as UIMessage;
    });
  }, []);

  const handleChatError = useCallback((error) => {
    console.error(error);
    // throw error;
  }, []);

  const addMessage = useCallback(
    async (message) => {
      await database.messages.put({
        id: message.id,
        role: message.role,
        parts: message.parts,
        model: message.model || parameters.model,
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
  const [attachments, setAttachments] = useState<
    {
      id: string;
      name: string;
      size: number;
      type: string;
      url: string;
      textContent?: string;
    }[]
  >([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

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
        const messageWithModel = { ...message, model: parameters.model };
        messageModelsRef.current.set(message.id, parameters.model);
        addMessage(messageWithModel);
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

  const handleFileSelectCb = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }

      const MAX_FILES_PER_MESSAGE = 3;
      const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
      const ALLOWED_TYPES = [
        'image/png',
        'image/jpeg',
        'image/webp',
        'text/plain',
        'text/markdown',
        'application/pdf',
      ];

      const currentCount = attachments.length;
      const remainingSlots = MAX_FILES_PER_MESSAGE - currentCount;

      if (remainingSlots <= 0) {
        setAttachmentError('You can attach up to 3 files per message.');
        return;
      }

      const filesArray = Array.from(files).slice(0, remainingSlots);
      let error: string | null = null;

      filesArray.forEach((file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
          error =
            'Unsupported file type. Allowed: PNG, JPEG, WEBP, TXT, MD, PDF.';
          return;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          error = 'File too large. Max size is 25 MB per file.';
          return;
        }

        const isTextFile =
          file.type === 'text/plain' || file.type === 'text/markdown';
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === 'string') {
            setAttachments((prev) => [
              ...prev,
              {
                id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2)}`,
                name: file.name,
                size: file.size,
                type: file.type,
                url: isTextFile ? '' : result,
                textContent: isTextFile ? result : undefined,
              },
            ]);
          }
        };
        if (isTextFile) {
          reader.readAsText(file);
        } else {
          reader.readAsDataURL(file);
        }
      });

      setAttachmentError(error);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [attachments]
  );

  const handleRemoveAttachmentCb = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  }, []);

  const handleSubmitCb = useCallback(
    (event) => {
      event.preventDefault();
      if (!input.trim() && attachments.length === 0) {
        return;
      }
      const parts: UIMessage['parts'] = [];
      if (input.trim()) {
        parts.push({ type: 'text', text: input.trim() });
      }

      attachments.forEach((att) => {
        if (att.textContent) {
          // Text files as text parts with filename prefix
          parts.push({
            type: 'text',
            text: `[File: ${att.name}]\n${att.textContent}`,
          });
        } else {
          // Images and PDFs as file parts
          parts.push({
            type: 'file',
            mediaType: att.type,
            url: att.url,
            name: att.name,
          } as never);
        }
      });

      sendMessage({ parts });
      setInput('');
      setAttachments([]);
      setAttachmentError(null);
    },
    [attachments, input, sendMessage]
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
      // Only save if this is a genuinely new message, not one loaded from DB
      const isNewMessage = !savedMessageIdsRef.current.has(lastMessage.id);

      // Save user messages immediately, assistant messages after loading completes
      if (
        isNewMessage &&
        (lastMessage.role === 'user' ||
          (lastMessage.role === 'assistant' && !isLoading))
      ) {
        addMessage(lastMessage);
        savedMessageIdsRef.current.add(lastMessage.id);
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
        messageModels={messageModelsRef.current}
        regenerate={regenerate}
        stop={stop}
        textAreaRef={textAreaRef}
      />
      <Footer
        formRef={formRef}
        fileInputRef={fileInputRef}
        onInputChange={handleInputChangeCb}
        onFileSelect={handleFileSelectCb}
        onRemoveAttachment={handleRemoveAttachmentCb}
        onSubmit={handleSubmitCb}
        input={input}
        attachments={attachments}
        attachmentError={attachmentError}
        isLoading={isLoading}
        model={parameters.model}
        systemMessageRef={systemMessageRef}
        textAreaRef={textAreaRef}
      />
    </ErrorBoundary>
  );
};

App.displayName = 'App';

export default App;
