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
  ({ index, isLoading, isUser, message, reload, stop, totalMessages }) => {
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

    const bubbleIcon = useMemo(() => {
      return isUser
        ? faUser
        : isLoading && index === totalMessages
          ? faSpinner
          : faRobot;
    }, [index, isLoading, isUser, totalMessages]);

    const bubbleIconSpinPulse = useMemo(() => {
      return !isUser && isLoading && index === totalMessages;
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
            <FontAwesomeIcon
              className="chat-avatar-icon"
              size="2x"
              icon={bubbleIcon}
              spinPulse={bubbleIconSpinPulse}
              fixedWidth
            />
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
                textToCopy={markdownToTxt(message.content)}
              />
              <DeleteMessage isUser={isUser} message={message} />
              {index === totalMessages ? (
                <ReloadMessage
                  isUser={isUser}
                  reload={reload}
                  message={message}
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
            {message.content.replace(/\n/g, '  \n')}
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
            message={message}
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
  message: PropTypes.object,
  reload: PropTypes.func,
  stop: PropTypes.func,
  totalMessages: PropTypes.number,
};

export default ChatBubble;
