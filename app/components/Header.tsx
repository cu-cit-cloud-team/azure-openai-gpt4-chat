import { faBars, faRobot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import { ClearChatButton } from './ClearChatButton.tsx';
import { ExportChatButton } from './ExportChatButton.tsx';
import { Parameters } from './Parameters.tsx';
import { SystemMessage } from './SystemMessage.tsx';
import { UpdateCheck } from './UpdateCheck.tsx';
import { UserAvatar } from './UserAvatar.tsx';

const ThemeChanger = dynamic(() => import('./ThemeChanger.tsx'), {
  // do not import/render server-side, `window` object is used in component
  ssr: false,
});

import { setItem } from '../utils/localStorage.ts';

import pkg from '../../package.json';

export const Header = ({
  input,
  isLoading,
  systemMessage,
  systemMessageRef,
  setSystemMessage,
  userMeta,
}) => {
  useEffect(() => {
    const details = [...document.querySelectorAll('.menu details')];
    document.addEventListener('click', (event) => {
      if (!details.some((el) => el.contains(event.target))) {
        for (const el of details) {
          el.removeAttribute('open');
        }
      } else {
        for (const el of details) {
          !el.contains(event.target) ? el.removeAttribute('open') : '';
        }
      }
    });
  }, []);

  const clearHistory = (doConfirm = true) => {
    if (!doConfirm) {
      setItem('messages', []);
      window.location.reload();
    } else if (confirm('Are you sure you want to clear the chat history?')) {
      setItem('messages', []);
      window.location.reload();
    }
  };

  return (
    <div className="fixed top-0 z-50 navbar bg-base-300">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <FontAwesomeIcon icon={faBars} />
          </label>
          <ul
            tabIndex={0}
            className="p-2 mt-3 shadow menu menu-sm dropdown-content z-1 bg-base-200 rounded-box"
          >
            <li>
              <details className="system-message-dropdown">
                <summary className="whitespace-nowrap">
                  <FontAwesomeIcon icon={faRobot} />
                  System
                </summary>
                <ul className="bg-base-200">
                  <li>
                    <SystemMessage
                      clearHistory={clearHistory}
                      input={input}
                      systemMessage={systemMessage}
                      systemMessageRef={systemMessageRef}
                      setSystemMessage={setSystemMessage}
                    />
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <Parameters clearHistory={clearHistory} />
            </li>
            <li>
              <ClearChatButton
                clearHistory={clearHistory}
                isLoading={isLoading}
                buttonText="Clear"
              />
            </li>
            <li>
              <ExportChatButton buttonText="Export" isLoading={isLoading} />
            </li>
            <li>
              <ThemeChanger />
            </li>
          </ul>
        </div>
        <a
          className="text-sm leading-4 normal-case lg:text-xl"
          href="https://github.com/CU-CommunityApps/ct-azure-openai-gpt4-chat"
          target="_blank"
          rel="noreferrer noopener"
        >
          GPT Chat Demo v{pkg.version}
        </a>
        <UpdateCheck />
      </div>
      <div className="hidden navbar-center lg:flex">
        <ul className="menu menu-horizontal">
          <li>
            <details className="system-message-dropdown">
              <summary>
                <FontAwesomeIcon icon={faRobot} />
                System
              </summary>
              <ul className="w-fit bg-base-200">
                <li>
                  <SystemMessage
                    clearHistory={clearHistory}
                    input={input}
                    systemMessage={systemMessage}
                    systemMessageRef={systemMessageRef}
                    setSystemMessage={setSystemMessage}
                  />
                </li>
              </ul>
            </details>
          </li>
          <li>
            <Parameters clearHistory={clearHistory} />
          </li>
          <li>
            <ClearChatButton
              buttonText="Clear"
              clearHistory={clearHistory}
              isLoading={isLoading}
            />
          </li>
          <li>
            <ExportChatButton buttonText="Export" isLoading={isLoading} />
          </li>
          <li>
            <ThemeChanger />
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <UserAvatar userMeta={userMeta} />
      </div>
    </div>
  );
};

Header.displayName = 'Header';
Header.propTypes = {
  input: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  systemMessage: PropTypes.string.isRequired,
  systemMessageRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.object }),
  ]),
  setSystemMessage: PropTypes.func.isRequired,
  userMeta: PropTypes.oneOfType([
    PropTypes.shape({
      email: PropTypes.string,
      name: PropTypes.string,
      user_id: PropTypes.string,
    }),
    PropTypes.instanceOf(undefined),
  ]),
};

export default Header;
