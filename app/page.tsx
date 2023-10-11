'use client';

import { useChat } from 'ai/react';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { useEffect, useRef } from 'react';
import useLocalStorageState from 'use-local-storage-state';

import { ChatBubble } from './components/ChatBubble';
import { Footer } from './components/Footer';
import { Header } from './components/Header';

export default function Chat() {
  const [userMeta, setUserMeta] = useLocalStorageState('userMeta', {
    defaultValue: { email: undefined, name: undefined },
  });

  useEffect(() => {
    if (userMeta.email) {
      return;
    }
    axios
      .get('/.auth/me')
      .then((response) => {
        // console.log(response.data);
        if (response.data?.user_id) {
          setUserMeta({
            email: response.data?.user_id,
            name: response.data?.user_claims?.find('name')?.value,
          });
        }
      })
      // biome-ignore lint/correctness/noUnusedVariables: used for debugging
      .catch((error) => {
        // ignore and move on
        // console.error(error);
      });
  }, []);

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

  const clearHistoryHandler = (useConfirm = true) => {
    if (useConfirm) {
      confirm('Are you sure you want to clear the chat history?');
      {
        setSavedMessages([]);
        location.reload();
      }
    } else {
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
        clearHistoryHandler={clearHistoryHandler}
        systemMessage={systemMessage}
        setSystemMessage={setSystemMessage}
        systemMessageRef={systemMessageRef}
        clearMessagesHandler={setSavedMessages}
        userMeta={userMeta}
      />
      <div className="z-0 overflow-auto">
        <div className="flex flex-col w-full h-full max-w-6xl min-h-screen pt-48 mx-auto pb-28 mb-28">
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
