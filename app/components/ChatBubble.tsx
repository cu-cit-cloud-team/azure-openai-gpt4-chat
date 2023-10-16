import { faRobot, faSpinner, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import relativeTime from 'dayjs/plugin/relativeTime';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { markdownToText } from '../utils/markdownToText.ts';

import { CopyToClipboard } from './CopyToClipboard.tsx';

dayjs.extend(isToday);
dayjs.extend(relativeTime);

export const ChatBubble = ({
  message,
  index,
  isUser,
  isLoading,
  totalMessages,
  userMeta,
}) => {
  const [lastUpdatedString, setLastUpdatedString] = useState('');

  useEffect(() => {
    if (!message) {
      return;
    }

    const updateString = () => {
      setLastUpdatedString(dayjs(dayjs(message.createdAt)).from());
    };
    const clockInterval = setInterval(updateString, 1000);

    updateString();

    return () => clearInterval(clockInterval);
  }, []);

  return (
    <div
      key={message.id}
      className={`chat ${isUser ? 'chat-start' : 'chat-end'}`}
    >
      <div className="chat-header">
        {isUser || index !== totalMessages ? (
          <time
            className="text-xs opacity-50 tooltip"
            data-tip={
              dayjs(message.createdAt).isToday()
                ? dayjs(message.createdAt).format('hh:mm a')
                : dayjs(message.createdAt).format('ddd MMM DD YYYY [at] h:mm a')
            }
          >
            {lastUpdatedString}
          </time>
        ) : null}
        {index === totalMessages && !isLoading ? (
          <time
            className="text-xs opacity-50 tooltip"
            data-tip={
              dayjs(message.createdAt).isToday()
                ? dayjs(message.createdAt).format('hh:mm a')
                : dayjs(message.createdAt).format('ddd MMM DD YYYY [at] h:mm a')
            }
          >
            {lastUpdatedString}
          </time>
        ) : null}
      </div>
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
            code(props) {
              // biome-ignore lint/correctness/noUnusedVariables: intentionally unused
              const { children, className, node, ...rest } = props;
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
        {isLoading && !isUser && index === totalMessages ? (
          <FontAwesomeIcon icon={faSpinner} spinPulse fixedWidth />
        ) : null}
        <span className="text-xs">
          {isUser ? `${userMeta?.name ?? 'User '}` : 'Azure OpenAI GPT-4 '}
        </span>
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
