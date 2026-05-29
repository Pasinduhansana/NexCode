import { Link } from "react-router-dom";
import { FaWhatsapp, FaPhone, FaGlobe, FaLinkedin, FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";
import { HiMail, HiLocationMarker } from "react-icons/hi";
import { useThemeClasses } from "../utils/useThemeClasses";
import logo from "../../assets/Logo.png";

const services = ["Web Development", "Mobile App Development", "Custom Software", "UI/UX Design", "Cloud Solutions", "AI & Automation"];
const quickLinks = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Showcase", path: "/showcase" },
  { label: "About Us", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "Start a Project", path: "/start-project" },
  { label: "Admin Panel", path: "/admin-panel" },
];

export default function Footer() {
  const themeClasses = useThemeClasses();

  return (
    <footer className="bg-background text-foreground border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="rounded-[2rem] bg-muted/55 ring-1 ring-border/40 backdrop-blur-sm px-5 sm:px-8 lg:px-10 py-8 sm:py-10 shadow-[0_24px_60px_rgba(15,23,42,0.06)] text-center xl:text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-10 xl:gap-8 justify-items-center xl:justify-items-stretch">
            {/* Brand */}
            <div className="xl:col-span-4 flex flex-col items-center xl:items-start">
              <div className="flex items-center gap-3 mb-4 justify-center xl:justify-start">
                <img src={logo} alt="NexCode" className="w-10 h-10 rounded-xl object-cover bg-background ring-1 ring-border/50 shadow-sm" />
                <div>
                  <span className={`font-display font-bold text-lg ${themeClasses.text.primary}`}>NexCode</span>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-text_muted">Software Development</div>
                </div>
              </div>
              <p className={`text-sm leading-relaxed mb-5 ${themeClasses.text.secondary}`}>
                Custom solutions. Modern technology. Real results. We build digital products that power your business forward.
              </p>
              <div className="space-y-2.5 flex flex-col items-center xl:items-start">
                <a
                  href="tel:+94753125140"
                  className={`flex items-center gap-2.5 text-sm justify-center xl:justify-start ${themeClasses.text.secondary} hover:text-primary transition-colors`}
                >
                  <FaPhone size={12} className="text-primary" />
                  +94 75 312 5140
                </a>
                <a
                  href="https://wa.me/94769747244"
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-2.5 text-sm justify-center xl:justify-start ${themeClasses.text.secondary} hover:text-accent transition-colors`}
                >
                  <FaWhatsapp size={12} className="text-accent" />
                  +94 76 974 7244
                </a>
                <a
                  href="https://nexcode.lk"
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-2.5 text-sm justify-center xl:justify-start ${themeClasses.text.secondary} hover:text-accent transition-colors`}
                >
                  <FaGlobe size={12} className="text-accent" />
                  www.nexcode.lk
                </a>
              </div>
            </div>

            {/* Services */}
            <div className="xl:col-span-2 flex flex-col items-center xl:items-start">
              <h3 className={`font-display font-semibold ${themeClasses.text.primary} mb-4 text-sm`}>Services</h3>
              <ul className="space-y-2.5 flex flex-col items-center xl:items-start">
                {services.map((s) => (
                  <li key={s}>
                    <Link
                      to="/services"
                      className={`text-sm ${themeClasses.text.secondary} hover:text-primary transition-all inline-flex items-center gap-2 group justify-center xl:justify-start`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/70 group-hover:scale-125 transition-transform" />
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div className="xl:col-span-3 flex flex-col items-center xl:items-start">
              <h3 className={`font-display font-semibold ${themeClasses.text.primary} mb-4 text-sm`}>Quick Links</h3>
              <ul className="space-y-2.5 flex flex-col items-center xl:items-start">
                {quickLinks.map((l) => (
                  <li key={l.path}>
                    <Link
                      to={l.path}
                      className={`text-sm ${themeClasses.text.secondary} hover:text-primary transition-all inline-flex items-center gap-2 group justify-center xl:justify-start`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/70 group-hover:scale-125 transition-transform" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="xl:col-span-3 flex flex-col items-center xl:items-start">
              <h3 className={`font-display font-semibold ${themeClasses.text.primary} mb-3 text-sm`}>Build With Us</h3>
              <p className={`text-sm ${themeClasses.text.secondary} mb-4`}>Ready to bring your idea to life? Let's talk.</p>
              <Link to="/start-project" className="btn-primary text-sm px-4 py-2.5 mb-4 inline-flex justify-center w-full sm:w-auto">
                Start Your Project
              </Link>
              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2.5 mt-3">
                {[FaLinkedin, FaTwitter, FaInstagram, FaGithub].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all duration-200 bg-card ring-1 ring-border/30 text-text_muted hover:bg-primary hover:text-white hover:ring-primary/20"
                  >
                    <Icon size={12} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div
            className={`mt-8 pt-5 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left`}
          >
            <p className={`text-xs ${themeClasses.text.secondary} opacity-80 text-center sm:text-left`}>
              © {new Date().getFullYear()} NexCode Software Development. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <a href="#" className={`${themeClasses.text.secondary} hover:text-primary transition-colors`}>
                Privacy Policy
              </a>
              <a href="#" className={`${themeClasses.text.secondary} hover:text-primary transition-colors`}>
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
