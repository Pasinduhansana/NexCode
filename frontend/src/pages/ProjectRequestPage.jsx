import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiCheckCircle } from 'react-icons/hi';
import { FaRocket } from 'react-icons/fa';
import api from '../utils/api';
import usePageTitle from '../utils/usePageTitle';

const serviceTypes = ['Web Development', 'Mobile App', 'Custom Software', 'UI/UX Design', 'Cloud Solution', 'AI & Automation', 'Database System', 'Other'];
const timelines = ['1-2 weeks', '1 month', '2-3 months', '3-6 months', '6+ months', 'Flexible'];
const budgets = ['Under $1,000', '$1,000 - $5,000', '$5,000 - $15,000', '$15,000 - $50,000', '$50,000+', 'Let\'s Discuss'];

export default function ProjectRequestPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    clientName: '', clientEmail: '', clientPhone: '',
    projectTitle: '', projectType: '', description: '',
    features: '', timeline: '', budget: '', techPreferences: ''
  });
  usePageTitle('Start a Project');

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/projects', {
        ...form,
        features: form.features.split('\n').filter(Boolean)
      });
      setSubmitted(true);
      toast.success('Project request submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-32 bg-gray-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <HiCheckCircle className="text-green-500" size={48} />
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">Request Submitted!</h2>
          <p className="text-gray-500 mb-8">We've received your project request and will contact you within 24 hours with a detailed proposal.</p>
          <div className="flex gap-4 justify-center">
            <a href="https://wa.me/94769747244" target="_blank" rel="noreferrer" className="btn-primary">Chat on WhatsApp</a>
            <a href="/" className="btn-secondary">Back to Home</a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="pt-32 pb-16 bg-hero-gradient dark-grid">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Start Your <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Project</span>
          </h1>
          <p className="text-gray-300">Tell us about your idea and we'll build it into reality.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>{s}</div>
                {s < 3 && <div className={`w-16 h-0.5 transition-all ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
          >
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Your Information</h2>
                <div><label className="label">Full Name *</label><input className="input-field" placeholder="John Doe" value={form.clientName} onChange={e => update('clientName', e.target.value)} /></div>
                <div><label className="label">Email Address *</label><input className="input-field" type="email" placeholder="john@example.com" value={form.clientEmail} onChange={e => update('clientEmail', e.target.value)} /></div>
                <div><label className="label">Phone Number</label><input className="input-field" placeholder="+94 7X XXX XXXX" value={form.clientPhone} onChange={e => update('clientPhone', e.target.value)} /></div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Project Details</h2>
                <div><label className="label">Project Title *</label><input className="input-field" placeholder="e.g. E-commerce Platform" value={form.projectTitle} onChange={e => update('projectTitle', e.target.value)} /></div>
                <div>
                  <label className="label">Service Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {serviceTypes.map(type => (
                      <button key={type} type="button" onClick={() => update('projectType', type)}
                        className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.projectType === type ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >{type}</button>
                    ))}
                  </div>
                </div>
                <div><label className="label">Project Description *</label><textarea className="input-field resize-none h-28" placeholder="Describe what you want to build..." value={form.description} onChange={e => update('description', e.target.value)} /></div>
                <div><label className="label">Key Features (one per line)</label><textarea className="input-field resize-none h-24" placeholder="User authentication&#10;Product catalog&#10;Payment integration" value={form.features} onChange={e => update('features', e.target.value)} /></div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Timeline & Budget</h2>
                <div>
                  <label className="label">Expected Timeline</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timelines.map(t => (
                      <button key={t} type="button" onClick={() => update('timeline', t)}
                        className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${form.timeline === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Budget Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    {budgets.map(b => (
                      <button key={b} type="button" onClick={() => update('budget', b)}
                        className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${form.budget === b ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >{b}</button>
                    ))}
                  </div>
                </div>
                <div><label className="label">Tech Preferences (optional)</label><input className="input-field" placeholder="e.g. React, Node.js, MongoDB" value={form.techPreferences} onChange={e => update('techPreferences', e.target.value)} /></div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)} className="btn-ghost flex-1 justify-center">← Back</button>
              )}
              {step < 3 ? (
                <button onClick={() => setStep(s => s + 1)} className="btn-primary flex-1 justify-center">Continue →</button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center disabled:opacity-60">
                  {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</> : <><FaRocket /> Submit Project Request</>}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
