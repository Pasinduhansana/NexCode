import { Link } from 'react-router-dom';
import { FaWhatsapp, FaPhone, FaGlobe, FaLinkedin, FaTwitter, FaInstagram, FaGithub } from 'react-icons/fa';
import { HiMail, HiLocationMarker } from 'react-icons/hi';
import { useThemeClasses } from '../utils/useThemeClasses';
import logo from '../../assets/Logo.png';

const services = ['Web Development', 'Mobile App Development', 'Custom Software', 'UI/UX Design', 'Cloud Solutions', 'AI & Automation'];
const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Showcase', path: '/showcase' },
  { label: 'About Us', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'Start a Project', path: '/start-project' },
  { label: 'Admin Panel', path: '/admin-panel' },
];

export default function Footer() {
  const themeClasses = useThemeClasses();

  const footerBg = 'bg-muted';
  const footerText = 'text-muted';
  const footerHeading = 'text-foreground';

  return (
    <footer className={`${footerBg} ${footerText} `}>
      <div className="max-w-7xl mx-auto pt-12 pb-6 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="NexCode" className="w-8 h-8 rounded-lg object-cover bg-background" />
              <span className={`font-display font-bold text-lg ${footerHeading}`}>NexCode</span>
            </div>
            <p className={`text-xs leading-relaxed mb-4 ${footerText}`}>
              Custom Solutions. Modern Technology. Real Results. We build digital products that power your business forward.
            </p>
            <div className="space-y-2">
                <a href="tel:+94753125140" className={`flex items-center gap-2 text-xs ${footerText} hover:text-primary transition-colors`}>
                <FaPhone size={12} className="text-blue-400" />
                +94 75 312 5140
              </a>
              <a href="https://wa.me/94769747244" target="_blank" rel="noreferrer" className={`flex items-center gap-2 text-xs ${footerText} hover:text-accent transition-colors`}>
                <FaWhatsapp size={12} className="text-accent" />
                +94 76 974 7244
              </a>
              <a href="https://nexcode.lk" target="_blank" rel="noreferrer" className={`flex items-center gap-2 text-xs ${footerText} hover:text-accent transition-colors`}>
                <FaGlobe size={12} className="text-accent" />
                www.nexcode.lk
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className={`font-display font-semibold ${footerHeading} mb-4 text-sm`}>Services</h3>
            <ul className="space-y-2">
              {services.map(s => (
                <li key={s}>
                  <Link to="/services" className={`text-xs ${footerText} hover:text-blue-600 hover:translate-x-0.5 transition-all inline-flex items-center gap-1`}>
                    <span className="w-1 h-1 rounded-full bg-blue-500" />
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`font-display font-semibold ${footerHeading} mb-4 text-sm`}>Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map(l => (
                <li key={l.path}>
                  <Link to={l.path} className={`text-xs ${footerText} hover:text-cyan-600 hover:translate-x-0.5 transition-all inline-flex items-center gap-1`}>
                    <span className="w-1 h-1 rounded-full bg-cyan-500" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h3 className={`font-display font-semibold ${footerHeading} mb-3 text-sm`}>Build With Us</h3>
            <p className={`text-xs ${footerText} mb-3`}>Ready to bring your idea to life? Let's talk.</p>
            <Link to="/start-project" className="btn-primary text-xs px-4 py-2 mb-4 inline-flex justify-center">
              Start Your Project
            </Link>
            <div className="flex items-center gap-2 mt-3">
              {[FaLinkedin, FaTwitter, FaInstagram, FaGithub].map((Icon, i) => (
                <a key={i} href="#" className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all duration-200 bg-muted text-muted hover:bg-primary hover:text-white`}>
                  <Icon size={12} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className={`border-t ${themeClasses.border.primary} pt-4 flex flex-col sm:flex-row items-center justify-between gap-2`}>
          <p className={`text-xs ${footerText} opacity-75`}>© {new Date().getFullYear()} NexCode Software Development. All rights reserved.</p>
          <div className="flex items-center gap-3 text-xs">
            <a href="#" className={`${footerText} hover:text-blue-600 transition-colors`}>Privacy Policy</a>
            <a href="#" className={`${footerText} hover:text-blue-600 transition-colors`}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
