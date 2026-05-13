import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { HiArrowRight, HiArrowLeft, HiExternalLink, HiX } from 'react-icons/hi';
import { FaRocket } from 'react-icons/fa';
import usePageTitle from '../utils/usePageTitle';
import { useThemeClasses } from '../utils/useThemeClasses';
import { showcaseProjects } from '../data/showcaseProjects';

const ProjectCard = ({ project, onNavigate, themeClasses }) => {
  return (
    <motion.div
      onClick={() => onNavigate(`/showcase/${project.slug}`)}
      whileHover={{ translateY: -4 }}
      className={`group cursor-pointer ${themeClasses.bg.card} rounded-xl border ${themeClasses.border.primary} overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300`}
    >
      <div className={`relative h-40 overflow-hidden ${themeClasses.theme === 'light' ? 'bg-gray-100' : 'bg-slate-700'}`}>
        <img 
          src={project.image} 
          alt={project.name} 
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${project.color} opacity-40`} />
        <div className={`absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
          themeClasses.theme === 'light' ? 'bg-white/90 text-gray-900' : 'bg-slate-900/90 text-white'
        } backdrop-blur`}>
          {project.type}
        </div>
      </div>

      <div className="p-3.5">
        <h3 className={`font-display text-sm font-bold ${themeClasses.text.primary} mb-1 line-clamp-2`}>{project.name}</h3>
        <p className={`text-xs ${themeClasses.text.secondary} mb-3 line-clamp-2`}>{project.summary}</p>

        {/* Results instead of tech stack */}
        <div className="mb-3">
          <div className="space-y-1.5">
            {project.results.slice(0, 2).map((result, idx) => (
              <div key={idx} className={`flex items-center gap-2 text-xs font-medium ${
                themeClasses.theme === 'light'
                  ? 'text-blue-600'
                  : 'text-blue-400'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {result}
              </div>
            ))}
          </div>
        </div>

        <div className={`pt-2.5 border-t ${themeClasses.border.primary} flex items-center justify-between`}>
          <div className={`text-xs font-medium ${themeClasses.text.tertiary}`}>View Details</div>
          <HiArrowRight className="text-blue-600 group-hover:translate-x-0.5 transition-transform" size={14} />
        </div>
      </div>
    </motion.div>
  );
};

