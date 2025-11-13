import type React from 'react';
import { memo, useEffect, useRef } from 'react';

import { ChatBubble } from '@/app/components/ChatBubble';
import {
  extractTextFromV5Message,
  type MyUIMessage,
} from '@/app/utils/conversion';

const MemoizedChatBubble = memo(ChatBubble);

interface MessagesProps {
  isLoading: boolean;
  messages: MyUIMessage[];
  regenerate(...args: unknown[]): unknown;
  stop(...args: unknown[]): unknown;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
}

export const Messages = memo(
  ({ isLoading, messages, regenerate, stop, textAreaRef }): MessagesProps => {
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
          className="flex flex-col w-full h-full max-w-6xl min-h-screen mx-auto pt-36 pb-28"
          ref={messagesRef}
        >
          {messages.length > 0
            ? messages.map((m, idx) => {
                return (
                  <MemoizedChatBubble
                    key={m.id}
                    index={idx}
                    isLoading={isLoading}
                    isUser={m.role === 'user'}
                    messageCreatedAt={m.createdAt}
                    messageContent={extractTextFromV5Message(m)}
                    messageId={m.id}
                    model={m.model}
                    regenerate={regenerate}
                    stop={stop}
                    totalMessages={messages.length - 1}
                  />
                );
              })
            : null}
        </div>
      </div>
    );
  }
);

Messages.displayName = 'Messages';

export default Messages;
