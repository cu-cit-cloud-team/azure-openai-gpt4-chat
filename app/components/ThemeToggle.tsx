import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';

export const ThemeToggle = () => {
  const isSystemDarkMode = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const [theme] = useLocalStorageState('theme', {
    defaultValue: isSystemDarkMode() ? 'night' : 'autumn',
  });

  const toggleTheme = () => {
    window.localStorage.setItem(
      'theme',
      JSON.stringify(theme === 'night' ? 'autumn' : 'night')
    );
    window.dispatchEvent(new Event('storage'));
  };

  const [checked, setChecked] = useState(true);
  useEffect(() => {
    setChecked(theme === 'night');
  }, [theme]);

  const handleClick = () => {
    toggleTheme();
    setChecked(!checked);
  };

  useEffect(() => {
    const htmlEl = document.querySelector('html');
    htmlEl.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="form-control">
      <label className="flex gap-2 py-0 cursor-pointer label label-text">
        <FontAwesomeIcon icon={faSun} />
        <input
          className="toggle toggle-sm theme-controller"
          type="checkbox"
          checked={checked}
          onChange={handleClick}
        />
        <FontAwesomeIcon icon={faMoon} />
      </label>
    </div>
  );
};

export default ThemeToggle;
