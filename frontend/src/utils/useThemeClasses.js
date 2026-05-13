import { useTheme } from '../context/ThemeContext';

export const useThemeClasses = () => {
  const { theme } = useTheme();

  return {
    theme,
    
    // Background colors
    bg: {
      primary: theme === 'light' ? 'bg-white' : theme === 'dark' ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
      secondary: theme === 'light' ? 'bg-gray-50' : theme === 'dark' ? 'bg-slate-900' : 'bg-slate-900/80',
      tertiary: theme === 'light' ? 'bg-white' : theme === 'dark' ? 'bg-slate-800' : 'bg-slate-800/60',
      hero: theme === 'light' ? 'bg-gradient-to-br from-blue-50 to-cyan-50' : theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950',
      card: theme === 'light' ? 'bg-white' : theme === 'dark' ? 'bg-slate-800' : 'bg-slate-800/40',
      navbar: theme === 'light' ? 'bg-white' : theme === 'dark' ? 'bg-slate-900' : 'bg-slate-900/80',
    },

    // Text colors
    text: {
      primary: theme === 'light' ? 'text-gray-900' : theme === 'dark' ? 'text-white' : 'text-white',
      secondary: theme === 'light' ? 'text-gray-600' : theme === 'dark' ? 'text-gray-300' : 'text-gray-200',
      tertiary: theme === 'light' ? 'text-gray-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-300',
      light: theme === 'light' ? 'text-gray-700' : theme === 'dark' ? 'text-white' : 'text-white',
      muted: theme === 'light' ? 'text-gray-400' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400',
    },

    // Border colors
    border: {
      primary: theme === 'light' ? 'border-gray-200' : theme === 'dark' ? 'border-slate-700' : 'border-slate-700/50',
      secondary: theme === 'light' ? 'border-gray-100' : theme === 'dark' ? 'border-slate-600' : 'border-slate-600/40',
    },

    // Button styles - single blue color with variations
    button: {
      primary: 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50',
      secondary: theme === 'light' ? 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border border-blue-200 transition-colors duration-200' : 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-blue-400 bg-blue-950/40 hover:bg-blue-950/60 active:bg-blue-950/80 border border-blue-700/50 transition-colors duration-200',
      ghost: 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200',
    },

    // Hover states
    hover: {
      bg: theme === 'light' ? 'hover:bg-gray-100' : theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-700/50',
      text: theme === 'light' ? 'hover:text-gray-900' : theme === 'dark' ? 'hover:text-white' : 'hover:text-white',
    },

    // Section backgrounds
    section: {
      light: theme === 'light' ? 'bg-white' : theme === 'dark' ? 'bg-slate-900' : 'bg-slate-900/50',
      muted: theme === 'light' ? 'bg-gray-50' : theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-800/30',
    },
  };
};
