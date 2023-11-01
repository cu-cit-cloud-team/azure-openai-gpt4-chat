import { faRobot, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import Markdown from 'react-markdown';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { markdownToText } from '../utils/markdownToText.ts';

import { ChatMeta } from './ChatMeta.tsx';
import { CopyToClipboard } from './CopyToClipboard.tsx';

export const ChatBubble = ({
  message,
  index,
  isUser,
  isLoading,
  totalMessages,
  userMeta,
}) => {
  const Pre = ({ children }) => {
    return (
      <pre className="code-pre">
        <CopyToClipboard textToCopy={markdownToText(children.props.children)} />
        {children}
      </pre>
    );
  };

  return (
    <div className={`chat ${isUser ? 'chat-start' : 'chat-end'} mb-4`}>
      <div className="chat-image avatar">
        <div
          className={`w-12 pt-2 p-1 rounded text-neutral-content ${
            isUser ? 'bg-primary text-primary-content' : 'bg-neutral'
          }`}
        >
          <FontAwesomeIcon
            className="chat-avatar-icon"
            size="2x"
            icon={isUser ? faUser : faRobot}
            fixedWidth
          />
        </div>
      </div>
      <div
        className={`prose relative chat-bubble${
          isUser ? ' chat-bubble-primary' : ' bot'
        }`}
      >
        {isUser
          ? null
          : (!isLoading || index !== totalMessages) && (
              <CopyToClipboard textToCopy={markdownToText(message.content)} />
            )}
        <Markdown
          children={message.content}
          components={{
            pre: Pre,
            code(props) {
              // biome-ignore lint/correctness/noUnusedVariables: intentionally unused
              const { children, className = 'code-pre', node, ...rest } = props;
              const match = /language-(\w+)/.exec(className || '');
              return match ? (
                <SyntaxHighlighter
                  {...rest}
                  children={String(children).replace(/\n$/, '')}
                  style={nightOwl}
                  language={match[1]}
                  PreTag="div"
                />
              ) : (
                <code {...rest} className={className}>
                  {children}
                </code>
              );
            },
          }}
        />
      </div>
      <div className="chat-footer">
        <ChatMeta
          index={index}
          isLoading={isLoading}
          isUser={isUser}
          message={message}
          totalMessages={totalMessages}
          userMeta={userMeta}
        />
      </div>
    </div>
  );
};

ChatBubble.displayName = 'ChatBubble';
ChatBubble.propTypes = {
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
