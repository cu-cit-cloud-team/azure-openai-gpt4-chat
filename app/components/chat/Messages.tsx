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
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/app/components/ai-elements/tool';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import type {
  FilePart,
  ReasoningPart,
  SourceUrlPart,
  ToolUIPart,
  UserMeta,
} from '@/app/types';
import {
  getMessageFiles,
  getMessageText,
  getSourceTitle,
} from '@/app/utils/messageHelpers';
import { modelStringFromName } from '@/app/utils/models';

// Extend dayjs plugins for time helpers
// These calls are idempotent and safe on every import
dayjs.extend(isToday);
dayjs.extend(relativeTime);

type StoredMessage = UIMessage & {
  model?: string;
  createdAt?: string;
};

export interface MessagesProps {
  messages: UIMessage[];
  modelName: string;
  userMeta?: UserMeta;
  chatStatus?: 'ready' | 'submitted' | 'streaming' | 'error';
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
  chatStatus,
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
          chatStatus={chatStatus}
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
  chatStatus?: 'ready' | 'submitted' | 'streaming' | 'error';
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
    chatStatus,
    copiedMessageId,
    onCopy,
    onRegenerate,
    onDelete,
    onFileClick,
  }: MessageRowProps) => {
    const messageText = useMemo(() => getMessageText(message), [message]);
    const messageFiles = useMemo(() => getMessageFiles(message), [message]);
    const isUser = message.role === 'user';
    const isStreamingState =
      chatStatus === 'streaming' || chatStatus === 'submitted';

    // Collect source parts for rendering before message content
    const sourceParts = useMemo(
      () =>
        message.parts.filter(
          (part): part is SourceUrlPart => part.type === 'source-url'
        ),
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
      <Message from={message.role}>
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
              {/* Render Sources if available (before all other content) */}
              {!isUser && sourceParts.length > 0 && (
                <Sources>
                  <SourcesTrigger count={sourceParts.length} />
                  <SourcesContent>
                    {sourceParts.map((part, idx) => (
                      <Source
                        key={part.sourceId || `${message.id}-source-${idx}`}
                        href={part.url}
                        title={part.title || getSourceTitle(part.url)}
                      />
                    ))}
                  </SourcesContent>
                </Sources>
              )}

              {/* Render message parts using switch-based pattern */}
              {message.parts.map((part, i) => {
                const isStreamingPart =
                  isLastMessage &&
                  isStreamingState &&
                  i === message.parts.length - 1;

                // Debug: Log part types to understand what we're receiving
                if (process.env.NODE_ENV === 'development' && !isUser) {
                  console.log(`Part ${i} type:`, part.type, part);
                }

                switch (part.type) {
                  case 'tool-input-start':
                  case 'tool-input-end': {
                    // These are internal streaming events, don't render
                    return null;
                  }

                  case 'reasoning': {
                    if (isUser) {
                      return null;
                    }
                    const reasoningPart = part as ReasoningPart;
                    const hasReasoningText =
                      reasoningPart.text && reasoningPart.text.trim() !== '';
                    return (
                      <Reasoning
                        key={`${message.id}-${i}`}
                        isStreaming={isStreamingPart}
                      >
                        <ReasoningTrigger />
                        {hasReasoningText ? (
                          <ReasoningContent>
                            {reasoningPart.text}
                          </ReasoningContent>
                        ) : (
                          <ReasoningContent className="text-muted-foreground italic">
                            {
                              'Reasoning content is not available (encrypted by Azure for OpenAI models with reasoning capabilities).'
                            }
                          </ReasoningContent>
                        )}
                      </Reasoning>
                    );
                  }

                  case 'text': {
                    // Text is already concatenated and rendered after the switch
                    return null;
                  }

                  case 'file': {
                    // Files are already collected and rendered after the switch
                    return null;
                  }

                  case 'source-url': {
                    // Sources are already rendered before the switch
                    return null;
                  }

                  default: {
                    // Handle dynamic tool types (tool-{toolName})
                    if (part.type.startsWith('tool-')) {
                      if (isUser) {
                        return null;
                      }
                      const toolPart = part as ToolUIPart;
                      return (
                        <Tool key={`${message.id}-${i}`}>
                          <ToolHeader
                            title={toolPart.type.split('tool-')[1] || 'tool'}
                            type={toolPart.type}
                            state={toolPart.state}
                          />
                          <ToolContent>
                            <ToolInput input={toolPart.input} />
                            {toolPart.output !== undefined && (
                              <ToolOutput
                                output={toolPart.output}
                                errorText={toolPart.errorText}
                              />
                            )}
                          </ToolContent>
                        </Tool>
                      );
                    }

                    // Unhandled part types
                    if (process.env.NODE_ENV === 'development') {
                      console.warn('Unhandled part type:', part.type, part);
                    }
                    return null;
                  }
                }
              })}

              {/* Render concatenated text content */}
              {messageText && (
                <MessageResponse
                  // Use component props (not key) so the message body isn't remounted
                  // when streaming status changes to ready.
                  mode="streaming"
                  parseIncompleteMarkdown
                  isAnimating={isLastMessage && isStreamingState && !isUser}
                  shikiTheme={['github-light', 'github-dark']}
                >
                  {messageText}
                </MessageResponse>
              )}

              {/* Render file attachments */}

              {messageFiles && messageFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {messageFiles.map((file, idx) => (
                    <Button
                      key={`${message.id}-file-${idx}`}
                      variant="outline"
                      size="lg"
                      className="h-auto gap-2"
                      onClick={() => handleFileClick(file as FilePart)}
                    >
                      {file.mediaType.startsWith('image/') ? (
                        <>
                          {/* biome-ignore lint/performance/noImgElement: data URL from file upload */}
                          <img
                            src={file.url}
                            alt={file.name}
                            className="size-32 object-cover rounded"
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
              {!isUser && isStreamingState && isLastMessage && !messageText && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )}
            </MessageContent>

            {/* Hide meta for assistant messages while streaming */}
            {!(isLastMessage && isStreamingState && !isUser) && (
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
            )}

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
