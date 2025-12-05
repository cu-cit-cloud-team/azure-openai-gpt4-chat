import { faBars, faRobot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { UIMessage } from 'ai';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import { memo, useCallback, useEffect, useRef } from 'react';

import { ClearChatButton } from '@/app/components/ClearChatButton';
import { ExportChatButton } from '@/app/components/ExportChatButton';
import { Models } from '@/app/components/Models';
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
  focusTextarea: () => void;
}

export const Header = memo(
  ({
    input,
    isLoading,
    systemMessageRef,
    chatError,
    onClearError,
    setMessages,
    focusTextarea,
  }: HeaderProps) => {
    const menuDetailsRef = useRef<(HTMLDetailsElement | null)[]>([]);

    const closeMenus = useCallback(() => {
      for (const el of menuDetailsRef.current) {
        if (el) {
          el.removeAttribute('open');
        }
      }
    }, []);

    useEffect(() => {
      const handleClick = (event: MouseEvent) => {
        const target = event.target as Node;
        const clickedInside = menuDetailsRef.current.some((el) =>
          el?.contains(target)
        );

        if (!clickedInside) {
          closeMenus();
        }
      };

      const handleToggle = (event: Event) => {
        const target = event.target as HTMLDetailsElement;
        // If this dropdown is being opened, close all others
        if (target.open) {
          for (const el of menuDetailsRef.current) {
            if (el && el !== target) {
              el.removeAttribute('open');
            }
          }
        }
      };

      document.addEventListener('click', handleClick);

      // Add toggle listeners to all details dropdowns
      for (const el of menuDetailsRef.current) {
        if (el) {
          el.addEventListener('toggle', handleToggle);
        }
      }

      return () => {
        document.removeEventListener('click', handleClick);
        for (const el of menuDetailsRef.current) {
          if (el) {
            el.removeEventListener('toggle', handleToggle);
          }
        }
      };
    }, [closeMenus]);

    const renderMenuItems = useCallback(
      (isMobile = false) => (
        <>
          <li>
            <details
              ref={(el) => {
                menuDetailsRef.current[0] = el;
              }}
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
                    onCloseMenu={closeMenus}
                    focusTextarea={focusTextarea}
                  />
                </li>
              </ul>
            </details>
          </li>
          <li>
            <Models onOpen={closeMenus} focusTextarea={focusTextarea} />
          </li>
          <li>
            <ClearChatButton
              buttonText="Clear"
              isLoading={isLoading}
              setMessages={setMessages}
              focusTextarea={focusTextarea}
            />
          </li>
          <li>
            <ExportChatButton buttonText="Export" isLoading={isLoading} />
          </li>
          <li>
            <ThemeChanger onOpen={closeMenus} focusTextarea={focusTextarea} />
          </li>
        </>
      ),
      [
        input,
        isLoading,
        systemMessageRef,
        setMessages,
        closeMenus,
        focusTextarea,
      ]
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
              Cloud Team Chat v{pkg.version}
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
