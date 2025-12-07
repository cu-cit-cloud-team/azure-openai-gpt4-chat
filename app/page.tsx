'use client';

import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { DefaultChatTransport } from 'ai';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { DeleteMessageDialog } from '@/app/components/chat/DeleteMessageDialog';
import {
  ImageModal,
  PdfModal,
  TextFileModal,
} from '@/app/components/chat/Modals';
import { ErrorFallback } from '@/app/components/ErrorFallback';
import { Footer } from '@/app/components/Footer';
import { Header } from '@/app/components/Header';
import { database } from '@/app/database/database.config';
import { useClipboardFeedback } from '@/app/hooks/useClipboardFeedback';
import { useDeleteMessage } from '@/app/hooks/useDeleteMessage';
import { useMessageModals } from '@/app/hooks/useMessageModals';
import { useMessagePersistence } from '@/app/hooks/useMessagePersistence';
import { useRegenerateMessage } from '@/app/hooks/useRegenerateMessage';
import {
  isLoadingAtom,
  modelAtom,
  systemMessageAtom,
  userMetaAtom,
} from '@/app/utils/atoms';

dayjs.extend(isToday);
dayjs.extend(relativeTime);

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/app/components/ai-elements/conversation';
import { Messages } from '@/app/components/chat/Messages';

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
  name?: string;
  filename?: string;
};

// Text file MIME types that should be read as text content
const TEXT_TYPES = new Set([
  'application/json',
  'application/typescript',
  'application/x-sh',
  'application/xml',
  'application/yaml',
  'text/css',
  'text/csv',
  'text/html',
  'text/javascript',
  'text/markdown',
  'text/plain',
  'text/x-csv',
  'text/x-golang',
  'text/x-java',
  'text/x-php',
  'text/x-python',
  'text/x-ruby',
  'text/x-script.python',
  'text/x-sass',
  'text/x-scss',
]);

