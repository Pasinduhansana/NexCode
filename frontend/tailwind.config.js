import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
const themePalettes = {
  light: {
    background: "255 255 255",
    foreground: "17 24 39",
    card: "250 250 252",
    border: "236 236 241",
    borderHard: "152 150 150",
    muted: "220 220 222",
    mutedForeground: "100 116 139",
    textPrimary: "52 66 97",
    textSecondary: "100 116 139",
    textMuted: "125 143 168",
    pageHero: "255 255 255",
    pageHeroSecondary: "201 236 255",
    pageBgAlt: "245 245 247",
    pageTextDark: "29 29 31",
    featurelistBorder: "236 236 241",
    featurelistItemBg: "250 250 252",
    grid: "100 116 139",
  },
  dark: {
    background: "7 11 17",
    foreground: "255 255 255",
    card: "20 24 31",
    border: "20 31 49",
    borderHard: "80 91 109",
    muted: "190 190 190",
    mutedForeground: "148 163 184",
    textPrimary: "235 235 235",
    textSecondary: "148 163 184",
    textMuted: "160 160 160",
    pageHero: "7 11 17",
    pageHeroSecondary: "7 13 34",
    pageBgAlt: "15 23 42",
    pageTextDark: "255 255 255",
    featurelistBorder: "20 31 49",
    featurelistItemBg: "20 24 31",
    grid: "255 255 255",
  },
  primary: {
    background: "255 255 255",
    foreground: "17 24 39",
    card: "250 250 252",
    border: "236 236 241",
    borderHard: "152 150 150",
    muted: "247 247 250",
    mutedForeground: "100 116 139",
    textPrimary: "52 66 97",
    textSecondary: "100 116 139",
    textMuted: "125 143 168",
    pageHero: "84 178 230",
    pageHeroSecondary: "94 188 255",
    pageBgAlt: "245 245 247",
    pageTextDark: "29 29 31",
    featurelistBorder: "236 236 241",
    featurelistItemBg: "250 250 252",
    grid: "100 116 139",
  },
};

const opacitySteps = [5, 10, 12, 14, 16, 18, 20, 22, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
const toRgb = (value, alpha = 1) => `rgb(${value} / ${alpha})`;
const themeScopedSelector = (themeName, selector) => `[data-theme='${themeName}'] ${selector}`;

const semanticTokens = [
  { className: "bg-background", property: "backgroundColor", token: "background" },
  { className: "text-foreground", property: "color", token: "foreground" },
  { className: "bg-card", property: "backgroundColor", token: "card" },
  { className: "border-border", property: "borderColor", token: "border" },
  { className: "border-border_hard", property: "borderColor", token: "borderHard" },
  { className: "bg-muted", property: "backgroundColor", token: "muted" },
  { className: "text-muted", property: "color", token: "mutedForeground" },
  { className: "text-text_primary", property: "color", token: "textPrimary" },
  { className: "text-text_secondary", property: "color", token: "textSecondary" },
  { className: "text-text_muted", property: "color", token: "textMuted" },
  { className: "bg-hero", property: "backgroundColor", token: "pageHero" },
  { className: "bg-page-alt", property: "backgroundColor", token: "pageBgAlt" },
  { className: "border-border-hard", property: "borderColor", token: "borderHard" },
  { className: "text-foreground-soft", property: "color", token: "textSecondary" },
];

const themeUtilities = {};
for (const [themeName, palette] of Object.entries(themePalettes)) {
  for (const token of semanticTokens) {
    themeUtilities[themeScopedSelector(themeName, `.${token.className}`)] = {
      [token.property]: toRgb(palette[token.token]),
    };

    for (const step of opacitySteps) {
      themeUtilities[themeScopedSelector(themeName, `.${token.className}\\/${step}`)] = {
        [token.property]: toRgb(palette[token.token], step / 100),
      };
    }
  }

  themeUtilities[themeScopedSelector(themeName, ".bg-hero-gradient")] = {
    backgroundImage: `linear-gradient(180deg, ${toRgb(palette.pageHero)} 0%, ${toRgb(palette.pageHeroSecondary, 0.9)} 50%, ${toRgb(palette.pageHero)} 100%)`,
  };
  themeUtilities[themeScopedSelector(themeName, ".bg-card-gradient")] = {
    backgroundImage: `linear-gradient(135deg, ${toRgb("54 153 243", 0.08)} 0%, ${toRgb("6 182 212", 0.04)} 100%)`,
  };
  themeUtilities[themeScopedSelector(themeName, ".bg-btn-gradient")] = {
    backgroundImage: "linear-gradient(135deg, rgb(54 153 243 / 1) 0%, rgb(6 182 212 / 1) 100%)",
  };
  themeUtilities[themeScopedSelector(themeName, ".grid-pattern")] = {
    backgroundImage: `radial-gradient(circle, ${toRgb(palette.grid, 0.12)} 1px, transparent 1px)`,
    backgroundSize: "30px 30px",
  };
  themeUtilities[themeScopedSelector(themeName, ".dark-grid")] = {
    backgroundImage:
      themeName === "dark"
        ? "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)"
        : "radial-gradient(circle, rgba(15,23,42,0.05) 1px, transparent 1px)",
    backgroundSize: "30px 30px",
  };
}

const themeComponents = {};
for (const [themeName, palette] of Object.entries(themePalettes)) {
  const scope = themeScopedSelector(themeName, "");
  themeComponents[`${scope}.btn-secondary`] = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.625rem 1.25rem",
    borderRadius: "0.5rem",
    fontWeight: "600",
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionDuration: "200ms",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: toRgb(palette.border),
    color: toRgb("54 153 243"),
  };
  themeComponents[`${scope}.btn-secondary:hover`] = {
    backgroundColor: toRgb("54 153 243", 0.05),
  };
  themeComponents[`${scope}.btn-ghost`] = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.625rem 1.25rem",
    borderRadius: "0.5rem",
    fontWeight: "600",
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionDuration: "200ms",
    color: toRgb(palette.mutedForeground),
  };
  themeComponents[`${scope}.btn-ghost:hover`] = {
    backgroundColor: toRgb(palette.muted, 0.28),
  };
  themeComponents[`${scope}.card`] = {
    borderRadius: "1rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: toRgb(palette.border),
    backgroundColor: toRgb(palette.card),
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
    transitionProperty: "transform, box-shadow, border-color, background-color",
    transitionDuration: "300ms",
  };
  themeComponents[`${scope}.card:hover`] = {
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.12)",
    transform: "translateY(-2px)",
  };
  themeComponents[`${scope}.input-field`] = {
    width: "100%",
    padding: "0.625rem 1rem",
    borderRadius: "0.5rem",
    borderWidth: "1px",
    borderStyle: "solid",
    backgroundColor: toRgb(palette.background),
    color: toRgb(palette.foreground),
    borderColor: toRgb(palette.border),
    fontSize: "0.875rem",
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke, box-shadow",
    transitionDuration: "200ms",
  };
  themeComponents[`${scope}.input-field::placeholder`] = {
    color: toRgb(palette.mutedForeground),
  };
  themeComponents[`${scope}.label`] = {
    display: "block",
    marginBottom: "0.25rem",
    fontSize: "0.75rem",
    fontWeight: "500",
    color: toRgb(palette.mutedForeground),
  };
  themeComponents[`${scope}.badge`] = {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.25rem 0.625rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: "500",
  };
  themeComponents[`${scope}.section-subtitle`] = {
    fontSize: "0.875rem",
    maxWidth: "42rem",
    marginLeft: "auto",
    marginRight: "auto",
    color: toRgb(palette.mutedForeground),
  };
  themeComponents[`${scope}.gradient-text`] = {
    backgroundImage: "linear-gradient(90deg, rgb(54 153 243 / 1) 0%, rgb(6 182 212 / 1) 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  };
  themeComponents[`${scope}.section-title`] = {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontSize: "1.25rem",
    lineHeight: "1.75rem",
    fontWeight: "700",
  };
}

