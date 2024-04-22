import { nanoid } from 'nanoid';
import PropTypes from 'prop-types';
import { memo, useEffect } from 'react';

import { ChatBubble } from '@/app/components/ChatBubble';

export const Messages = memo(({ isLoading, messages, reload, stop }) => {
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
                  key={nanoid()}
                  index={idx}
                  isLoading={isLoading}
                  isUser={m.role === 'user'}
                  message={m}
                  reload={reload}
                  stop={stop}
                  totalMessages={messages.length - 1}
                />
              );
            })
          : null}
      </div>
    </div>
  );
});

Messages.displayName = 'Messages';
Messages.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  reload: PropTypes.func.isRequired,
  savedMessages: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.object),
    PropTypes.instanceOf(null),
  ]).isRequired,
  stop: PropTypes.func.isRequired,
};

export default Messages;
