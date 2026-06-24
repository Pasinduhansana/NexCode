/**
 * ServicesPage — NexCode
 * Modern landing-page-feel design with full support for:
 *   light | dark | primary  themes via Tailwind semantic tokens.
 */
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiGlobe,
  HiDeviceMobile,
  HiCode,
  HiColorSwatch,
  HiCloud,
  HiChip,
  HiDatabase,
  HiArrowRight,
  HiCheckCircle,
  HiLightningBolt,
  HiShieldCheck,
  HiTrendingUp,
  HiStar,
  HiX,
  HiChevronDown,
  HiSparkles,
} from "react-icons/hi";
import { FaRocket, FaWhatsapp } from "react-icons/fa";
import usePageTitle from "../utils/usePageTitle";
import FAQ from "../components/FAQ";

/* ═══════════════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════════════ */
const SERVICES = [
  {
    id: "web",
    icon: HiGlobe,
    title: "Web Development",
    tagline: "Blazing-fast & SEO-ready",
    description:
      "High-performance web applications using React, Next.js & full-stack technologies. From polished marketing sites to complex enterprise portals built for speed and scale.",
    features: ["React / Next.js / Vue.js", "REST & GraphQL APIs", "E-commerce Solutions", "CMS Integration", "Performance Optimisation"],
    accent: "#3b82f6",
    rgb: "59,130,246",
    from: "from-blue-500",
    to: "to-indigo-600",
  },
  {
    id: "mobile",
    icon: HiDeviceMobile,
    title: "Mobile Development",
    tagline: "iOS & Android excellence",
    description:
      "Native iOS and Android apps plus cross-platform solutions with React Native and Flutter — delivering experiences users love and businesses depend on.",
    features: ["React Native / Flutter", "iOS & Android Native", "Push Notifications", "Offline-First Support", "App Store Deployment"],
    accent: "#a855f7",
    rgb: "168,85,247",
    from: "from-purple-500",
    to: "to-violet-600",
  },
  {
    id: "software",
    icon: HiCode,
    title: "Custom Software",
    tagline: "Tailored to your workflow",
    description:
      "End-to-end bespoke software built specifically for your business — from workflow automation and ERPs to full SaaS product development.",
    features: ["Business Process Automation", "ERP & CRM Systems", "API Development", "Legacy Modernisation", "SaaS Development"],
    accent: "#6366f1",
    rgb: "99,102,241",
    from: "from-indigo-500",
    to: "to-purple-600",
  },
  {
    id: "design",
    icon: HiColorSwatch,
    title: "UI/UX Design",
    tagline: "Design that converts",
    description:
      "Research-driven design that delights and converts. Wireframes, prototypes, and pixel-perfect interfaces aligned to measurable business goals.",
    features: ["User Research", "Wireframing & Prototyping", "Figma Design Systems", "Brand Identity", "Usability Testing"],
    accent: "#ec4899",
    rgb: "236,72,153",
    from: "from-pink-500",
    to: "to-rose-600",
  },
  {
    id: "cloud",
    icon: HiCloud,
    title: "Cloud Solutions",
    tagline: "Scale with confidence",
    description:
      "Resilient cloud infrastructure on AWS, Azure, and GCP. We handle migration, architecture design, CI/CD and ongoing DevOps management.",
    features: ["AWS / Azure / GCP", "Cloud Migration", "Docker & Kubernetes", "CI/CD Pipelines", "Cost Optimisation"],
    accent: "#0ea5e9",
    rgb: "14,165,233",
    from: "from-sky-500",
    to: "to-cyan-600",
  },
  {
    id: "ai",
    icon: HiChip,
    title: "AI & Automation",
    tagline: "Intelligent by design",
    description:
      "Harness AI to automate tasks, gain deep insights from data, and embed intelligence into your products — making every process smarter.",
    features: ["Machine Learning Models", "NLP & Chatbots", "Process Automation", "Data Analytics", "Computer Vision"],
    accent: "#06b6d4",
    rgb: "6,182,212",
    from: "from-cyan-500",
    to: "to-teal-600",
  },
  {
    id: "database",
    icon: HiDatabase,
    title: "Database & Systems",
    tagline: "Built for reliability",
    description:
      "Robust database design, migration, and optimisation ensuring your data infrastructure scales reliably alongside your growing business.",
    features: ["MongoDB / PostgreSQL", "Database Architecture", "Data Migration", "Performance Tuning", "Backup & Recovery"],
    accent: "#f97316",
    rgb: "249,115,22",
    from: "from-orange-500",
    to: "to-amber-600",
  },
];

