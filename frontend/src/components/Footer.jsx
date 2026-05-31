import { Link } from "react-router-dom";
import { FaWhatsapp, FaPhone, FaGlobe } from "react-icons/fa";
import { HiMail, HiLocationMarker } from "react-icons/hi";
import { useThemeClasses } from "../utils/useThemeClasses";
import { footerSocialLinks } from "../data/socialLinks";
import logo from "../../assets/Logo.png";

const quickLinks = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Showcase", path: "/showcase" },
  { label: "About Us", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "Start a Project", path: "/start-project" },
];

export default function Footer() {
  const themeClasses = useThemeClasses();

  return (
    <footer className="bg-background text-foreground border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="rounded-[2rem] border border-border/60 bg-card/80 backdrop-blur-xl px-6 sm:px-8 lg:px-10 py-10 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12 items-start text-center lg:text-left">
            <div className="space-y-4 flex flex-col items-center lg:items-start">
              <Link to="/" className="flex items-center gap-3">
                <img src={logo} alt="NexCode" className="w-10 h-10 rounded-xl object-cover bg-background ring-1 ring-border/50 shadow-sm" />
                <div className="text-left">
                  <span className={`font-display font-bold text-lg ${themeClasses.text.primary}`}>NexCode</span>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-text_muted">Software Development</div>
                </div>
              </Link>
              <p className={`max-w-sm text-sm leading-relaxed ${themeClasses.text.secondary}`}>
                Modern software built with clarity, precision, and a clean responsive experience across every theme.
              </p>
              <div className="flex flex-col items-center lg:items-start gap-2 text-sm">
                <a
                  href="tel:+94753125140"
                  className={`inline-flex items-center gap-2 ${themeClasses.text.secondary} hover:text-primary transition-colors`}
                >
                  <FaPhone size={12} className="text-primary" />
                  +94 75 312 5140
                </a>
                <a
                  href="https://wa.me/94769747244"
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-2 ${themeClasses.text.secondary} hover:text-accent transition-colors`}
                >
                  <FaWhatsapp size={12} className="text-accent" />
                  +94 76 974 7244
                </a>
                <a
                  href="https://nexcode.lk"
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-2 ${themeClasses.text.secondary} hover:text-accent transition-colors`}
                >
                  <FaGlobe size={12} className="text-accent" />
                  www.nexcode.lk
                </a>
              </div>
            </div>

            <div className="space-y-4 flex flex-col items-center lg:items-start">
              <h3 className={`font-display font-semibold text-sm ${themeClasses.text.primary}`}>Quick Links</h3>
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-3">
                {quickLinks.map((l) => (
                  <Link key={l.path} to={l.path} className={`text-sm ${themeClasses.text.secondary} hover:text-primary transition-colors`}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4 flex flex-col items-center lg:items-start">
              <h3 className={`font-display font-semibold text-sm ${themeClasses.text.primary}`}>Connect</h3>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                {footerSocialLinks.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-border/70 bg-background/80 text-text_secondary hover:text-primary hover:border-primary/30 hover:bg-muted/60 transition-all duration-200"
                  >
                    <Icon size={13} />
                  </a>
                ))}
              </div>
              <p className={`text-xs ${themeClasses.text.secondary} max-w-xs`}>
                Available for web, mobile, and custom system builds with theme-aware design support.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className={`text-xs ${themeClasses.text.secondary}`}>
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
