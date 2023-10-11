import {
  faCircleUser,
  faEraser,
  faFloppyDisk,
  faMessage,
  faRectangleXmark,
  faRobot,
  faRotateLeft,
  // faUserSecret,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import pkg from '../../package.json';

export const Header = ({
  clearHistoryHandler,
  systemMessage,
  systemMessageRef,
  setSystemMessage,
  userMeta,
}) => {
  const [originalSystemMessage, setOriginalSystemMessage] = useState('');
  const [localSystemMessage, setLocalSystemMessage] = useState('');

  useEffect(() => {
    // console.log(systemMessage);
    setOriginalSystemMessage(systemMessage);
    setLocalSystemMessage(systemMessage);
  }, [systemMessage]);

  useEffect(() => {
    const details = [...document.querySelectorAll('.menu details')];
    document.addEventListener('click', (event) => {
      if (!details.some((el) => el.contains(event.target))) {
        details.forEach((el) => el.removeAttribute('open'));
      } else {
        details.forEach((el) =>
          !el.contains(event.target) ? el.removeAttribute('open') : ''
        );
      }
    });
  }, []);

  const cancelClickHandler = () => {
    setSystemMessage(originalSystemMessage);
    const systemMessageMenu = document.querySelector(
      'details.system-message-dropdown'
    );
    if (systemMessageMenu) {
      systemMessageMenu.removeAttribute('open');
    }
  };

  const resetClickHandler = () => {
    if (localSystemMessage !== originalSystemMessage) {
      if (confirm('Are you sure you want to reset your unsaved changes?')) {
        setSystemMessage(originalSystemMessage);
        setLocalSystemMessage(originalSystemMessage);
      }
    }
  };

  const saveClickHandler = () => {
    if (localSystemMessage !== originalSystemMessage) {
      if (
        confirm(
          'Are you sure you want to change the system message?\n\nNOTE: This will also clear your chat history and reload the app.'
        )
      ) {
        setLocalSystemMessage(localSystemMessage);
        setSystemMessage(localSystemMessage);
        clearHistoryHandler(false);
      }
    }
  };

  return (
    <div className="fixed top-0 z-50 navbar bg-base-200">
      <div className="navbar-start">
        <a
          className="text-xl leading-6 normal-case"
          href="https://github.com/CU-CommunityApps/ct-azure-openai-gpt4-chat"
          target="_blank"
          rel="noreferrer noopener"
        >
          Cloud Team GPT Chat v{pkg.version}
          {/* <br />
          <small className="text-xs">Powered by Azure OpenAI GPT-4</small> */}
        </a>
      </div>
      <div className="navbar-center">
        <ul className="menu menu-horizontal">
          <li>
            <details className="system-message-dropdown">
              <summary>
                <FontAwesomeIcon icon={faRobot} fixedWidth />
                <FontAwesomeIcon icon={faMessage} fixedWidth />
                System Message
              </summary>
              <ul className="w-fit bg-base-300">
                <li>
                  <textarea
                    className="h-48 whitespace-pre-line w-96"
                    ref={systemMessageRef}
                    onChange={(e) => setLocalSystemMessage(e.target.value)}
                    value={localSystemMessage}
                  />
                  <div className="join">
                    <button
                      className="btn join-item btn-info"
                      type="button"
                      onClick={cancelClickHandler}
                    >
                      <FontAwesomeIcon icon={faRectangleXmark} />
                      Close
                    </button>
                    <button
                      className={`btn join-item btn-error${
                        localSystemMessage?.trim() ===
                        originalSystemMessage?.trim()
                          ? ' btn-disabled'
                          : ''
                      }`}
                      type="button"
                      onClick={resetClickHandler}
                    >
                      <FontAwesomeIcon icon={faRotateLeft} />
                      Reset
                    </button>
                    <button
                      className={`btn join-item btn-success${
                        localSystemMessage?.trim() ===
                        originalSystemMessage?.trim()
                          ? ' btn-disabled'
                          : ''
                      }`}
                      type="button"
                      disabled={
                        localSystemMessage?.trim() ===
                        originalSystemMessage?.trim()
                      }
                      onClick={saveClickHandler}
                    >
                      <FontAwesomeIcon icon={faFloppyDisk} />
                      Save
                    </button>
                  </div>
                </li>
              </ul>
            </details>
          </li>
          {/* <li>
          <details>
            <summary>Parameters</summary>
            <ul className="w-48 bg-base-300">
              <li>
                <a>level 2 item 1</a>
              </li>
              <li>
                <a>level 2 item 2</a>
              </li>
              <li>
                <details>
                  <summary>Parent</summary>
                  <ul>
                    <li>
                      <a>level 3 item 1</a>
                    </li>
                    <li>
                      <a>level 3 item 2</a>
                    </li>
                  </ul>
                </details>
              </li>
            </ul>
          </details>
        </li> */}
          <li>
            <button type="button" onClick={clearHistoryHandler}>
              <FontAwesomeIcon icon={faEraser} fixedWidth />
              Clear Chat History
            </button>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <span className="mr-2 text-sm">
          {userMeta?.email ? userMeta.email : ''}
        </span>
        <label
          className={`avatar${
            userMeta?.email && userMeta?.name ? ' placeholder' : ''
          }`}
        >
          <div
            className={`p-${
              userMeta?.email && userMeta?.name ? '2' : '1'
            } rounded-full bg-neutral`}
          >
            {userMeta?.email && userMeta?.name ? (
              userMeta?.name?.split(' ')?.map((part) => part[0].toUpperCase())
            ) : (
              <FontAwesomeIcon size="2x" icon={faCircleUser} />
            )}
          </div>
        </label>
      </div>
    </div>
  );
};

Header.displayName = 'Header';
Header.propTypes = {
  clearHistoryHandler: PropTypes.func.isRequired,
};

export default Header;