export default function ShowcasePage() {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStacks, setSelectedStacks] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const themeClasses = useThemeClasses();

  usePageTitle('Showcase');

  // Extract unique categories and stacks
  const allCategories = Array.from(new Set(showcaseProjects.map(p => p.type))).sort();
  const allStacks = Array.from(new Set(showcaseProjects.flatMap(p => p.stack))).sort();

  // Filter projects
  const filteredProjects = useMemo(() => {
    return showcaseProjects.filter(project => {
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(project.type);
      const stackMatch = selectedStacks.length === 0 || selectedStacks.some(stack => project.stack.includes(stack));
      return categoryMatch && stackMatch;
    });
  }, [selectedCategories, selectedStacks]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleStack = (stack) => {
    setSelectedStacks(prev =>
      prev.includes(stack)
        ? prev.filter(s => s !== stack)
        : [...prev, stack]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedStacks([]);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedStacks.length > 0;

  return (
    <div className="min-h-screen">
      <section className={`relative pt-32 pb-20 ${themeClasses.bg.hero} overflow-hidden`}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 dark-grid opacity-50" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md mb-6 ${
                themeClasses.theme === 'light'
                  ? 'bg-blue-100/40 border border-blue-200 text-blue-700'
                  : 'bg-white/5 border border-white/10 text-white/80'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-medium">Explore Our Portfolio</span>
            </motion.div>

            {/* Main heading with gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 ${
                themeClasses.theme === 'light'
                  ? 'bg-gradient-to-r from-blue-900 via-blue-700 to-cyan-600 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent'
              }`}
            >
              <span>Project</span>
              <br />
              <span>Showcase</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={`text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-6 ${
                themeClasses.theme === 'light'
                  ? 'text-gray-600'
                  : 'text-white/70'
              }`}
            >
              Discover how we transform business ideas into digital excellence. Explore our portfolio of innovative solutions built with cutting-edge technology and strategic vision.
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10 pt-6 border-t border-white/10"
            >
              {[
                { label: 'Projects Delivered', value: '150+' },
                { label: 'Client Satisfaction', value: '98%' },
                { label: 'Technologies', value: '20+' }
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent mb-1`}>
                    {stat.value}
                  </div>
                  <div className={`text-xs ${themeClasses.text.tertiary} font-medium`}>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className={`py-16 bg-gradient-to-b ${
        themeClasses.theme === 'light'
          ? 'from-white via-blue-50/30 to-white'
          : themeClasses.theme === 'dark'
          ? 'from-slate-900 via-slate-800/50 to-slate-900'
          : 'from-slate-900/50 via-blue-950/30 to-slate-900/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3 ${
              themeClasses.theme === 'light'
                ? 'bg-blue-100 border border-blue-200 text-blue-700'
                : 'bg-blue-950/40 border border-blue-700/50 text-blue-300'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Featured Collection
            </div>
            <h2 className={`font-display text-2xl md:text-3xl font-bold mb-2 ${themeClasses.text.primary}`}>
              Our Latest <span className="gradient-text">Projects</span>
            </h2>
            <p className={`text-sm ${themeClasses.text.secondary} max-w-2xl leading-relaxed`}>
              Browse through our curated collection of successful projects. Filter by category and technology to find exactly what you're looking for.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Left Sidebar - Filters */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`lg:col-span-1 ${
                mobileFiltersOpen
                  ? 'fixed inset-0 bg-black/40 z-40 flex items-start justify-start pt-20 px-4'
                  : 'hidden lg:block'
              }`}
              onClick={() => mobileFiltersOpen && setMobileFiltersOpen(false)}
            >
              <div
                className={`w-full lg:w-auto rounded-xl border p-4 lg:sticky lg:top-24 backdrop-blur-sm ${
                  themeClasses.theme === 'light'
                    ? 'bg-white border-gray-200 shadow-sm'
                    : 'bg-slate-800/50 border-slate-700/50 shadow-lg shadow-black/20'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-display text-sm font-bold ${themeClasses.text.primary}`}>Refine Search</h3>
                  {mobileFiltersOpen && (
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className={`lg:hidden ${themeClasses.text.tertiary} hover:${themeClasses.text.primary}`}
                    >
                      <HiX size={20} />
                    </button>
                  )}
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className={`w-full mb-3 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      themeClasses.theme === 'light'
                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200'
                        : 'text-blue-400 bg-blue-950/40 hover:bg-blue-950/60 border-blue-700/50'
                    }`}
                  >
                    Clear All
                  </button>
                )}

                {/* Categories Filter */}
                <div className="mb-6">
                  <h4 className={`font-semibold text-xs mb-3 uppercase tracking-wider ${themeClasses.text.tertiary}`}>Category</h4>
                  <div className="space-y-2">
                    {allCategories.map(category => {
                      const count = showcaseProjects.filter(p => p.type === category).length;
                      return (
                        <label key={category} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className={`text-xs ${themeClasses.text.secondary} group-hover:text-blue-600 transition-colors flex-1`}>{category}</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${
                            themeClasses.theme === 'light'
                              ? 'text-gray-500 bg-gray-100'
                              : 'text-gray-400 bg-slate-700/50'
                          }`}>
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Tech Stack Filter */}
                <div className={`pt-4 ${themeClasses.border.secondary} border-t`}>
                  <h4 className={`font-semibold text-xs mb-3 uppercase tracking-wider ${themeClasses.text.tertiary}`}>Technology</h4>
                  <div className="space-y-2">
                    {allStacks.map(stack => {
                      const count = showcaseProjects.filter(p => p.stack.includes(stack)).length;
                      return (
                        <label key={stack} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedStacks.includes(stack)}
                            onChange={() => toggleStack(stack)}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className={`text-xs ${themeClasses.text.secondary} group-hover:text-blue-600 transition-colors flex-1`}>{stack}</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${
                            themeClasses.theme === 'light'
                              ? 'text-gray-500 bg-gray-100'
                              : 'text-gray-400 bg-slate-700/50'
                          }`}>
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content - Projects Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`font-display text-lg md:text-xl font-bold ${themeClasses.text.primary}`}>
                    {hasActiveFilters ? 'Filtered Results' : 'All Projects'}
                  </h3>
                  <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
                    {filteredProjects.length === 1
                      ? '1 project found'
                      : `${filteredProjects.length} projects found`}
                  </p>
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className={`lg:hidden px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                    themeClasses.theme === 'light'
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
                      : 'bg-blue-950/40 text-blue-400 hover:bg-blue-950/60 border-blue-700/50'
                  }`}
                >
                  Filters
                </button>
              </div>

              {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.slug}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <ProjectCard project={project} onNavigate={navigate} themeClasses={themeClasses} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className={`text-center py-12 rounded-xl border-2 border-dashed ${
                    themeClasses.theme === 'light'
                      ? 'bg-gray-50 border-gray-300'
                      : 'bg-slate-800/30 border-slate-600/50'
                  }`}
                >
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className={`font-display text-sm font-bold ${themeClasses.text.primary} mb-1`}>No Projects Found</h3>
                  <p className={`text-xs ${themeClasses.text.secondary} mb-4 max-w-xs mx-auto`}>
                    We couldn't find any projects matching your current filters. Try adjusting your selection.
                  </p>
                  <button
                    onClick={clearFilters}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      themeClasses.theme === 'light'
                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200'
                        : 'text-blue-400 bg-blue-950/40 hover:bg-blue-950/60 border-blue-700/50'
                    }`}
                  >
                    <HiArrowLeft size={14} />
                    Reset Filters
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className={`relative py-20 bg-gradient-to-r ${
        themeClasses.theme === 'light'
          ? 'from-blue-600 to-cyan-500'
          : themeClasses.theme === 'dark'
          ? 'from-blue-700 to-cyan-600'
          : 'from-blue-600 to-cyan-500'
      } overflow-hidden`}>
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-white">
              Ready to Start Your
              <br />
              <span className="text-cyan-100">
                Next Project?
              </span>
            </h2>

            <p className="text-sm md:text-base text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Transform your vision into reality. Let's collaborate to build innovative software solutions that drive your business forward.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link
                to="/start-project"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-blue-600 bg-white hover:bg-blue-50 transition-colors text-sm"
              >
                <FaRocket size={14} /> Start Your Project
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors text-sm"
              >
                Explore Services <HiArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
