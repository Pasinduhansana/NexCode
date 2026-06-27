/**
 * AboutPage — NexCode
 * Modern About Us page with support for:
 *   light | dark | primary themes via Tailwind semantic tokens.
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HiCheckCircle, HiLightBulb,HiChevronDoubleRight , HiChevronRight, HiEye, HiHeart, HiTrendingUp, HiShieldCheck, HiStar, HiSparkles } from "react-icons/hi";
import { FaRocket } from "react-icons/fa";
import usePageTitle from "../utils/usePageTitle";
import { useThemeClasses } from "../utils/useThemeClasses";
import Button from "../components/Button";

/* ═══════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */
const stats = [
  { value: "150+", label: "Projects Delivered", description: "Across various industries" },
  { value: "50+", label: "Happy Clients", description: "Who trust our expertise" },
  { value: "5+", label: "Years Experience", description: "In software development" },
  { value: "100%", label: "Sri Lankan Team", description: "Local talent, global standards" },
];

const STATS = [
  { value: "150+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "7", label: "Service Domains" },
  { value: "24/7", label: "Support" },
];

const timeline = [
  { year: "2019", title: "Founded", description: "NexCode was born with a mission to deliver world-class software from Sri Lanka." },
  { year: "2020", title: "First 20 Clients", description: "Rapidly grew our portfolio across web development and mobile applications." },
  { year: "2021", title: "AI Division", description: "Launched our AI & Automation services to help businesses embrace intelligent tech." },
  { year: "2022", title: "Cloud Expansion", description: "Added full cloud solutions including AWS, Azure, and GCP managed services." },
  { year: "2023", title: "Regional Recognition", description: "Recognized as one of Sri Lanka's fastest-growing software companies." },
  { year: "2024", title: "Going Global", description: "Expanding to serve international clients across UK, Australia, and Middle East." },
];

const values = [
  { icon: HiLightBulb, title: "Innovation First", desc: "We embrace emerging technologies and always seek better ways to solve problems." },
  { icon: HiHeart, title: "Client-Centric", desc: "Your success is our success. We build lasting partnerships, not just projects." },
  { icon: HiCheckCircle, title: "Quality Obsessed", desc: "Every line of code is crafted with care, tested thoroughly, and delivered with pride." },
  { icon: HiEye, title: "Transparent", desc: "Clear communication, honest timelines, and no hidden costs — always." },
];

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
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

/* ═══════════════════════════════════════════════════════════════════════
   SHARED SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════ */
function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-card text-xs font-semibold text-text_secondary mb-5 select-none shadow-sm">
      {Icon ? (
        <Icon className="text-primary text-sm flex-shrink-0 animate-pulse" />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex-shrink-0" />
      )}
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function AboutPage() {
  usePageTitle("About Us — NexCode");
  const themeClasses = useThemeClasses();

  return (
    <div className="min-h-screen bg-background">
      {/* ──────────────────────────────────────────────────────────────
          § 1 HERO — Cinematic banner opener
      ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-background dark-grid">
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
        </div>

        <div className="grid w-full grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-28 lg:py-32">
          <div className="relative z-10 w-full flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
              <SectionLabel icon={HiSparkles}>About NexCode</SectionLabel>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="font-display font-extrabold text-foreground tracking-tight mb-6 leading-[1.08]"
              style={{ fontSize: "clamp(2.4rem, 6vw, 4.8rem)" }}
            >
              Built by Passionate <br />
              <span className="gradient-text">Engineers & Builders.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="text-base text-text_secondary leading-relaxed max-w-2xl mb-12"
            >
              NexCode is a premier software development firm dedicated to bridging the gap between ambitious product ideas and highly optimized, clean
              digital solutions. We engineer for scale, stability, and speed.
            </motion.p>

            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button variant="primary" rightIcon={<HiChevronDoubleRight size={20} />} to="/start-project">
                  Start Your Project
                </Button>
                <Button variant="radio" rightIcon={<HiChevronRight size={20} />} to="/contact" >
                  Get in Touch
                </Button>

            </motion.div>


                          {/* Stats */}
                          <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="show"
                            custom={4}
                            className="grid grid-cols-2 sm:grid-cols-4 w-full gap-3 pt-8 border-t mt-10 border-border"
                          >
                            {STATS.map((s, i) => (
                              <div key={i} className="text-center">
                                <div className="font-display text-xl md:text-2xl font-extrabold gradient-text leading-none">{s.value}</div>
                                <div className="text-[10px] text-text_muted mt-1 leading-tight">{s.label}</div>
                              </div>
                            ))}
                          </motion.div>
          </div>

          <div className="w-full mx-auto px-0 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  whileHover={{ y: -4, transition: { duration: 0.18 } }}
                  className="text-center p-5 rounded-3xl bg-card border border-border hover:border-primary/30 transition-all duration-300 shadow-sm"
                >
                  <div className="font-display text-4.5xl font-black gradient-text mb-2 leading-none">{s.value}</div>
                  <div className="font-bold text-sm text-foreground mb-1">{s.label}</div>
                  <div className="text-xs text-text_secondary">{s.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          § 3 MISSION & VISION — Bento layout cards
      ────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-page-alt border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl p-10 overflow-hidden border border-border bg-card shadow-sm"
            >
              {/* Corner soft gradient */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mb-6 shadow shadow-blue-500/10">
                  <FaRocket size={18} />
                </div>
                <h3 className="font-display text-2xl font-extrabold text-foreground mb-4">Our Mission</h3>
                <p className="text-sm text-text_secondary leading-relaxed">
                  To empower businesses of all sizes with custom software solutions that are reliable, scalable, and built to grow. We bridge the gap
                  between ambitious ideas and functional, beautiful digital products — delivering real results for real businesses.
                </p>
              </div>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl p-10 overflow-hidden border border-border bg-card shadow-sm"
            >
              {/* Corner soft gradient */}
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white flex items-center justify-center mb-6 shadow shadow-cyan-500/10">
                  <HiEye size={20} />
                </div>
                <h3 className="font-display text-2xl font-extrabold text-foreground mb-4">Our Vision</h3>
                <p className="text-sm text-text_secondary leading-relaxed">
                  To become the leading software development company from Sri Lanka recognized globally for innovation, quality, and impact. We
                  envision a future where every business — from startups to enterprises — has access to world-class digital capabilities.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          § 4 CORE VALUES — Grouped card list
      ────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <SectionLabel icon={HiStar}>Core Guidelines</SectionLabel>
            </motion.div>
            <h2 className="font-display text-3xl md:text-4.5xl font-extrabold text-foreground tracking-tight">
              Values That <span className="gradient-text">Steer Us.</span>
            </h2>
            <p className="text-sm text-text_secondary max-w-md mx-auto mt-2">
              Principles guiding every single design, block of code, and deployment pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300 text-center flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center mb-5 group-hover:scale-108 transition-transform shadow shadow-blue-500/10">
                  <v.icon size={20} />
                </div>
                <h4 className="font-display font-bold text-foreground text-sm mb-2">{v.title}</h4>
                <p className="text-xs text-text_secondary leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          § 5 TIMELINE JOURNEY — Alternating split timeline
      ────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-page-alt border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <SectionLabel icon={HiTrendingUp}>Our Evolution</SectionLabel>
            </motion.div>
            <h2 className="font-display text-3xl md:text-4.5xl font-extrabold text-foreground tracking-tight">
              Our <span className="gradient-text">Journey.</span>
            </h2>
          </div>

          <div className="relative">
            {/* Center connector line */}
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-cyan-400 to-indigo-500 opacity-20" />

            <div className="space-y-12">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -28 : 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5 }}
                  className={`relative flex justify-center ${i % 2 === 0 ? "lg:justify-start" : "lg:justify-end"}`}
                >
                  {/* Center Year Badge */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-4 w-6 h-6 rounded-full bg-card border-4 border-border shadow-md z-10 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>

                  <div className={`w-5/12 ${i % 2 === 0 ? "pr-8" : "pl-8"}`}>
                    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:border-primary/25 transition-all duration-300">
                      <div className="text-primary font-mono font-black text-sm mb-1">{item.year}</div>
                      <h4 className="font-display font-bold text-foreground text-sm mb-2">{item.title}</h4>
                      <p className="text-xs text-text_secondary leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          § 6 CTA — Dynamic full-bleed banner cta
      ────────────────────────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-900 to-violet-800" />
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h2 className="font-display font-extrabold mb-5 tracking-tight leading-[1.1]" style={{ fontSize: "clamp(2.2rem, 5.5vw, 3.8rem)" }}>
              Ready to Partner <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">With NexCode?</span>
            </h2>
            <p className="text-white/70 text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed">
              Join 50+ businesses who leverage our digital engineering capabilities to achieve outstanding growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="radio" to="/start-project" leftIcon={<FaRocket size={15} />} className="bg-white text-blue-700">
                Start Your Project
              </Button>
              <Button variant="custom" to="/contact" rightIcon={<HiChevronRight size={20} />} className=" text-white border border-white/30 ">
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
