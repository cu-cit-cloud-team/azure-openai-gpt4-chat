import { faBars, faRobot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { UIMessage } from 'ai';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import { memo, useCallback, useEffect } from 'react';

import { ClearChatButton } from '@/app/components/ClearChatButton';
import { ExportChatButton } from '@/app/components/ExportChatButton';
import { Parameters } from '@/app/components/Parameters';
import { SystemMessage } from '@/app/components/SystemMessage';
import { UpdateCheck } from '@/app/components/UpdateCheck';

const ThemeChanger = dynamic(
  () => import('@/app/components/ThemeChanger.tsx'),
  {
    // do not import/render server-side, `window` object is used in component
    ssr: false,
  }
);

const UserAvatar = dynamic(() => import('@/app/components/UserAvatar.tsx'));

import pkg from '@/package.json';

interface HeaderProps {
  input: string;
  isLoading: boolean;
  systemMessageRef: React.RefObject<HTMLTextAreaElement>;
  chatError?: string | null;
  onClearError?: () => void;
  setMessages: (messages: UIMessage[]) => void;
}

export const Header = memo(
  ({
    input,
    isLoading,
    systemMessageRef,
    chatError,
    onClearError,
    setMessages,
  }: HeaderProps) => {
    useEffect(() => {
      const handleClick = (event: MouseEvent) => {
        const details = [...document.querySelectorAll('.menu details')];
        if (!details.some((el) => el.contains(event.target as Node))) {
          for (const el of details) {
            el.removeAttribute('open');
          }
        } else {
          for (const el of details) {
            !el.contains(event.target as Node)
              ? el.removeAttribute('open')
              : '';
          }
        }
      };

      document.addEventListener('click', handleClick);
      return () => {
        document.removeEventListener('click', handleClick);
      };
    }, []);

    const renderMenuItems = useCallback(
      (isMobile = false) => (
        <>
          <li>
            <details
              className={clsx('system-message-dropdown', {
                'pointer-events-none opacity-50': isLoading,
              })}
            >
              <summary className={isMobile ? 'whitespace-nowrap' : undefined}>
                <FontAwesomeIcon icon={faRobot} />
                System
              </summary>
              <ul className="bg-base-200">
                <li>
                  <SystemMessage
                    input={input}
                    systemMessageRef={systemMessageRef}
                    setMessages={setMessages}
                  />
                </li>
              </ul>
            </details>
          </li>
          <li
            className={clsx({
              'pointer-events-none opacity-50': isLoading,
            })}
          >
            <Parameters />
          </li>
          <li>
            <ClearChatButton
              buttonText="Clear"
              isLoading={isLoading}
              setMessages={setMessages}
            />
          </li>
          <li>
            <ExportChatButton buttonText="Export" isLoading={isLoading} />
          </li>
          <li>
            <ThemeChanger />
          </li>
        </>
      ),
      [input, isLoading, systemMessageRef, setMessages]
    );

    return (
      <>
        <div className="fixed top-0 z-50 navbar bg-base-300">
          <div className="navbar-start">
            <div className="dropdown">
              {/* biome-ignore lint/a11y/noLabelWithoutControl: daisyUI pattern */}
              <label tabIndex={0} className="btn btn-ghost lg:hidden">
                <FontAwesomeIcon icon={faBars} />
              </label>
              <ul
                tabIndex={0}
                className="p-2 w-52 mt-3 shadow menu menu-sm dropdown-content z-1 bg-base-200 rounded-box"
              >
                {renderMenuItems(true)}
              </ul>
            </div>
            <a
              className="text-sm leading-4 normal-case lg:text-xl"
              href="https://github.com/cu-cit-cloud-team/azure-openai-gpt4-chat"
              target="_blank"
              rel="noreferrer noopener"
            >
              Cloud Team GPT Chat v{pkg.version}
            </a>
            <UpdateCheck />
          </div>
          <div className="hidden navbar-center lg:flex">
            <ul className="menu menu-horizontal">{renderMenuItems()}</ul>
          </div>
          <div className="navbar-end">
            <UserAvatar />
          </div>
        </div>
        {chatError && (
          <div className="fixed top-16 left-0 right-0 z-40 alert alert-error">
            <span>{chatError}</span>
            {onClearError && (
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={onClearError}
              >
                ✕
              </button>
            )}
          </div>
        )}
      </>
    );
  }
);

Header.displayName = 'Header';

export default Header;
