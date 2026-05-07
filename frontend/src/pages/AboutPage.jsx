import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiCheckCircle, HiArrowRight, HiLightBulb, HiEye, HiHeart } from 'react-icons/hi';
import { FaRocket } from 'react-icons/fa';

const stats = [
  { value: '150+', label: 'Projects Delivered', description: 'Across various industries' },
  { value: '50+', label: 'Happy Clients', description: 'Who trust our expertise' },
  { value: '5+', label: 'Years Experience', description: 'In software development' },
  { value: '100%', label: 'Sri Lankan Team', description: 'Local talent, global standards' },
];

const timeline = [
  { year: '2019', title: 'Founded', description: 'NexCode was born with a mission to deliver world-class software from Sri Lanka.' },
  { year: '2020', title: 'First 20 Clients', description: 'Rapidly grew our portfolio across web development and mobile applications.' },
  { year: '2021', title: 'AI Division', description: 'Launched our AI & Automation services to help businesses embrace intelligent tech.' },
  { year: '2022', title: 'Cloud Expansion', description: 'Added full cloud solutions including AWS, Azure, and GCP managed services.' },
  { year: '2023', title: 'Regional Recognition', description: 'Recognized as one of Sri Lanka\'s fastest-growing software companies.' },
  { year: '2024', title: 'Going Global', description: 'Expanding to serve international clients across UK, Australia, and Middle East.' },
];

const values = [
  { icon: HiLightBulb, title: 'Innovation First', desc: 'We embrace emerging technologies and always seek better ways to solve problems.' },
  { icon: HiHeart, title: 'Client-Centric', desc: 'Your success is our success. We build lasting partnerships, not just projects.' },
  { icon: HiCheckCircle, title: 'Quality Obsessed', desc: 'Every line of code is crafted with care, tested thoroughly, and delivered with pride.' },
  { icon: HiEye, title: 'Transparent', desc: 'Clear communication, honest timelines, and no hidden costs — always.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-20 bg-hero-gradient dark-grid">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs mb-6">
              About NexCode
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
              Built By Passionate <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Builders</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              We're a Sri Lankan software development company on a mission to help businesses worldwide succeed through exceptional digital solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100"
              >
                <div className="font-display text-4xl font-bold gradient-text mb-2">{s.value}</div>
                <div className="font-semibold text-gray-900 mb-1">{s.label}</div>
                <div className="text-xs text-gray-500">{s.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-10 text-white"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <FaRocket size={24} />
              </div>
              <h2 className="font-display text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-white/80 leading-relaxed">
                To empower businesses of all sizes with custom software solutions that are reliable, scalable, and built to grow. We bridge the gap between ambitious ideas and functional, beautiful digital products — delivering real results for real businesses.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-3xl p-10 text-white"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <HiEye size={24} />
              </div>
              <h2 className="font-display text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-white/80 leading-relaxed">
                To become the leading software development company from Sri Lanka recognized globally for innovation, quality, and impact. We envision a future where every business — from startups to enterprises — has access to world-class digital capabilities.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Our Core <span className="gradient-text">Values</span></h2>
            <p className="section-subtitle">Principles that guide every decision we make.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card p-6 text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <v.icon size={24} />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Our <span className="gradient-text">Journey</span></h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-cyan-400" />
            <div className="space-y-10">
              {timeline.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  className={`relative flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className="absolute left-1/2 -translate-x-1/2 top-6 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-md z-10" />
                  <div className={`w-5/12 ${i % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="text-blue-600 font-display font-bold text-lg mb-1">{item.year}</div>
                      <div className="font-semibold text-gray-900 mb-2">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-hero-gradient">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Ready to Work With Us?</h2>
          <p className="text-gray-300 mb-8">Join 50+ businesses who trust NexCode with their digital future.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/start-project" className="btn-primary px-8 py-4">
              <FaRocket /> Start a Project
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white hover:bg-white/10 transition-all font-semibold">
              Contact Us <HiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
