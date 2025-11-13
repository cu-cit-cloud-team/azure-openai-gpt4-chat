import { faRobot, faSpinner, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import markdownToTxt from 'markdown-to-txt';
import { nanoid } from 'nanoid';
import { memo, useMemo } from 'react';
import Markdown from 'react-markdown';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';

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
  messageCreatedAt?: string | Date;
  messageId?: string;
  model?: string;
  regenerate?(...args: unknown[]): unknown;
  stop?(...args: unknown[]): unknown;
  totalMessages?: number;
}

const Pre = ({ children }) => {
  return (
    <pre className="code-pre">
      <CopyToClipboard key={nanoid()} textToCopy={children.props.children} />
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
    messageCreatedAt,
    messageId,
    model,
    regenerate,
    stop,
    totalMessages,
  }: ChatBubbleProps) => {
    const editorTheme = useAtomValue(editorThemeAtom);
    const copyToClipBoardKey = nanoid();

    const rehypePlugins = useMemo(
      () => [rehypeKatex, rehypeSanitize, rehypeStringify],
      []
    );

    const remarkPlugins = useMemo(
      () => [remarkGfm, remarkMath, remarkParse, remarkRehype],
      []
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
          className={clsx('relative chat-bubble', {
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
              <DeleteMessage isUser={isUser} messageId={messageId} />
              {index === totalMessages ? (
                <ReloadMessage
                  isUser={isUser}
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
              {messageContent?.replace(/\n/g, '  \n') || ''}
            </Markdown>
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
