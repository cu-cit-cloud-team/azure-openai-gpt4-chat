import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';
import useLocalStorageState from 'use-local-storage-state';

export const ThemeToggle = () => {
  const [theme, setTheme] = useLocalStorageState('theme', {
    defaultValue: 'night',
  });

  const toggleTheme = () => {
    setTheme(theme === 'night' ? 'light' : 'night');
  };

  useEffect(() => {
    const body = document.body;
    body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <button onClick={toggleTheme} type="button">
      {theme === 'night' ? (
        <FontAwesomeIcon icon={faMoon} />
      ) : (
        <FontAwesomeIcon icon={faSun} />
      )}
      {theme === 'night' ? ' Dark Mode' : ' Light Mode'}
    </button>
  );
};

export default ThemeToggle;
