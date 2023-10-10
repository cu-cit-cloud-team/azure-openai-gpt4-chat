'use client';

import { useChat } from 'ai/react';
import { nanoid } from 'nanoid';
import { useEffect, useRef } from 'react';
import useLocalStorageState from 'use-local-storage-state';

import { ChatBubble } from './components/ChatBubble';
import { Footer } from './components/Footer';
import { Header } from './components/Header';

export default function Chat() {
  const systemMessageRef = useRef<HTMLTextAreaElement>(null);

  const [systemMessage, setSystemMessage] = useLocalStorageState(
    'systemMessage',
    {
      defaultValue:
        'You are a helpful AI assistant. Answer in markdown format.',
    }
  );

  const [savedMessages, setSavedMessages] = useLocalStorageState('messages', {
    defaultValue: [],
  });

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: `/api/chat?systemMessage=${encodeURIComponent(systemMessage)}`,
      id: 'ms388',
      initialMessages: savedMessages,
    });

  useEffect(() => {
    if (messages.length > 0 && messages !== savedMessages) {
      setSavedMessages(messages);
    }
  }, [messages]);

  const clearHistoryHandler = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setSavedMessages([]);
      location.reload();
    }
  };

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
          location.reload();
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
    <>
      <Header
        clickHandler={clearHistoryHandler}
        systemMessageHandler={setSystemMessage}
        systemMessageRef={systemMessageRef}
      />
      <div className="z-0 overflow-auto">
        <div className="flex flex-col w-full h-full max-w-6xl min-h-screen mx-auto py-28 mb-28">
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
                  />
                );
              })
            : null}
        </div>
        <Footer
          formRef={formRef}
          systemMessageRef={systemMessageRef}
          textAreaRef={textAreaRef}
          handleSubmit={handleSubmit}
          input={input}
          handleInputChange={handleInputChange}
        />
      </div>
    </>
  );
}
