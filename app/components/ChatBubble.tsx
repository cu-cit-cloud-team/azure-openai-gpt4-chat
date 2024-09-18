import { faRobot, faSpinner, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import markdownToTxt from 'markdown-to-txt';
import { nanoid } from 'nanoid';
import PropTypes from 'prop-types';
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

import { editorThemeAtom } from '@/app/components/ThemeChanger';

export const ChatBubble = memo(
  ({
    index,
    isLoading,
    isUser,
    messageContent,
    messageCreatedAt,
    messageId,
    modelString,
    reload,
    stop,
    totalMessages,
  }) => {
    const editorTheme = useAtomValue(editorThemeAtom);
    const copyToClipBoardKey = nanoid();
    const preCopyToClipBoardKey = nanoid();

    const Pre = ({ children }) => {
      return (
        <pre className="code-pre">
          <CopyToClipboard
            key={preCopyToClipBoardKey}
            textToCopy={children.props.children}
          />
          {children}
        </pre>
      );
    };

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
              <DeleteMessage isUser={isUser} messageId={messageId} />
              {index === totalMessages ? (
                <ReloadMessage
                  isUser={isUser}
                  reload={reload}
                  messageId={messageId}
                />
              ) : null}
            </>
          )}
          <Markdown
            rehypePlugins={rehypePlugins}
            remarkPlugins={remarkPlugins}
            components={{
              pre: Pre,
              code(props) {
                const {
                  children,
                  className = 'code-pre',
                  node,
                  ...rest
                } = props;
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
            {messageContent.replace(/\n/g, '  \n')}
          </Markdown>
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
            modelString={modelString}
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
ChatBubble.propTypes = {
  index: PropTypes.number,
  isLoading: PropTypes.bool,
  isUser: PropTypes.bool,
  messageContent: PropTypes.string,
  messageCreatedAt: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  messageId: PropTypes.string,
  reload: PropTypes.func,
  stop: PropTypes.func,
  totalMessages: PropTypes.number,
};

export default ChatBubble;
