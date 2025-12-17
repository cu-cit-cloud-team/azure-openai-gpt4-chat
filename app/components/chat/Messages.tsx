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
  ToolUIPart,
  UserMeta,
} from '@/app/types';
import { getSourceTitle } from '@/app/utils/messageHelpers';
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
    const isUser = message.role === 'user';
    const isStreamingState =
      chatStatus === 'streaming' || chatStatus === 'submitted';

    // Collect file parts and text files for rendering before message content
    const fileParts = useMemo(() => {
      const files: Array<{
        type: string;
        mediaType: string;
        url: string;
        name?: string;
        textContent?: string;
      }> = [];

      message.parts.forEach((part) => {
        if (part.type === 'file') {
          const filePart = part as FilePart;
          files.push({
            type: part.type,
            mediaType: filePart.mediaType,
            url: filePart.url || '',
            name: filePart.name,
          });
        } else if (part.type === 'text' && part.text.startsWith('[File: ')) {
          const match = part.text.match(/^\[File: (.+?)\]\n([\s\S]*)$/);
          if (match) {
            const filename = match[1];
            const ext = filename.split('.').pop()?.toLowerCase();
            const mediaTypeMap: Record<string, string> = {
              json: 'application/json',
              pdf: 'application/pdf',
              jpg: 'image/jpeg',
              jpeg: 'image/jpeg',
              png: 'image/png',
              webp: 'image/webp',
              txt: 'text/plain',
            };
            files.push({
              type: 'file',
              mediaType: mediaTypeMap[ext || ''] || 'text/plain',
              url: '',
              name: filename,
              textContent: match[2],
            });
          }
        }
      });

      return files;
    }, [message.parts]);

    // Extract text content for copy functionality
    const messageText = useMemo(() => {
      const textParts = message.parts
        .filter(
          (part): part is { type: 'text'; text: string } =>
            part.type === 'text' && !part.text.startsWith('[File: ')
        )
        .map((part) => part.text);
      return textParts.join('');
    }, [message.parts]);

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

          <div className="flex-1 flex flex-col gap-2">
            {/* Render file attachments first (before text) */}
            {fileParts.length > 0 && (
              <div
                className={`gap-4 ${isUser ? 'ml-auto max-w-2/5' : 'max-w-2/5'} ${fileParts.filter((f) => f.mediaType.startsWith('image/')).length === 1 ? 'flex flex-col' : 'grid grid-cols-1 sm:grid-cols-2'}`}
              >
                {fileParts.map((file, idx) =>
                  file.mediaType.startsWith('image/') ? (
                    <div
                      key={`${message.id}-file-${idx}`}
                      className="rounded-lg border p-2 bg-muted/50 h-auto"
                    >
                      <button
                        type="button"
                        onClick={() => handleFileClick(file as FilePart)}
                        className="cursor-pointer hover:opacity-80 transition-opacity w-full"
                      >
                        {/* biome-ignore lint/performance/noImgElement: data URL from file upload */}
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-auto rounded"
                        />
                      </button>
                    </div>
                  ) : (
                    <Button
                      key={`${message.id}-file-${idx}`}
                      variant="outline"
                      size="lg"
                      className="h-auto gap-2"
                      onClick={() => handleFileClick(file as FilePart)}
                    >
                      <span>📄 {file.name || 'File'}</span>
                    </Button>
                  )
                )}
              </div>
            )}

            <MessageContent>
              {/* Render Sources if available (before all other content) */}
              {!isUser &&
                message.parts.some((p) => p.type === 'source-url') && (
                  <Sources>
                    <SourcesTrigger
                      count={
                        message.parts.filter((p) => p.type === 'source-url')
                          .length
                      }
                    />
                    <SourcesContent>
                      {message.parts
                        .filter((p) => p.type === 'source-url')
                        .map((part, idx) => {
                          const sourcePart = part as unknown as Record<
                            string,
                            unknown
                          >;
                          const url = (
                            typeof sourcePart.url === 'string'
                              ? sourcePart.url
                              : typeof sourcePart.href === 'string'
                                ? sourcePart.href
                                : ''
                          ) as string;
                          const title = (
                            typeof sourcePart.title === 'string'
                              ? sourcePart.title
                              : getSourceTitle(url)
                          ) as string;
                          const sourceId = (
                            typeof sourcePart.sourceId === 'string'
                              ? sourcePart.sourceId
                              : typeof sourcePart.id === 'string'
                                ? sourcePart.id
                                : undefined
                          ) as string | undefined;
                          return (
                            <Source
                              key={sourceId || `${message.id}-source-${idx}`}
                              href={url}
                              title={title}
                            />
                          );
                        })}
                    </SourcesContent>
                  </Sources>
                )}

              {/* Render message parts using switch-based pattern */}
              {message.parts.map((part, i) => {
                const isStreamingPart =
                  isLastMessage &&
                  isStreamingState &&
                  i === message.parts.length - 1;

                switch (part.type) {
                  case 'step-start': {
                    // Show step boundaries for multi-step tool calls
                    return i > 0 ? (
                      <div key={`${message.id}-${i}`} className="text-gray-500">
                        <hr className="my-2 border-gray-300" />
                      </div>
                    ) : null;
                  }
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

                    // Don't render empty reasoning if not streaming
                    if (!hasReasoningText && !isStreamingPart) {
                      return null;
                    }

                    return (
                      <Reasoning
                        key={`${message.id}-${i}`}
                        isStreaming={isStreamingPart}
                      >
                        <ReasoningTrigger />
                        <ReasoningContent>
                          {hasReasoningText
                            ? reasoningPart.text
                            : '_Reasoning..._'}
                        </ReasoningContent>
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

                  case 'source-document': {
                    // Render document sources (similar to source-url but for documents)
                    if (isUser) {
                      return null;
                    }
                    const docPart = part as unknown as Record<string, unknown>;
                    const title =
                      typeof docPart.title === 'string'
                        ? docPart.title
                        : `Document ${typeof docPart.id === 'string' ? docPart.id : i}`;
                    return (
                      <span
                        key={`${message.id}-${i}`}
                        className="text-xs text-muted-foreground"
                      >
                        [{title}]
                      </span>
                    );
                  }

                  case 'dynamic-tool': {
                    // Handle generic dynamic tool invocations
                    if (isUser) {
                      return null;
                    }
                    const dynamicPart = part as unknown as Record<
                      string,
                      unknown
                    >;
                    const toolName =
                      typeof dynamicPart.toolName === 'string'
                        ? dynamicPart.toolName
                        : 'tool';
                    // Default to 'input-available' if state is not a valid tool state
                    const state: ToolUIPart['state'] =
                      typeof dynamicPart.state === 'string' &&
                      (dynamicPart.state === 'input-streaming' ||
                        dynamicPart.state === 'input-available' ||
                        dynamicPart.state === 'output-available' ||
                        dynamicPart.state === 'output-error')
                        ? (dynamicPart.state as ToolUIPart['state'])
                        : 'input-available';

                    return (
                      <div key={`${message.id}-${i}`} className="my-2">
                        <Tool className="w-full">
                          <ToolHeader
                            title={toolName}
                            type={`tool-${toolName}` as `tool-${string}`}
                            state={state}
                          />
                          <ToolContent>
                            <ToolInput input={dynamicPart.input} />
                            {dynamicPart.output !== undefined && (
                              <ToolOutput
                                output={dynamicPart.output}
                                errorText={
                                  typeof dynamicPart.errorText === 'string'
                                    ? dynamicPart.errorText
                                    : undefined
                                }
                              />
                            )}
                          </ToolContent>
                        </Tool>
                      </div>
                    );
                  }

                  default: {
                    // Handle dynamic tool types (tool-{toolName})
                    if (part.type.startsWith('tool-')) {
                      if (isUser) {
                        return null;
                      }
                      const toolPart = part as ToolUIPart;

                      // Check if this is an image generation tool with output
                      const isImageGeneration =
                        toolPart.type === 'tool-image_generation';
                      const hasImageOutput =
                        isImageGeneration &&
                        toolPart.output &&
                        typeof toolPart.output === 'object' &&
                        'result' in toolPart.output;

                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Tool className="w-full">
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
                          {hasImageOutput ? (
                            <div className="mt-4 rounded-lg border p-2 bg-muted/50 max-w-2/5 h-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  const output = toolPart.output as {
                                    result: string;
                                  };
                                  const dataUrl = `data:image/png;base64,${output.result}`;
                                  const filePart = {
                                    type: 'file' as const,
                                    name: `${message.id}.png`,
                                    mediaType: 'image/png',
                                    url: dataUrl,
                                    title: `${message.id}.png`,
                                  };
                                  onFileClick(filePart);
                                }}
                                className="cursor-pointer hover:opacity-80 transition-opacity w-full"
                              >
                                {/* biome-ignore lint/performance/noImgElement: base64 from tool output */}
                                <img
                                  src={`data:image/png;base64,${(toolPart.output as { result: string }).result}`}
                                  alt={
                                    typeof toolPart.input === 'object' &&
                                    toolPart.input &&
                                    'prompt' in toolPart.input
                                      ? String(toolPart.input.prompt)
                                      : 'AI-generated content'
                                  }
                                  className="object-cover rounded-md w-full"
                                />
                              </button>
                            </div>
                          ) : null}
                        </Fragment>
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
