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
import { Fragment } from 'react';
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/app/components/ai-elements/message';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import type { UserMeta } from '@/app/types';
import { getMessageFiles, getMessageText } from '@/app/utils/messageHelpers';
import { modelStringFromName } from '@/app/utils/models';

// Extend dayjs plugins locally for this component
if (!dayjs.isToday) {
  dayjs.extend(isToday);
}
if (!dayjs.fromNow) {
  dayjs.extend(relativeTime);
}

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
      {messages.map((message, index) => {
        const messageText = getMessageText(message);
        const messageFiles = getMessageFiles(message);
        const isUser = message.role === 'user';
        const isLastMessage = index === messages.length - 1;

        const storedMessage = message as StoredMessage;
        const messageModel = storedMessage.model || modelName;
        const messageCreatedAt =
          storedMessage.createdAt || new Date().toISOString();

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
                          onClick={() => onFileClick(file as FilePart)}
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
                  <MessageActions
                    className={`mt-2 ${isUser ? 'justify-end' : ''}`}
                  >
                    <MessageAction
                      tooltip={
                        copiedMessageId === message.id
                          ? 'Copied!'
                          : 'Copy message'
                      }
                      onClick={() => onCopy(message.id, messageText)}
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
                        onClick={() => onRegenerate(message.id)}
                      >
                        <RefreshCw className="size-4" />
                      </MessageAction>
                    )}

                    <MessageAction
                      tooltip="Delete message"
                      onClick={() => onDelete(message.id)}
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
    </Fragment>
  );
};
