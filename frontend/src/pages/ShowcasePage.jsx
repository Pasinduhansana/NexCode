import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiCode, HiExternalLink } from 'react-icons/hi';
import { FaRocket } from 'react-icons/fa';
import usePageTitle from '../utils/usePageTitle';

const featuredProjects = [
  {
    name: 'LankaCart Commerce Suite',
    type: 'E-commerce Platform',
    summary: 'Multi-vendor storefront with integrated order, payment, and inventory workflows for fast-growing retailers.',
    stack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    results: ['42% faster checkout', '2.4x repeat orders'],
    color: 'from-blue-600 to-cyan-500',
    image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'MedFlow Clinic Portal',
    type: 'Healthcare Management',
    summary: 'Centralized patient records, appointment orchestration, and doctor dashboards with role-based access.',
    stack: ['React', 'Express', 'PostgreSQL', 'Redis'],
    results: ['60% lower admin time', '99.9% uptime'],
    color: 'from-cyan-600 to-teal-500',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'FleetTrack Analytics',
    type: 'Logistics Dashboard',
    summary: 'Live route monitoring and predictive delivery insights to optimize last-mile operations.',
    stack: ['Next.js', 'NestJS', 'Kafka', 'TimescaleDB'],
    results: ['31% fuel savings', '28% faster delivery ETA'],
    color: 'from-indigo-600 to-blue-500',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'LearnEdge LMS',
    type: 'Education Platform',
    summary: 'Learning platform with instructor workflows, assessments, and progress analytics for private institutes.',
    stack: ['React', 'Node.js', 'MongoDB', 'AWS S3'],
    results: ['3x course completion', '18k active learners'],
    color: 'from-sky-600 to-blue-500',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'BuildOps ERP Lite',
    type: 'Construction Operations',
    summary: 'Project budgeting, procurement tracking, and workforce scheduling for mid-size construction teams.',
    stack: ['Vue', 'Laravel', 'MySQL', 'Docker'],
    results: ['25% cost leakage reduction', '40% faster reporting'],
    color: 'from-blue-700 to-indigo-600',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'TravelCore Booking Hub',
    type: 'Travel Reservation App',
    summary: 'Unified booking flow with package builder, payment gateway, and partner management tools.',
    stack: ['React', 'Express', 'MongoDB', 'Cloudinary'],
    results: ['2.1x conversion growth', '35% fewer support tickets'],
    color: 'from-cyan-500 to-blue-600',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
  }
];

const CarouselCard = ({ project }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 14;
    const rotateX = -(((y / rect.height) - 0.5) * 14);
    setTilt({ x: rotateX, y: rotateY });
  };

  return (
    <motion.article
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="group relative w-[320px] sm:w-[360px] shrink-0"
      style={{ perspective: '1400px' }}
    >
      <div
        className="h-full rounded-[1.9rem] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] overflow-hidden transition-transform duration-200"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(0px)`,
        }}
      >
        <div className="relative h-56 overflow-hidden">
          <img src={project.image} alt={project.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className={`absolute inset-0 bg-gradient-to-t ${project.color} opacity-60`} />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-medium">
            <HiCode />
            {project.type}
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="font-display text-2xl font-bold mb-1">{project.name}</h3>
            <p className="text-sm text-white/80">{project.summary}</p>
          </div>
        </div>

        <div className="p-5 bg-white">
          <div className="mb-4">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.18em] mb-2">Tech Stack</div>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span key={item} className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 mb-5">
            {project.results.map((result) => (
              <div key={result} className="text-sm text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                {result}
              </div>
            ))}
          </div>

          <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            View Case Summary <HiExternalLink />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default function ShowcasePage() {
  usePageTitle('Showcase');

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-20 bg-hero-gradient dark-grid relative overflow-hidden">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs mb-6">
              Our Work
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
              Project <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Showcase</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              A selection of digital products we designed and engineered to solve real business challenges.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium mb-3">
                Featured Projects
              </div>
              <h2 className="section-title">Selected work from our recent builds</h2>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              Auto sliding showcase
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4 md:p-6 shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50 to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50 to-transparent z-10" />

            <motion.div
              className="flex w-max gap-6"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 34, ease: 'linear', repeat: Infinity }}
            >
              {[...featuredProjects, ...featuredProjects].map((project, index) => (
                <CarouselCard key={`${project.name}-${index}`} project={project} />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Have A Project In Mind?
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              Let us build your next software product with the same quality and focus shown in these projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/start-project" className="btn-primary px-8 py-4">
                <FaRocket /> Start Your Project
              </Link>
              <Link to="/services" className="btn-secondary px-8 py-4">
                Explore Services <HiArrowRight />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
