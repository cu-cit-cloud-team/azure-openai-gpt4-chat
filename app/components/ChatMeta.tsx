import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import relativeTime from 'dayjs/plugin/relativeTime';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

dayjs.extend(isToday);
dayjs.extend(relativeTime);

export const ChatMeta = ({
  isLoading,
  index,
  totalMessages,
  isUser,
  message,
  userMeta,
}) => {
  const [lastUpdatedString, setLastUpdatedString] = useState(
    dayjs(dayjs(message.createdAt)).from()
  );

  useEffect(() => {
    const updateString = () => {
      setLastUpdatedString(dayjs(dayjs(message.createdAt)).from());
    };
    const clockInterval = setInterval(updateString, 1000);

    updateString();

    return () => clearInterval(clockInterval);
  }, [message]);

  return (
    <>
      {isLoading && !isUser && index === totalMessages ? (
        <FontAwesomeIcon icon={faSpinner} spinPulse fixedWidth />
      ) : null}
      <span
        className={`cursor-default text-xs tooltip ${
          isUser ? 'tooltip-primary tooltip-right' : 'tooltip-left'
        }`}
        data-tip={
          dayjs(message.createdAt).isToday()
            ? dayjs(message.createdAt).format('hh:mm a')
            : dayjs(message.createdAt).format('ddd MMM DD YYYY [at] h:mm a')
        }
      >
        {isUser ? `${userMeta?.name ?? 'User'}` : 'Azure OpenAI GPT-4'}
        {isUser || index !== totalMessages ? (
          <time>
            <span className="opacity-60">&nbsp;{lastUpdatedString}</span>
          </time>
        ) : null}
        {index === totalMessages && !isLoading ? (
          <time>
            <span className="opacity-60">&nbsp;{lastUpdatedString}</span>
          </time>
        ) : null}
      </span>
    </>
  );
};

ChatMeta.displayName = 'ChatMeta';
ChatMeta.propTypes = {
  isLoading: PropTypes.bool,
  index: PropTypes.number,
  totalMessages: PropTypes.number,
  isUser: PropTypes.bool,
  message: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    createdAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
  }),
  userMeta: PropTypes.oneOfType([
    PropTypes.shape({
      email: PropTypes.string,
      name: PropTypes.string,
    }),
    PropTypes.instanceOf(undefined),
  ]),
};

export default ChatMeta;
