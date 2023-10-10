import {
  faCircleUser,
  faEraser,
  faMessage,
  faRobot,
  faUserAstronaut,
  faUserNinja,
  faUserSecret,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import useLocalStorageState from 'use-local-storage-state';

import pkg from '../../package.json';

export const Header = ({ clickHandler }) => {
  const [systemMessage, setSystemMessage] = useLocalStorageState(
    'systemMessage',
    {
      defaultValue: null,
    }
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!systemMessage) {
      console.log('Setting system message');
      setSystemMessage(
        'You are a helpful AI assistant. Answer in markdown format.'
      );
    }

    if (textareaRef.current) {
      textareaRef.current.value = systemMessage;
    }
  }, [systemMessage]);

  return (
    <div className="fixed top-0 z-50 navbar bg-base-200">
      <div className="navbar-start">
        <a className="text-xl normal-case leading-6" href="/">
          Cloud Team GPT Chat v{pkg.version}
          <br />
          <small className="text-xs">Powered by Azure OpenAI GPT-4</small>
        </a>
      </div>
      <div className="navbar-center">
        <ul className="menu menu-horizontal">
          <li>
            <details>
              <summary>
                <FontAwesomeIcon icon={faRobot} fixedWidth />
                <FontAwesomeIcon icon={faMessage} fixedWidth />
                System Message
              </summary>
              <ul className="w-fit bg-base-300">
                <li>
                  <textarea
                    className="w-96 h-48 whitespace-pre-line"
                    ref={textareaRef}
                    readOnly
                  />
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
            <button type="button" onClick={clickHandler}>
              <FontAwesomeIcon icon={faEraser} fixedWidth />
              Clear History
            </button>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        {/* <button type="button" className="btn btn-neutral" onClick={clickHandler}>
        Clear History
      </button> */}
        <label className="avatar">
          <div className="rounded-full">
            <FontAwesomeIcon size="2x" icon={faCircleUser} />
          </div>
        </label>
      </div>
    </div>
  );
};

Header.displayName = 'Header';
Header.propTypes = {
  clickHandler: PropTypes.func.isRequired,
};

export default Header;
