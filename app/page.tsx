'use client';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useChat } from 'ai/react';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  materialDark,
  nightOwl,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import useLocalStorageState from 'use-local-storage-state';

export default function Chat() {
  const [savedMessages, setSavedMessages] = useLocalStorageState('messages', {
    defaultValue: [],
  });

  const { messages, input, handleInputChange, handleSubmit, data, isLoading } =
    useChat({
      id: 'ms388',
      initialMessages: savedMessages,
    });

  useEffect(() => {
    if (messages.length > 0 && messages !== savedMessages) {
      setSavedMessages(messages);
    }
  }, [messages]);

  const lastMessageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formRef = useRef<HTMLFormElement>(null);
  const submitForm = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }
  };

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const textareaElement = textAreaRef.current;
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && event.metaKey) {
        if (confirm('Are you sure you want to clear the chat history?')) {
          setSavedMessages([]);
          location.reload(true);
        }
      }
      if (event.key === 'Enter' && event.metaKey) {
        submitForm();
      }
    };
    if (textareaElement) {
      textareaElement.addEventListener('keydown', listener);
    }
    return () => {
      if (textareaElement) {
        textareaElement.removeEventListener('keydown', listener);
      }
    };
  }, [textareaElement]);

  return (
    <div className="flex flex-col w-full h-full max-w-6xl min-h-screen py-6 mx-auto mb-32">
      {messages.length > 0
        ? messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                ref={idx === messages.length - 1 ? lastMessageRef : null}
                className={`chat ${isUser ? 'chat-start' : 'chat-end'}`}
              >
                <div className="chat-image avatar">
                  <div className="w-10 rounded">
                    <img
                      src={`/${isUser ? 'icon-user.png' : 'openai.svg'}`}
                      alt=""
                      className={`${isUser ? 'invert' : ''}`}
                    />
                  </div>
                </div>
                <div className="prose chat-bubble">
                  <Markdown
                    children={m.content}
                    components={{
                      code(props) {
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
                  {idx === messages.length - 1 && !isLoading ? (
                    <time className="text-xs opacity-50">
                      {dayjs(m.createdAt).format('h:mm A')}
                    </time>
                  ) : null}
                  {idx !== messages.length - 1 ? (
                    <time className="text-xs opacity-50">
                      {dayjs(m.createdAt).format('h:mm A')}
                    </time>
                  ) : null}
                  {isLoading && !isUser && idx === messages.length - 1 ? (
                    <FontAwesomeIcon icon={faSpinner} spinPulse fixedWidth />
                  ) : null}
                </div>
              </div>
            );
          })
        : null}
      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="fixed bottom-0 mb-8">
          <textarea
            autoFocus={true}
            ref={textAreaRef}
            className="fixed w-full max-w-6xl p-2 border border-gray-300 rounded shadow-xl bottom-16"
            value={input}
            placeholder="Type a message..."
            onChange={handleInputChange}
          />
          <small className="fixed bottom-8">
            <kbd className="kbd">⌘</kbd>+<kbd className="kbd">Enter</kbd> to
            send /<kbd className="kbd">⌘</kbd>+<kbd className="kbd">Esc</kbd> to
            clear history
          </small>
        </div>
      </form>
      {textAreaRef?.current?.focus()}
    </div>
  );
}