export default function App() {
  const systemMessageRef = useRef<HTMLTextAreaElement>(null);
  // Ref for PromptInput textarea
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  const focusTextarea = useCallback(() => {
    setTimeout(() => {
      // Don't steal focus from system message textarea
      if (document?.activeElement !== systemMessageRef.current) {
        promptInputRef.current?.focus();
      }
    }, 0);
  }, []);

  // Focus PromptInput on mount (unless system message textarea is focused)
  useEffect(() => {
    if (document?.activeElement !== systemMessageRef.current) {
      promptInputRef.current?.focus();
    }
  }, []);

  const modelName = useAtomValue(modelAtom);
  const systemMessage = useAtomValue(systemMessageAtom);
  const userMeta = useAtomValue(userMetaAtom);

  const savedMessages = useLiveQuery(async () => {
    const messages = await database.messages.toArray();
    const sorted = messages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return sorted;
  }, []);

  const handleChatError = useCallback((error: Error | { message?: string }) => {
    console.error(error);
    setChatError(error?.message || 'An error occurred. Please try again.');
  }, []);

  const userId = useMemo(
    () => (userMeta?.email ? btoa(userMeta?.email) : undefined),
    [userMeta]
  );
  const [chatError, setChatError] = useState<string | null>(null);

  const chatId = useMemo(
    () => (userId ? `${userId}-chat` : 'local-chat'),
    [userId]
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

  const { messages, setMessages, sendMessage, status } = useChat({
    id: chatId,
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
  const { addMessage } = useMessagePersistence({
    messages,
    isLoading,
    currentModel: modelName,
    savedMessages,
  });

  // Token counts will be calculated by TokenCount component when needed

  // handlers now supplied by custom hooks above

  const handlePromptSubmit = useCallback(
    async (message: { text: string; files: FilePart[] }) => {
      const parts: UIMessage['parts'] = [];

      if (message.text.trim()) {
        parts.push({ type: 'text', text: message.text.trim() });
      }

      // Process files: text files → text parts, images → image parts, PDFs → file parts
      for (const file of message.files) {
        const fileName = file.filename || file.name || 'file';
        const isTextFile = TEXT_TYPES.has(file.mediaType);
        const isImage = file.mediaType.startsWith('image/');
        const isPdf = file.mediaType === 'application/pdf';

        if (isTextFile && file.url) {
          // Read text files and convert to text parts with [File: name] prefix
          try {
            const response = await fetch(file.url);
            const text = await response.text();
            parts.push({
              type: 'text',
              text: `[File: ${fileName}]\n${text}`,
            });
          } catch (error) {
            console.error(`Failed to read text file ${fileName}:`, error);
          }
        } else if (isImage && file.url) {
          // Images: Use 'file' type with image mediaType (FileUIPart format)
          // convertToModelMessages will convert this to the model's image format
          parts.push({
            type: 'file',
            url: file.url, // Data URL
            mediaType: file.mediaType,
            filename: fileName,
          });
        } else if (isPdf && file.url) {
          // PDFs: Use 'url' property (FileUIPart format)
          // convertToModelMessages will convert this to the model format
          parts.push({
            type: 'file',
            url: file.url, // Data URL
            mediaType: 'application/pdf',
            filename: fileName,
          });
        }
      }

      if (parts.length > 0) {
        sendMessage({ parts });
      }
    },
    [sendMessage]
  );

  // Load saved messages into chat when they're available (only on initial load)
  // Model tracking is now handled inside useMessagePersistence hook
  const initialLoadRef = useRef(false);
  useEffect(() => {
    if (savedMessages && !initialLoadRef.current) {
      setMessages(savedMessages);
      initialLoadRef.current = true;
    }
  }, [savedMessages, setMessages]);

  // subscribe to storage change events so multiple tabs stay in sync
  useEffect(() => {
    const handleStorageChanges = (e: StorageEvent) => {
      // Only reload atom values when storage actually changes in another tab
      // Don't dispatch new storage events to avoid infinite loops
      const keysToHandle = [
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

  const { copiedMessageId, handleCopyMessage } = useClipboardFeedback();
  const {
    modalImageUrl,
    modalTextFile,
    modalPdfFile,
    handleFileClick,
    closeImage,
    closeText,
    closePdf,
  } = useMessageModals();
  const {
    showDeleteDialog,
    handleDeleteMessage,
    confirmDeleteMessage,
    cancelDeleteMessage,
  } = useDeleteMessage(setMessages);
  const { handleRegenerateResponse } = useRegenerateMessage(
    messages,
    setMessages,
    sendMessage
  );

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Header
        isLoading={isLoading}
        systemMessageRef={systemMessageRef}
        chatError={chatError}
        onClearError={() => setChatError(null)}
        setMessages={setMessages}
        focusTextarea={focusTextarea}
        messages={messages}
      />

      {/* Main Chat Container */}
      <div className="flex flex-col h-screen pt-14 pb-40">
        <Conversation className="flex-1">
          <ConversationContent className="max-w-5xl mx-auto px-4">
            {/* Decreased top padding for smaller header, added horizontal padding */}
            <Messages
              messages={messages}
              modelName={modelName}
              userMeta={userMeta}
              isLoading={isLoading}
              copiedMessageId={copiedMessageId}
              onCopy={handleCopyMessage}
              onRegenerate={handleRegenerateResponse}
              onDelete={handleDeleteMessage}
              onFileClick={handleFileClick}
            />
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <Footer
        onSubmit={handlePromptSubmit}
        isLoading={isLoading}
        focusTextarea={focusTextarea}
        systemMessageRef={systemMessageRef}
        promptInputRef={promptInputRef}
      />

      <ImageModal
        open={!!modalImageUrl}
        filename={modalImageUrl?.filename}
        url={modalImageUrl?.url}
        onClose={closeImage}
      />

      <TextFileModal
        open={!!modalTextFile}
        filename={modalTextFile?.filename}
        content={modalTextFile?.content}
        onClose={closeText}
      />

      <PdfModal
        open={!!modalPdfFile}
        filename={modalPdfFile?.filename}
        url={modalPdfFile?.url}
        onClose={closePdf}
      />

      <DeleteMessageDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) {
            cancelDeleteMessage();
          }
        }}
        onConfirm={confirmDeleteMessage}
        onCancel={cancelDeleteMessage}
      />
    </ErrorBoundary>
  );
}
