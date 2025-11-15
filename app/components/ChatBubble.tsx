import {
  faFile,
  faRobot,
  faSpinner,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import markdownToTxt from 'markdown-to-txt';
import { nanoid } from 'nanoid';
import { memo, useCallback, useMemo } from 'react';
import Markdown from 'react-markdown';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { ChatMeta } from '@/app/components/ChatMeta';
import { CopyToClipboard } from '@/app/components/CopyToClipboard';
import { DeleteMessage } from '@/app/components/DeleteMessage';
import { ReloadMessage } from '@/app/components/ReloadMessage';

// import { markdownToText } from '@/app/utils/markdownToText';

import { editorThemeAtom } from '@/app/page';

interface ChatBubbleProps {
  index?: number;
  isLoading?: boolean;
  isUser?: boolean;
  messageContent?: string;
  messageFiles?: {
    type: string;
    mediaType: string;
    url: string;
    name?: string;
    size?: number;
  }[];
  messageCreatedAt?: string | Date;
  messageId?: string;
  model?: string;
  regenerate?: (messageId: string) => void;
  stop?: () => void;
  totalMessages?: number;
  onFileClick: (file: {
    type: string;
    mediaType: string;
    url?: string;
    textContent?: string;
    name?: string;
  }) => void;
  focusTextarea: () => void;
}

const Pre = ({ children }: { children: { props: { children: string } } }) => {
  const preKey = useMemo(() => nanoid(), []);
  return (
    <pre className="code-pre">
      <CopyToClipboard
        key={preKey}
        textToCopy={children.props.children || ''}
      />
      {children}
    </pre>
  );
};

Pre.displayName = 'Pre';

export const ChatBubble = memo(
  ({
    index,
    isLoading,
    isUser,
    messageContent,
    messageFiles,
    messageCreatedAt,
    messageId,
    model,
    regenerate,
    stop,
    totalMessages,
    onFileClick,
    focusTextarea,
  }: ChatBubbleProps) => {
    const editorTheme = useAtomValue(editorThemeAtom);
    const copyToClipBoardKey = useMemo(() => nanoid(), []);

    const rehypePlugins = useMemo(() => [rehypeKatex, rehypeSanitize], []);

    const remarkPlugins = useMemo(() => [remarkGfm, remarkMath], []);

    const handleFileKeyDown = useCallback(
      (event: React.KeyboardEvent, file: (typeof messageFiles)[0]) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onFileClick(file);
        }
      },
      [onFileClick]
    );

    const chatBubbleUserIcon = useMemo(() => {
      return isUser ? (
        <FontAwesomeIcon
          className="chat-avatar-icon"
          size="2x"
          icon={faUser}
          fixedWidth
        />
      ) : isLoading && index === totalMessages ? (
        <FontAwesomeIcon
          className="chat-avatar-icon"
          size="2x"
          icon={faSpinner}
          spinPulse={true}
          fixedWidth
        />
      ) : (
        <FontAwesomeIcon
          className="chat-avatar-icon"
          size="2x"
          icon={faRobot}
          fixedWidth
        />
      );
    }, [index, isLoading, isUser, totalMessages]);

    return (
      <div
        className={clsx('chat mb-10', {
          'chat-start': isUser,
          'chat-end': !isUser,
        })}
      >
        <div className="chat-image avatar">
          <div
            className={clsx('w-12 pt-2 p-1 rounded', {
              'bg-primary text-primary-content': isUser,
              'bg-secondary text-secondary-content': !isUser,
            })}
          >
            {chatBubbleUserIcon}
          </div>
        </div>
        <div
          className={clsx('prose relative chat-bubble', {
            'chat-bubble-primary': isUser,
            'chat-bubble-secondary bot': !isUser,
          })}
        >
          {(isUser || !isLoading || index !== totalMessages) && (
            <>
              <CopyToClipboard
                key={copyToClipBoardKey}
                isUser={isUser}
                textToCopy={markdownToTxt(messageContent)}
              />
              <DeleteMessage
                isUser={isUser}
                messageId={messageId}
                focusTextarea={focusTextarea}
              />
              {index === totalMessages ? (
                <ReloadMessage
                  isUser={isUser}
                  isLoading={isLoading}
                  regenerate={regenerate}
                  messageId={messageId}
                />
              ) : null}
            </>
          )}
          {!isUser &&
          isLoading &&
          index === totalMessages &&
          (!messageContent || messageContent.trim() === '') ? (
            <div className="flex items-center gap-2 py-2">
              <FontAwesomeIcon
                icon={faSpinner}
                spinPulse
                className="text-secondary-content opacity-60"
              />
              <span className="text-sm opacity-60">Thinking...</span>
            </div>
          ) : (
            <>
              <Markdown
                rehypePlugins={rehypePlugins}
                remarkPlugins={remarkPlugins}
                components={{
                  pre: Pre,
                  code({ children, className, ...rest }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <SyntaxHighlighter
                        {...rest}
                        style={editorTheme}
                        language={match[1]}
                        PreTag="div"
                        showLineNumbers={true}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code {...rest} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {(messageContent || '').replace(/\n/g, '  \n')}
              </Markdown>
              {messageFiles && messageFiles.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {messageFiles.map((file) => (
                    <div
                      key={`${file.url}-${file.name ?? ''}`}
                      className="flex items-center gap-2 px-2 py-1 text-xs border rounded bg-base-200 text-base-content border-base-300"
                    >
                      {file.mediaType.startsWith('image/') ? (
                        <button
                          type="button"
                          className="cursor-pointer"
                          onClick={() => onFileClick(file)}
                          onKeyDown={(event) => handleFileKeyDown(event, file)}
                        >
                          <figure className="w-12 h-12 overflow-hidden rounded">
                            <div
                              className="w-full h-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${file.url})` }}
                            />
                          </figure>
                        </button>
                      ) : file.textContent ? (
                        <button
                          type="button"
                          className="cursor-pointer flex items-center gap-2"
                          onClick={() => onFileClick(file)}
                          onKeyDown={(event) => handleFileKeyDown(event, file)}
                        >
                          <FontAwesomeIcon
                            icon={faFile}
                            className="text-base"
                          />
                          <span className="max-w-40 truncate" title={file.name}>
                            {file.name || 'Attachment'}
                          </span>
                        </button>
                      ) : (
                        <>
                          <FontAwesomeIcon
                            icon={faFile}
                            className="text-base"
                          />
                          <span className="max-w-40 truncate" title={file.name}>
                            {file.name || 'Attachment'}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div
          className={clsx('chat-footer', {
            'bot': !isUser,
          })}
        >
          <ChatMeta
            index={index}
            isLoading={isLoading}
            isUser={isUser}
            model={model}
            messageCreatedAt={messageCreatedAt}
            stop={stop}
            totalMessages={totalMessages}
          />
        </div>
      </div>
    );
  }
);

ChatBubble.displayName = 'ChatBubble';

export default ChatBubble;
