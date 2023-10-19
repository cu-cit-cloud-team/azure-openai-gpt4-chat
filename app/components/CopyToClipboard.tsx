import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { nanoid } from 'nanoid';
import { React, useState } from 'react';

export const CopyToClipboard = ({ textToCopy }) => {
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
    <div className="relative float-right -mr-2">
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
        className="w-8 h-8 p-0 m-0 mr-0 btn btn-sm btn-ghost"
      >
        <FontAwesomeIcon icon={faCopy} fixedWidth />
        {isCopied ? <span className="text-xs capitalize">Copied!</span> : null}
      </button>
    </div>
  );
};

export default CopyToClipboard;
