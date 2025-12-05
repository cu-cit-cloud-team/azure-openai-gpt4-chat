'use client';

import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { DefaultChatTransport } from 'ai';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';

import { Footer } from '@/app/components/Footer';
import { Header } from '@/app/components/Header';
import { Messages } from '@/app/components/Messages';

import { database } from '@/app/database/database.config';
import { useFileUpload } from '@/app/hooks/useFileUpload';
import { useFocusTextarea } from '@/app/hooks/useFocusTextarea';
import { useMessagePersistence } from '@/app/hooks/useMessagePersistence';
import { getLanguageFromFilename } from '@/app/utils/fileHelpers';
import { defaultModel, modelFromName } from '@/app/utils/models';
import { getEditorTheme } from '@/app/utils/themes';
import { getTokenCount } from '@/app/utils/tokens';

/**
 * Extended UIMessage type with additional metadata we store
 */
type StoredMessage = UIMessage & {
  model: string;
  createdAt: string;
};

type FilePart = {
  type: 'file';
  mediaType: string;
  url: string;
  name: string;
};

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

export const modelAtom = atomWithStorage(
  'model',
  defaultModel?.name || 'gpt-5'
);

// get tokens for default model
const tokensRemaining = defaultModel?.maxInputTokens || 272000;

export const tokensAtom = atomWithStorage('tokens', {
  input: 0,
  maximum: tokensRemaining,
  remaining: tokensRemaining,
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

  const focusTextarea = useFocusTextarea(textAreaRef, systemMessageRef);

  const modelName = useAtomValue(modelAtom);
  const systemMessage = useAtomValue(systemMessageAtom);
  const userMeta = useAtomValue(userMetaAtom);
  const editorTheme = useAtomValue(editorThemeAtom);

  const savedMessages = useLiveQuery(async () => {
    const messages = await database.messages.toArray();
    const sorted = messages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return sorted as StoredMessage[];
  }, []);

  const handleChatError = useCallback((error: Error | { message?: string }) => {
    console.error(error);
    setChatError(error?.message || 'An error occurred. Please try again.');
  }, []);

  const userId = useMemo(
    () => (userMeta?.email ? btoa(userMeta?.email) : undefined),
    [userMeta]
  );
  const [input, setInput] = useState('');
  const [modalImageUrl, setModalImageUrl] = useState<{
    url: string;
    filename: string;
  } | null>(null);
  const [modalTextFile, setModalTextFile] = useState<{
    content: string;
    filename: string;
    mediaType: string;
  } | null>(null);
  const [modalPdfFile, setModalPdfFile] = useState<{
    url: string;
    filename: string;
  } | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  // File upload management
  const {
    attachments,
    attachmentError,
    handleFileSelect: handleFileSelectBase,
    handleRemoveAttachment: handleRemoveAttachmentBase,
    clearAttachments,
  } = useFileUpload();

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      handleFileSelectBase(files);
      if (files && files.length > 0) {
        focusTextarea();
      }
    },
    [handleFileSelectBase, focusTextarea]
  );

  const handleRemoveAttachment = useCallback(
    (id: string) => {
      handleRemoveAttachmentBase(id);
      focusTextarea();
    },
    [handleRemoveAttachmentBase, focusTextarea]
  );

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
              model: modelName,
              id: userId,
            },
          };
        },
      }),
    [modelName, systemMessage, userId]
  );

  const { messages, setMessages, sendMessage, regenerate, stop, status } =
    useChat({
      id: `${userId}-chat-${modelName}`,
      initialMessages: savedMessages || [],
      transport,
      onError: handleChatError,
      onFinish: ({ message }) => {
        const messageWithModel: StoredMessage = {
          ...message,
          model: modelName,
          createdAt: new Date().toISOString(),
        };
        addMessage(messageWithModel);
      },
    });

  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);

  useEffect(() => {
    setIsLoading(status === 'streaming' || status === 'submitted');
  }, [status, setIsLoading]);

  // Message persistence - hook now handles tracking models from DB
  const { addMessage, messageModelsRef } = useMessagePersistence({
    messages,
    isLoading,
    currentModel: modelName,
    savedMessages,
  });

  // Derive token counts with useMemo - automatically recalculates only when dependencies change
  const derivedTokens = useMemo(() => {
    const model = modelFromName(modelName);
    const maxTokens = model?.maxInputTokens || 16384;
    const inputCount = input ? getTokenCount(input) : 0;
    const systemMessageCount = systemMessage ? getTokenCount(systemMessage) : 0;
    const remaining = maxTokens - (inputCount + systemMessageCount);
    const systemRemaining = systemMessageMaxTokens - systemMessageCount;

    return {
      input: inputCount,
      maximum: maxTokens,
      remaining,
      systemMessage: systemMessageCount,
      systemMessageRemaining: systemRemaining,
    };
  }, [input, systemMessage, modelName]);

  // Sync derived tokens to atom for persistence and cross-component access
  const setTokens = useSetAtom(tokensAtom);
  useEffect(() => {
    setTokens(derivedTokens);
  }, [derivedTokens, setTokens]);

  const handleInputChangeCb = useCallback((value: string) => {
    setInput(value);
  }, []);

  const imageModalRef = useRef<HTMLDialogElement>(null);
  const textModalRef = useRef<HTMLDialogElement>(null);
  const pdfModalRef = useRef<HTMLDialogElement>(null);

  const handleFileClickCb = useCallback(
    (file: {
      type: string;
      mediaType: string;
      url?: string;
      textContent?: string;
      name?: string;
    }) => {
      if (file.mediaType.startsWith('image/')) {
        setModalImageUrl({
          url: file.url || '',
          filename: file.name || 'image',
        });
      } else if (file.mediaType === 'application/pdf') {
        setModalPdfFile({
          url: file.url || '',
          filename: file.name || 'document.pdf',
        });
      } else if (file.textContent) {
        setModalTextFile({
          content: file.textContent,
          filename: file.name || 'file.txt',
          mediaType: file.mediaType,
        });
      }
    },
    []
  );

  // Open image modal after it mounts to avoid first-click race condition
  useEffect(() => {
    if (modalImageUrl && imageModalRef.current && !imageModalRef.current.open) {
      imageModalRef.current.showModal();
    }
  }, [modalImageUrl]);

  // Open text file modal after it mounts
  useEffect(() => {
    if (modalTextFile && textModalRef.current && !textModalRef.current.open) {
      textModalRef.current.showModal();
    }
  }, [modalTextFile]);

  // Open PDF modal after it mounts
  useEffect(() => {
    if (modalPdfFile && pdfModalRef.current && !pdfModalRef.current.open) {
      pdfModalRef.current.showModal();
    }
  }, [modalPdfFile]);

  const handleKeyDownCb = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        const value = event.currentTarget.value;
        if (value.trim().length) {
          event.preventDefault();
          if (formRef.current) {
            formRef.current.dispatchEvent(
              new Event('submit', { cancelable: true, bubbles: true })
            );
          }
        } else {
          event.preventDefault();
        }
      }
    },
    []
  );

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
          const filePart: FilePart = {
            type: 'file',
            mediaType: att.type,
            url: att.url,
            name: att.name,
          };
          parts.push(filePart);
        }
      });

      sendMessage({ parts });
      setInput('');
      clearAttachments();
    },
    [attachments, input, sendMessage, clearAttachments]
  );

  // Load saved messages into chat when they're available
  // Model tracking is now handled inside useMessagePersistence hook
  useEffect(() => {
    if (savedMessages) {
      setMessages(savedMessages);
    }
  }, [savedMessages, setMessages]);

  // subscribe to storage change events so multiple tabs stay in sync
  useEffect(() => {
    const handleStorageChanges = (e: StorageEvent) => {
      // Only reload atom values when storage actually changes in another tab
      // Don't dispatch new storage events to avoid infinite loops
      const keysToHandle = [
        'editorTheme',
        'model',
        'systemMessage',
        'theme',
        'tokens',
        'userMeta',
      ];
      if (e.key && keysToHandle.includes(e.key)) {
        // The atoms will automatically sync from localStorage
        // No need to dispatch additional events
      }
    };

    window.addEventListener('storage', handleStorageChanges);

    return () => {
      window.removeEventListener('storage', handleStorageChanges);
    };
  }, []);

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
        chatError={chatError}
        onClearError={() => setChatError(null)}
        setMessages={setMessages}
        focusTextarea={focusTextarea}
      />
      <Messages
        isLoading={isLoading}
        messages={messages}
        messageModels={messageModelsRef.current}
        regenerate={regenerate}
        stop={stop}
        textAreaRef={textAreaRef}
        onFileClick={handleFileClickCb}
        focusTextarea={focusTextarea}
      />
      <Footer
        formRef={formRef}
        fileInputRef={fileInputRef}
        onInputChange={handleInputChangeCb}
        onFileSelect={handleFileSelect}
        onRemoveAttachment={handleRemoveAttachment}
        onSubmit={handleSubmitCb}
        onKeyDown={handleKeyDownCb}
        input={input}
        attachments={attachments}
        attachmentError={attachmentError}
        isLoading={isLoading}
        model={modelName}
        systemMessageRef={systemMessageRef}
        textAreaRef={textAreaRef}
      />
      {/* Image modal */}
      {modalImageUrl && (
        <dialog
          ref={imageModalRef}
          className="modal"
          onClose={() => setModalImageUrl(null)}
        >
          <div className="modal-box max-w-5xl w-auto">
            <form method="dialog">
              {/** biome-ignore lint/a11y/useButtonType: daisyUI */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg mb-4">{modalImageUrl.filename}</h3>
            {/** biome-ignore lint/performance/noImgElement: intentional */}
            <img
              src={modalImageUrl.url}
              alt="Attachment"
              className="w-full h-auto max-h-[80vh] object-contain rounded"
            />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="submit">close</button>
          </form>
        </dialog>
      )}
      {/* Text file modal */}
      {modalTextFile && (
        <dialog
          ref={textModalRef}
          className="modal"
          onClose={() => setModalTextFile(null)}
        >
          <div className="modal-box max-w-5xl w-full">
            <form method="dialog">
              {/** biome-ignore lint/a11y/useButtonType: daisyUI */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg mb-4">{modalTextFile.filename}</h3>
            <div className="overflow-auto max-h-[70vh]">
              <SyntaxHighlighter
                style={editorTheme}
                language={getLanguageFromFilename(modalTextFile.filename)}
                PreTag="div"
                showLineNumbers={true}
                customStyle={{
                  margin: 0,
                  borderRadius: '0.5rem',
                }}
              >
                {modalTextFile.content}
              </SyntaxHighlighter>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="submit">close</button>
          </form>
        </dialog>
      )}
      {/* PDF file modal */}
      {modalPdfFile && (
        <dialog
          ref={pdfModalRef}
          className="modal"
          onClose={() => setModalPdfFile(null)}
        >
          <div className="modal-box max-w-5xl w-full h-[90vh]">
            <form method="dialog">
              {/** biome-ignore lint/a11y/useButtonType: daisyUI */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg mb-4">{modalPdfFile.filename}</h3>
            <iframe
              src={modalPdfFile.url}
              title={modalPdfFile.filename}
              className="w-full h-[calc(100%-3rem)] rounded border border-base-300"
            />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="submit">close</button>
          </form>
        </dialog>
      )}
    </ErrorBoundary>
  );
};

App.displayName = 'App';

export default App;
