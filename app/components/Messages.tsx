import { nanoid } from 'nanoid';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

import { ChatBubble } from './ChatBubble.tsx';

export const Messages = ({
  isLoading,
  messages,
  userMeta,
  savedMessages,
  error,
  reload,
  stop,
}) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom fix
  useEffect(() => {
    window.scrollTo({
      left: 0,
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <div className="z-0 overflow-auto bg-base-100">
      <div className="flex flex-col w-full h-full max-w-6xl min-h-screen pt-64 mx-auto mb-12 pb-28">
        {messages.length > 0
          ? messages.map((m, idx) => {
              return (
                <ChatBubble
                  key={m.id || nanoid()}
                  message={m}
                  index={idx}
                  isUser={m.role === 'user'}
                  isLoading={isLoading}
                  totalMessages={messages.length - 1}
                  userMeta={userMeta}
                  savedMessages={savedMessages}
                  stop={stop}
                  reload={reload}
                  error={error}
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
  error: PropTypes.oneOfType([
    PropTypes.instanceOf(Error),
    PropTypes.instanceOf(undefined),
  ]),
  isLoading: PropTypes.bool.isRequired,
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  reload: PropTypes.func.isRequired,
  savedMessages: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.object),
    PropTypes.instanceOf(null),
  ]).isRequired,
  stop: PropTypes.func.isRequired,
  userMeta: PropTypes.oneOfType([
    PropTypes.shape({
      email: PropTypes.string,
      name: PropTypes.string,
      user_id: PropTypes.string,
    }),
    PropTypes.instanceOf(undefined),
  ]).isRequired,
};
export default Messages;
