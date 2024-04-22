import { faBars, faRobot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { memo, useEffect } from 'react';

import { ClearChatButton } from '@/app/components/ClearChatButton';
import { ExportChatButton } from '@/app/components/ExportChatButton';
import { Parameters } from '@/app/components/Parameters';
import { SystemMessage } from '@/app/components/SystemMessage';
import { UpdateCheck } from '@/app/components/UpdateCheck';
import { UserAvatar } from '@/app/components/UserAvatar';

const ThemeChanger = dynamic(
  () => import('@/app/components/ThemeChanger.tsx'),
  {
    // do not import/render server-side, `window` object is used in component
    ssr: false,
  }
);

import pkg from '@/package.json';

export const Header = memo(
  ({
    clearHistory,
    input,
    isLoading,
    systemMessage,
    systemMessageRef,
    setSystemMessage,
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
                <ExportChatButton
                  buttonText="Export"
                  isLoading={isLoading}
                  systemMessage={systemMessage}
                />
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
            Cloud Team GPT Chat v{pkg.version}
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
              <ExportChatButton
                buttonText="Export"
                isLoading={isLoading}
                systemMessage={systemMessage}
              />
            </li>
            <li>
              <ThemeChanger />
            </li>
          </ul>
        </div>
        <div className="navbar-end">
          <UserAvatar />
        </div>
      </div>
    );
  }
);

Header.displayName = 'Header';
Header.propTypes = {
  clearHistory: PropTypes.func.isRequired,
  input: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  systemMessage: PropTypes.string.isRequired,
  systemMessageRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.object }),
  ]),
  setSystemMessage: PropTypes.func.isRequired,
};

export default Header;
