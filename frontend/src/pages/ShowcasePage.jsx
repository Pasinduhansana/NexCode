import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { HiArrowRight, HiArrowLeft, HiExternalLink, HiX } from 'react-icons/hi';
import { FaRocket } from 'react-icons/fa';
import usePageTitle from '../utils/usePageTitle';
import { showcaseProjects } from '../data/showcaseProjects';

const ProjectCard = ({ project, onNavigate }) => {
  return (
    <motion.div
      onClick={() => onNavigate(`/showcase/${project.slug}`)}
      whileHover={{ translateY: -8 }}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={project.image} 
          alt={project.name} 
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${project.color} opacity-40`} />
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-gray-900 text-xs font-semibold">
          {project.type}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-bold text-gray-900 mb-1 line-clamp-2">{project.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.summary}</p>

        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {project.stack.slice(0, 3).map((item) => (
              <span key={item} className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100">
                {item}
              </span>
            ))}
            {project.stack.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200">
                +{project.stack.length - 3}
              </span>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs font-medium text-gray-500">View Details</div>
          <HiArrowRight className="text-blue-600 group-hover:translate-x-1 transition-transform" size={16} />
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
      <section className="relative pt-40 pb-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl" />
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm font-medium text-white/80">Explore Our Portfolio</span>
            </motion.div>

            {/* Main heading with gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
            >
              <span className="bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
                Project
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Showcase
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-8"
            >
              Discover how we transform business ideas into digital excellence. Explore our portfolio of innovative solutions built with cutting-edge technology and strategic vision.
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-12 pt-8 border-t border-white/10"
            >
              {[
                { label: 'Projects Delivered', value: '150+' },
                { label: 'Client Satisfaction', value: '98%' },
                { label: 'Technologies', value: '20+' }
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/60 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white via-blue-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-sm font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Featured Collection
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Our Latest <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Projects</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
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
                className="w-full lg:w-auto bg-white rounded-2xl border border-gray-200 p-6 shadow-sm lg:sticky lg:top-24 backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg font-bold text-gray-900">Refine Search</h3>
                  {mobileFiltersOpen && (
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="lg:hidden text-gray-500 hover:text-gray-900"
                    >
                      <HiX size={24} />
                    </button>
                  )}
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full mb-4 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    Clear All
                  </button>
                )}

                {/* Categories Filter */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 text-sm mb-4 uppercase tracking-widest text-gray-700">Category</h4>
                  <div className="space-y-3">
                    {allCategories.map(category => {
                      const count = showcaseProjects.filter(p => p.type === category).length;
                      return (
                        <label key={category} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors flex-1">{category}</span>
                          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Tech Stack Filter */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 text-sm mb-4 uppercase tracking-widest text-gray-700">Technology</h4>
                  <div className="space-y-3">
                    {allStacks.map(stack => {
                      const count = showcaseProjects.filter(p => p.stack.includes(stack)).length;
                      return (
                        <label key={stack} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedStacks.includes(stack)}
                            onChange={() => toggleStack(stack)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors flex-1">{stack}</span>
                          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
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
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-gray-900">
                    {hasActiveFilters ? 'Filtered Results' : 'All Projects'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {filteredProjects.length === 1
                      ? '1 project found'
                      : `${filteredProjects.length} projects found`}
                  </p>
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  Filters
                </button>
              </div>

              {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.slug}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <ProjectCard project={project} onNavigate={navigate} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300"
                >
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-2">No Projects Found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    We couldn't find any projects matching your current filters. Try adjusting your selection.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    <HiArrowLeft size={18} />
                    Reset Filters
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-28 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Ready to Start Your
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Next Project?
              </span>
            </h2>

            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Transform your vision into reality. Let's collaborate to build innovative software solutions that drive your business forward.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/start-project"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
              >
                <FaRocket /> Start Your Project
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white border-2 border-white/20 hover:bg-white/10 transition-all duration-300"
              >
                Explore Services <HiArrowRight />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
