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

const stats = [
  { value: "150+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "5+", label: "Years Experience" },
  { value: "24/7", label: "Support" },
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
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium mb-4"
            >
              Our Services
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-title mb-4">
              Everything You Need to
              <br />
              <span className="gradient-text">Build Digitally</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="section-subtitle"
            >
              From concept to launch, we offer a full spectrum of software services designed to accelerate your business.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {services.map((s, i) => (
              <ServiceCard key={i} {...s} index={i} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" to="/services" rightIcon={<HiChevronRight size={20} />}>
              Explore All Services
            </Button>
          </div>
        </div>
      </section>

      {/* WHY NEXCODE */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium mb-6">
                Why NexCode?
              </div>
              <h2 className="section-title mb-6">
                We Build Products That
                <br />
                <span className="gradient-text">Actually Work</span>
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed section-subtitle">
                We're not just developers — we're digital partners who care about your success. Our team brings together expertise, creativity, and
                technical excellence to deliver solutions that drive real business outcomes.
              </p>
              {[
                "Agile development with weekly updates",
                "End-to-end project ownership",
                "Post-launch support & maintenance",
                "Transparent pricing, no hidden costs",
                "Modern tech stack & best practices",
                "Client-first communication approach",
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                  <HiCheckCircle className="text-blue-500 flex-shrink-0" size={20} />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
              <div className="mt-8">
                <Button variant="primary" to="/about" rightIcon={<HiChevronRight size={20} />}>
                  Learn More About Us
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                      <FaRocket size={20} />
                    </div>
                    <div>
                      <div className="font-display font-bold text-xl">Let's Build Together</div>
                      <div className="text-white/70 text-sm">Your next digital project</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {stats.map((s, i) => (
                      <div key={i} className="bg-white/10 rounded-2xl p-4 text-center">
                        <div className="font-display text-2xl font-bold">{s.value}</div>
                        <div className="text-white/70 text-xs mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button variant="phone" href="tel:+94753125140" leftIcon={<FaPhone />}>
                      Call Us
                    </Button>
                    <Button variant="whatsapp" href="https://wa.me/94769747244" target="_blank" rel="noreferrer" leftIcon={<FaWhatsapp />}>
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
      <section className="py-20 bg-hero-gradient dark-grid">
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
    </div>
  );
}
