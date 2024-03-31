import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useCallback } from 'react';

import { database } from '@/app/database/database.config';

export const ExportChatButton = ({
  buttonText = 'Export Chat',
  isLoading,
  systemMessage,
}) => {
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
          return (
            Object.keys(message)
              .sort()
              /* biome-ignore lint/suspicious/noAssignInExpressions: <explanation> */
              // biome-ignore lint/style/noCommaOperator: <explanation>
              .reduce((res, key) => ((res[key] = message[key]), res), {})
          );
        });
        console.log(systemMessage);
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

  return (
    <>
      <button
        type="button"
        onClick={exportHandler}
        disabled={isLoading}
        className={isLoading ? 'btn-disabled' : ''}
      >
        <FontAwesomeIcon icon={faDownload} /> {buttonText}
      </button>
    </>
  );
};

ExportChatButton.displayName = 'ExportChatButton';
ExportChatButton.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  buttonText: PropTypes.string,
};

export default ExportChatButton;
