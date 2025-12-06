'use client';

import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { DefaultChatTransport } from 'ai';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAtom, useAtomValue } from 'jotai';
import {
  Bot,
  Check,
  Copy,
  Loader2,
  RefreshCw,
  Trash2,
  User,
} from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Streamdown } from 'streamdown';
import { Footer } from '@/app/components/Footer';
import { Header } from '@/app/components/Header';
import { database } from '@/app/database/database.config';
import { useMessagePersistence } from '@/app/hooks/useMessagePersistence';
import {
  isLoadingAtom,
  modelAtom,
  systemMessageAtom,
  userMetaAtom,
} from '@/app/utils/atoms';
import { getMessageFiles, getMessageText } from '@/app/utils/messageHelpers';
import { modelStringFromName } from '@/app/utils/models';

dayjs.extend(isToday);
dayjs.extend(relativeTime);

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/app/components/ai-elements/conversation';
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/app/components/ai-elements/message';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog';

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

  const focusTextarea = useCallback(() => {
    setTimeout(() => {
      // Don't steal focus from system message textarea
      if (document?.activeElement !== systemMessageRef.current) {
        // Query for the PromptInput textarea
        const textarea = document.querySelector(
          'textarea[name="message"]'
        ) as HTMLTextAreaElement | null;
        textarea?.focus();
      }
    }, 0);
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
  const [modalImageUrl, setModalImageUrl] = useState<{
    url: string;
    filename: string;
  } | null>(null);
  const [modalTextFile, setModalTextFile] = useState<{
    content: string;
    filename: string;
    mediaType: string;
  } | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [modalPdfFile, setModalPdfFile] = useState<{
    url: string;
    filename: string;
  } | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
    id: `${userId}-chat`,
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
          filename: file.name || 'file.pdf',
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

  const handleCopyMessage = useCallback(
    async (messageId: string, text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    },
    []
  );

  const handleDeleteMessage = useCallback((messageId: string) => {
    setDeleteMessageId(messageId);
    setShowDeleteDialog(true);
  }, []);

  const confirmDeleteMessage = useCallback(async () => {
    if (deleteMessageId) {
      try {
        // Delete from database
        await database.messages.delete(deleteMessageId);
        // Update UI
        setMessages((prev) => prev.filter((m) => m.id !== deleteMessageId));
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
    setShowDeleteDialog(false);
    setDeleteMessageId(null);
  }, [deleteMessageId, setMessages]);

  const cancelDeleteMessage = useCallback(() => {
    setShowDeleteDialog(false);
    setDeleteMessageId(null);
  }, []);

  const handleRegenerateResponse = useCallback(
    async (messageId: string) => {
      try {
        // Find the message index
        const messageIndex = messages.findIndex((m) => m.id === messageId);
        if (messageIndex === -1) {
          return;
        }

        const message = messages[messageIndex];
        const isUserMessage = message.role === 'user';

        if (isUserMessage) {
          // For user messages: remove it and everything after, then resend
          const messagesToKeep = messages.slice(0, messageIndex);

          // Delete this message and all messages after from database
          const messageIdsToDelete = messages
            .slice(messageIndex)
            .map((m) => m.id);
          await database.messages.bulkDelete(messageIdsToDelete);

          // Update messages state to remove the user message and everything after
          setMessages(messagesToKeep);

          // Wait a tick to ensure state has updated, then resend the message
          setTimeout(() => {
            // Ensure parts exist and are in the correct format
            if (message.parts && Array.isArray(message.parts)) {
              // Resend the user message with its parts - this will create a new message with a new ID
              sendMessage({ parts: message.parts });
            }
          }, 10);
        } else {
          // For assistant messages: remove the assistant and resend the previous user message
          let lastUserIndex = -1;
          for (let i = messageIndex - 1; i >= 0; i -= 1) {
            if (messages[i].role === 'user') {
              lastUserIndex = i;
              break;
            }
          }

          if (lastUserIndex === -1) {
            return;
          }

          const messagesToKeep = messages.slice(0, lastUserIndex);
          const userMessage = messages[lastUserIndex];

          const messageIdsToDelete = messages
            .slice(lastUserIndex)
            .map((m) => m.id);
          await database.messages.bulkDelete(messageIdsToDelete);

          setMessages(messagesToKeep);

          setTimeout(() => {
            if (userMessage.parts && Array.isArray(userMessage.parts)) {
              sendMessage({ parts: userMessage.parts });
            }
          }, 10);
        }
      } catch (error) {
        console.error('Error regenerating response:', error);
        setChatError(
          error instanceof Error
            ? error.message
            : 'Failed to regenerate response'
        );
      }
    },
    [messages, setMessages, sendMessage]
  );

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

  const ErrorFallback = memo(
    ({
      error,
      resetErrorBoundary,
    }: {
      error: Error;
      resetErrorBoundary: () => void;
    }) => {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Alert variant="destructive" className="w-11/12 max-w-lg">
            <AlertDescription className="space-y-4">
              <h3 className="text-lg font-bold">Error</h3>
              <p>{error?.message}</p>
              <Button
                variant="destructive"
                onClick={() => {
                  resetErrorBoundary();
                  window.location.reload();
                }}
              >
                Reload and try again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  );

  ErrorFallback.displayName = 'ErrorFallback';

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Header
        isLoading={isLoading}
        systemMessageRef={systemMessageRef}
        chatError={chatError}
        onClearError={() => setChatError(null)}
        setMessages={setMessages}
        focusTextarea={focusTextarea}
      />

      {/* Main Chat Container */}
      <div className="flex flex-col h-screen pt-14 pb-40">
        <Conversation className="flex-1">
          <ConversationContent className="max-w-4xl mx-auto px-4">
            {/* Decreased top padding for smaller header, added horizontal padding */}
            {messages.map((message, index) => {
              const messageText = getMessageText(message);
              const messageFiles = getMessageFiles(message);
              const isUser = message.role === 'user';
              const isLastMessage = index === messages.length - 1;

              // Get metadata from stored message
              const storedMessage = message as StoredMessage;
              const messageModel = storedMessage.model || modelName;
              const messageCreatedAt =
                storedMessage.createdAt || new Date().toISOString();

              return (
                <Message key={message.id} from={message.role}>
                  {/* Avatar */}
                  <div
                    className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Avatar className="size-8">
                      <AvatarFallback
                        className={
                          isUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        }
                      >
                        {isUser ? (
                          <User className="size-4" />
                        ) : (
                          <Bot className="size-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <MessageContent>
                        {/* Message text with Streamdown */}
                        {messageText && (
                          <MessageResponse
                            mode="streaming"
                            parseIncompleteMarkdown
                            isAnimating={isLastMessage && isLoading && !isUser}
                            shikiTheme={['github-light', 'github-dark']}
                          >
                            {messageText}
                          </MessageResponse>
                        )}

                        {/* File attachments */}
                        {messageFiles && messageFiles.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {messageFiles.map((file, idx) => (
                              <Button
                                key={`${message.id}-file-${idx}`}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => handleFileClickCb(file)}
                              >
                                {file.mediaType.startsWith('image/') ? (
                                  <>
                                    {/* biome-ignore lint/performance/noImgElement: data URL from file upload */}
                                    <img
                                      src={file.url}
                                      alt={file.name}
                                      className="size-8 object-cover rounded"
                                    />
                                  </>
                                ) : (
                                  <span>📄 {file.name || 'File'}</span>
                                )}
                              </Button>
                            ))}
                          </div>
                        )}

                        {/* Loading indicator */}
                        {!isUser &&
                          isLoading &&
                          messages[messages.length - 1].id === message.id &&
                          !messageText && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="size-4 animate-spin" />
                              <span className="text-sm">Thinking...</span>
                            </div>
                          )}
                      </MessageContent>

                      {/* Message Metadata - Timestamp and model info */}
                      <div
                        className={`mt-1 text-xs text-muted-foreground ${isUser ? 'text-right' : ''}`}
                        title={
                          dayjs(messageCreatedAt).isToday()
                            ? dayjs(messageCreatedAt).format('h:mm a')
                            : dayjs(messageCreatedAt).format(
                                'ddd MMM DD YYYY [at] h:mm a'
                              )
                        }
                      >
                        {isUser ? (
                          <>
                            {userMeta?.name || 'User'} •{' '}
                            {dayjs(messageCreatedAt).fromNow()}
                          </>
                        ) : (
                          <>
                            {modelStringFromName(messageModel)} •{' '}
                            {dayjs(messageCreatedAt).fromNow()}
                          </>
                        )}
                      </div>

                      {/* Message Actions - Always visible, displayed after message */}
                      {messageText && (
                        <MessageActions
                          className={`mt-2 ${isUser ? 'justify-end' : ''}`}
                        >
                          <MessageAction
                            tooltip={
                              copiedMessageId === message.id
                                ? 'Copied!'
                                : 'Copy message'
                            }
                            onClick={() =>
                              handleCopyMessage(message.id, messageText)
                            }
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="size-4" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </MessageAction>

                          {isLastMessage && (
                            <MessageAction
                              tooltip="Regenerate response"
                              onClick={() =>
                                handleRegenerateResponse(message.id)
                              }
                            >
                              <RefreshCw className="size-4" />
                            </MessageAction>
                          )}

                          <MessageAction
                            tooltip="Delete message"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            <Trash2 className="size-4" />
                          </MessageAction>
                        </MessageActions>
                      )}
                    </div>
                  </div>
                </Message>
              );
            })}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <Footer
        onSubmit={handlePromptSubmit}
        isLoading={isLoading}
        focusTextarea={focusTextarea}
        systemMessageRef={systemMessageRef}
      />

      {/* Image modal - convert to shadcn Dialog */}
      <Dialog
        open={!!modalImageUrl}
        onOpenChange={(open) => !open && setModalImageUrl(null)}
      >
        <DialogContent className="w-[80vw] sm:max-w-7xl">
          <DialogTitle>{modalImageUrl?.filename}</DialogTitle>
          {modalImageUrl && (
            // biome-ignore lint/performance/noImgElement: data URL from file upload
            <img
              src={modalImageUrl.url}
              alt="Attachment"
              className="w-full h-auto max-h-[80vh] object-contain rounded"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Text file modal - convert to shadcn Dialog with Streamdown */}
      <Dialog
        open={!!modalTextFile}
        onOpenChange={(open) => !open && setModalTextFile(null)}
      >
        <DialogContent className="w-[80vw] sm:max-w-7xl max-h-[90vh]">
          <DialogTitle>{modalTextFile?.filename}</DialogTitle>
          {modalTextFile && (
            <div className="overflow-auto max-h-[75vh] -mx-6 px-6">
              <Streamdown
                mode="static"
                className="max-w-none"
                shikiTheme={['github-light', 'github-dark']}
              >
                {`\`\`\`${modalTextFile.filename.split('.').pop() || 'text'}\n${modalTextFile.content}\n\`\`\``}
              </Streamdown>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PDF file modal - convert to shadcn Dialog */}
      <Dialog
        open={!!modalPdfFile}
        onOpenChange={(open) => !open && setModalPdfFile(null)}
      >
        <DialogContent className="w-[80vw] sm:max-w-7xl h-[90vh]">
          <DialogTitle>{modalPdfFile?.filename}</DialogTitle>
          {modalPdfFile && (
            <iframe
              src={modalPdfFile.url}
              title={modalPdfFile.filename}
              className="w-full h-[calc(90vh-8rem)] rounded border-0"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete message confirmation dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Message?"
        description="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteMessage}
        onCancel={cancelDeleteMessage}
        variant="destructive"
      />
    </ErrorBoundary>
  );
}
