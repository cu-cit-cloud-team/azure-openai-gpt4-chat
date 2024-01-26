'use client';

import { useChat } from 'ai/react';
import axios from 'axios';
import { useEffect, useRef } from 'react';
import useLocalStorageState from 'use-local-storage-state';

import { Footer } from './components/Footer.tsx';
import { Header } from './components/Header.tsx';
import { Messages } from './components/Messages.tsx';

import { setItem } from './utils/localStorage.ts';

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
      defaultValue: 'You are a helpful AI assistant.',
    }
  );

  const [parameters] = useLocalStorageState('parameters', {
    defaultValue: {
      model: 'gpt-4',
      temperature: '1',
      top_p: '1',
      frequency_penalty: '0',
      presence_penalty: '0',
    },
  });

  const [savedMessages] = useLocalStorageState('messages', {
    defaultValue: [],
  });

  const handleChatError = (error) => {
    console.error(error);
  };

  const {
    error,
    handleInputChange,
    handleSubmit,
    input,
    isLoading,
    messages,
    reload,
    stop,
  } = useChat({
    api: `/api/langchain?systemMessage=${encodeURIComponent(
      systemMessage
    )}&temperature=${encodeURIComponent(
      parameters.temperature
    )}&top_p=${encodeURIComponent(
      parameters.top_p
    )}&frequency_penalty=${encodeURIComponent(
      parameters.frequency_penalty
    )}&presence_penalty=${encodeURIComponent(parameters.presence_penalty)}
      &model=${encodeURIComponent(parameters.model)}`,
    id: userMeta?.email ? btoa(userMeta?.email) : undefined,
    initialMessages: savedMessages,
    onError: handleChatError,
  });

  // update localStorage when messages change
  useEffect(() => {
    if (messages.length && messages !== savedMessages) {
      setItem('messages', messages);
    }
  }, [messages, savedMessages]);

  // subscribe to storage change events so multiple tabs stay in sync
  useEffect(() => {
    const handleStorageChanges = (e) => {
      const keysToHandle = [
        'editorTheme',
        'messages',
        'parameters',
        'remainingTokens',
        'systemMessage',
        'theme',
        'tokens',
        'userMeta',
      ];
      const { key } = e;
      if (key && keysToHandle.includes(key)) {
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
          setItem('messages', []);
          window.location.reload();
        }
      }
      // if (event.key === 'Enter' && event.shiftKey) {
      //   console.log('new line');
      // }
      if (event.key === 'Enter' && !event.shiftKey) {
        if (event.target.value.trim().length) {
          event.preventDefault();
          submitForm();
        } else {
          event.preventDefault();
          return false;
        }
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
        input={input}
        userMeta={userMeta}
      />
      <Messages
        isLoading={isLoading}
        messages={messages}
        userMeta={userMeta}
        savedMessages={savedMessages}
        error={error}
        reload={reload}
        stop={stop}
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
