import type { UIMessage } from 'ai';
import type React from 'react';
import { memo, useEffect, useRef } from 'react';

import { ChatBubble } from '@/app/components/ChatBubble';

import { getMessageFiles, getMessageText } from '@/app/utils/messageHelpers';
import { defaultModel } from '@/app/utils/models';

// Footer height offset for scroll padding calculation
const FOOTER_OFFSET = 110;

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
    messages,
    isLoading,
    messageModels,
    regenerate,
    stop,
    textAreaRef,
    onFileClick,
    focusTextarea,
  }: MessagesProps) => {
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
        messagesRef.current.style.paddingBottom = `${height + FOOTER_OFFSET}px`;
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
          {messages && messages.length > 0
            ? messages.map((message, index) => {
                const messageText = getMessageText(message);
                const messageFiles = getMessageFiles(message);

                return (
                  <ChatBubble
                    key={message.id}
                    index={index}
                    isLoading={isLoading}
                    isUser={message.role === 'user'}
                    messageContent={messageText}
                    messageFiles={messageFiles}
                    messageCreatedAt={message.createdAt}
                    messageId={message.id}
                    model={
                      messageModels?.[message.id] ||
                      defaultModel?.name ||
                      'gpt-5'
                    }
                    regenerate={regenerate}
                    stop={stop}
                    totalMessages={messages.length - 1}
                    onFileClick={onFileClick}
                    focusTextarea={focusTextarea}
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
