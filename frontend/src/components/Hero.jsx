import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';
import { FaRocket } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import lightBg from '../../assets/hero_light_bg.png';
import darkBg from '../../assets/hero_dark_bg.png';
import primaryBg from '../../assets/hero_primary_bg.png';

export default function Hero({ stats = [] }) {
  const { theme } = useTheme();

  const bgImage = theme === 'dark' ? darkBg : theme === 'primary' ? primaryBg : lightBg;

  return (
    <section
      className={`relative min-h-screen dark-grid m-auto flex flex-col items-center overflow-hidden h-full bg-hero-gradient`}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 h-full flex-1 ">
        <div className="w-full mx-auto text-center h-full pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-xs mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Newest Tech Trends · Software Development
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`font-display text-xl md:text-2xl lg:text-3xl font-semibold mb-4 leading-tight text-text_primary`}
          >
            ELAVATE YOUR BUSINESS WITH<br /> SOFTWARE SOLUTIONS
            <br />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-sm md:text-[14px] my-8 max-w-xl mx-auto text-text_secondary leading-relaxed`}
          >
            Unlock your business's full potential with NexCode. From sleek websites to powerful enterprise systems, we deliver digital products that actually work.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/start-project" className="btn-primary text-xs px-5 py-2.5 justify-center bg-blue-500/80 hover:bg-blue-500 text-white transition-colors">
              <FaRocket size={14} />
              Build Your Next Project
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className={`absolute right-0 bg-red-400 grid grid-cols-2 md:grid-cols-4 gap-4 bottom-0 pt-6 border-t border-border`}
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-2xl font-bold text-text_primary">{s.value}</div>
                <div className={`text-xs text-text_muted mt-1`}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
      >
        <HiChevronDown size={28} />
      </motion.div>
    </section>
  );
}
