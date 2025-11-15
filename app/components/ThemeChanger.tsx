'use client';

import { faPalette } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSetAtom } from 'jotai';
import { useTheme } from 'next-themes';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { editorThemeAtom } from '@/app/page';
import { getEditorTheme, themes } from '@/app/utils/themes';

export const ThemeChanger = () => {
  const { theme, setTheme } = useTheme();
  const setEditorTheme = useSetAtom(editorThemeAtom);
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const themeListRef = useRef<HTMLUListElement>(null);

  const memoizedPaletteIcon = useMemo(
    () => <FontAwesomeIcon icon={faPalette} />,
    []
  );

  // console.log(theme);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        (event.target as Element)
          .closest('button')
          ?.classList?.contains('button-theme')
      ) {
        return;
      }

      // Close dropdown if clicking outside
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        dropdownRef.current.removeAttribute('open');
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = e.currentTarget;
      setTheme(button.dataset.set_theme as string);
      setEditorTheme(getEditorTheme(button.dataset.set_theme as string));
    },
    [setEditorTheme, setTheme]
  );

  const updateSelected = useCallback(() => {
    if (!themeListRef.current) {
      return;
    }

    // Find all theme selection checkmarks within our theme list
    const selectedSVGs =
      themeListRef.current.querySelectorAll('svg.themeSelected');
    for (const svg of selectedSVGs) {
      svg.classList.add('hidden');
    }

    const buttons = themeListRef.current.querySelectorAll(
      'button[data-set_theme]'
    );
    for (const button of buttons) {
      if ((button as HTMLButtonElement).dataset.set_theme === theme) {
        const svg = button.querySelector('svg');
        if (svg) {
          svg.classList.remove('hidden');
          svg.classList.add('visible');
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
    <details
      ref={dropdownRef}
      title="Change Theme"
      className="-m-1 dropdown dropdown-end"
    >
      <summary className="btn btn-sm btn-ghost w-fit list-none">
        {memoizedPaletteIcon} Theme
        <svg
          width="12px"
          height="12px"
          className="hidden h-2 w-2 fill-current opacity-60 sm:inline-block"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
        </svg>
      </summary>
      <div className="dropdown-content bg-base-200 text-base-content rounded-box top-px h-112 max-h-[calc(100vh-10rem)] overflow-y-auto border border-white/5 shadow-2xl outline-1 outline-black/5 mt-13">
        <ul
          ref={themeListRef}
          className="menu"
          style={{
            marginInlineStart: 'initial',
            paddingInlineStart: 'initial',
          }}
        >
          {themes.map((theme) => (
            <li key={theme}>
              <button
                className="px-2 gap-3"
                data-set_theme={theme}
                type="button"
                onClick={handleClick}
              >
                <div
                  data-theme={theme}
                  className="w-6 grid grid-cols-2 gap-0.5 p-1 rounded-md shadow-sm shrink-0 bg-base-100"
                >
                  <div className="size-1.5 rounded-full bg-base-content" />
                  <div className="size-1.5 rounded-full bg-primary" />
                  <div className="size-1.5 rounded-full bg-secondary" />
                  <div className="size-1.5 rounded-full bg-accent" />
                </div>
                <div className="w-32 truncate">{theme}</div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="themeSelected hidden h-3 w-3 shrink-0"
                >
                  <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
};

export default ThemeChanger;
