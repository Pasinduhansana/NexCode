import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('primary');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('nexcode_theme') || 'primary';
    setTheme(savedTheme);
  }, []);

  // Save theme to localStorage when it changes
  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('nexcode_theme', newTheme);
  };

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
