import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';

export const ExportChatButton = ({ isLoading, buttonText = 'Export Chat' }) => {
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

  const exportHandler = (event) => {
    event.preventDefault();
    if (confirm('Are you sure you want to download the chat history?')) {
      const data = window.localStorage.getItem('messages');
      downloadFile({ data });
    }
  };

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
