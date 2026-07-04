/**
 * TermsOfServicePage — NexCode
 * Theme-aware Terms of Service page matching NexCode's design system.
 */
import { motion } from "framer-motion";
import {
  HiDocumentText,
  HiCheckCircle,
  HiExclamationCircle,
  HiScale,
  HiCurrencyDollar,
  HiShieldExclamation,
  HiRefresh,
  HiMail,
  HiChevronDoubleRight,
  HiBan,
  HiInformationCircle,
  HiGlobeAlt,
  HiExternalLink,
  HiBookOpen,
} from "react-icons/hi";
import usePageTitle from "../utils/usePageTitle";
import { useThemeClasses } from "../utils/useThemeClasses";
import Button from "../components/Button";

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
   DATA
   ═══════════════════════════════════════════════════════════════════════ */
const effectiveDate = "July 4, 2026";

const sections = [
  {
    id: "acceptance",
    icon: HiCheckCircle,
    title: "1. Acceptance of Terms",
    content: [
      {
        text: "By accessing or using the NexCode website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our website.",
      },
    ],
  },
  {
    id: "about",
    icon: HiInformationCircle,
    title: "2. About NexCode",
    content: [
      {
        text: "NexCode is an independent software development startup based in Sri Lanka providing services such as:",
        list: [
          "Software Development",
          "Web Development",
          "Mobile Application Development",
          "UI/UX Design",
          "AI Solutions",
          "Cloud Services",
          "Other related IT services",
        ],
      },
    ],
  },
  {
    id: "use-of-website",
    icon: HiGlobeAlt,
    title: "3. Use of Website",
    content: [
      {
        text: "You agree to use this website only for lawful purposes. You must not:",
        list: [
          "Use the website for illegal activities",
          "Attempt to hack or disrupt the website",
          "Submit false or misleading information",
          "Spam or abuse contact forms",
        ],
      },
    ],
  },
  {
    id: "intellectual-property",
    icon: HiScale,
    title: "4. Intellectual Property",
    content: [
      {
        text: "All content on this website, including:",
        list: [
          "Logo",
          "Branding",
          "Text",
          "Graphics",
          "Design",
          "Source code",
        ],
      },
      {
        text: "belongs to NexCode unless otherwise stated. You may not copy, reproduce, or distribute any content without permission.",
      },
    ],
  },
  {
    id: "project-inquiries",
    icon: HiCurrencyDollar,
    title: "5. Project Inquiries and Quotes",
    content: [
      {
        list: [
          "All project inquiries submitted through the website are non-binding.",
          "Any price estimates provided are subject to change based on requirements.",
          "A final agreement will be made separately for each project.",
        ],
      },
    ],
  },
  {
    id: "third-party",
    icon: HiExternalLink,
    title: "6. Third-Party Services",
    content: [
      {
        text: "Our website may use third-party services (such as hosting, form handling, or analytics). We are not responsible for the content or policies of these third-party services.",
      },
    ],
  },
  {
    id: "no-guarantees",
    icon: HiExclamationCircle,
    title: "7. No Guarantees",
    content: [
      {
        text: "We strive to keep the website accurate and updated, but we do not guarantee:",
        list: [
          "That the website will always be available",
          "That all information is error-free",
          "That the website will meet all user expectations",
        ],
      },
    ],
  },
  {
    id: "limitation-liability",
    icon: HiShieldExclamation,
    title: "8. Limitation of Liability",
    content: [
      {
        text: "NexCode shall not be liable for any damages arising from:",
        list: [
          "Use or inability to use the website",
          "Data loss",
          "Business interruptions",
          "Reliance on website information",
        ],
      },
    ],
  },
  {
    id: "external-links",
    icon: HiBan,
    title: "9. External Links",
    content: [
      {
        text: "Our website may contain links to external websites. We are not responsible for the content or practices of those websites.",
      },
    ],
  },
  {
    id: "changes-terms",
    icon: HiRefresh,
    title: "10. Changes to Terms",
    content: [
      {
        text: "We may update these Terms of Service at any time. Continued use of the website means you accept the updated terms.",
      },
    ],
  },
];

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

