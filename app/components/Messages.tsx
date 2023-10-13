import { nanoid } from 'nanoid';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';

import { ChatBubble } from './ChatBubble';

export const Messages = ({ isLoading, messages, userMeta }) => {
  const lastMessageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    window.scrollTo({
      left: 0,
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <div className="z-0 overflow-auto">
      <div className="flex flex-col w-full h-full max-w-6xl min-h-screen pt-48 mx-auto pb-28 mb-36">
        {messages.length > 0
          ? messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <ChatBubble
                  key={nanoid()}
                  message={m}
                  index={idx}
                  isUser={isUser}
                  isLoading={isLoading}
                  lastMessageRef={lastMessageRef}
                  totalMessages={messages.length - 1}
                  userMeta={userMeta}
                />
              );
            })
          : null}
      </div>
    </div>
  );
};

Messages.displayName = 'Messages';
Messages.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  userMeta: PropTypes.oneOfType([
    PropTypes.shape({
      email: PropTypes.string,
      name: PropTypes.string,
      user_id: PropTypes.string,
    }),
    PropTypes.instanceOf(undefined),
  ]),
};
export default Messages;
