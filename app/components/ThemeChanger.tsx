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
  }, []);

  const handleClick = useCallback(
    (e) => {
      const button = e.target.closest('button');
      setTheme(button.dataset.theme);
      setEditorTheme(getEditorTheme(button.dataset.theme));
    },
    [setEditorTheme, setTheme]
  );

  const updateSelected = useCallback(() => {
    const selectedSVGs = document.querySelectorAll('svg.themeSelected');
    for (const svg of selectedSVGs) {
      svg.classList.add('invisible');
    }
    const buttons = document.querySelectorAll('button');
    for (const button of buttons) {
      if (button.dataset.theme === theme) {
        const svg = button.querySelector('svg');
        svg.classList.remove('invisible');
        svg.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }
    }
  }, [theme]);

  useEffect(() => {
    updateSelected();
  }, [updateSelected]);

  return (
    <details className="dropdown lg:dropdown-end">
      <summary className="btn-sm">
        <span className="font-normal">
          <FontAwesomeIcon icon={faPalette} /> Theme
        </span>
      </summary>
      <div className="w-56 mt-12 overflow-y-auto shadow dropdown-content bg-base-200 text-base-content rounded-box top-px h-70vh max-h-96">
        <div className="grid grid-cols-1 gap-3 p-3" tabIndex="0">
          {themes.map((theme) => (
            <button
              className="overflow-hidden text-left rounded-lg outline-base-content button-theme"
              data-theme={theme}
              data-editor-theme={getEditorTheme(theme)}
              onClick={handleClick}
              type="button"
              key={nanoid()}
            >
              <span className="block w-full font-sans cursor-pointer bg-base-100 text-base-content">
                <span className="grid grid-cols-5 grid-rows-3">
                  <span className="flex items-center col-span-5 row-span-3 row-start-1 gap-2 px-4 py-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="invisible w-3 h-3 shrink-0 themeSelected"
                    >
                      <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                    </svg>
                    <span className="flex-grow text-sm">{theme}</span>
                    <span className="flex flex-wrap flex-shrink-0 h-full gap-1">
                      <span className="w-2 rounded bg-primary" />
                      <span className="w-2 rounded bg-secondary" />
                      <span className="w-2 rounded bg-accent" />
                      <span className="w-2 rounded bg-neutral" />
                    </span>
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </details>
  );
};

export default ThemeChanger;
