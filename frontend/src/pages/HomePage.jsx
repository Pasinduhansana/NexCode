import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  HiGlobe, HiDeviceMobile, HiCode, HiColorSwatch, HiCloud, HiChip,
  HiDatabase, HiArrowRight, HiCheckCircle, HiStar, HiChevronDown
} from 'react-icons/hi';
import { FaWhatsapp, FaPhone, FaRocket } from 'react-icons/fa';
import ServiceCard from '../components/ServiceCard';
import usePageTitle from '../utils/usePageTitle';

const services = [
  { icon: HiGlobe, title: 'Web Development', description: 'Modern, responsive websites and web applications built with cutting-edge frameworks for maximum performance.', gradient: 'bg-gradient-to-br from-blue-500 to-blue-700' },
  { icon: HiDeviceMobile, title: 'Mobile App Development', description: 'Native and cross-platform mobile apps for iOS and Android that deliver seamless user experiences.', gradient: 'bg-gradient-to-br from-purple-500 to-purple-700' },
  { icon: HiCode, title: 'Custom Software Development', description: 'Tailored enterprise software solutions built to match your exact business requirements and workflows.', gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-700' },
  { icon: HiColorSwatch, title: 'UI/UX Design', description: 'Beautiful, intuitive user interfaces crafted with attention to detail and user psychology for maximum engagement.', gradient: 'bg-gradient-to-br from-pink-500 to-pink-700' },
  { icon: HiCloud, title: 'Cloud Solutions', description: 'Scalable cloud infrastructure, migration services, and cloud-native application development on AWS, Azure, and GCP.', gradient: 'bg-gradient-to-br from-sky-500 to-sky-700' },
  { icon: HiChip, title: 'AI & Automation Solutions', description: 'Intelligent automation, machine learning integration, and AI-powered tools to supercharge your business operations.', gradient: 'bg-gradient-to-br from-cyan-500 to-teal-600' },
  { icon: HiDatabase, title: 'Database & System Development', description: 'Robust database architecture, optimization, and enterprise system development for high-performance operations.', gradient: 'bg-gradient-to-br from-orange-500 to-orange-700' },
];

const stats = [
  { value: '150+', label: 'Projects Delivered' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '5+', label: 'Years Experience' },
  { value: '24/7', label: 'Support' },
];

const faqs = [
  { q: 'How long does a typical project take?', a: 'Project timelines vary based on complexity. A simple website may take 2–4 weeks, while a custom enterprise application can take 3–6 months. We provide a detailed timeline during the discovery phase.' },
  { q: 'What technologies do you work with?', a: 'We work with React, Next.js, Node.js, Python, Flutter, React Native, AWS, MongoDB, PostgreSQL, and many more modern technologies.' },
  { q: 'Do you provide post-launch support?', a: 'Yes! We offer maintenance packages including bug fixes, updates, performance monitoring, and feature additions after launch.' },
  { q: 'How much does a project cost?', a: 'Pricing depends on scope, complexity, and timeline. We provide transparent, detailed quotes after an initial consultation. Contact us for a free estimate.' },
  { q: 'Can you work with my existing team?', a: 'Absolutely. We can work as an extension of your in-house team, providing additional expertise and resources when needed.' },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(null);
  usePageTitle('Home');

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative min-h-screen bg-hero-gradient dark-grid flex items-center overflow-hidden">
        {/* Glows */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Newest Tech Trends · Software Development
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Nex<span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Code</span>
              <br />
              <span className="text-3xl md:text-4xl lg:text-5xl font-semibold text-black/40">Software Development</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
            >
              Custom Solutions. Modern Technology. Real Results.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/start-project" className="btn-primary text-base px-8 py-4">
                <FaRocket />
                Build Your Next Project
              </Link>
              <a href="https://wa.me/94769747244" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-green-500 text-white hover:bg-green-600 transition-all duration-300 shadow-md"
              >
                <FaWhatsapp />
                WhatsApp Us
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-10 border-t border-white/10"
            >
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-display text-3xl font-bold gradient-text">{s.value}</div>
                  <div className="text-sm text-gray-400 mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
        >
          <HiChevronDown size={28} />
        </motion.div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium mb-4"
            >
              Our Services
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="section-title mb-4"
            >
              Everything You Need to<br />
              <span className="gradient-text">Build Digitally</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
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
            <Link to="/services" className="btn-secondary">
              Explore All Services <HiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY NEXCODE */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium mb-6">
                Why NexCode?
              </div>
              <h2 className="section-title mb-6">
                We Build Products That<br /><span className="gradient-text">Actually Work</span>
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                We're not just developers — we're digital partners who care about your success. Our team brings together expertise, creativity, and technical excellence to deliver solutions that drive real business outcomes.
              </p>
              {[
                'Agile development with weekly updates',
                'End-to-end project ownership',
                'Post-launch support & maintenance',
                'Transparent pricing, no hidden costs',
                'Modern tech stack & best practices',
                'Client-first communication approach'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 mb-3">
                  <HiCheckCircle className="text-blue-500 flex-shrink-0" size={20} />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
              <div className="mt-8">
                <Link to="/about" className="btn-primary">
                  Learn More About Us <HiArrowRight />
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="relative"
            >
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
                  <div className="flex gap-3">
                    <a href="tel:+94753125140" className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors">
                      <FaPhone /> Call Us
                    </a>
                    <a href="https://wa.me/94769747244" target="_blank" rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors"
                    >
                      <FaWhatsapp /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Frequently Asked <span className="gradient-text">Questions</span></h2>
            <p className="section-subtitle">Everything you need to know about working with NexCode.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-medium text-gray-900 text-sm">{faq.q}</span>
                  <HiChevronDown
                    className={`flex-shrink-0 text-blue-500 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                    size={20}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-4">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 bg-hero-gradient dark-grid">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-4xl mb-6">🚀</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Let's Build Your Next <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Digital Project!</span>
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Have an idea? Let's turn it into reality. Get a free consultation today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/start-project" className="btn-primary text-base px-8 py-4">
                <FaRocket /> Start Your Project
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold border-2 border-white/20 text-white hover:bg-white/10 transition-all">
                Contact Us <HiArrowRight />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
