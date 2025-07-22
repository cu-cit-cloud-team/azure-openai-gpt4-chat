import { faBars, faRobot } from '@fortawesome/free-solid-svg-icons';
import dynamic from 'next/dynamic';
import { Suspense, lazy, memo, useEffect, useMemo } from 'react';

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

// Lazy load FontAwesomeIcon
const FontAwesomeIcon = lazy(() =>
  import('@fortawesome/react-fontawesome').then((module) => ({
    default: module.FontAwesomeIcon,
  }))
);

import pkg from '@/package.json';

interface HeaderProps {
  input: string;
  isLoading: boolean;
  systemMessageRef: object;
}

export const Header = memo(
  ({ input, isLoading, systemMessageRef }: HeaderProps) => {
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

    const memoFaBars = useMemo(() => <FontAwesomeIcon icon={faBars} />, []);
    const memoFaRobot = useMemo(() => <FontAwesomeIcon icon={faRobot} />, []);
    const memoThemeChanger = useMemo(() => <ThemeChanger />, []);

    return (
      <div className="fixed top-0 z-50 navbar bg-base-300">
        <div className="navbar-start">
          <div className="dropdown">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label tabIndex={0} className="btn btn-ghost lg:hidden">
              <Suspense fallback={<div>Loading...</div>}>{memoFaBars}</Suspense>
            </label>
            <ul
              tabIndex={0}
              className="p-2 w-52 mt-3 shadow menu menu-sm dropdown-content z-1 bg-base-200 rounded-box"
            >
              <li>
                <details className="system-message-dropdown">
                  <summary className="whitespace-nowrap">
                    <Suspense fallback={<div>Loading...</div>}>
                      {memoFaRobot}
                    </Suspense>
                    System
                  </summary>
                  <ul className="bg-base-200">
                    <li>
                      <SystemMessage
                        input={input}
                        systemMessageRef={systemMessageRef}
                      />
                    </li>
                  </ul>
                </details>
              </li>
              <li>
                <Parameters />
              </li>
              <li>
                <ClearChatButton buttonText="Clear" isLoading={isLoading} />
              </li>
              <li>
                <ExportChatButton buttonText="Export" isLoading={isLoading} />
              </li>
              <li>{memoThemeChanger}</li>
            </ul>
          </div>
          <a
            className="text-sm leading-4 normal-case lg:text-xl"
            href="https://github.com/cu-cit-cloud-team/azure-openai-gpt4-chat"
            target="_blank"
            rel="noreferrer noopener"
          >
            TeamGPT v{pkg.version}
          </a>
          <UpdateCheck />
        </div>
        <div className="hidden navbar-center lg:flex">
          <ul className="menu menu-horizontal">
            <li>
              <details className="system-message-dropdown">
                <summary>
                  <Suspense fallback={<div>Loading...</div>}>
                    {memoFaRobot}
                  </Suspense>
                  System
                </summary>
                <ul className="bg-base-200">
                  <li>
                    <SystemMessage
                      input={input}
                      systemMessageRef={systemMessageRef}
                    />
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <Parameters />
            </li>
            <li>
              <ClearChatButton buttonText="Clear" isLoading={isLoading} />
            </li>
            <li>
              <ExportChatButton buttonText="Export" isLoading={isLoading} />
            </li>
            <li>{memoThemeChanger}</li>
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

export default Header;