const PROCESS = [
  {
    step: "01",
    icon: HiSparkles,
    title: "Discovery",
    desc: "We deep-dive into your goals, audience, and technical requirements to build a precise project blueprint.",
  },
  {
    step: "02",
    icon: HiColorSwatch,
    title: "Design & Architect",
    desc: "Stunning prototypes meet scalable system architecture — built to last and grow from day one.",
  },
  {
    step: "03",
    icon: HiLightningBolt,
    title: "Build & Iterate",
    desc: "Agile sprints with weekly demos so you see real progress and steer direction continuously.",
  },
  {
    step: "04",
    icon: HiShieldCheck,
    title: "Launch & Support",
    desc: "Rigorous QA, smooth deployment, then ongoing monitoring and maintenance.",
  },
];

const STATS = [
  { value: "150+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "7", label: "Service Domains" },
  { value: "24/7", label: "Support" },
];

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
═══════════════════════════════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.08,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

/* ═══════════════════════════════════════════════════════════════════════
   SHARED SMALL COMPONENTS
═══════════════════════════════════════════════════════════════════════ */

/** Pill label above section headings */
function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-card text-xs font-semibold text-text_secondary mb-5 select-none">
      {Icon ? (
        <Icon className="text-primary text-sm flex-shrink-0" />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex-shrink-0" />
      )}
      {children}
    </div>
  );
}

