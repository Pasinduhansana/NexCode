import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiGlobe, HiDeviceMobile, HiCode, HiColorSwatch, HiCloud, HiChip, HiDatabase, HiArrowRight
} from 'react-icons/hi';
import { FaRocket } from 'react-icons/fa';
import ServiceCard from '../components/ServiceCard';
import usePageTitle from '../utils/usePageTitle';

const services = [
  {
    icon: HiGlobe, title: 'Web Development',
    description: 'We craft high-performance, SEO-optimized websites and web applications using React, Next.js, Vue, and modern full-stack technologies. From landing pages to complex enterprise portals.',
    features: ['React / Next.js / Vue.js', 'REST & GraphQL APIs', 'E-commerce Solutions', 'CMS Integration', 'Performance Optimization'],
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-700'
  },
  {
    icon: HiDeviceMobile, title: 'Mobile App Development',
    description: 'Native iOS and Android apps plus cross-platform solutions with React Native and Flutter. We build apps that users love and businesses depend on.',
    features: ['React Native / Flutter', 'iOS & Android', 'Push Notifications', 'Offline Support', 'App Store Deployment'],
    gradient: 'bg-gradient-to-br from-purple-500 to-purple-700'
  },
  {
    icon: HiCode, title: 'Custom Software Development',
    description: 'End-to-end custom software built specifically for your business model — from workflow automation to enterprise resource planning systems.',
    features: ['Business Process Automation', 'ERP & CRM Systems', 'API Development', 'Legacy Modernization', 'SaaS Development'],
    gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-700'
  },
  {
    icon: HiColorSwatch, title: 'UI/UX Design',
    description: 'Research-driven design that converts. We create wireframes, prototypes, and pixel-perfect interfaces that delight users and achieve business goals.',
    features: ['User Research', 'Wireframing & Prototyping', 'Figma Design', 'Design Systems', 'Usability Testing'],
    gradient: 'bg-gradient-to-br from-pink-500 to-pink-700'
  },
  {
    icon: HiCloud, title: 'Cloud Solutions',
    description: 'Scalable, resilient cloud infrastructure on AWS, Azure, and Google Cloud. We handle migration, architecture design, and ongoing DevOps management.',
    features: ['AWS / Azure / GCP', 'Cloud Migration', 'Docker & Kubernetes', 'CI/CD Pipelines', 'Cost Optimization'],
    gradient: 'bg-gradient-to-br from-sky-500 to-sky-700'
  },
  {
    icon: HiChip, title: 'AI & Automation Solutions',
    description: 'Harness the power of AI to automate repetitive tasks, gain insights from data, and build intelligent features into your products.',
    features: ['Machine Learning Models', 'NLP & Chatbots', 'Process Automation', 'Data Analytics', 'Computer Vision'],
    gradient: 'bg-gradient-to-br from-cyan-500 to-teal-600'
  },
  {
    icon: HiDatabase, title: 'Database & System Development',
    description: 'Robust database design, migration, and optimization services ensuring your data infrastructure can scale with your business.',
    features: ['MongoDB / PostgreSQL', 'Database Design', 'Data Migration', 'Performance Tuning', 'Backup & Recovery'],
    gradient: 'bg-gradient-to-br from-orange-500 to-orange-700'
  },
];

export default function ServicesPage() {
  usePageTitle('Services');
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-20 bg-hero-gradient dark-grid">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs mb-6">
              Our Services
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
              What We <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Build</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              From web to mobile to AI — NexCode offers a comprehensive suite of software services to transform your business digitally.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Service Cards Overview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s, i) => <ServiceCard key={i} {...s} index={i} />)}
          </div>
        </div>
      </section>

      {/* Detailed service sections */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-white text-3xl ${service.gradient}`}>
                    <service.icon />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-4">{service.title}</h2>
                  <p className="text-gray-500 mb-6 leading-relaxed">{service.description}</p>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {service.features.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-sm text-gray-600">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/start-project" className="btn-primary">
                    Get Started <HiArrowRight />
                  </Link>
                </div>
                <div className={`${i % 2 === 1 ? 'lg:order-1' : ''} bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-3xl p-10 flex items-center justify-center min-h-64`}>
                  <div className={`w-32 h-32 rounded-3xl ${service.gradient} flex items-center justify-center text-white text-6xl shadow-2xl`}>
                    <service.icon />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <FaRocket size={40} className="mx-auto mb-6 opacity-80" />
          <h2 className="font-display text-3xl font-bold mb-4">Ready to Build Something Amazing?</h2>
          <p className="text-white/80 mb-8">Tell us about your project and we'll get back to you within 24 hours.</p>
          <Link to="/start-project" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-xl">
            <FaRocket /> Start Your Project
          </Link>
        </div>
      </section>
    </div>
  );
}
