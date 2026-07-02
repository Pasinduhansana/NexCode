import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { HiPhone, HiMail, HiLocationMarker, HiClock, HiSparkles, HiOutlineChat, HiChevronRight  } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { useForm } from "@formspree/react";
import usePageTitle from "../utils/usePageTitle";
import { useThemeClasses } from "../utils/useThemeClasses";
import Button from "../components/Button";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [state, formspreeHandleSubmit] = useForm("mwvdwkvz");
  const themeClasses = useThemeClasses();
  usePageTitle("Contact");

  useEffect(() => {
    if (state.succeeded) {
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setErrors({});
    }
  }, [state.succeeded]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = "Valid email required";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (form.message.trim().length < 20) e.message = "Message must be at least 20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    formspreeHandleSubmit(e);
  };

  const contacts = [
    { icon: FaWhatsapp, label: "WhatsApp", value: "+94 76 974 7244", href: "https://wa.me/94769747244", color: "text-green-500" },
    { icon: HiPhone, label: "Call Us", value: "+94 75 312 5140", href: "tel:+94753125140", color: "text-blue-500" },
    { icon: HiMail, label: "Email", value: "info@nexcode.lk", href: "mailto:info@nexcode.lk", color: "text-purple-500" },
    { icon: HiLocationMarker, label: "Location", value: "Sri Lanka", href: "#", color: "text-red-500" },
  ];

  const quickFacts = [
    { icon: HiClock, label: "Response Time", value: "Within 24 hours" }
  ];

  return (
    <div className={`min-h-screen ${themeClasses.bg.primary} ${themeClasses.text.primary}`}>
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background dark-grid">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute hidden sm:block -top-32 -left-32 w-[650px] h-[650px] rounded-full animate-pulse-slow"
            style={{ background: "radial-gradient(circle, rgba(54,153,243,0.12) 0%, transparent 65%)" }}
          />
          <div
            className="absolute hidden sm:block top-1/4 right-[-10%] w-[580px] h-[580px] rounded-full animate-float"
            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.13) 0%, transparent 65%)", animationDelay: "1s" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 lg:py-0 sm:px-6 lg:px-8 mt-20 md:mt-o">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/80 backdrop-blur border border-border text-text_secondary text-xs font-medium mb-2 md:mb-5">
                Get In Touch
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.05] text-foreground">
                Let's <span className="gradient-text">Connect</span>
              </h1>
              <p className="text-base sm:text-lg text-text_secondary leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8">
                Share your idea, ask a question, or start a new build. We work across websites, apps, and custom systems, with each theme and layout
                tuned for a clean responsive experience.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                <Button variant="primary" rightIcon={<HiMail size={20}/>} href="mailto:info@nexcode.lk" className="w-full sm:w-auto">
                  Email Us
                </Button>
                <Button variant="whatsapp" leftIcon={<FaWhatsapp size={18}/>} href="https://wa.me/94769747244" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                  WhatsApp
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto lg:mx-0 mt-10">
                {quickFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-xl md:rounded-2xl border border-border bg-card/80 backdrop-blur p-4 flex items-center gap-3 justify-center lg:justify-start"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <fact.icon size={18} />
                    </div>
                    <div className="text-left">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-text_muted font-semibold">{fact.label}</div>
                      <div className="text-sm font-semibold text-foreground">{fact.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl md:rounded-3xl border border-border bg-card/90 backdrop-blur-xl shadow-[0_24px_60px_rgba(15,23,42,0.08)] p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 justify-center lg:justify-start mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <FaWhatsapp size={18} />
                </div>
                <div>
                  <div className="font-display font-bold text-xl text-foreground">Quick Contact</div>
                  <div className="text-sm text-text_secondary">We usually reply within one business day.</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {contacts.map((c, i) => (
                  <motion.a
                    key={i}
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-lg md:rounded-2xl border border-border bg-background/70 p-4 flex items-center gap-3 text-left hover:border-primary/30 hover:-translate-y-0.5 transition-all"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-muted flex items-center justify-center ${c.color} flex-shrink-0`}>
                      <c.icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-text_muted font-semibold">{c.label}</div>
                      <div className="font-semibold text-sm text-foreground truncate">{c.value}</div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className={`${themeClasses.bg.primary} py-16 sm:py-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-12 items-start">
            <div className="space-y-5 text-center lg:text-left">
              <div>
                <p className="text-[11px] tracking-[0.22em] uppercase font-semibold mb-3 text-text_muted">Contact Information</p>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight">Tell us what you need</h2>
                <p className="mt-4 text-text_secondary leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Use the form, email, or WhatsApp to reach out. We’ll help you shape the scope, timeline, and the best implementation path for your
                  project.
                </p>
              </div>

              <div className="rounded-2xl md:rounded-3xl border border-border bg-card p-6 sm:p-8 text-center lg:text-left">
                <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-text_muted mb-4">Availability</p>
                <p className="text-sm text-text_secondary leading-relaxed">
                  Available for remote work, on-site consultations, and collaborative product development across websites, mobile apps, and internal
                  systems.
                </p>
                <div className="mt-5 rounded-xl md:rounded-2xl border border-border bg-background p-5 flex items-center justify-center lg:justify-start gap-4">
                  <div className="w-12 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <HiLocationMarker size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-foreground">Sri Lanka</div>
                    <div className="text-sm text-text_secondary">Working with clients locally and globally</div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl md:rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
            >
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground mb-3 text-center lg:text-left">Send a Message</h2>
              <p className="text-sm text-text_secondary mb-8 text-center lg:text-left">
                Share a little context and we’ll get back to you with the next step.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 flex flex-col md:text-left text-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input
                      className={`input-field text-center md:text-left ${errors.name ? "border-red-400" : ""}`}
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1 text-left">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="label">Email Address *</label>
                    <input
                      className={`input-field text-center md:text-left ${errors.email ? "border-red-400" : ""}`}
                      placeholder="john@example.com"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1 text-left">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Phone Number</label>
                    <input
                      className="input-field text-center md:text-left"
                      placeholder="+94 7X XXX XXXX"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Subject *</label>
                    <input
                      className={`input-field text-center md:text-left ${errors.subject ? "border-red-400" : ""}`}
                      placeholder="Project inquiry"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                    {errors.subject && <p className="text-red-500 text-xs mt-1 text-left">{errors.subject}</p>}
                  </div>
                </div>

                <div>
                  <label className="label">Message *</label>
                  <textarea
                    className={`input-field text-center md:text-left resize-none h-36 ${errors.message ? "border-red-400" : ""}`}
                    placeholder="Tell us about your project, timeline, goals, or question..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1 text-left">{errors.message}</p>}
                </div>

                <Button variant="primary" type="submit" disabled={loading} rightIcon={<HiOutlineChat/> } className="self-center md:self-end">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
