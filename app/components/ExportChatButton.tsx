import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import { memo, useCallback, useMemo } from 'react';

import { database } from '@/app/database/database.config';

import { systemMessageAtom } from '@/app/page';

interface ExportChatButtonProps {
  buttonText?: string;
  isLoading: boolean;
}

export const ExportChatButton = memo(
  ({ buttonText = 'Export Chat', isLoading }: ExportChatButtonProps) => {
    const systemMessage = useAtomValue(systemMessageAtom);
    const exportHandler = useCallback(
      async (event) => {
        const downloadFile = ({
          data,
          fileName = 'chat-history.json',
          fileType = 'text/json',
        }) => {
          const blob = new Blob([data], { type: fileType });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = fileName;
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
          });
          link.dispatchEvent(clickEvent);
          link.remove();
        };

        event.preventDefault();
        const getMessages = async () => {
          const messages = await database.messages.toArray();
          let sortedMessages = messages.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          sortedMessages = sortedMessages.map((message) => {
            const sortedKeys = Object.keys(message).sort();
            const sortedMessage = {};
            for (const key of sortedKeys) {
              sortedMessage[key] = message[key];
            }
            return sortedMessage;
          });
          // console.log(systemMessage);
          sortedMessages.unshift({
            role: 'system',
            content: systemMessage,
          });
          return JSON.stringify(sortedMessages, null, 2);
        };
        if (confirm('Are you sure you want to download the chat history?')) {
          const data = await getMessages();
          downloadFile({ data });
        }
      },
      [systemMessage]
    );

    const memoizedIcon = useMemo(
      () => <FontAwesomeIcon icon={faDownload} />,
      []
    );

    return (
      <>
        <button
          type="button"
          onClick={exportHandler}
          className={clsx({
            'pointer-events-none opacity-50': isLoading,
          })}
        >
          {memoizedIcon} {buttonText}
        </button>
      </>
    );
  }
);

ExportChatButton.displayName = 'ExportChatButton';

export default ExportChatButton;
