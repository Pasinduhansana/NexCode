import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  HiGlobe,
  HiDeviceMobile,
  HiCode,
  HiColorSwatch,
  HiCloud,
  HiChip,
  HiDatabase,
  HiCheckCircle,
  HiStar,
  HiChevronDown,
  HiChevronRight,
} from "react-icons/hi";
import { FaWhatsapp, FaPhone, FaRocket } from "react-icons/fa";
import ServiceCard from "../components/ServiceCard";
import usePageTitle from "../utils/usePageTitle";
import { useThemeClasses } from "../utils/useThemeClasses";
import Hero from "../components/Hero";
import FAQ from "../components/FAQ";
import { hero_services as services } from "../data/services";
import Button from "../components/Button";
import SelectionLable from "../components/SectionLabel";
import SectionLabel from "../components/SectionLabel";
import OffersBanner from "../components/Offersbanner";

const stats = [
  { value: "Custom", label: "Projects" },
  { value: "Dedicated", label: "Clientele" },
  { value: "2025", label: "Founded" },
  { value: "Responsive", label: "Support" },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(null);
  const themeClasses = useThemeClasses();
  usePageTitle("Home");

  return (
    <div className="min-h-screen h-full">
      {/* HERO */}
      <Hero stats={stats} className="bg-green-800" />

      {/* SERVICES PREVIEW */}
      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center md:mb-14">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <SectionLabel content="Our Services" />
            </motion.div>

            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-title mb-4">
              Everything You Need to <br className="hidden sm:block" />
              <span className="gradient-text">Build Digitally</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="section-subtitle mx-auto max-w-2xl"
            >
              From concept to launch, we offer a full spectrum of software services designed to accelerate your business.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((s, i) => (
              <ServiceCard key={i} {...s} index={i} />
            ))}
          </div>

          <div className="mt-10 text-center md:mt-12">
            <div className="mx-auto w-full sm:w-auto">
              <Button variant="outline" to="/services" rightIcon={<HiChevronRight size={20} />} className="w-full sm:w-auto">
                Explore All Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* WHY NEXCODE */}
      <section className="bg-background py-8 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 items-center lg:grid-cols-2 lg:gap-16">
            {/* LEFT CONTENT (TEXT FIRST ON MOBILE, NORMAL ON DESKTOP) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 text-left lg:text-left flex flex-col"
            >
              <SectionLabel content="Why Choose Us?" />

              <h2 className="section-title mb-6 text-center lg:text-left">
                We Build Products That <br className="hidden sm:block" />
                <span className="gradient-text">Actually Work</span>
              </h2>

              <p className="section-subtitle mb-8 leading-relaxed text-gray-500 text-center lg:text-left">
                We're not just developers — we're digital partners who care about your success. Our team brings together expertise, creativity, and
                technical excellence to deliver solutions that drive real business outcomes.
              </p>

              <div className="space-y-3 pl-6">
                {[
                  "Agile development with weekly updates",
                  "End-to-end project ownership",
                  "Post-launch support & maintenance",
                  "Transparent pricing, no hidden costs",
                  "Modern tech stack & best practices",
                  "Client-first communication approach",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-left">
                    <HiCheckCircle className="flex-shrink-0 text-blue-500" size={20} />
                    <span className="text-sm leading-relaxed text-text_secondary text-left">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button className="w-full sm:w-auto" variant="primary" to="/about" rightIcon={<HiChevronRight size={20} />}>
                  Learn More About Us
                </Button>
              </div>
            </motion.div>

            {/* RIGHT CARD (BOTTOM ON MOBILE) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-2"
            >
              <div className="relative overflow-hidden rounded-xl lg:rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white sm:p-8">
                {/* Background effects */}
                <div className="absolute top-0 right-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10" />
                <div className="absolute bottom-0 left-0 h-32 w-32 translate-y-1/2 -translate-x-1/2 rounded-full bg-white/5" />

                <div className="relative">
                  <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                      <FaRocket size={20} />
                    </div>
                    <div>
                      <div className="font-display text-xl font-bold">Let's Build Together</div>
                      <div className="text-sm text-white/70">Your next digital project</div>
                    </div>
                  </div>

                  <div className="mb-8 grid grid-cols-2 gap-4">
                    {stats.map((s, i) => (
                      <div key={i} className="rounded-2xl bg-white/10 p-4 text-center">
                        <div className="font-display text-2xl font-bold">{s.value}</div>
                        <div className="mt-1 text-xs text-white/70">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button className="w-full sm:w-auto" variant="phone" href="tel:+94753125140" leftIcon={<FaPhone />}>
                      Call Us
                    </Button>

                    <Button
                      className="w-full sm:w-auto"
                      variant="whatsapp"
                      href="https://wa.me/94769747244"
                      target="_blank"
                      rel="noreferrer"
                      leftIcon={<FaWhatsapp />}
                    >
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* CTA BANNER */}
      <section className="py-8 lg:py-20 bg-hero-gradient dark-grid">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display section-title text-3xl md:text-4xl font-bold  mb-4">
              Let's Build Your Next <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Digital Project!</span>
            </h2>
            <p className="text-gray-500 mb-8 text-lg">Have an idea? Let's turn it into reality. Get a free consultation today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="md" to="/start-project" leftIcon={<FaRocket />}>
                Start Your Project
              </Button>
              <Button variant="secondary" size="md" to="/contact" rightIcon={<HiChevronRight size={20} />}>
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* OFFERS BANNER */}
      <section className="py-5 bg-hero-gradient dark-grid">
        <OffersBanner />
      </section>
    </div>
  );
}
