import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('nexcode_theme') || 'light';
    setTheme(savedTheme);
  }, []);

  // Apply theme to the document (toggle dark class + data-theme attribute)
  useEffect(() => {
    const root = document.documentElement;
    // toggle Tailwind dark class
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    // set a data-theme attribute for variant-specific overrides
    root.setAttribute('data-theme', theme);
    localStorage.setItem('nexcode_theme', theme);
  }, [theme]);

  // Save theme to localStorage when it changes (via updateTheme)
  const updateTheme = (newTheme) => setTheme(newTheme);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
