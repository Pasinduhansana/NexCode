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

  const navbarBg = scrolled
    ? theme === 'light'
      ? 'bg-white/95 backdrop-blur-md shadow-lg'
      : theme === 'dark'
      ? 'bg-slate-900/95 backdrop-blur-md shadow-lg shadow-black/50'
      : 'bg-slate-900/95 backdrop-blur-md shadow-lg shadow-black/50'
    : theme === 'light'
    ? 'bg-white/88 backdrop-blur-md'
    : theme === 'dark'
    ? 'bg-slate-900/88 backdrop-blur-md'
    : 'bg-slate-900/88 backdrop-blur-md';

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
              Nex<span className="gradient-text">Code</span>
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
                    ? 'bg-blue-50 text-blue-600'
                    : theme === 'light'
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
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
                className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  theme === 'light'
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-300 hover:bg-slate-700/50'
                }`}
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
                    className={`absolute top-full right-0 mt-2 rounded-lg shadow-lg overflow-hidden z-50 w-36 border ${
                      theme === 'light'
                        ? 'bg-white border-gray-200'
                        : 'bg-slate-800 border-slate-700'
                    }`}
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
                            ? 'bg-blue-50 text-blue-600'
                            : theme === 'light'
                            ? 'text-gray-700 hover:bg-gray-50'
                            : 'text-gray-300 hover:bg-slate-700/50'
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

            <Link to="/start-project" className="btn-primary text-xs">
              Start Project
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-slate-700/50'
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <HiX size={20} /> : <HiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden ${themeClasses.bg.secondary}`}
          >
            <div className={`px-4 py-3 space-y-2 ${themeClasses.border.secondary} border-t`}>
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
                      ? 'bg-blue-50 text-blue-600'
                      : theme === 'light'
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 hover:bg-slate-700/50'
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
                      ? 'bg-blue-50 text-blue-600'
                      : theme === 'light'
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 hover:bg-slate-700/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/start-project" className="btn-primary w-full justify-center text-xs mt-2">
                Start Project
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
