import type { UIMessage } from 'ai';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Bot,
  Check,
  Copy,
  Loader2,
  RefreshCw,
  Trash2,
  User,
} from 'lucide-react';
import { Fragment, memo, useCallback, useMemo } from 'react';
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/app/components/ai-elements/message';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/app/components/ai-elements/reasoning';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/app/components/ai-elements/sources';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import type { UserMeta } from '@/app/types';
import { getMessageFiles, getMessageText } from '@/app/utils/messageHelpers';
import { modelStringFromName } from '@/app/utils/models';

// Extend dayjs plugins for time helpers
// These calls are idempotent and safe on every import
dayjs.extend(isToday);
dayjs.extend(relativeTime);

type StoredMessage = UIMessage & {
  model?: string;
  createdAt?: string;
};

type FilePart = {
  type: string;
  mediaType: string;
  url?: string;
  textContent?: string;
  name?: string;
};

export interface MessagesProps {
  messages: UIMessage[];
  modelName: string;
  userMeta?: UserMeta;
  isLoading: boolean;
  copiedMessageId: string | null;
  onCopy: (messageId: string, text: string) => void;
  onRegenerate: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onFileClick: (file: FilePart) => void;
}

export const Messages = ({
  messages,
  modelName,
  userMeta,
  isLoading,
  copiedMessageId,
  onCopy,
  onRegenerate,
  onDelete,
  onFileClick,
}: MessagesProps) => {
  return (
    <Fragment>
      {messages.map((message, index) => (
        <MessageRow
          key={message.id}
          message={message}
          isLastMessage={index === messages.length - 1}
          modelName={modelName}
          userMeta={userMeta}
          isLoading={isLoading}
          copiedMessageId={copiedMessageId}
          onCopy={onCopy}
          onRegenerate={onRegenerate}
          onDelete={onDelete}
          onFileClick={onFileClick}
        />
      ))}
    </Fragment>
  );
};

interface MessageRowProps {
  message: UIMessage;
  isLastMessage: boolean;
  modelName: string;
  userMeta?: UserMeta;
  isLoading: boolean;
  copiedMessageId: string | null;
  onCopy: (messageId: string, text: string) => void;
  onRegenerate: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onFileClick: (file: FilePart) => void;
}

const MessageRow = memo(
  ({
    message,
    isLastMessage,
    modelName,
    userMeta,
    isLoading,
    copiedMessageId,
    onCopy,
    onRegenerate,
    onDelete,
    onFileClick,
  }: MessageRowProps) => {
    const messageText = useMemo(() => getMessageText(message), [message]);
    const messageFiles = useMemo(() => getMessageFiles(message), [message]);
    const isUser = message.role === 'user';

    // Extract reasoning and source parts
    const reasoningParts = useMemo(
      () => message.parts.filter((part) => part.type === 'reasoning'),
      [message.parts]
    );
    const sourceParts = useMemo(
      () => message.parts.filter((part) => part.type === 'source-url'),
      [message.parts]
    );

    const storedMessage = message as StoredMessage;
    const messageModel = storedMessage.model || modelName;
    const messageCreatedAt =
      storedMessage.createdAt || new Date().toISOString();

    const handleCopy = useCallback(() => {
      if (messageText) {
        onCopy(message.id, messageText);
      }
    }, [message.id, messageText, onCopy]);

    const handleRegenerate = useCallback(() => {
      onRegenerate(message.id);
    }, [message.id, onRegenerate]);

    const handleDelete = useCallback(() => {
      onDelete(message.id);
    }, [message.id, onDelete]);

    const handleFileClick = useCallback(
      (file: FilePart) => onFileClick(file),
      [onFileClick]
    );

    return (
      <Message key={message.id} from={message.role}>
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
              {/* Render Sources if available (before content) */}
              {!isUser && sourceParts.length > 0 && (
                <Sources>
                  <SourcesTrigger count={sourceParts.length} />
                  {sourceParts.map((part, idx) => {
                    const sourcePart = part as { url: string };
                    return (
                      <SourcesContent key={`${message.id}-source-${idx}`}>
                        <Source href={sourcePart.url} title={sourcePart.url} />
                      </SourcesContent>
                    );
                  })}
                </Sources>
              )}

              {/* Render Reasoning if available */}
              {!isUser &&
                reasoningParts.map((part, idx) => {
                  const reasoningPart = part as { text: string };
                  const isStreamingReasoning =
                    isLastMessage &&
                    isLoading &&
                    idx === message.parts.length - 1;
                  return (
                    <Reasoning
                      key={`${message.id}-reasoning-${idx}`}
                      isStreaming={isStreamingReasoning}
                    >
                      <ReasoningTrigger />
                      <ReasoningContent>{reasoningPart.text}</ReasoningContent>
                    </Reasoning>
                  );
                })}

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

              {messageFiles && messageFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {messageFiles.map((file, idx) => (
                    <Button
                      key={`${message.id}-file-${idx}`}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleFileClick(file as FilePart)}
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

              {!isUser && isLoading && isLastMessage && !messageText && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )}
            </MessageContent>

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

            {messageText && (
              <MessageActions className={`mt-2 ${isUser ? 'justify-end' : ''}`}>
                <MessageAction
                  tooltip={
                    copiedMessageId === message.id ? 'Copied!' : 'Copy message'
                  }
                  onClick={handleCopy}
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
                    onClick={handleRegenerate}
                  >
                    <RefreshCw className="size-4" />
                  </MessageAction>
                )}

                <MessageAction tooltip="Delete message" onClick={handleDelete}>
                  <Trash2 className="size-4" />
                </MessageAction>
              </MessageActions>
            )}
          </div>
        </div>
      </Message>
    );
  }
);

MessageRow.displayName = 'MessageRow';
