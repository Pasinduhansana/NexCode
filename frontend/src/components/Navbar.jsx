import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiChevronDown, HiSun, HiMoon } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';
import { useThemeClasses } from '../utils/useThemeClasses';
import logo from '../../assets/Logo.png';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Showcase', path: '/showcase' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

const themeUi = {
  light: {
    navScrolled: 'bg-white/92 backdrop-blur-xl  shadow-[0_10px_30px_rgba(15,23,42,0.08)]',
    navTop: 'bg-white/75 backdrop-blur-xl ',
    linkActive: 'bg-primary/12 text-primary',
    linkIdle: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80',
    toggleBtn: 'bg-slate-100 border-none text-slate-700  hover:bg-slate-200',
    dropdown: 'bg-white border-slate-200 shadow-[0_12px_28px_rgba(15,23,42,0.14)]',
    dropdownItemActive: 'bg-primary/10 text-primary',
    dropdownItemIdle: 'text-slate-700 hover:bg-slate-50',
    mobilePanel: 'bg-white/95 border-t border-slate-200/70',
    mobileLinkIdle: 'text-slate-700 hover:bg-slate-100',
    ctaBtn: 'inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold bg-blue-500/80 duration-200 transition-all text-white/80 hover:bg-blue-500 shadow-sm',
  },
  dark: {
    navScrolled: 'bg-slate-950/90 backdrop-blur-xl  shadow-[0_14px_34px_rgba(2,6,23,0.55)]',
    navTop: 'bg-slate-950/74 backdrop-blur-xl ',
    linkActive: 'bg-primary/25 text-blue-200',
    linkIdle: 'text-slate-300 hover:text-white hover:bg-white/10',
    toggleBtn: 'bg-slate-800 text-slate-200 border-none hover:bg-slate-700',
    dropdown: 'bg-slate-900 border-slate-700 shadow-[0_14px_34px_rgba(2,6,23,0.6)]',
    dropdownItemActive: 'bg-primary/20 text-blue-200',
    dropdownItemIdle: 'text-slate-200 hover:bg-white/10',
    mobilePanel: 'bg-slate-900/95 border-t border-slate-700/70',
    mobileLinkIdle: 'text-slate-200 hover:bg-white/10',
    ctaBtn: 'inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold bg-blue-500/80 duration-200 transition-all text-white/80 hover:bg-blue-500 shadow-sm',
  },
  primary: {
    navScrolled: 'bg-gradient-to-r from-primary/20 via-card/94 to-accent/20 backdrop-blur-xl shadow-[0_12px_30px_rgba(6,182,212,0.18)]',
    navTop: 'bg-gradient-to-r from-primary/14 via-card/88 to-accent/14 backdrop-blur-xl',
    linkActive: 'bg-primary/18 text-primary ring-1 ring-primary/35',
    linkIdle: 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/20',
    toggleBtn: 'border-white/40 text-foreground border-1 hover:bg-primary/22 ',
    dropdown: 'bg-blue-400/10 border-blue-500/50 border-1 shadow-[0_12px_28px_rgba(15,23,42,0.14)]',
    dropdownItemActive: 'bg-primary/14 text-primary',
    dropdownItemIdle: 'text-foreground hover:bg-primary/10',
    mobilePanel: 'bg-card/95 border-t border-primary/25',
    mobileLinkIdle: 'text-foreground hover:bg-primary/12',
    ctaBtn: 'inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold bg-blue-500/80 duration-200 transition-all text-white/80 hover:bg-blue-500 shadow-sm',
  },
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const location = useLocation();
  const { theme, updateTheme } = useTheme();
  const themeClasses = useThemeClasses();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const ui = themeUi[theme] || themeUi.primary;
  const navbarBg = scrolled ? ui.navScrolled : ui.navTop;

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navbarBg}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logo} alt="NexCode" className="w-8 h-8 rounded-lg object-cover shadow-md group-hover:scale-110 transition-transform" />
            <span className={`font-display font-bold text-lg ${themeClasses.text.primary}`}>
              Nex<span className="text-foreground">Code</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? ui.linkActive
                    : ui.linkIdle
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA & Theme Toggle */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors border ${ui.toggleBtn}`}
              >
                {theme === 'light' && <HiSun size={16} />}
                {theme === 'dark' && <HiMoon size={16} />}
                {theme === 'primary' && <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300" />}
                <HiChevronDown size={14} />
              </button>

              <AnimatePresence>
                {themeDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute top-full right-0 mt-2 rounded-lg shadow-lg overflow-hidden z-50 w-36 border ${ui.dropdown}`}
                    onClick={() => setThemeDropdownOpen(false)}
                  >
                    {[
                      { value: 'light', label: 'Light', icon: HiSun },
                      { value: 'dark', label: 'Dark', icon: HiMoon },
                      { value: 'primary', label: 'Primary', icon: null }
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => updateTheme(value)}
                        className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 ${
                          theme === value
                            ? ui.dropdownItemActive
                            : ui.dropdownItemIdle
                        }`}
                      >
                        {Icon ? <Icon size={14} /> : <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />}
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/start-project" className={ui.ctaBtn} >
              Start Project
            </Link>
            <Link to="/admin-panel" className="px-3 py-2 rounded-lg text-xs font-medium border border-blue-200/70 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
              Admin Panel
            </Link>
          </div>

          {/* Mobile CTA + Hamburger */}
          <div className="md:hidden flex items-center gap-2 ">
            <Link to="/start-project" className={`${ui.ctaBtn} px-3 py-1.5 text-[11px]`}>
              Start Project
            </Link>
            <button
              className={`p-2 rounded-lg transition-colors ${ui.toggleBtn}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <HiX size={20} /> : <HiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden ${ui.mobilePanel}`}
          >
            <div className="px-4 py-3 space-y-2">
              {[
                { value: 'light', label: 'Light Theme', icon: HiSun },
                { value: 'dark', label: 'Dark Theme', icon: HiMoon },
                { value: 'primary', label: 'Primary Theme', icon: null }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    updateTheme(value);
                    setMobileOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                    theme === value
                      ? ui.dropdownItemActive
                      : ui.mobileLinkIdle
                  }`}
                >
                  {Icon ? <Icon size={14} /> : <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />}
                  {label}
                </button>
              ))}
            </div>
            <div className={`px-4 py-3 space-y-2`}>
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    location.pathname === link.path
                      ? ui.linkActive
                      : ui.mobileLinkIdle
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/start-project" className={`${ui.ctaBtn} w-full mt-2`}>
                Start Project
              </Link>
              <Link to="/admin-panel" className="block px-3 py-2 rounded-lg text-xs font-medium border border-blue-200/70 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors text-center">
                Admin Panel
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