themeComponents[".btn-primary"] = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: "0.625rem 1.25rem",
  borderRadius: "0.5rem",
  fontWeight: "600",
  color: "white",
  backgroundColor: "rgb(54 153 243 / 1)",
  transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke, box-shadow",
  transitionDuration: "200ms",
};
themeComponents[".btn-primary:focus"] = {
  outline: "none",
  boxShadow: "0 0 0 4px rgb(54 153 243 / 0.12)",
};

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(255 255 255 / <alpha-value>)",
        foreground: "rgb(17 24 39 / <alpha-value>)",
        primary: "#3699f3",
        secondary: "#06b6d4",
        card: "rgb(250 250 252 / <alpha-value>)",
        border: "rgb(236 236 241 / <alpha-value>)",
        border_hard: "rgb(152 150 150 / <alpha-value>)",
        muted: "rgb(247 247 250 / <alpha-value>)",
        accent: "#06b6d4",
        text_primary: "rgb(52 66 97 / <alpha-value>)",
        text_secondary: "rgb(100 116 139 / <alpha-value>)",
        text_muted: "rgb(125 143 168 / <alpha-value>)",
        hero: "rgb(84 178 230 / <alpha-value>)",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "sans-serif"],
        body: ['"DM Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        gradient: "gradient 8s ease infinite",
        "slide-up": "slideUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.8s ease forwards",
        "spin-slow": "spin 12s linear infinite",
        "float-sm": "floatSm 4s ease-in-out infinite",
        "fade-slide": "fadeSlide 0.5s ease forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        floatSm: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeSlide: {
          from: { opacity: "0", transform: "translateX(-10px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(180deg, rgb(84 178 230 / 1) 0%, rgb(94 188 255 / 0.9) 50%, rgb(84 178 230 / 1) 100%)",
        "card-gradient": "linear-gradient(135deg, rgb(54 153 243 / 0.08) 0%, rgb(6 182 212 / 0.04) 100%)",
        "btn-gradient": "linear-gradient(135deg, rgb(54 153 243 / 1) 0%, rgb(6 182 212 / 1) 100%)",
        "radial-primary": "radial-gradient(ellipse at 60% 0%, rgb(54 153 243 / 0.18) 0%, transparent 65%)",
        "radial-accent": "radial-gradient(ellipse at 40% 100%, rgb(6 182 212 / 0.15) 0%, transparent 65%)",
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3CfilterID='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgb(54 153 243 / 0.3)",
        "glow-cyan": "0 0 20px rgb(6 182 212 / 0.3)",
        "glow-purple": "0 0 20px rgb(168 85 247 / 0.3)",
        "card-hover": "0 20px 60px rgb(0 0 0 / 0.12), 0 8px 24px rgb(0 0 0 / 0.08)",
        "card-dark-hover": "0 20px 60px rgb(0 0 0 / 0.4), 0 8px 24px rgb(0 0 0 / 0.25)",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities, addComponents }) => {
      addUtilities(themeUtilities);
      addComponents(themeComponents);
    }),
  ],
};
