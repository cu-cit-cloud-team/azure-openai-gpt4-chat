import {
  faFloppyDisk,
  faRectangleXmark,
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { atom, useAtom } from 'jotai';
import { Suspense, memo, useCallback, useEffect, useMemo } from 'react';

import { TokenCount } from '@/app/components/TokenCount';

import { database } from '@/app/database/database.config';

import { systemMessageAtom } from '@/app/page';

interface SystemMessageProps {
  input?: string;
  systemMessageRef?: (...args: unknown[]) =>
    | unknown
    | {
        current?: object;
      };
}

export const SystemMessage = memo(
  ({ input, systemMessageRef }: SystemMessageProps) => {
    const localSystemMessageAtom = atom('');
    const originalSystemMessageAtom = atom('');

    const [systemMessage, setSystemMessage] = useAtom(systemMessageAtom);
    const [localSystemMessage, setLocalSystemMessage] = useAtom(
      localSystemMessageAtom
    );
    const [originalSystemMessage, setOriginalSystemMessage] = useAtom(
      originalSystemMessageAtom
    );

    useEffect(() => {
      setOriginalSystemMessage(systemMessage);
      setLocalSystemMessage(systemMessage);
    }, [setLocalSystemMessage, setOriginalSystemMessage, systemMessage]);

    const cancelClickHandler = useCallback(() => {
      setSystemMessage(originalSystemMessage);
      const systemMessageMenu = document.querySelectorAll(
        'details.system-message-dropdown'
      );
      for (const menu of systemMessageMenu) {
        if (menu) {
          menu.removeAttribute('open');
        }
      }
    }, [originalSystemMessage, setSystemMessage]);

    const resetClickHandler = useCallback(() => {
      if (localSystemMessage !== originalSystemMessage) {
        if (confirm('Are you sure you want to reset your unsaved changes?')) {
          setSystemMessage(originalSystemMessage);
          setLocalSystemMessage(originalSystemMessage);
        }
      }
    }, [
      localSystemMessage,
      originalSystemMessage,
      setLocalSystemMessage,
      setSystemMessage,
    ]);

    const saveClickHandler = useCallback(async () => {
      if (localSystemMessage !== originalSystemMessage) {
        if (
          confirm(
            'Are you sure you want to change the system message?\n\nNOTE: This will also clear your chat history and reload the app.'
          )
        ) {
          setLocalSystemMessage(localSystemMessage);
          setSystemMessage(localSystemMessage);
          try {
            await database.messages.clear();
            window.location.reload();
          } catch (error) {
            console.error(error);
          }
        }
      }
    }, [
      localSystemMessage,
      originalSystemMessage,
      setLocalSystemMessage,
      setSystemMessage,
    ]);

    const handleSystemMessageChange = (e) => {
      setLocalSystemMessage(e.target.value);
    };

    const MemoizedFontAwesomeRectangleXIcon = useMemo(
      () => <FontAwesomeIcon icon={faRectangleXmark} />,
      []
    );

    const MemoizedFontAwesomeRotateIcon = useMemo(
      () => <FontAwesomeIcon icon={faRotateLeft} />,
      []
    );

    const MemoizedFontAwesomeSaveIcon = useMemo(
      () => <FontAwesomeIcon icon={faFloppyDisk} />,
      []
    );

    return (
      <>
        <TokenCount
          input={input}
          systemMessage={localSystemMessage}
          display={'systemMessage'}
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
            <Suspense fallback={<span>Loading...</span>}>
              {MemoizedFontAwesomeRectangleXIcon}
            </Suspense>
            <span className="hidden lg:flex">Close</span>
          </button>
          <button
            className={clsx(
              'btn btn-sm lg:btn-md join-item btn-error grow text-center',
              {
                'btn-disabled':
                  localSystemMessage?.trim() === originalSystemMessage?.trim(),
              }
            )}
            type="button"
            onClick={resetClickHandler}
          >
            {MemoizedFontAwesomeRotateIcon}
            <span className="hidden lg:flex grow text-center">Reset</span>
          </button>
          <button
            className={clsx('btn btn-sm lg:btn-md join-item btn-success', {
              'btn-disabled':
                localSystemMessage?.trim() === originalSystemMessage?.trim(),
            })}
            type="button"
            disabled={
              localSystemMessage?.trim() === originalSystemMessage?.trim()
            }
            onClick={saveClickHandler}
          >
            {MemoizedFontAwesomeSaveIcon}
            <span className="hidden lg:flex">Save</span>
          </button>
        </div>
      </>
    );
  }
);

SystemMessage.displayName = 'SystemMessage';

export default SystemMessage;
