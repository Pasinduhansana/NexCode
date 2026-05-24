import { useTheme } from '../context/ThemeContext';

export const useThemeClasses = () => {
  const { theme } = useTheme();

  // Semantic token-based classes (map to Tailwind tokens defined in tailwind.config.js)
  return {
    theme,
    bg: {
      primary: 'bg-background',
      secondary: 'bg-muted',
      tertiary: 'bg-card',
      hero: 'bg-hero-gradient',
      card: 'bg-card',
      navbar: 'bg-card',
    },
    text: {
      primary: 'text-foreground',
      secondary: 'text-muted',
      tertiary: 'text-muted',
      light: 'text-foreground',
      muted: 'text-muted',
    },
    border: {
      primary: 'border-border',
      secondary: 'border-border',
    },
    button: {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
    },
    hover: {
      bg: 'hover:bg-muted/10',
      text: 'hover:text-foreground',
    },
    section: {
      light: 'bg-card',
      muted: 'bg-muted',
    },
  };
};
