/**
 * ShowcasePage — NexCode
 * Modern portfolio landing-page design with full support for:
 *   light | dark | primary themes via Tailwind semantic tokens.
 */
import { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiArrowRight, HiArrowLeft, HiX, HiFilter, HiSearch,
  HiSparkles, HiCheckCircle, HiStar, HiDatabase, HiCode,
  HiLightningBolt, HiExternalLink, HiMenu, HiChevronDown,
} from 'react-icons/hi';
import { FaRocket, FaWhatsapp } from 'react-icons/fa';
import usePageTitle from '../utils/usePageTitle';
import { useThemeClasses } from '../utils/useThemeClasses';
import { showcaseProjects } from '../data/showcaseProjects';
import api from '../utils/api';

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATION CONFIGS
   ═══════════════════════════════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.06,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.93 },
  show: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.45,
      delay: i * 0.05,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

/* ═══════════════════════════════════════════════════════════════════════
   SHARED SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════ */

/** Pill label above sections */
function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-card text-xs font-semibold text-text_secondary mb-5 select-none shadow-sm">
      {Icon
        ? <Icon className="text-primary text-sm flex-shrink-0 animate-pulse" />
        : <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex-shrink-0" />}
      {children}
    </div>
  );
}

/** Premium Project Card with hover-active effects */
function ProjectCard({ project, onNavigate, themeClasses }) {
  // Extract accent styles from project colors
  const gradientClass = project.color || 'from-blue-600 to-indigo-600';
  const rgbValues = gradientClass.includes('cyan') ? '6,182,212' : '54,153,243';

  return (
    <motion.article
      variants={scaleIn}
      whileHover={{ y: -6, transition: { duration: 0.22 } }}
      onClick={() => onNavigate(`/showcase/${project.slug}`)}
      className="group relative flex flex-col rounded-3xl border border-border bg-card overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:border-primary/45"
    >
      {/* Radial glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, rgba(${rgbValues}, 0.09) 0%, transparent 70%)`
        }}
      />

      {/* Media frame */}
      <div className="relative h-56 overflow-hidden bg-background">
        <img
          src={project.image}
          alt={project.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        {/* Soft color overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${gradientClass} opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
        
        {/* Category tag */}
        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-card/90 text-foreground backdrop-blur border border-border/40 shadow-sm">
          <HiSparkles className="text-primary text-[10px]" />
          {project.type}
        </div>

        {/* Floating results overlay on card bottom-right */}
        {project.results && project.results[0] && (
          <div className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600/90 to-cyan-500/90 text-white backdrop-blur shadow-md">
            {project.results[0]}
          </div>
        )}
      </div>

      {/* Content wrapper */}
      <div className="p-6 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-display text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-1">
          {project.name}
        </h3>

        {/* Summary */}
        <p className="text-xs text-text_secondary leading-relaxed mb-5 line-clamp-3 flex-1">
          {project.summary}
        </p>

        {/* Results / Achievements metrics list */}
        {project.results && project.results.length > 0 && (
          <div className="space-y-1.5 mb-5 border-t border-border pt-4">
            <div className="text-[10px] uppercase font-extrabold tracking-widest text-text_muted mb-1">Impact Metrics</div>
            {project.results.map((result, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-primary">
                <HiCheckCircle className="text-sm flex-shrink-0" />
                <span>{result}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stack list */}
        <div className="flex flex-wrap gap-1.5 pt-3.5 border-t border-border mt-auto">
          {project.stack.slice(0, 3).map((stk) => (
            <span
              key={stk}
              className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-background border border-border text-text_muted uppercase tracking-wider"
            >
              {stk}
            </span>
          ))}
          {project.stack.length > 3 && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-background border border-border text-text_muted uppercase tracking-wider">
              +{project.stack.length - 3} more
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function ShowcasePage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStacks, setSelectedStacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const themeClasses = useThemeClasses();
  const heroRef = useRef(null);

  usePageTitle('Showcase — NexCode');

  // Load Showcase Projects from database API or static data fallback
  useEffect(() => {
    let mounted = true;
    const fetchProjects = async () => {
      try {
        const res = await api.get('/showcase');
        if (mounted) {
          setProjects(Array.isArray(res.data.data) ? res.data.data : []);
        }
      } catch (err) {
        console.warn('API fetch error, falling back to static data:', err);
        if (mounted) {
          setProjects(showcaseProjects);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    fetchProjects();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter Categories & Tech stacks lists dynamically based on active data
  const allCategories = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.type))).sort();
  }, [projects]);

  const allStacks = useMemo(() => {
    return Array.from(new Set(projects.flatMap((p) => p.stack))).sort();
  }, [projects]);

  // Main dynamic filter process
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchSearch =
        searchQuery === '' ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.stack.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(project.type);

      const matchStack =
        selectedStacks.length === 0 ||
        selectedStacks.some((stk) => project.stack.includes(stk));

      return matchSearch && matchCategory && matchStack;
    });
  }, [projects, searchQuery, selectedCategories, selectedStacks]);

  // Category Filter Toggle Action
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Tech Stack Filter Toggle Action
  const toggleStack = (stack) => {
    setSelectedStacks((prev) =>
      prev.includes(stack)
        ? prev.filter((s) => s !== stack)
        : [...prev, stack]
    );
  };

  // Reset filter settings
  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedStacks([]);
    setSearchQuery('');
  };

  // Check if any filters are active
  const hasActiveFilters = selectedCategories.length > 0 || selectedStacks.length > 0 || searchQuery !== '';

  // Identify featured projects to spotlight (first 2 projects)
  const spotlightProjects = useMemo(() => {
    return projects.slice(0, 2);
  }, [projects]);

  return (
    <div className="min-h-screen bg-background">
      
      {/* ──────────────────────────────────────────────────────────────
          § 1 HERO — Cinematic opening banner with background grids
      ────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden bg-background dark-grid"
      >
        {/* Ambient background glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full animate-pulse-slow"
            style={{ background: 'radial-gradient(circle, rgba(54,153,243,0.12) 0%, transparent 65%)' }}
          />
          <div
            className="absolute top-1/4 right-[-10%] w-[580px] h-[580px] rounded-full animate-float"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.13) 0%, transparent 65%)', animationDelay: '1s' }}
          />
          <div
            className="absolute bottom-[-10%] left-[30%] w-[450px] h-[450px] rounded-full animate-pulse-slow"
            style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 65%)', animationDelay: '2s' }}
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-16 items-center">
            
            {/* Left Column Content */}
            <div className="text-left">
              <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
                <SectionLabel icon={HiSparkles}>
                  Engineered Case Studies
                </SectionLabel>
              </motion.div>

              <motion.h1
                variants={fadeUp} initial="hidden" animate="show" custom={1}
                className="font-display font-extrabold text-foreground tracking-tight mb-6 leading-[1.08]"
                style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.8rem)' }}
              >
                Stunning Digital Products,<br />
                Engineered for <span className="gradient-text">Impact.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp} initial="hidden" animate="show" custom={2}
                className="text-base text-text_secondary leading-relaxed mb-10 max-w-2xl"
              >
                Explore our portfolio of bespoke software solutions, cloud systems,
                e-commerce suites, and custom web builds. Every product is engineered with
                extreme performance and clean UI design to drive measurable business outcomes.
              </motion.p>

              {/* Main action CTAs */}
              <motion.div
                variants={fadeUp} initial="hidden" animate="show" custom={3}
                className="flex flex-wrap gap-4 mb-12"
              >
                <a
                  href="#collection"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-glow-blue hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  <HiFilter size={15} /> Browse Showcase
                </a>
                <Link
                  to="/start-project"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:border-primary/40 transition-all duration-200"
                >
                  Start Your Project <HiArrowRight size={15} />
                </Link>
              </motion.div>

              {/* Stat counters block */}
              <motion.div
                variants={fadeUp} initial="hidden" animate="show" custom={4}
                className="grid grid-cols-3 gap-4 pt-8 border-t border-border max-w-xl"
              >
                {[
                  { value: '150+', label: 'Delivered Projects' },
                  { value: '98%', label: 'Retention & Satisfaction' },
                  { value: '20+', label: 'Modern Technologies' },
                ].map((stat, i) => (
                  <div key={i} className="text-left">
                    <div className="font-display text-2xl md:text-3xl font-extrabold gradient-text leading-none mb-1">
                      {stat.value}
                    </div>
                    <div className="text-[10px] font-bold text-text_muted uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Column: Floating tech stack visual block */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.35 }}
              className="hidden lg:grid grid-cols-3 gap-4 relative"
            >
              {/* Outer decorative ring */}
              <div className="absolute -inset-10 border border-border/40 rounded-full pointer-events-none -z-10 animate-spin-slow opacity-20" />
              
              {/* Showcase image mini card orbs */}
              {projects.slice(0, 6).map((proj, idx) => (
                <motion.div
                  key={proj.slug}
                  animate={{ y: [0, idx % 2 === 0 ? -12 : 8, 0] }}
                  transition={{ repeat: Infinity, duration: 4 + idx * 0.4, ease: 'easeInOut', delay: idx * 0.15 }}
                  whileHover={{ scale: 1.05, border: '1px solid rgba(54,153,243,0.45)' }}
                  onClick={() => navigate(`/showcase/${proj.slug}`)}
                  className="group relative flex flex-col items-center justify-center bg-card border border-border rounded-2xl p-4 text-center cursor-pointer shadow-sm transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden mb-2.5 border border-border bg-background">
                    <img src={proj.image} alt={proj.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-bold text-foreground line-clamp-1 uppercase tracking-wide group-hover:text-primary">
                    {proj.name.split(' ')[0]}
                  </span>
                  <span className="text-[8px] font-semibold text-text_muted line-clamp-1">
                    {proj.type.split(' ')[0]}
                  </span>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </div>

        {/* Bottom divider section fade */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* ──────────────────────────────────────────────────────────────
          § 2 CASE STUDY SPOTLIGHTS — Alternating Featured Projects
      ────────────────────────────────────────────────────────────── */}
      {spotlightProjects.length > 0 && (
        <section className="py-24 bg-page-alt border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-20">
              <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <SectionLabel icon={HiStar}>Featured Spotlights</SectionLabel>
              </motion.div>
              <h2 className="font-display text-3xl md:text-4.5xl font-extrabold text-foreground tracking-tight">
                Case Studies in <span className="gradient-text">Excellence</span>
              </h2>
              <p className="text-sm text-text_secondary max-w-lg mt-3">
                Deep dive into some of our biggest production launches, highlighting the challenges met and technologies applied.
              </p>
            </div>

            {/* Alternating spotlight rows */}
            <div className="space-y-28">
              {spotlightProjects.map((proj, idx) => {
                const isRight = idx % 2 === 1;
                const strokeColor = proj.color?.includes('cyan') ? '#06b6d4' : '#3699f3';
                const rgbOverlay = proj.color?.includes('cyan') ? '6,182,212' : '54,153,243';

                return (
                  <motion.div
                    key={proj.slug}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-50px' }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
                  >
                    
                    {/* Text Block */}
                    <div className={isRight ? 'lg:order-2' : ''}>
                      <div className="flex items-center gap-3 mb-6">
                        <span className="font-mono text-xs font-black tracking-widest uppercase opacity-45" style={{ color: strokeColor }}>
                          Featured Case {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="h-px w-10 opacity-25" style={{ background: strokeColor }} />
                      </div>

                      <div className="flex flex-col mb-6">
                        <span className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: strokeColor }}>
                          {proj.type}
                        </span>
                        <h3 className="font-display text-2xl md:text-3.5xl font-extrabold text-foreground tracking-tight">
                          {proj.name}
                        </h3>
                      </div>

                      <p className="text-sm text-text_secondary leading-relaxed mb-8">
                        {proj.summary}
                      </p>

                      {/* Display Results details */}
                      {proj.results && proj.results.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                          {proj.results.map((res, ri) => (
                            <div key={ri} className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-border bg-card shadow-sm">
                              <HiCheckCircle className="text-base flex-shrink-0" style={{ color: strokeColor }} />
                              <span className="text-xs font-bold text-foreground">{res}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* CTA link to detailed case page */}
                      <Link
                        to={`/showcase/${proj.slug}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${strokeColor}, rgba(${rgbOverlay}, 0.75))`,
                          boxShadow: `0 6px 20px rgba(${rgbOverlay}, 0.25)`,
                        }}
                      >
                        <FaRocket size={12} /> Explore Full Case Study <HiArrowRight size={14} />
                      </Link>
                    </div>

                    {/* Graphics / Image Mockup Frame */}
                    <div className={isRight ? 'lg:order-1' : ''}>
                      <div className="relative rounded-3xl p-8 flex items-center justify-center min-h-[330px] overflow-hidden border border-border bg-card shadow-md">
                        {/* Dot background texture grid */}
                        <div
                          className="absolute inset-0 opacity-[0.07]"
                          style={{
                            backgroundImage: `radial-gradient(circle, ${strokeColor} 1px, transparent 1px)`,
                            backgroundSize: '24px 24px',
                          }}
                        />

                        {/* Concentric rings decoration */}
                        {[130, 220, 310].map((sz, ri) => (
                          <div
                            key={ri}
                            className="absolute rounded-full border pointer-events-none"
                            style={{
                              width: sz, height: sz,
                              borderColor: `rgba(${rgbOverlay}, ${0.12 - ri * 0.03})`,
                            }}
                          />
                        ))}

                        {/* Centered Image Mockup Card */}
                        <motion.div
                          animate={{ y: [0, -12, 0] }}
                          transition={{ repeat: Infinity, duration: 4.2 + idx * 0.3, ease: 'easeInOut' }}
                          className="relative z-10 w-full max-w-[360px] rounded-2xl overflow-hidden shadow-2xl border border-border/80 bg-background"
                        >
                          <img src={proj.image} alt={proj.name} className="w-full h-48 object-cover" />
                          <div className="p-4 border-t border-border">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text_muted">{proj.type}</span>
                            <h4 className="text-sm font-extrabold text-foreground mt-0.5">{proj.name}</h4>
                          </div>
                        </motion.div>

                        {/* Floating Tooltips */}
                        {proj.stack && proj.stack.slice(0, 3).map((tech, ti) => {
                          const tooltipsPos = [
                            { top: '12%', right: '8%' },
                            { bottom: '12%', left: '8%' },
                            { top: '48%', left: '6%' },
                          ];
                          return (
                            <motion.div
                              key={tech}
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.2 + ti * 0.1 }}
                              className="absolute flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border border-border bg-card shadow-sm"
                              style={{ ...tooltipsPos[ti] }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: strokeColor }} />
                              {tech}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────
          § 3 MAIN COLLECTION GRID — Filter sidebar + bento cards list
      ────────────────────────────────────────────────────────────── */}
      <section id="collection" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-16">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <SectionLabel icon={HiDatabase}>Explore Portfolio</SectionLabel>
            </motion.div>
            <h2 className="font-display text-3xl md:text-4.5xl font-extrabold text-foreground tracking-tight">
              Featured Case <span className="gradient-text">Showcase</span>
            </h2>
            <p className="text-sm text-text_secondary max-w-lg mt-2.5">
              Refine our collection by categories, stack, or keywords to inspect specific technologies.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Side column: Filtering Controls */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 bg-card border border-border rounded-3xl p-6 shadow-sm">
                
                {/* Heading */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
                  <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wider">Refine Search</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Text search input */}
                <div className="relative mb-6">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text_muted">
                    <HiSearch size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search stack or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder-text_muted focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Category filters */}
                <div className="mb-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-text_muted mb-3.5">Categories</h4>
                  <div className="space-y-2">
                    {allCategories.map((cat) => {
                      const isActive = selectedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                            isActive
                              ? 'border-primary/40 bg-primary/8 text-primary shadow-sm'
                              : 'border-border bg-background/50 text-text_secondary hover:bg-muted/30'
                          }`}
                        >
                          <span className="truncate">{cat}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-text_muted'}`}>
                            {projects.filter((p) => p.type === cat).length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tech stack filters */}
                <div className="pt-5 border-t border-border">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-text_muted mb-3.5">Technologies</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {allStacks.map((stk) => {
                      const isActive = selectedStacks.includes(stk);
                      return (
                        <button
                          key={stk}
                          onClick={() => toggleStack(stk)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                            isActive
                              ? 'border-primary/45 bg-primary/10 text-primary shadow-sm'
                              : 'border-border bg-background/40 text-text_secondary hover:bg-muted/40'
                          }`}
                        >
                          {stk}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </aside>

            {/* Main project collection grid (col-span 3) */}
            <main className="lg:col-span-3">
              
              {/* Toolbar controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-5 border-b border-border">
                <div className="text-left w-full">
                  <h3 className="font-display font-extrabold text-lg text-foreground leading-none mb-1.5">
                    {hasActiveFilters ? 'Search Results' : 'All Case Studies'}
                  </h3>
                  <p className="text-xs text-text_muted font-medium">
                    Found {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} matching criteria.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Search box for mobile display */}
                  <div className="relative flex-1 sm:hidden">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text_muted pointer-events-none">
                      <HiSearch size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-border bg-card text-xs text-foreground placeholder-text_muted focus:outline-none"
                    />
                  </div>

                  {/* Toggle filter panel on mobile */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-xs font-semibold bg-card text-text_secondary hover:bg-muted"
                  >
                    <HiFilter /> Filters
                  </button>
                </div>
              </div>

              {/* Dynamic projects grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-12">
                  {[1, 2, 4].map((i) => (
                    <div key={i} className="animate-pulse rounded-3xl border border-border bg-card overflow-hidden h-[340px] flex flex-col p-6 gap-4">
                      <div className="bg-muted w-full h-40 rounded-2xl" />
                      <div className="bg-muted w-2/3 h-5 rounded-md" />
                      <div className="bg-muted w-full h-12 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : filteredProjects.length > 0 ? (
                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-20px' }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {filteredProjects.map((proj, idx) => (
                    <ProjectCard
                      key={proj.slug}
                      project={proj}
                      onNavigate={navigate}
                      themeClasses={themeClasses}
                    />
                  ))}
                </motion.div>
              ) : (
                /* Empty state when no filters match */
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 px-6 border-2 border-dashed border-border rounded-3xl bg-card"
                >
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl mx-auto mb-4 text-text_muted">
                    🔍
                  </div>
                  <h3 className="font-display font-bold text-foreground text-sm mb-1.5">No Matching Case Studies</h3>
                  <p className="text-xs text-text_secondary mb-6 max-w-xs mx-auto">
                    Try adjusting your keyword query, selected categories, or active technologies stack to explore other case studies.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary/95 transition-all shadow-md"
                  >
                    <HiArrowLeft /> Reset All Filters
                  </button>
                </motion.div>
              )}

            </main>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          § 4 MOBILE SIDEBAR DRAWERS — Filtering overlay
      ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileFiltersOpen(false)}
            className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-xs flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs h-full bg-card border-l border-border p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                  <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wider">Filters</h3>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1.5 border border-border rounded-lg hover:bg-muted text-text_muted hover:text-foreground"
                  >
                    <HiX size={16} />
                  </button>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-text_muted mb-3">Categories</h4>
                  <div className="space-y-1.5">
                    {allCategories.map((cat) => {
                      const isActive = selectedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border text-left ${
                            isActive ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-text_secondary'
                          }`}
                        >
                          <span>{cat}</span>
                          <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-md text-text_muted">
                            {projects.filter((p) => p.type === cat).length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stacks */}
                <div className="mb-6 pt-5 border-t border-border">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-text_muted mb-3">Technologies</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {allStacks.map((stk) => {
                      const isActive = selectedStacks.includes(stk);
                      return (
                        <button
                          key={stk}
                          onClick={() => toggleStack(stk)}
                          className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg border ${
                            isActive ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-text_secondary'
                          }`}
                        >
                          {stk}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      resetFilters();
                      setMobileFiltersOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl border border-border bg-background text-xs font-semibold text-text_secondary hover:bg-muted mb-2"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-semibold shadow-md"
                >
                  Apply Filters
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────
          § 5 STANDARDS — Engineering principles
      ────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-page-alt border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column info */}
            <div>
              <SectionLabel icon={HiCode}>NexCode Standards</SectionLabel>
              <h2 className="font-display text-3xl md:text-4.5xl font-extrabold text-foreground tracking-tight mb-5">
                Engineering for <span className="gradient-text">Uptime & Scale.</span>
              </h2>
              <p className="text-sm text-text_secondary leading-relaxed mb-8">
                NexCode doesn't just design interfaces; we deliver core software architectures
                built to grow with your user base. Every client receives high-performance code
                compliant with leading security standards.
              </p>

              <div className="space-y-4">
                {[
                  { icon: HiLightningBolt, title: 'Optimized Assets Pipeline', desc: 'Pre-rendered chunks and lazy loadings deliver sub-second loading states.' },
                  { icon: HiCheckCircle, title: 'Clean Architecture', desc: 'Strict separation of concern rules ensures simple scalability and clean integrations.' },
                  { icon: HiDatabase, title: 'Resilient DB Scaling', desc: 'Custom connection indexes, indexing optimizations, and query profiling minimize server bottlenecks.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/25 transition-colors duration-250 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center flex-shrink-0 shadow shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                      <item.icon className="text-lg" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-foreground mb-1">{item.title}</h4>
                      <p className="text-xs text-text_secondary leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column visual: standards mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative p-1 border border-border bg-card rounded-3xl"
            >
              <div className="relative rounded-2xl overflow-hidden bg-background p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="text-[10px] font-mono text-text_muted ml-2">nexcode-performance.log</span>
                </div>
                <div className="font-mono text-xs text-text_muted space-y-2 leading-relaxed">
                  <div className="text-green-500">// 1. Performance Audit successful</div>
                  <div>&gt; webpack --mode production --profile --json</div>
                  <div className="text-primary">&gt; Chunk loaded: main-js-bundle.js (968kb gzip)</div>
                  <div>&gt; Performance score: 100/100 (Google Lighthouse)</div>
                  <div>&gt; Time to First Byte (TTFB): 140ms</div>
                  <div className="text-purple-400">&gt; DB Connection pool established: pool_size=12</div>
                  <div className="text-green-500">&gt; MongoDB Atlas Cluster Connected successfully.</div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          § 6 CTA BANNER — Full-bleed gradients CTA
      ────────────────────────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700" />
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        
        {/* Glow float shapes */}
        <div className="absolute -top-32 -left-20 w-80 h-80 rounded-full bg-white/10 blur-2xl animate-float pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-80 h-80 rounded-full bg-white/10 blur-2xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full bg-white/15 border border-white/20 backdrop-blur text-[10px] font-black uppercase tracking-widest mb-6">
              <HiLightningBolt size={10} className="text-yellow-300 animate-bounce" /> Build with NexCode
            </div>

            <h2 className="font-display font-extrabold mb-5 tracking-tight leading-[1.1]" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)' }}>
              Let's Collaborate to <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Launch Your Platform.
              </span>
            </h2>

            <p className="text-white/70 text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed">
              Have a bespoke solution in mind? Reach out to start a collaborative discovery cycle and outline details with our architects.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/start-project"
                className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
              >
                <FaRocket size={12} /> Start Your Project
              </Link>
              <a
                href="https://wa.me/94769747244"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-xl border-2 border-white/25 text-white font-bold text-xs hover:bg-white/10 backdrop-blur-sm transition-colors"
              >
                <FaWhatsapp /> Contact WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