function PolicySection({ section, index }) {
  const { icon: Icon, title, content } = section;
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      custom={index * 0.5}
      id={section.id}
      className="scroll-mt-28 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="text-primary text-lg" />
        </div>
        <h2 className="font-display font-bold text-foreground">{title}</h2>
      </div>

      {/* Content blocks */}
      <div className="space-y-4">
        {content.map((block, i) => (
          <div key={i}>
            {block.subtitle && (
              <h3 className="font-semibold text-foreground text-sm mb-2">
                {block.subtitle}
              </h3>
            )}
            {block.text && (
              <p className="text-text_secondary leading-relaxed mb-2">
                {block.text}
              </p>
            )}
            {block.list && (
              <ul className="space-y-1.5 mt-2">
                {block.list.map((item, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2.5 text-sm text-text_secondary"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TABLE OF CONTENTS
   ═══════════════════════════════════════════════════════════════════════ */
function TableOfContents() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-6 shadow-sm sticky top-28">
      <h3 className="font-display font-bold text-foreground text-sm mb-4">
        Table of Contents
      </h3>
      <nav className="space-y-0.5">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="flex items-center gap-2 text-xs text-text_secondary hover:text-primary transition-colors py-1.5 px-2 rounded-lg hover:bg-primary/5"
          >
            <s.icon className="flex-shrink-0 text-primary/60" size={11} />
            <span className="line-clamp-1">{s.title}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function TermsOfServicePage() {
  usePageTitle("Terms of Service — NexCode");
  const themeClasses = useThemeClasses();

  return (
    <div className="min-h-screen bg-background">
      {/* ──────────────────────────────────────────────────────────────
          § 1 HERO
      ────────────────────────────────────────────────────────────── */}
      <section className="relative flex items-center overflow-hidden bg-background dark-grid pt-32 pb-16 sm:pb-24">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute hidden sm:block -top-32 -left-32 w-[550px] h-[550px] rounded-full animate-pulse-slow"
            style={{ background: "radial-gradient(circle, rgba(54,153,243,0.12) 0%, transparent 65%)" }}
          />
          <div
            className="absolute hidden sm:block top-1/4 right-[-10%] w-[500px] h-[500px] rounded-full animate-float"
            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 65%)", animationDelay: "1s" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
            <SectionLabel icon={HiDocumentText}>Legal</SectionLabel>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="font-display font-extrabold text-foreground tracking-tight mb-6 leading-[1.08]"
            style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)" }}
          >
            Terms of{" "}
            <span className="gradient-text">Service</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="text-base text-text_secondary leading-relaxed max-w-2xl mb-6"
          >
            Please read these Terms of Service carefully before using NexCode's website or
            engaging our services. These terms govern your use of our platform and define
            our mutual obligations.
          </motion.p>

          {/* Meta badges */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="flex flex-wrap gap-3"
          >
            {[
              { label: "Effective Date", value: effectiveDate },
            ].map((badge) => (
              <div
                key={badge.label}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/60 bg-card/80 text-xs shadow-sm"
              >
                <span className="text-text_secondary">{badge.label}:</span>
                <span className="font-semibold text-foreground">{badge.value}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          § 2 CONTENT
      ────────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 items-start">

            {/* Policy Sections */}
            <div className="space-y-5">
              {sections.map((section, index) => (
                <PolicySection key={section.id} section={section} index={index} />
              ))}
            </div>

            {/* Sidebar TOC — sticky on desktop */}
            <div className="hidden lg:block">
              <TableOfContents />
            </div>

          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          § 3 CTA STRIP
      ────────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-8 sm:p-12 text-center shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <HiMail className="text-primary text-2xl" />
            </div>
            <h2 className="font-display font-bold text-foreground mb-3">
              Ready to Work Together?
            </h2>
            <p className="text-text_secondary max-w-md mx-auto mb-8">
              Have questions about our terms or want to start a project? We'd love to hear
              from you.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                variant="primary"
                rightIcon={<HiChevronDoubleRight size={18} />}
                to="/start-project"
              >
                Start a Project
              </Button>
              <Button variant="secondary" to="/privacy-policy">
                Privacy Policy →
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
