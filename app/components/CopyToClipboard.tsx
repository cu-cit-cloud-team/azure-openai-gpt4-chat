import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { atom, useAtom, useAtomValue } from 'jotai';
import { nanoid } from 'nanoid';
import PropTypes from 'prop-types';
import { memo, useCallback } from 'react';

export const CopyToClipboard = memo(({ isUser, textToCopy }) => {
  const inputIdKey = nanoid();
  const buttonIdKey = nanoid();

  const isCopiedAtom = atom(false);
  const inputIdAtom = atom(inputIdKey);
  const buttonIdAtom = atom(buttonIdKey);

  const [isCopied, setIsCopied] = useAtom(isCopiedAtom);
  const inputId = useAtomValue(inputIdAtom);
  const buttonId = useAtomValue(buttonIdAtom);

  const copyClickHandler = useCallback(async () => {
    const copyTextToClipboard = async (text) => {
      if ('clipboard' in navigator) {
        return await navigator.clipboard.writeText(text);
      }

      return document.execCommand('copy', true, text);
    };

    await copyTextToClipboard(textToCopy)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [setIsCopied, textToCopy]);

  return (
    <div
      className={clsx('clipboard-container tooltip', {
        'float-left -ml-4 tooltip-right tooltip-primary': isUser,
        'float-right -mr-4 tooltip-left tooltip-secondary': !isUser,
      })}
      data-tip={'Copy to clipboard'}
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
        className={clsx('w-6 h-6 p-0 m-0 mr-0 btn btn-xs', {
          'btn-primary text-primary-content': isUser,
          'btn-secondary text-secondary-content': !isUser,
        })}
      >
        {isCopied ? (
          <FontAwesomeIcon icon={faCheck} className="text-green-600" />
        ) : (
          <FontAwesomeIcon icon={faCopy} />
        )}
      </button>
    </div>
  );
});

CopyToClipboard.displayName = 'CopyToClipboard';
CopyToClipboard.propTypes = {
  isUser: PropTypes.bool.isRequired,
  textToCopy: PropTypes.string.isRequired,
};

export default CopyToClipboard;
