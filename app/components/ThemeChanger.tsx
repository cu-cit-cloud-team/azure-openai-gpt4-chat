'use client';

import { faPalette } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { nanoid } from 'nanoid';
import { useTheme } from 'next-themes';
import { useCallback, useEffect } from 'react';

import { getEditorTheme, themes } from '@/app/utils/themes';

export const editorThemeAtom = atomWithStorage(
  'editorTheme',
  getEditorTheme('dark')
);

export const themeAtom = atomWithStorage('theme', 'dark');

export const ThemeChanger = () => {
  const { theme, setTheme } = useTheme();
  const setEditorTheme = useSetAtom(editorThemeAtom);

  // console.log(theme);

  useEffect(() => {
    const details = [...document.querySelectorAll('details.dropdown')];
    document.addEventListener('click', (event) => {
      if (event.target.closest('button')?.classList?.contains('button-theme')) {
        return;
      }
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
    // document.addEventListener('click', handleClickOutside);
  }, []);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const button = e.currentTarget;
      console.log(button);
      setTheme(button.dataset.theme as string);
      setEditorTheme(getEditorTheme(button.dataset.theme as string));
    },
    [setEditorTheme, setTheme]
  );

  const updateSelected = useCallback(() => {
    const selectedSVGs = document.querySelectorAll('svg.themeSelected');
    for (const svg of selectedSVGs) {
      svg.classList.add('hidden');
    }
    const buttons = document.querySelectorAll('button');
    for (const button of buttons) {
      if (button.dataset.theme === theme) {
        const svg = button.querySelector('svg');
        if (svg) {
          svg.classList.remove('hidden');
          svg.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          });
        }
      }
    }
  }, [theme]);

  useEffect(() => {
    updateSelected();
  }, [updateSelected]);

  return (
    <div title="Change Theme" className={'dropdown dropdown-end block'}>
      <div tabIndex={0} role="button" className={'btn btn-sm btn-ghost'}>
        <FontAwesomeIcon icon={faPalette} /> Theme
        <svg
          width="12px"
          height="12px"
          className="hidden h-2 w-2 fill-current opacity-60 sm:inline-block"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
        </svg>
      </div>
      <div
        tabIndex={0}
        className={
          'dropdown-content bg-base-200 text-base-content rounded-box top-px h-[28rem] max-h-[calc(100vh-10rem)] overflow-y-auto border border-white/5 shadow-2xl outline-1 outline-black/5 mt-16'
        }
      >
        <ul className="menu w-56">
          {themes.map((theme) => (
            <li key={theme}>
              <button
                className="px-2 gap-3"
                data-set-theme={theme}
                data-act-class="[&_svg]:visible"
                type="button"
              >
                <div
                  data-theme={theme}
                  className="grid grid-cols-2 gap-0.5 p-1 rounded-md shadow-sm shrink-0 bg-base-100"
                >
                  <div className="size-1 rounded-full bg-base-content" />
                  <div className="size-1 rounded-full bg-primary" />
                  <div className="size-1 rounded-full bg-secondary" />
                  <div className="size-1 rounded-full bg-accent" />
                </div>
                <div className="w-32 truncate">{theme}</div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="invisible h-3 w-3 shrink-0"
                >
                  <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                </svg>
              </button>
            </li>
          ))}
          <li>
            <a href="/theme-generator/">
              <svg
                width="24"
                height="24"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 fill-current"
                viewBox="0 0 512 512"
              >
                <path d="M96,208H48a16,16,0,0,1,0-32H96a16,16,0,0,1,0,32Z" />
                <line x1="90.25" y1="90.25" x2="124.19" y2="124.19" />
                <path d="M124.19,140.19a15.91,15.91,0,0,1-11.31-4.69L78.93,101.56a16,16,0,0,1,22.63-22.63l33.94,33.95a16,16,0,0,1-11.31,27.31Z" />
                <path d="M192,112a16,16,0,0,1-16-16V48a16,16,0,0,1,32,0V96A16,16,0,0,1,192,112Z" />
                <line x1="293.89" y1="90.25" x2="259.95" y2="124.19" />
                <path d="M260,140.19a16,16,0,0,1-11.31-27.31l33.94-33.95a16,16,0,0,1,22.63,22.63L271.27,135.5A15.94,15.94,0,0,1,260,140.19Z" />
                <line x1="124.19" y1="259.95" x2="90.25" y2="293.89" />
                <path d="M90.25,309.89a16,16,0,0,1-11.32-27.31l33.95-33.94a16,16,0,0,1,22.62,22.63l-33.94,33.94A16,16,0,0,1,90.25,309.89Z" />
                <path d="M219,151.83a26,26,0,0,0-36.77,0l-30.43,30.43a26,26,0,0,0,0,36.77L208.76,276a4,4,0,0,0,5.66,0L276,214.42a4,4,0,0,0,0-5.66Z" />
                <path d="M472.31,405.11,304.24,237a4,4,0,0,0-5.66,0L237,298.58a4,4,0,0,0,0,5.66L405.12,472.31a26,26,0,0,0,36.76,0l30.43-30.43h0A26,26,0,0,0,472.31,405.11Z" />
              </svg>
              <div className="grow text-sm font-bold">Make your theme!</div>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ThemeChanger;