/** Gradient icon box */
function IconBox({ service, size = "md", className = "" }) {
  const sizes = { sm: "w-10 h-10 text-lg", md: "w-12 h-12 text-xl", lg: "w-16 h-16 text-3xl", xl: "w-24 h-24 text-5xl" };
  return (
    <div
      className={`${sizes[size]} rounded-2xl bg-gradient-to-br ${service.from} ${service.to} flex items-center justify-center text-white shadow-lg flex-shrink-0 ${className}`}
      style={{ boxShadow: `0 8px 24px rgba(${service.rgb},0.32)` }}
    >
      <service.icon />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SERVICE DETAIL MODAL
═══════════════════════════════════════════════════════════════════════ */
function ServiceModal({ service, onClose }) {
  return (
    <AnimatePresence>
      {service && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 28 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-card border border-border rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Accent stripe */}
            <div className={`h-1 w-full bg-gradient-to-r ${service.from} ${service.to}`} />

            <div className="p-7">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <IconBox service={service} size="md" />
                  <div>
                    <div className="text-xs font-semibold mb-1" style={{ color: service.accent }}>
                      {service.tagline}
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground">{service.title}</h3>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="p-2 rounded-xl border border-border hover:bg-muted text-text_secondary hover:text-foreground transition-colors ml-2 flex-shrink-0"
                >
                  <HiX size={16} />
                </button>
              </div>

              <p className="text-sm text-text_secondary leading-relaxed mb-6">{service.description}</p>

              {/* Features */}
              <p className="text-[10px] font-bold uppercase tracking-widest text-text_muted mb-3">What's Included</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {service.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-background">
                    <HiCheckCircle className="flex-shrink-0" style={{ color: service.accent }} />
                    <span className="text-sm text-foreground font-medium">{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                to="/start-project"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${service.accent}, rgba(${service.rgb},0.7))`,
                  boxShadow: `0 6px 24px rgba(${service.rgb},0.3)`,
                }}
              >
                <FaRocket size={13} />
                Start with {service.title}
                <HiArrowRight />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SERVICE CARD (grid)
═══════════════════════════════════════════════════════════════════════ */
function ServiceCard({ service, index, onSelect }) {
  return (
    <motion.article
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={() => onSelect(service)}
      className="group relative rounded-2xl border border-border bg-card overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:border-opacity-70"
    >
      {/* Hover radial glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 35% 0%, rgba(${service.rgb},0.10) 0%, transparent 65%)` }}
      />
      {/* Bottom accent bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${service.from} ${service.to} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
      />

      <div className="p-5 flex flex-col h-full">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div className="group-hover:scale-110 transition-transform duration-300">
            <IconBox service={service} size="md" />
          </div>
          <HiArrowRight
            className="text-text_muted group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 mt-1 opacity-0 group-hover:opacity-100"
            size={16}
          />
        </div>

        {/* Tagline */}
        <div
          className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2.5 w-fit border"
          style={{
            background: `rgba(${service.rgb},0.08)`,
            color: service.accent,
            borderColor: `rgba(${service.rgb},0.18)`,
          }}
        >
          {service.tagline}
        </div>

        {/* Title */}
        <h3 className="font-display text-sm font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-text_secondary leading-relaxed flex-1 line-clamp-3">{service.description}</p>

        {/* Feature chips */}
        <div className="flex flex-wrap gap-1.5 mt-4 pt-3.5 border-t border-border">
          {service.features.slice(0, 2).map((f, fi) => (
            <span key={fi} className="text-[10px] px-2 py-0.5 rounded-full bg-background border border-border text-text_muted">
              {f}
            </span>
          ))}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-background border border-border text-text_muted">
            +{service.features.length - 2} more
          </span>
        </div>
      </div>
    </motion.article>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════ */
export default function ServicesPage() {
  usePageTitle("Services — NexCode");
  const [selected, setSelected] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const heroRef = useRef(null);

  /* Parallax on hero text */
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-background">
      {/* ──────────────────────────────────────────────────────────────
          § 1  HERO — cinematic full-screen opener
      ────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden bg-background dark-grid">
        {/* Ambient orbs — use CSS vars so they respond to any background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-40 -left-40 w-[680px] h-[680px] rounded-full animate-pulse-slow"
            style={{ background: "radial-gradient(circle, rgba(54,153,243,0.14) 0%, transparent 65%)" }}
          />
          <div
            className="absolute top-1/3 right-[-12%] w-[520px] h-[520px] rounded-full animate-float"
            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 65%)" }}
          />
          <div
            className="absolute bottom-[-8%] left-[28%] w-[400px] h-[400px] rounded-full animate-pulse-slow"
            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 65%)", animationDelay: "1.5s" }}
          />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-16 items-center">
            {/* ── Left: headline ── */}
            <div>
              <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
                <SectionLabel icon={HiSparkles}>Full-Spectrum Digital Services</SectionLabel>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={1}
                className="font-display font-extrabold text-foreground tracking-tight mb-6 leading-[1.07]"
                style={{ fontSize: "clamp(2.6rem, 6vw, 5rem)" }}
              >
                Build Every <span className="gradient-text">Digital Layer</span>
                <br />
                of Your Business.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={2}
                className="text-base text-text_secondary leading-relaxed mb-10 max-w-xl"
              >
                From blazing-fast web apps to intelligent AI systems — NexCode engineers every layer of your digital presence with precision,
                creativity, and a relentless focus on results.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="flex flex-wrap gap-3 mb-12">
                <Link
                  to="/start-project"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-glow-blue hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  <FaRocket size={13} /> Start Your Project
                </Link>
                <a
                  href="#services-grid"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:border-primary/40 transition-all duration-200"
                >
                  Explore Services <HiArrowRight size={15} />
                </a>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={4}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 border-t border-border"
              >
                {STATS.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="font-display text-xl md:text-2xl font-extrabold gradient-text leading-none">{s.value}</div>
                    <div className="text-[10px] text-text_muted mt-1 leading-tight">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── Right: floating service icon grid ── */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="hidden lg:grid grid-cols-3 gap-3"
            >
              {SERVICES.map((svc, i) => (
                <motion.div
                  key={svc.id}
                  animate={{ y: [0, i % 2 === 0 ? -10 : 8, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5 + i * 0.35, ease: "easeInOut", delay: i * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: `0 16px 40px rgba(${svc.rgb},0.22)`,
                    borderColor: `rgba(${svc.rgb},0.4)`,
                  }}
                  onClick={() => setSelected(svc)}
                  className={`group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-5 cursor-pointer transition-all duration-300 ${i === 3 ? "col-start-2" : ""}`}
                >
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    <IconBox service={svc} size="md" />
                  </div>
                  <span className="text-[11px] font-semibold text-text_secondary text-center leading-tight">{svc.title}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          § 2  SERVICES GRID
      ────────────────────────────────────────────────────────────── */}
      <section id="services-grid" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-14">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <SectionLabel>Our Capabilities</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={1}
              className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-4"
            >
              Everything You Need to <span className="gradient-text">Build Digitally</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={2}
              className="text-sm text-text_secondary max-w-lg"
            >
              Click any card to explore full details — each service is delivered with precision and a commitment to measurable outcomes.
            </motion.p>
          </div>

          {/* 4-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {SERVICES.map((svc, i) => (
              <ServiceCard key={svc.id} service={svc} index={i} onSelect={setSelected} />
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          § 3  DETAILED SERVICE SPOTLIGHTS (alternating layout)
      ────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-page-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-20">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <SectionLabel icon={HiLightningBolt}>Deep Dive</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={1}
              className="font-display text-3xl md:text-4xl font-extrabold text-foreground tracking-tight"
            >
              What We Deliver, <span className="gradient-text">End to End</span>
            </motion.h2>
          </div>

          <div className="space-y-28">
            {SERVICES.map((svc, i) => {
              const isRight = i % 2 === 1;
              return (
                <motion.div
                  key={svc.id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-60px" }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
                >
                  {/* Text */}
                  <div className={isRight ? "lg:order-2" : ""}>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="font-mono text-xs font-black tracking-widest opacity-40" style={{ color: svc.accent }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="h-px w-8 opacity-25 rounded-full" style={{ background: svc.accent }} />
                    </div>

                    <div className="flex items-start gap-5 mb-5">
                      <IconBox service={svc} size="lg" />
                      <div>
                        <div className="text-xs font-semibold mb-1.5" style={{ color: svc.accent }}>
                          {svc.tagline}
                        </div>
                        <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">{svc.title}</h2>
                      </div>
                    </div>

                    <p className="text-sm text-text_secondary leading-relaxed mb-8">{svc.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
                      {svc.features.map((f, fi) => (
                        <div key={fi} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-border bg-card">
                          <HiCheckCircle className="flex-shrink-0 text-sm" style={{ color: svc.accent }} />
                          <span className="text-sm text-foreground font-medium">{f}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setSelected(svc)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${svc.accent}, rgba(${svc.rgb},0.72))`,
                        boxShadow: `0 4px 20px rgba(${svc.rgb},0.28)`,
                      }}
                    >
                      <FaRocket size={12} /> Learn More <HiArrowRight size={14} />
                    </button>
                  </div>

                  {/* Visual panel */}
                  <div className={isRight ? "lg:order-1" : ""}>
                    <div className="relative rounded-3xl p-10 flex items-center justify-center min-h-72 overflow-hidden border border-border bg-card">
                      {/* Dot grid */}
                      <div
                        className="absolute inset-0 opacity-[0.06]"
                        style={{
                          backgroundImage: `radial-gradient(circle, rgba(${svc.rgb},1) 1px, transparent 1px)`,
                          backgroundSize: "26px 26px",
                        }}
                      />
                      {/* Concentric rings */}
                      {[120, 200, 280].map((sz, si) => (
                        <div
                          key={si}
                          className="absolute rounded-full border pointer-events-none"
                          style={{
                            width: sz,
                            height: sz,
                            borderColor: `rgba(${svc.rgb},${0.14 - si * 0.04})`,
                          }}
                        />
                      ))}

                      {/* Floating icon */}
                      <motion.div
                        animate={{ y: [0, -14, 0] }}
                        transition={{ repeat: Infinity, duration: 3.8 + i * 0.22, ease: "easeInOut" }}
                        className="relative z-10"
                      >
                        <IconBox service={svc} size="xl" />
                        <div className="absolute -inset-6 rounded-3xl blur-2xl -z-10 opacity-35" style={{ background: `rgba(${svc.rgb},0.45)` }} />
                      </motion.div>

                      {/* Feature chips floating around */}
                      {svc.features.slice(0, 3).map((f, fi) => {
                        const poses = [
                          { top: "10%", right: "6%" },
                          { bottom: "10%", left: "6%" },
                          { top: "50%", right: "4%", transform: "translateY(-50%)" },
                        ];
                        return (
                          <motion.div
                            key={fi}
                            initial={{ opacity: 0, scale: 0.85 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.25 + fi * 0.12 }}
                            className="absolute flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-border bg-card shadow-md"
                            style={{ ...poses[fi], color: svc.accent }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: svc.accent }} />
                            {f}
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

      {/* ──────────────────────────────────────────────────────────────
          § 4  PROCESS — numbered horizontal steps
      ────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-16">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <SectionLabel icon={HiTrendingUp}>How We Work</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={1}
              className="font-display text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-4"
            >
              A Process Built for <span className="gradient-text">Excellence</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={2}
              className="text-sm text-text_secondary max-w-lg"
            >
              Four battle-tested phases that consistently ship remarkable software products on time and on budget.
            </motion.p>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Desktop connector line */}
            <div className="hidden lg:block absolute top-[3.4rem] left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {PROCESS.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  custom={i}
                  className="relative z-10 flex flex-col items-center text-center group"
                >
                  {/* Icon bubble */}
                  <div className="relative mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                      <step.icon />
                    </div>
                    {/* Step badge */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center">
                      <span className="text-[10px] font-black gradient-text">{i + 1}</span>
                    </div>
                  </div>

                  <div className="text-[10px] font-black tracking-[0.2em] text-text_muted font-mono mb-2">{step.step}</div>
                  <h3 className="font-display text-base font-bold text-foreground mb-2.5">{step.title}</h3>
                  <p className="text-xs text-text_secondary leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          § 5  WHY NEXCODE — differentiators + contact card
      ────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-page-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <SectionLabel icon={HiStar}>Why NexCode?</SectionLabel>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-5">
                We Build Software That <span className="gradient-text">Actually Works.</span>
              </h2>
              <p className="text-sm text-text_secondary leading-relaxed mb-8">
                We're not just developers — we're digital partners invested in your success. Our team blends deep expertise, creative design, and
                engineering excellence to deliver solutions that drive real, measurable growth.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  {
                    icon: HiTrendingUp,
                    title: "Outcome-Focused",
                    desc: "We measure success by the results you achieve, not just deliverables handed over.",
                  },
                  { icon: HiShieldCheck, title: "Enterprise Security", desc: "Bank-grade security practices baked into every layer from day one." },
                  {
                    icon: HiLightningBolt,
                    title: "Lightning Delivery",
                    desc: "Our agile process gets you to market significantly faster than traditional agencies.",
                  },
                  { icon: HiStar, title: "98% Satisfaction Rate", desc: "Proven track record across 150+ delivered projects globally." },
                ].map((d, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    custom={i}
                    className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-lg flex-shrink-0 shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform duration-200">
                      <d.icon />
                    </div>
                    <div>
                      <div className="font-display font-bold text-foreground text-sm mb-1">{d.title}</div>
                      <div className="text-xs text-text_secondary leading-relaxed">{d.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Link to="/about" className="btn-primary">
                Learn More About Us <HiArrowRight />
              </Link>
            </motion.div>

            {/* Right — premium contact card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative"
            >
              {/* Outer glow */}
              <div className="absolute -inset-4 rounded-4xl bg-gradient-to-br from-blue-500/15 to-cyan-500/10 blur-2xl pointer-events-none" />

              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-8 text-white border border-blue-500/25">
                {/* BG decoration */}
                <div className="absolute top-0 right-0 w-56 h-56 bg-white/8 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none" />
                <div
                  className="absolute inset-0 opacity-[0.07] pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                  }}
                />

                {/* Header */}
                <div className="relative flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FaRocket size={18} />
                  </div>
                  <div>
                    <div className="font-display font-bold text-xl">Ready to Launch?</div>
                    <div className="text-white/60 text-sm">Join 150+ satisfied clients</div>
                  </div>
                </div>

                {/* Stat grid */}
                <div className="relative grid grid-cols-2 gap-3 mb-8">
                  {STATS.map((s, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                      <div className="font-display text-2xl font-extrabold">{s.value}</div>
                      <div className="text-white/60 text-xs mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="relative flex gap-3 mb-4">
                  <a
                    href="tel:+94753125140"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors"
                  >
                    📞 Call Us
                  </a>
                  <a
                    href="https://wa.me/94769747244"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors"
                  >
                    <FaWhatsapp /> WhatsApp
                  </a>
                </div>
                <Link
                  to="/start-project"
                  className="relative flex items-center justify-center gap-2 py-3 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  <FaRocket size={13} /> Start a Project
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          § 6  FAQ accordion
      ────────────────────────────────────────────────────────────── */}
      <FAQ/>
      {/* ──────────────────────────────────────────────────────────────
          § 7  CTA BANNER — full-bleed gradient
      ────────────────────────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden">
        {/* Gradient BG */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700" />
        {/* Dot texture */}
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Orbs */}
        <div
          className="absolute -top-24 -left-12 w-96 h-96 rounded-full animate-float opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, white 0%, transparent 65%)" }}
        />
        <div
          className="absolute -bottom-20 right-8 w-72 h-72 rounded-full animate-pulse-slow opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle, white 0%, transparent 65%)", animationDelay: "2s" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm text-xs font-semibold mb-8">
              <FaRocket size={11} /> Limited Project Slots Available
            </div>

            <h2 className="font-display font-extrabold tracking-tight mb-5" style={{ fontSize: "clamp(2.2rem, 5.5vw, 4rem)", lineHeight: "1.08" }}>
              Ready to Build Something{" "}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Extraordinary?</span>
            </h2>

            <p className="text-white/70 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Tell us about your vision and we'll craft a precise plan to bring it to life. Free consultation. No obligations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/start-project"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-white text-blue-700 font-bold text-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:bg-blue-50 transition-all duration-200"
              >
                <FaRocket size={13} /> Start Your Project
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl border-2 border-white/25 text-white font-semibold text-sm hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
              >
                Contact Us <HiArrowRight />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Detail Modal */}
      <ServiceModal service={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
