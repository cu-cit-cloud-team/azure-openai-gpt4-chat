import { faBars, faRobot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import { ClearChatButton } from './ClearChatButton';
import { SystemMessage } from './SystemMessage';
import { UpdateCheck } from './UpdateCheck';

const ThemeToggle = dynamic(() => import('./ThemeToggle'), {
  // do not import/render server-side, `window` object is used in component
  ssr: false,
});
import { UserAvatar } from './UserAvatar';

import pkg from '../../package.json';

export const Header = ({
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

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      localStorage.removeItem('messages');
      location.reload();
    }
  };

  return (
    <div className="fixed top-0 z-50 navbar bg-base-200">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <FontAwesomeIcon icon={faBars} />
          </label>
          <ul
            tabIndex={0}
            className="p-2 mt-3 shadow menu menu-sm dropdown-content z-1 bg-base-300 rounded-box"
          >
            <li>
              <details className="system-message-dropdown">
                <summary className="whitespace-nowrap">
                  <FontAwesomeIcon icon={faRobot} />
                  System Message
                </summary>
                <ul className="bg-base-300">
                  <li>
                    <SystemMessage
                      clearHistory={clearHistory}
                      systemMessage={systemMessage}
                      systemMessageRef={systemMessageRef}
                      setSystemMessage={setSystemMessage}
                    />
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <ClearChatButton clearHistory={clearHistory} />
            </li>
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </div>
        <a
          className="text-sm leading-4 normal-case lg:text-xl"
          href="https://github.com/CU-CommunityApps/ct-azure-openai-gpt4-chat"
          target="_blank"
          rel="noreferrer noopener"
        >
          Cloud Team GPT Chat v{pkg.version}
        </a>
        <UpdateCheck appVersion={`v${pkg.version}`} />
      </div>
      <div className="hidden navbar-center lg:flex">
        <ul className="menu menu-horizontal">
          <li>
            <details className="system-message-dropdown">
              <summary>
                <FontAwesomeIcon icon={faRobot} />
                System Message
              </summary>
              <ul className="w-fit bg-base-300">
                <li>
                  <SystemMessage
                    clearHistory={clearHistory}
                    systemMessage={systemMessage}
                    systemMessageRef={systemMessageRef}
                    setSystemMessage={setSystemMessage}
                  />
                </li>
              </ul>
            </details>
          </li>
          {/* <li>
            <details>
              <summary>
                <FontAwesomeIcon icon={faSliders} />
                Parameters
              </summary>
              <ul className="w-48 bg-base-300">
                <li>temperature</li>
                <li>top_p</li>
                <li>frequency_penalty</li>
                <li>presence_penalty</li>
              </ul>
            </details>
          </li> */}
          <li>
            <ClearChatButton clearHistory={clearHistory} />
          </li>
          <li>
            <ThemeToggle />
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
  systemMessage: PropTypes.string.isRequired,
  systemMessageRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.object }),
  ]),
  setSystemMessage: PropTypes.func.isRequired,
  setSavedMessages: PropTypes.func.isRequired,
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
