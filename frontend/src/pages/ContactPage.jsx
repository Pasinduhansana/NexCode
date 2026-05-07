import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiPhone, HiMail, HiLocationMarker } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import api from '../utils/api';
import usePageTitle from '../utils/usePageTitle';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  usePageTitle('Contact');

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = 'Valid email required';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (form.message.trim().length < 20) e.message = 'Message must be at least 20 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/contacts', form);
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contacts = [
    { icon: FaWhatsapp, label: 'WhatsApp', value: '+94 76 974 7244', href: 'https://wa.me/94769747244', color: 'text-green-500' },
    { icon: HiPhone, label: 'Call Us', value: '+94 75 312 5140', href: 'tel:+94753125140', color: 'text-blue-500' },
    { icon: HiMail, label: 'Email', value: 'info@nexcode.lk', href: 'mailto:info@nexcode.lk', color: 'text-purple-500' },
    { icon: HiLocationMarker, label: 'Location', value: 'Sri Lanka', href: '#', color: 'text-red-500' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-16 bg-hero-gradient dark-grid">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs mb-6">
              Get In Touch
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Let's <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Connect</span>
            </h1>
            <p className="text-gray-300">Have a question or project in mind? We'd love to hear from you.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-display font-bold text-2xl text-gray-900 mb-6">Contact Information</h2>
              {contacts.map((c, i) => (
                <motion.a
                  key={i}
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center ${c.color} group-hover:scale-110 transition-transform`}>
                    <c.icon size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-medium">{c.label}</div>
                    <div className="font-semibold text-gray-900 text-sm">{c.value}</div>
                  </div>
                </motion.a>
              ))}

              {/* Map placeholder */}
              <div className="mt-6 rounded-2xl overflow-hidden bg-blue-50 border border-blue-100 h-48 flex items-center justify-center">
                <div className="text-center text-blue-400">
                  <HiLocationMarker size={40} className="mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-600">Sri Lanka</p>
                  <p className="text-xs text-blue-400">Available for remote & on-site projects</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
            >
              <h2 className="font-display font-bold text-2xl text-gray-900 mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input className={`input-field ${errors.name ? 'border-red-400' : ''}`} placeholder="John Doe"
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="label">Email Address *</label>
                    <input className={`input-field ${errors.email ? 'border-red-400' : ''}`} placeholder="john@example.com" type="email"
                      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Phone Number</label>
                    <input className="input-field" placeholder="+94 7X XXX XXXX"
                      value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Subject *</label>
                    <input className={`input-field ${errors.subject ? 'border-red-400' : ''}`} placeholder="Project inquiry"
                      value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                  </div>
                </div>
                <div>
                  <label className="label">Message *</label>
                  <textarea className={`input-field resize-none h-32 ${errors.message ? 'border-red-400' : ''}`}
                    placeholder="Tell us about your project or question..."
                    value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-60">
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
