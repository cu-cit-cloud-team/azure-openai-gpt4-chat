import {
  faFloppyDisk,
  faRectangleXmark,
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { UIMessage } from 'ai';
import clsx from 'clsx';
import { useAtom } from 'jotai';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { TokenCount } from '@/app/components/TokenCount';
import { useClearMessages } from '@/app/hooks/useClearMessages';

import { systemMessageAtom } from '@/app/page';

interface SystemMessageProps {
  input: string;
  systemMessageRef?: React.RefObject<HTMLTextAreaElement>;
  setMessages: (messages: UIMessage[]) => void;
  onCloseMenu?: () => void;
  focusTextarea: () => void;
}

export const SystemMessage = memo(
  ({
    input,
    systemMessageRef,
    setMessages,
    onCloseMenu,
    focusTextarea,
  }: SystemMessageProps) => {
    const [systemMessage, setSystemMessage] = useAtom(systemMessageAtom);
    const [localSystemMessage, setLocalSystemMessage] = useState('');
    const [originalSystemMessage, setOriginalSystemMessage] = useState('');
    const dropdownRef = useRef<HTMLDetailsElement>(null);
    const clearMessages = useClearMessages(setMessages);

    useEffect(() => {
      setOriginalSystemMessage(systemMessage);
      setLocalSystemMessage(systemMessage);
    }, [systemMessage]);

    const cancelClickHandler = useCallback(() => {
      setSystemMessage(originalSystemMessage);
      if (dropdownRef.current) {
        dropdownRef.current.removeAttribute('open');
      }
      onCloseMenu?.();
    }, [originalSystemMessage, setSystemMessage, onCloseMenu]);

    const resetClickHandler = useCallback(() => {
      if (localSystemMessage.trim() !== originalSystemMessage.trim()) {
        if (confirm('Are you sure you want to reset your unsaved changes?')) {
          setSystemMessage(originalSystemMessage);
          setLocalSystemMessage(originalSystemMessage);
        }
        onCloseMenu?.();
      }
    }, [
      localSystemMessage,
      originalSystemMessage,
      setSystemMessage,
      onCloseMenu,
    ]);

    const saveClickHandler = useCallback(async () => {
      if (localSystemMessage.trim() !== originalSystemMessage.trim()) {
        if (
          confirm(
            'Are you sure you want to change the system message?\n\nNOTE: This will also clear your chat history and reload the app.'
          )
        ) {
          setLocalSystemMessage(localSystemMessage);
          setSystemMessage(localSystemMessage);
          await clearMessages();
        }
        onCloseMenu?.();
        focusTextarea();
      }
    }, [
      localSystemMessage,
      originalSystemMessage,
      setSystemMessage,
      clearMessages,
      onCloseMenu,
      focusTextarea,
    ]);

    const handleSystemMessageChange = (e) => {
      setLocalSystemMessage(e.target.value);
    };

    return (
      <>
        {/* Re-enabled TokenCount after stateless refactor */}
        <TokenCount
          input={input}
          systemMessage={localSystemMessage}
          display={'systemMessage'}
          useLocalCalculation={true}
        />
        <textarea
          className="h-48 m-2 whitespace-pre-line w-52 lg:w-96"
          ref={systemMessageRef}
          onChange={handleSystemMessageChange}
          value={localSystemMessage}
        />
        <div className="join">
          <button
            className="btn btn-sm lg:btn-md join-item btn-info"
            type="button"
            onClick={cancelClickHandler}
          >
            <FontAwesomeIcon icon={faRectangleXmark} />
            <span className="hidden lg:flex">Close</span>
          </button>
          <button
            className={clsx(
              'btn btn-sm lg:btn-md join-item btn-error grow text-center',
              {
                'btn-disabled':
                  localSystemMessage.trim() === originalSystemMessage.trim(),
              }
            )}
            type="button"
            onClick={resetClickHandler}
          >
            <FontAwesomeIcon icon={faRotateLeft} />
            <span className="hidden lg:flex grow text-center">Reset</span>
          </button>
          <button
            className="btn btn-sm lg:btn-md join-item btn-success"
            type="button"
            disabled={
              localSystemMessage.trim() === originalSystemMessage.trim()
            }
            onClick={saveClickHandler}
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
            <span className="hidden lg:flex">Save</span>
          </button>
        </div>
      </>
    );
  }
);

SystemMessage.displayName = 'SystemMessage';

export default SystemMessage;
