/**
 * PrivacyPolicyPage — NexCode
 * Theme-aware privacy policy page matching NexCode's design system.
 */
import { motion } from "framer-motion";
import {
  HiShieldCheck,
  HiLockClosed,
  HiEye,
  HiDatabase,
  HiMail,
  HiRefresh,
  HiUserGroup,
  HiChevronDoubleRight,
  HiInformationCircle,
  HiDocumentText,
  HiClock,
  HiHeart,
  HiPencilAlt,
  HiExternalLink,
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
    id: "introduction",
    icon: HiInformationCircle,
    title: "1. Introduction",
    content: [
      {
        text: 'NexCode ("we", "our", or "us") is an independent software development startup based in Sri Lanka. We are committed to protecting your privacy and handling your personal data responsibly.',
      },
      {
        text: "This Privacy Policy explains how we collect, use, and protect your information when you visit our website https://nexcode.lk.",
      },
      {
        text: "By using our website, you agree to this Privacy Policy.",
      },
    ],
  },
  {
    id: "information-collect",
    icon: HiDatabase,
    title: "2. Information We Collect",
    content: [
      {
        subtitle: "Information You Provide",
        list: [
          "Full name",
          "Email address",
          "Phone number",
          "Company name",
          "Project details or requirements",
        ],
      },
      {
        subtitle: "Automatically Collected Information",
        list: [
          "IP address",
          "Browser type",
          "Device information",
          "Pages visited",
          "Time spent on website",
        ],
      },
    ],
  },
  {
    id: "how-we-collect",
    icon: HiDocumentText,
    title: "3. How We Collect Information",
    content: [
      {
        text: "We collect information through:",
        list: [
          "Contact forms (e.g., Formspree or similar services)",
          "Email communication",
          "Basic website analytics (if enabled in the future)",
          "Cookies (if enabled)",
        ],
      },
    ],
  },
  {
    id: "how-we-use",
    icon: HiEye,
    title: "4. How We Use Your Information",
    content: [
      {
        text: "We use the collected information to:",
        list: [
          "Respond to inquiries and messages",
          "Provide project quotations",
          "Understand client requirements",
          "Improve our website and services",
          "Communicate regarding services you requested",
        ],
      },
      {
        text: "We do not use your data for automated decision-making.",
      },
    ],
  },
  {
    id: "cookies",
    icon: HiRefresh,
    title: "5. Cookies",
    content: [
      {
        text: "Our website may use cookies in the future to improve user experience and analyze website traffic.",
      },
      {
        text: "You can disable cookies through your browser settings at any time.",
      },
    ],
  },
  {
    id: "third-party",
    icon: HiExternalLink,
    title: "6. Third-Party Services",
    content: [
      {
        text: "We may use third-party services such as:",
        list: [
          "Form handling services (e.g., Formspree)",
          "Hosting providers",
          "Email services",
          "Analytics tools (optional in future)",
        ],
      },
      {
        text: "These services may collect and process data according to their own privacy policies.",
      },
    ],
  },
  {
    id: "data-sharing",
    icon: HiUserGroup,
    title: "7. Data Sharing",
    content: [
      {
        text: "We do not sell, rent, or trade your personal data.",
      },
      {
        text: "We may only share your information:",
        list: [
          "With trusted service providers to operate our website",
          "When required by law or legal process",
        ],
      },
    ],
  },
  {
    id: "data-security",
    icon: HiLockClosed,
    title: "8. Data Security",
    content: [
      {
        text: "We take reasonable measures to protect your information, including:",
        list: [
          "Secure HTTPS encryption",
          "Restricted access to data",
          "Secure third-party services",
        ],
      },
      {
        text: "However, no method of transmission over the internet is 100% secure.",
      },
    ],
  },
  {
    id: "data-retention",
    icon: HiClock,
    title: "9. Data Retention",
    content: [
      {
        text: "We retain your information only as long as necessary to:",
        list: [
          "Respond to inquiries",
          "Provide services",
          "Meet legal obligations",
        ],
      },
      {
        text: "After that, data may be deleted securely.",
      },
    ],
  },
  {
    id: "your-rights",
    icon: HiShieldCheck,
    title: "10. Your Rights",
    content: [
      {
        text: "You may request:",
        list: [
          "Access to your personal data",
          "Correction of inaccurate data",
          "Deletion of your data",
          "Withdrawal of consent",
        ],
      },
      {
        text: "To make such requests, contact us using the details below.",
      },
    ],
  },
  {
    id: "childrens-privacy",
    icon: HiHeart,
    title: "11. Children's Privacy",
    content: [
      {
        text: "Our website is not intended for children under the age of 13. We do not knowingly collect data from children.",
      },
    ],
  },
  {
    id: "policy-changes",
    icon: HiPencilAlt,
    title: "12. Changes to This Policy",
    content: [
      {
        text: "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.",
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
export default function PrivacyPolicyPage() {
  usePageTitle("Privacy Policy — NexCode");
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
            <SectionLabel icon={HiShieldCheck}>Legal</SectionLabel>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="font-display font-extrabold text-foreground tracking-tight mb-6 leading-[1.08]"
            style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)" }}
          >
            Privacy{" "}
            <span className="gradient-text">Policy</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="text-base text-text_secondary leading-relaxed max-w-2xl mb-6"
          >
            At NexCode, we take your privacy seriously. This policy explains how we collect,
            use, and protect your personal information when you use our website and services.
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
              Have Questions?
            </h2>
            <p className="text-text_secondary max-w-md mx-auto mb-8">
              If you have any questions about our privacy practices, we're happy to help.
              Reach out to us directly.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                variant="primary"
                rightIcon={<HiChevronDoubleRight size={18} />}
                to="/contact"
              >
                Contact Us
              </Button>
              <Button variant="secondary" to="/terms-of-service">
                Terms of Service →
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
