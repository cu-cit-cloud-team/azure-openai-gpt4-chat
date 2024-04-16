import { faRobot, faSpinner, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import Markdown from 'react-markdown';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism';
import useLocalStorageState from 'use-local-storage-state';

import { ChatMeta } from '@/app/components/ChatMeta.tsx';
import { CopyToClipboard } from '@/app/components/CopyToClipboard.tsx';
import { DeleteMessage } from '@/app/components/DeleteMessage.tsx';
import { ReloadMessage } from '@/app/components/ReloadMessage.tsx';

import { getItem } from '@/app/utils/localStorage.ts';
import { markdownToText } from '@/app/utils/markdownToText.ts';
import { memo } from 'react';

export const ChatBubble = memo(
  ({
    error,
    index,
    isLoading,
    isUser,
    message,
    reload,
    stop,
    totalMessages,
    userMeta,
  }) => {
    const Pre = ({ children }) => {
      return (
        <pre className="code-pre">
          <CopyToClipboard textToCopy={children.props.children} />
          {children}
        </pre>
      );
    };

    const [editorTheme] = useLocalStorageState('editorTheme', {
      defaultValue: getItem('editorTheme') || nightOwl,
    });

    return (
      <div className={`chat mb-10 ${isUser ? 'chat-start' : 'chat-end'}`}>
        <div className="chat-image avatar">
          <div
            className={`w-12 pt-2 p-1 rounded ${
              isUser
                ? 'bg-primary text-primary-content'
                : 'bg-secondary text-secondary-content'
            }`}
          >
            <FontAwesomeIcon
              className="chat-avatar-icon"
              size="2x"
              icon={
                isUser
                  ? faUser
                  : isLoading && index === totalMessages
                    ? faSpinner
                    : faRobot
              }
              spinPulse={!isUser && isLoading && index === totalMessages}
              fixedWidth
            />
          </div>
        </div>
        <div
          className={`prose relative chat-bubble${
            isUser ? ' chat-bubble-primary' : ' chat-bubble-secondary bot'
          }`}
        >
          {(isUser || !isLoading || index !== totalMessages) && (
            <>
              <CopyToClipboard
                isUser={isUser}
                textToCopy={markdownToText(message.content)}
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
            {message.content}
          </Markdown>
        </div>
        <div className={`chat-footer${isUser ? '' : ' bot'}`}>
          <ChatMeta
            index={index}
            isLoading={isLoading}
            isUser={isUser}
            message={message}
            totalMessages={totalMessages}
            userMeta={userMeta}
            stop={stop}
          />
        </div>
      </div>
    );
  }
);

ChatBubble.displayName = 'ChatBubble';
ChatBubble.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.instanceOf(Error),
    PropTypes.instanceOf(undefined),
  ]),
  index: PropTypes.number,
  isLoading: PropTypes.bool,
  isUser: PropTypes.bool,
  message: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    createdAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
  }),
  totalMessages: PropTypes.number,
  userMeta: PropTypes.oneOfType([
    PropTypes.shape({
      email: PropTypes.string,
      name: PropTypes.string,
      user_id: PropTypes.string,
    }),
    PropTypes.instanceOf(undefined),
  ]),
};

export default ChatBubble;
