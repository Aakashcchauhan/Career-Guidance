// ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Set initial theme from cookie or default to light
  const [theme, setTheme] = useState(() => {
    return Cookies.get('theme') || 'light';
  });

  useEffect(() => {
    // Apply the class to the document root (html)
    document.documentElement.className = theme;
    // Store current theme in cookie
    Cookies.set('theme', theme, { expires: 365 });
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
