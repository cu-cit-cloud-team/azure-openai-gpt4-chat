import type { UIMessage } from 'ai';
import type React from 'react';
import { memo, useEffect, useRef } from 'react';

import { ChatBubble } from '@/app/components/ChatBubble';
import { getMessageFiles, getMessageText } from '@/app/utils/messageHelpers';

interface MessagesProps {
  isLoading: boolean;
  messages: UIMessage[];
  messageModels: Map<string, string>;
  regenerate: (messageId: string) => void;
  stop: () => void;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  onFileClick: (file: {
    type: string;
    mediaType: string;
    url?: string;
    textContent?: string;
    name?: string;
  }) => void;
}

export const Messages = memo(
  ({
    isLoading,
    messages,
    messageModels,
    regenerate,
    stop,
    textAreaRef,
    onFileClick,
  }: MessagesProps): JSX.Element => {
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

      return () => observer.disconnect();
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
                  <ChatBubble
                    key={m.id}
                    index={idx}
                    isLoading={isLoading}
                    isUser={m.role === 'user'}
                    messageCreatedAt={m.createdAt}
                    messageContent={getMessageText(m)}
                    messageFiles={getMessageFiles(m)}
                    messageId={m.id}
                    model={messageModels.get(m.id) || m.model}
                    regenerate={regenerate}
                    stop={stop}
                    totalMessages={messages.length - 1}
                    onFileClick={onFileClick}
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
