import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { nanoid } from 'nanoid';
import { React, useState } from 'react';

export const CopyToClipboard = ({ isUser, textToCopy }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [inputId] = useState(nanoid());
  const [buttonId] = useState(nanoid());

  async function copyTextToClipboard(text) {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand('copy', true, text);
    }
  }

  const copyClickHandler = () => {
    copyTextToClipboard(textToCopy)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div
      className={`clipboard-container ${
        isUser ? 'float-left -ml-4' : 'float-right -mr-4'
      }`}
    >
      <input
        key={inputId}
        className="hidden"
        id={inputId}
        name={inputId}
        type="text"
        value={textToCopy}
        readOnly
      />
      <button
        key={buttonId}
        onClick={copyClickHandler}
        type="button"
        className={`w-6 h-6 p-0 m-0 mr-0 btn btn-xs ${
          isUser
            ? 'btn-primary text-primary-content'
            : 'btn-secondary text-secondary-content'
        }`}
      >
        <FontAwesomeIcon
          icon={isCopied ? faCheck : faCopy}
          className={isCopied ? 'text-green-600' : ''}
        />
      </button>
    </div>
  );
};

export default CopyToClipboard;
