import { Link } from 'react-router-dom';
import { FaWhatsapp, FaPhone, FaGlobe, FaLinkedin, FaTwitter, FaInstagram, FaGithub } from 'react-icons/fa';
import { HiMail, HiLocationMarker } from 'react-icons/hi';

const services = ['Web Development', 'Mobile App Development', 'Custom Software', 'UI/UX Design', 'Cloud Solutions', 'AI & Automation'];
const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'About Us', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'Start a Project', path: '/start-project' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm font-display">N</span>
              </div>
              <span className="font-display font-bold text-xl text-white">NexCode</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Custom Solutions. Modern Technology. Real Results. We build digital products that power your business forward.
            </p>
            <div className="space-y-3">
              <a href="tel:+94753125140" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                <FaPhone size={14} className="text-blue-400" />
                +94 75 312 5140
              </a>
              <a href="https://wa.me/94769747244" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                <FaWhatsapp size={14} className="text-green-400" />
                +94 76 974 7244
              </a>
              <a href="https://nexcode.lk" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                <FaGlobe size={14} className="text-cyan-400" />
                www.nexcode.lk
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-display font-semibold text-white mb-5">Services</h3>
            <ul className="space-y-2.5">
              {services.map(s => (
                <li key={s}>
                  <Link to="/services" className="text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-blue-500" />
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-white mb-5">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map(l => (
                <li key={l.path}>
                  <Link to={l.path} className="text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-cyan-500" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h3 className="font-display font-semibold text-white mb-5">Build With Us</h3>
            <p className="text-sm text-gray-400 mb-4">Ready to bring your idea to life? Let's talk.</p>
            <Link to="/start-project" className="btn-primary text-sm mb-4 inline-flex">
              Start Your Project
            </Link>
            <div className="flex items-center gap-3 mt-4">
              {[FaLinkedin, FaTwitter, FaInstagram, FaGithub].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-200">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} NexCode Software Development. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
