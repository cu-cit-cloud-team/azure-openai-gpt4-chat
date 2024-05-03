import { nanoid } from 'nanoid';
import PropTypes from 'prop-types';
import { memo, useEffect, useRef } from 'react';

import { ChatBubble } from '@/app/components/ChatBubble';

import { useRefsContext } from '@/app/contexts/RefsContext';

export const Messages = memo(({ isLoading, messages, reload, stop }) => {
  const { textAreaRef } = useRefsContext();

  const messagesRef = useRef(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom fix
  useEffect(() => {
    window.scrollTo({
      left: 0,
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const { height } = entries[0].contentRect;
      messagesRef.current.style.paddingBottom = `${height + 110}px`;
      window.scrollTo({
        left: 0,
        top: document.body.scrollHeight,
        behavior: 'smooth',
      });
    });
    observer.observe(textAreaRef?.current);
  }, [textAreaRef]);

  return (
    <div className="z-0 overflow-auto bg-base-100">
      <div
        className="flex flex-col w-full h-full max-w-6xl min-h-screen pt-64 mx-auto pb-28"
        ref={messagesRef}
      >
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
