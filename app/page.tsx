'use client';

import { useChat } from 'ai/react';
import axios from 'axios';
import { useEffect, useRef } from 'react';
import useLocalStorageState from 'use-local-storage-state';

import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Messages } from './components/Messages';

export default function Chat() {
  const [userMeta, setUserMeta] = useLocalStorageState('userMeta', {
    defaultValue: {},
  });

  useEffect(() => {
    if (userMeta?.email && userMeta?.name) {
      return;
    }
    const getUserMeta = async () => {
      await axios
        .get('/.auth/me')
        .then((response) => {
          // console.log(response.data);

          const email = response.data[0].user_claims.find(
            (item) => item.typ === 'preferred_username'
          ).val;

          const name = response.data[0].user_claims.find(
            (item) => item.typ === 'name'
          ).val;

          const user_id = response.data[0].user_id;

          setUserMeta({
            email,
            name,
            user_id,
          });
        })
        // biome-ignore lint/correctness/noUnusedVariables: used for debugging
        .catch((error) => {
          // console.error(error);
        });
    };
    getUserMeta();
  }, [userMeta, setUserMeta]);

  const systemMessageRef = useRef<HTMLTextAreaElement>(null);

  const [systemMessage, setSystemMessage] = useLocalStorageState(
    'systemMessage',
    {
      defaultValue:
        'You are a helpful AI assistant. Answer in markdown format.',
    }
  );

  const [savedMessages] = useLocalStorageState('messages', {
    defaultValue: [],
  });

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: `/api/chat?systemMessage=${encodeURIComponent(systemMessage)}`,
      id: userMeta?.email ? btoa(userMeta?.email) : undefined,
      initialMessages: savedMessages,
    });

  // update localStorage when messages change
  useEffect(() => {
    if (messages.length && messages !== savedMessages) {
      window.localStorage.setItem('messages', JSON.stringify(messages));
      window.dispatchEvent(new Event('storage'));
    }
  }, [messages, savedMessages]);

  // subscribe to storage change events so multiple tabs stay in sync
  useEffect(() => {
    const handleStorageChanges = (e) => {
      const keysToHandle = ['messages', 'theme', 'systemMessage', 'userMeta'];
      const { key } = e;
      if (key && keysToHandle.includes(key)) {
        const newValue = JSON.parse(e.newValue);
        window.localStorage.setItem(key, JSON.stringify(newValue));
        window.dispatchEvent(new Event('storage'));
      }
    };

    window.addEventListener('storage', handleStorageChanges);

    return () => {
      window.removeEventListener('storage', handleStorageChanges);
    };
  }, []);

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
      event.stopPropagation();
      if (event.key === 'Escape' && event.metaKey) {
        if (confirm('Are you sure you want to clear the chat history?')) {
          window.localStorage.removeItem('messages');
          window.dispatchEvent(new Event('storage'));
          window.location.reload();
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
  }, [textareaElement, submitForm]);

  return (
    <>
      <Header
        isLoading={isLoading}
        systemMessage={systemMessage}
        setSystemMessage={setSystemMessage}
        systemMessageRef={systemMessageRef}
        userMeta={userMeta}
      />
      <Messages
        isLoading={isLoading}
        messages={messages}
        userMeta={userMeta}
        savedMessages={savedMessages}
      />
      <Footer
        formRef={formRef}
        systemMessageRef={systemMessageRef}
        textAreaRef={textAreaRef}
        handleSubmit={handleSubmit}
        input={input}
        handleInputChange={handleInputChange}
      />
    </>
  );
}
