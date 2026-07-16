/**
 * ShowcasePage — NexCode
 * Modern portfolio landing-page design with full support for:
 *   light | dark | primary themes via Tailwind semantic tokens.
 */
import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import {
  HiFilter,
  HiChevronRight,
  HiSearch,
  HiSparkles,
  HiCheckCircle,
  HiStar,
  HiDatabase,
  HiCode,
  HiLightningBolt,
  HiChevronLeft,
} from "react-icons/hi";
import { FaRocket, FaWhatsapp } from "react-icons/fa";
import { FaFilterCircleXmark } from "react-icons/fa6";
import usePageTitle from "../utils/usePageTitle";
import { useThemeClasses } from "../utils/useThemeClasses";
import { showcaseProjects } from "../data/showcaseProjects";
import SectionLabel from "../components/SectionLabel";

// Add once, outside the component that maps over your projects
function TiltMockup({ proj, idx }) {
  const ref = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);

  // Contact shadow reacts to tilt — grows/softens as the card "lifts"
  const shadowScale = useTransform([smoothX, smoothY], ([x, y]) => 1 - (Math.abs(x) + Math.abs(y)) * 0.15);
  const shadowOpacity = useTransform([smoothX, smoothY], ([x, y]) => 0.35 - (Math.abs(x) + Math.abs(y)) * 0.15);

  // Sheen glare that tracks the cursor across the glass surface
  const sheenX = useTransform(smoothX, [-0.5, 0.5], ["20%", "80%"]);
  const sheenY = useTransform(smoothY, [-0.5, 0.5], ["20%", "80%"]);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative z-10 w-full max-w-[450px]"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Contact shadow — sits at the floor of the scene, breathes with tilt */}
      <motion.div
        style={{
          scaleX: shadowScale,
          opacity: shadowOpacity,
          z: -20,
        }}
        className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-[80%] h-6 rounded-full  blur-xl "
      />

      <motion.div
        style={{ rotateX, rotateY, z: 60, transformStyle: "preserve-3d" }}
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 4.5 + idx * 0.3, ease: "easeInOut" }}
        className="relative rounded-[10px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.20)] border border-border bg-background "
      >
        <div className="relative">
          <img src={proj.cover} alt={proj.name} className="w-full h-54 object-cover" loading="lazy" decoding="async" />
          {/* Glassy top highlight, like light hitting a curved surface */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
          {/* Cursor-tracking sheen */}
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              background: useTransform([sheenX, sheenY], ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.35), transparent 55%)`),
            }}
          />
        </div>
        <div className="p-4 border-t border-border/60 backdrop-blur-xl bg-background/80">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-text_muted">{proj.type}</span>
          <h4 className="text-sm font-semibold tracking-tight text-foreground mt-0.5">{proj.name}</h4>
        </div>
      </motion.div>
    </div>
  );
}

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

/** Premium Project Card with hover-active effects */
function ProjectCard({ project, onNavigate, idx = 0 }) {
  // Extract accent styles from project colors
  const gradientClass = project.color || "from-blue-600 to-indigo-600";
  const rgbValues = gradientClass.includes("cyan") ? "6,182,212" : "54,153,243";

  return (
    <motion.article
      variants={scaleIn}
      custom={idx}
      whileHover={{ y: -6, transition: { duration: 0.22 } }}
      onClick={() => onNavigate(`/showcase/${project.slug}`)}
      className="group relative flex flex-col rounded-3xl border border-border bg-card overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:border-primary/45"
    >
      {/* Radial glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, rgba(${rgbValues}, 0.09) 0%, transparent 70%)`,
        }}
      />
      {/* Media frame */}
      <div className="relative h-48 lg:h-56 overflow-hidden bg-background">
          <img
            src={project.cover}
            alt={project.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
            decoding="async"
          />

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
        <p className="text-xs text-text_secondary leading-relaxed mb-5 line-clamp-3 flex-1">{project.summary}</p>

        {/* Results / Achievements metrics list */}
        {project.results && project.results.length > 0 && (
          <div className="space-y-1.5 mb-5 border-t border-border pt-4">
            <div className="text-[10px] uppercase font-extrabold tracking-widest text-text_muted mb-1">Impact Metrics</div>
            {project.results.map((result, ridx) => (
              <div key={ridx} className="flex items-center gap-2 text-xs font-semibold text-primary">
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
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const themeClasses = useThemeClasses();
  const heroRef = useRef(null);

  usePageTitle("Showcase — NexCode");

  // Static data only (no backend required)
  useEffect(() => {
    setProjects(showcaseProjects);
    setLoading(false);
  }, []);

  // Filter Categories list dynamically based on active data
  const allCategories = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.type))).sort();
  }, [projects]);

  // Main dynamic filter process (category + keyword search only)
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchSearch =
        searchQuery === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.stack.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(project.type);

      return matchSearch && matchCategory;
    });
  }, [projects, searchQuery, selectedCategories]);

  // Category Filter Toggle Action
  const toggleCategory = (category) => {
    setSelectedCategories((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]));
  };

  // Reset filter settings
  const resetFilters = () => {
    setSelectedCategories([]);
    setSearchQuery("");
  };

  // Check if any filters are active
  const hasActiveFilters = selectedCategories.length > 0 || searchQuery !== "";

  // Unique signature so the results grid remounts cleanly on every filter
  // change — fixes the bug where clearing a category left the grid stuck
  // invisible even though the cards (and their click targets) were present.
  const filterSignature = useMemo(() => `${selectedCategories.join("-")}|${searchQuery}`, [selectedCategories, searchQuery]);

  // Identify featured projects to spotlight (first 2 projects)
  const spotlightProjects = useMemo(() => {
    return projects.slice(0, 2);
  }, [projects]);

  return (
    <div className="min-h-screen bg-background -mt-20">
      {/* ──────────────────────────────────────────────────────────────
          § 1 HERO — Cinematic opening banner with background grids
      ────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden bg-background dark-grid">
        {/* Ambient background glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute hidden sm:block -top-32 -left-32 w-[650px] h-[650px] rounded-full animate-pulse-slow"
            style={{ background: "radial-gradient(circle, rgba(54,153,243,0.12) 0%, transparent 65%)" }}
          />
          <div
            className="absolute hidden sm:block top-1/4 right-[-10%] w-[580px] h-[580px] rounded-full animate-float"
            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.13) 0%, transparent 65%)", animationDelay: "1s" }}
          />
          <div
            className="absolute hidden sm:block bottom-[-10%] left-[30%] w-[450px] h-[450px] rounded-full animate-pulse-slow"
            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 65%)", animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-24 pb-10 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 md:gap-16 items-center">
            {/* Left Column Content */}
            <div className="text-center lg:text-left">
              <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
                <SectionLabel icon={HiSparkles} content="Engineered Case Studies" />
              </motion.div>

              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={1}
                className="font-display font-extrabold text-foreground tracking-tight mb-6 leading-[1.08]"
                style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.8rem)" }}
              >
                Stunning Digital Products,
                <br />
                Engineered for <span className="gradient-text">Impact.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={2}
                className="text-base text-text_secondary leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0"
              >
                Explore our portfolio of bespoke software solutions, cloud systems, e-commerce suites, and custom web builds. Every product is
                engineered with extreme performance and clean UI design to drive measurable business outcomes.
              </motion.p>

              {/* Main action CTAs */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={3}
                className="flex flex-col md:flex-row md:flex-wrap gap-3 lg:gap-4 mb-12 justify-center lg:justify-start px-6 sm:px-20 lg:px-0"
              >
                <Button variant="primary" rightIcon={<HiFilter size={16} />} href="#collection" className="w-full lg:w-auto">
                  Start Your Project
                </Button>
                <Button variant="radio" rightIcon={<HiChevronRight size={20} />} to="/start-project" className="w-full lg:w-auto">
                  Get in Touch
                </Button>
              </motion.div>

              {/* Stat counters block */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={4}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-border max-w-xl mx-auto lg:mx-0"
              >
                {[
                  { value: "20+", label: "Delivered Work" },
                  { value: "18+", label: "Client Experience" },
                  { value: "10+", label: "Tech Stack" },
                ].map((stat, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <div className="font-display text-2xl md:text-3xl font-extrabold gradient-text leading-none mb-1">{stat.value}</div>
                    <div className="text-[12px] font-semibold text-text_muted uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Column: Floating tech stack visual block */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.35 }}
              className="hidden lg:grid grid-cols-3 gap-4 relative -mt-20"
            >
              {/* Outer decorative ring */}
              <div className="absolute -inset-10 border border-border/40 rounded-full pointer-events-none -z-10 animate-spin-slow opacity-20" />

              {/* Showcase image mini card orbs */}
              {projects.slice(0, 6).map((proj, idx) => (
                <motion.div
                  key={proj.slug}
                  animate={{ y: [0, idx % 2 === 0 ? -12 : 8, 0] }}
                  transition={{ repeat: Infinity, duration: 4 + idx * 0.4, ease: "easeInOut", delay: idx * 0.15 }}
                  whileHover={{ scale: 1.05, border: "1px solid rgba(54,153,243,0.45)" }}
                  onClick={() => navigate(`/showcase/${proj.slug}`)}
                  className="group relative flex flex-col items-center justify-center bg-card border border-border  rounded-xl mx-2 my-1 p-4  text-center cursor-pointer shadow-sm transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden mb-2.5 border border-border bg-background ">
                    <img src={proj.cover} alt={proj.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </div>
                  <span className="text-[10px] font-bold text-foreground line-clamp-1 uppercase tracking-wide group-hover:text-primary">
                    {proj.name.split(" ")[0]}
                  </span>
                  <span className="text-[8px] font-semibold text-text_muted line-clamp-1">{proj.type.split(" ")[0]}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          § 2 CASE STUDY SPOTLIGHTS — Alternating Featured Projects
      ────────────────────────────────────────────────────────────── */}
      {spotlightProjects.length > 0 && (
        <section className="py-8 lg:py-20 bg-page-alt border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-0 lg:mb-20">
              <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <SectionLabel icon={HiStar} content="Featured Spotlights" />
              </motion.div>
              <h2 className="font-display text-3xl md:text-4.5xl font-extrabold text-foreground tracking-tight">
                Case Studies in <span className="gradient-text">Excellence</span>
              </h2>
              <p className="text-sm text-text_secondary max-w-lg mt-3">
                Deep dive into some of our biggest production launches, highlighting the challenges met and technologies applied.
              </p>
            </div>

            {/* Alternating spotlight rows */}
            <div className="space-y-12 md:space-y-28">
              {spotlightProjects.map((proj, idx) => {
                const isRight = idx % 2 === 1;
                const strokeColor = proj.color?.includes("cyan") ? "#06b6d4" : "#3699f3";
                const rgbOverlay = proj.color?.includes("cyan") ? "6,182,212" : "54,153,243";

                return (
                  <motion.div
                    key={proj.slug}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-0 lg:gap-20 items-center"
                  >
                    {/* Text Block */}
                    <div className={isRight ? "lg:order-2" : ""}>
                      <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 text-center md:text-left">
                        <div className="md:hidden h-px w-10 opacity-25" style={{ background: strokeColor }} />
                        <span className="font-mono text-xs font-black tracking-widest uppercase opacity-45" style={{ color: strokeColor }}>
                          Featured Case {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="h-px w-10 opacity-25" style={{ background: strokeColor }} />
                      </div>

                      <div className="flex flex-col mb-6">
                        <span
                          className="text-xs font-semibold uppercase tracking-wider mb-1.5 text-center md:text-left"
                          style={{ color: strokeColor }}
                        >
                          {proj.type}
                        </span>
                        <h3 className="font-display text-2xl md:text-3.5xl font-extrabold text-foreground tracking-tight text-center md:text-left">
                          {proj.name}
                        </h3>
                      </div>

                      <p className="text-sm text-text_secondary leading-relaxed mb-8 text-center md:text-left line-clamp-4 lg:line-clamp-5">
                        {proj.summary}
                      </p>

                      {/* Display Results details */}
                      {proj.results && proj.results.length > 0 && (
                        <div className="grid grid-cols-1  sm:grid-cols-2 gap-3 mb-8 ">
                          {proj.results.map((res, ri) => (
                            <div
                              key={ri}
                              className="flex items-center justify-center md:justify-start gap-2.5 px-4 py-1 md:py-3 rounded-xl md:border border-border md:bg-card md:shadow-sm md:mx-0  px-auto"
                            >
                              <HiCheckCircle className="text-base flex-shrink-0 text" style={{ color: strokeColor }} />
                              <span className="text-xs font-bold text-foreground">{res}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* CTA link to detailed case page */}
                      <div className="px-6 sm:px-16 md:px-0">
                        <Button
                          varient="primary"
                          rightIcon={<HiChevronRight size={20} />}
                          onClick={() => navigate(`/showcase/${proj.slug}`)}
                          style={{
                            background: `linear-gradient(135deg, ${strokeColor}, rgba(${rgbOverlay}, 0.75))`,
                          }}
                          className="w-full"
                        >
                          Explore Case Study
                        </Button>
                      </div>
                    </div>

                    {/* Graphics / Image Mockup Frame */}
                    <div className={`h-full ${isRight ? "lg:order-1" : ""}`}>
                      <div
                        className="relative rounded-[32px] p-8 flex items-center justify-center h-full min-h-[340px] overflow-hidden "
                        style={{ perspective: 1600, transformStyle: "preserve-3d" }}
                      >
                        {/* Far background — soft mesh gradient blobs, pushed deep and blurred (atmospheric depth) */}
                        <div
                          className="absolute -top-16 -left-10 w-72 h-72 rounded-full blur-3xl opacity-[0.18] pointer-events-none hidden"
                          style={{
                            transform: "translateZ(-220px) scale(1.3)",
                            background: `radial-gradient(circle, rgba(${rgbOverlay}, 0.9), transparent 70%)`,
                          }}
                        />
                        <div
                          className="absolute -bottom-20 -right-10 w-80 h-80 rounded-full blur-3xl opacity-[0.14] pointer-events-none hidden"
                          style={{
                            transform: "translateZ(-220px) scale(1.3)",
                            background: `radial-gradient(circle, rgba(${rgbOverlay}, 0.9), transparent 70%)`,
                          }}
                        />

                        {/* Faint dot grid, set slightly back and softly out of focus */}
                        <div
                          className="absolute inset-0 opacity-[0.05] blur-[0.5px] pointer-events-none z-50"
                          style={{
                            backgroundImage: `radial-gradient(circle, ${strokeColor} 1px, transparent 1px)`,
                            backgroundSize: "28px 28px",
                            transform: "translateZ(-120px) scale(1.1)",
                          }}
                        />

                        {/* Concentric rings — mid-depth, slow rotation, slight blur for depth-of-field */}
                        {[130, 220, 310].map((sz, ri) => (
                          <motion.div
                            key={ri}
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 50 + ri * 15, ease: "linear" }}
                            className="absolute rounded-full border pointer-events-none z-50"
                            style={{
                              width: sz,
                              height: sz,
                              borderColor: `rgba(${rgbOverlay}, ${0.1 - ri * 0.02})`,
                              transform: `translateZ(${-40 - ri * 20}px)`,
                              filter: `blur(${ri * 0.4}px)`,
                            }}
                          />
                        ))}

                        {/* Centered Image Mockup — foreground layer, tilts toward cursor */}
                        <TiltMockup proj={proj} idx={idx} className="z-10" />

                        {/* Floating Tooltips — closest layer, glass pills with independent drift */}
                        {proj.stack &&
                          proj.stack.slice(0, 3).map((tech, ti) => {
                            const tooltipsPos = [
                              { top: "10%", right: "6%" },
                              { bottom: "10%", left: "54%" },
                              { top: "40%", left: "0%" },
                            ];
                            return (
                              <motion.div
                                key={tech}
                                initial={{ opacity: 0, scale: 0.85 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                animate={{ y: [0, -6, 0] }}
                                transition={{
                                  opacity: { delay: 0.2 + ti * 0.1 },
                                  scale: { delay: 0.2 + ti * 0.1 },
                                  y: { repeat: Infinity, duration: 3.2 + ti * 0.4, ease: "easeInOut" },
                                }}
                                className="hidden sm:flex absolute items-center gap-1.5 px-3 z-50 py-1 rounded-full text-[11px] font-medium tracking-tight border border-white/30 bg-white/50 dark:bg-white/10 backdrop-blur-xl shadow-[0_8px_20px_-8px_rgba(0,0,0,0.25)]"
                                style={{ ...tooltipsPos[ti], transform: "translateZ(100px)" }}
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
          § 3 MAIN COLLECTION — Full-width horizontal filter bar + grid
      ────────────────────────────────────────────────────────────── */}
      <section id="collection" className="py-10 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10 md:mb-14">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <SectionLabel icon={HiDatabase} content="Explore Portfolio" />
            </motion.div>
            <h2 className="font-display text-3xl md:text-4.5xl font-extrabold text-foreground tracking-tight">
              Featured Case <span className="gradient-text">Showcase</span>
            </h2>
            <p className="text-sm text-text_secondary max-w-lg mt-2.5">
              Refine our collection by category or keyword to inspect specific case studies.
            </p>
          </div>

          {/* Full-width horizontal filter bar */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-10 md:mb-14 rounded-3xl border border-border bg-card/70 backdrop-blur-xl shadow-sm p-4 sm:p-5 md:p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 md:gap-5 lg:gap-6">
              {/* Search input */}
              <div className="relative w-full lg:w-72 flex-shrink-0">
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

              {/* Reset button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-background/60 text-xs font-semibold text-text_secondary hover:text-danger hover:border-danger/40 hover:bg-danger/5 transition-colors"
                >
                  <FaFilterCircleXmark size={13} /> Clear
                </button>
              )}

              {/* Divider (desktop / tablet only) */}
              <div className="hidden lg:block w-px h-8 bg-border flex-shrink-0" />
              <div className="lg:hidden h-px w-full bg-border" />

              {/* Category chips — wraps on mobile & tablet, single row on desktop */}
              <div className="flex-1 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-text_muted mr-1 inline-flex items-center gap-1.5 py-1.5">
                  <HiFilter size={12} /> Categories
                </span>
                {allCategories.map((cat) => {
                  const isActive = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`relative z-10 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all duration-200 ${
                        isActive
                          ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
                          : "border-border bg-background/60 text-text_secondary hover:border-primary/30 hover:bg-muted/40"
                      }`}
                    >
                      {cat}
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-primary/20 text-primary" : "bg-muted text-text_muted"}`}
                      >
                        {projects.filter((p) => p.type === cat).length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Toolbar: title + result count */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 pb-5 border-b border-border">
            <div>
              <h3 className="font-display font-extrabold text-lg text-foreground leading-none mb-1.5">
                {hasActiveFilters ? "Search Results" : "All Case Studies"}
              </h3>
              <p className="text-xs text-text_muted font-medium">
                Found {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"} matching criteria.
              </p>
            </div>
          </div>

          {/* Full-width projects grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-3xl border border-border bg-card overflow-hidden h-[340px] flex flex-col p-6 gap-4">
                  <div className="bg-muted w-full h-40 rounded-2xl" />
                  <div className="bg-muted w-2/3 h-5 rounded-md" />
                  <div className="bg-muted w-full h-12 rounded-md" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <motion.div key={filterSignature} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((proj, idx) => (
                <ProjectCard key={proj.slug} project={proj} idx={idx} onNavigate={navigate} themeClasses={themeClasses} />
              ))}
            </motion.div>
          ) : (
            /* Empty state when no filters match */
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 px-6 border-2 border-dashed border-border rounded-3xl bg-card"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl mx-auto mb-4 text-text_muted">🔍</div>
              <h3 className="font-display font-bold text-foreground text-sm mb-4">No Matching Case Studies</h3>
              <p className="text-text_secondary mb-6 max-w-lg mx-auto">
                Try adjusting your keyword query or selected categories to explore other case studies.
              </p>
              <Button variant="secondary" size="sm" leftIcon={<HiChevronLeft size={20} />} onClick={resetFilters}>
                Reset All Filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          § 4 STANDARDS — Engineering principles
      ────────────────────────────────────────────────────────────── */}
      <section className="py-10 md:py-24 bg-page-alt border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left Column info */}
            <div>
              <SectionLabel icon={HiCode} content="NexCode Standards" />

              <h2 className="font-display text-3xl md:text-4.5xl font-extrabold text-foreground tracking-tight mb-5">
                Engineering for <span className="gradient-text">Uptime & Scale.</span>
              </h2>
              <p className="text-sm text-text_secondary leading-relaxed mb-8">
                NexCode doesn't just design interfaces; we deliver core software architectures built to grow with your user base. Every client
                receives high-performance code compliant with leading security standards.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: HiLightningBolt,
                    title: "Optimized Assets Pipeline",
                    desc: "Pre-rendered chunks and lazy loadings deliver sub-second loading states.",
                  },
                  {
                    icon: HiCheckCircle,
                    title: "Clean Architecture",
                    desc: "Strict separation of concern rules ensures simple scalability and clean integrations.",
                  },
                  {
                    icon: HiDatabase,
                    title: "Resilient DB Scaling",
                    desc: "Custom connection indexes, indexing optimizations, and query profiling minimize server bottlenecks.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/25 transition-colors duration-250 group"
                  >
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
                <div className="font-mono text-xs text-text_muted space-y-2 leading-relaxed overflow-x-auto">
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
          § 5 CTA BANNER — Full-bleed gradients CTA
      ────────────────────────────────────────────────────────────── */}
      <section className="relative py-10 md:py-32 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700" />
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Glow float shapes */}
        <div className="absolute -top-32 -left-20 w-80 h-80 rounded-full bg-white/10 blur-2xl animate-float pointer-events-none" />
        <div
          className="absolute -bottom-24 right-10 w-80 h-80 rounded-full bg-white/10 blur-2xl animate-pulse-slow pointer-events-none"
          style={{ animationDelay: "1.5s" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <SectionLabel icon={HiLightningBolt} content="Build with NexCode" />

            <h2 className="font-display font-extrabold mb-5 tracking-tight leading-[1.1]" style={{ fontSize: "clamp(2.1rem, 5.5vw, 3.8rem)" }}>
              Let's Collaborate to <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Launch Your Platform.</span>
            </h2>

            <p className="text-white/70 text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed">
              Have a bespoke solution in mind? Reach out to start a collaborative discovery cycle and outline details with our architects.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="radio" to="/start-project" leftIcon={<FaRocket size={15} />} className="bg-white text-blue-700">
                Start Your Project
              </Button>
              <Button variant="whatsapp" href="https://wa.me/94769747244" target="_blank" rel="noreferrer" leftIcon={<FaWhatsapp size={20} />}>
                Contact Whatsapp
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
