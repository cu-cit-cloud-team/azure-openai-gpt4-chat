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

import { ThemeToggle } from './ThemeToggle';

import pkg from '../../package.json';

export const Header = ({
  systemMessage,
  systemMessageRef,
  setSystemMessage,
  setSavedMessages,
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

  const clearHistory = () => {
    setSavedMessages([]);
    location.reload();
  };

  const clearHistoryHandler = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      clearHistory();
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
        clearHistory();
      }
    }
  };

  return (
    <div className="fixed top-0 z-50 navbar bg-base-200">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box"
          >
            <li>
              <details className="system-message-dropdown">
                <summary>
                  <FontAwesomeIcon icon={faRobot} fixedWidth />
                  <FontAwesomeIcon icon={faMessage} fixedWidth />
                  System Message
                </summary>
                <ul className="bg-base-300">
                  <li>
                    <textarea
                      className="h-48 whitespace-pre-line w-40 m-2"
                      ref={systemMessageRef}
                      onChange={(e) => setLocalSystemMessage(e.target.value)}
                      value={localSystemMessage}
                    />
                    <div className="join">
                      <button
                        className="btn btn-sm join-item btn-info"
                        type="button"
                        onClick={cancelClickHandler}
                      >
                        <FontAwesomeIcon icon={faRectangleXmark} />
                      </button>
                      <button
                        className={`btn btn-sm join-item btn-error${
                          localSystemMessage?.trim() ===
                          originalSystemMessage?.trim()
                            ? ' btn-disabled'
                            : ''
                        }`}
                        type="button"
                        onClick={resetClickHandler}
                      >
                        <FontAwesomeIcon icon={faRotateLeft} />
                      </button>
                      <button
                        className={`btn btn-sm join-item btn-success${
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
                      </button>
                    </div>
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <button type="button" onClick={clearHistoryHandler}>
                <FontAwesomeIcon icon={faEraser} fixedWidth />
                Clear Chat History
              </button>
            </li>
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </div>
        <a
          className="text-sm lg:text-xl leading-6 normal-case"
          href="https://github.com/CU-CommunityApps/ct-azure-openai-gpt4-chat"
          target="_blank"
          rel="noreferrer noopener"
        >
          Cloud Team GPT Chat v{pkg.version}
          {/* <br />
          <small className="text-xs">Powered by Azure OpenAI GPT-4</small> */}
        </a>
      </div>
      <div className="navbar-center hidden lg:flex">
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
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <span className="mr-2 hidden lg:text-sm">
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
            } rounded-full bg-neutral text-neutral-content`}
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
  systemMessage: PropTypes.string.isRequired,
  systemMessageRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.object }),
  ]),
  setSystemMessage: PropTypes.func.isRequired,
  userMeta: PropTypes.any,
};

export default Header;
