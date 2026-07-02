import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { HiCheckCircle } from "react-icons/hi";
import { FaArrowLeft, FaArrowRight, FaRocket } from "react-icons/fa";
import { ValidationError, useForm } from "@formspree/react";
import usePageTitle from "../utils/usePageTitle";
import Button from "../components/Button";

const serviceTypes = [
  "Web Development",
  "Mobile App",
  "Custom Software",
  "UI/UX Design",
  "Cloud Solution",
  "AI & Automation",
  "Database System",
  "Other",
];
const timelines = ["1-2 weeks", "1 month", "2-3 months", "3-6 months", "6+ months", "Flexible"];
const budgets = ["Under $1,000", "$1,000 - $5,000", "$5,000 - $15,000", "$15,000 - $50,000", "$50,000+", "Let's Discuss"];

export default function ProjectRequestPage() {
  const [step, setStep] = useState(1);
  const [state, formspreeHandleSubmit] = useForm("xbdvpjjv");
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    projectTitle: "",
    projectType: "",
    description: "",
    features: "",
    timeline: "",
    budget: "",
    techPreferences: "",
  });
  usePageTitle("Start a Project");

  useEffect(() => {
    if (state.succeeded) {
      toast.success("Project request submitted!");
    }
  }, [state.succeeded]);

  const update = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const validate = () => {
    if (!form.clientName.trim()) return { ok: false, step: 1, message: "Please enter your name." };
    if (!form.clientEmail.trim()) return { ok: false, step: 1, message: "Please enter your email." };
    if (!form.projectTitle.trim()) return { ok: false, step: 2, message: "Please enter a project title." };
    if (!form.projectType.trim()) return { ok: false, step: 2, message: "Please select a service type." };
    if (!form.description.trim()) return { ok: false, step: 2, message: "Please add a project description." };
    if (!form.timeline.trim()) return { ok: false, step: 2, message: "Please select a timeline." };
    if (!form.budget.trim()) return { ok: false, step: 2, message: "Please select a budget range." };
    return { ok: true };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = validate();
    if (!result.ok) {
      setStep(result.step);
      toast.error(result.message);
      return;
    }
    await formspreeHandleSubmit(e);
  };

  if (state.succeeded) {
    return (
      <div className="min-h-screen pt-32 bg-gray-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <HiCheckCircle className="text-green-500" size={48} />
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">Request Submitted!</h2>
          <p className="text-gray-500 mb-8">We've received your project request and will contact you within 24 hours with a detailed proposal.</p>
          <div className="flex gap-4 justify-center">
            <a href="https://wa.me/94769747244" target="_blank" rel="noreferrer" className="btn-primary">
              Chat on WhatsApp
            </a>
            <a href="/" className="btn-secondary">
              Back to Home
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="pt-28 sm:pt-32 pb-10 bg-hero-gradient dark-grid">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Start Your <span className="text-primary">Project</span>
          </h1>
          <p className="section-subtitle mt-6">
            Tell us about your idea in detail, and our team will carefully design, develop, and transform it into a fully functional real-world
            solution tailored to your needs.
          </p>{" "}
        </div>
      </section>

      <section className="py-5 sm:py-5">
        <div className="max-w-2xl mx-auto px-4">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8 sm:mb-10 overflow-x-auto pb-1">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step >= s ? "bg-primary border border-primary text-white" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {s}
                </div>
                {s < 2 && <div className={`w-16 h-0.5 transition-all ${step > s ? "bg-primary" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          <motion.form
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100 flex flex-col"
            onSubmit={onSubmit}
          >
            <input type="hidden" name="project_type" value={form.projectType} />
            <input type="hidden" name="timeline" value={form.timeline} />
            <input type="hidden" name="budget" value={form.budget} />
            <textarea
              className="hidden"
              readOnly
              name="details"
              value={[
                `Phone: ${form.clientPhone || "Not provided"}`,
                `Project title: ${form.projectTitle || "Not selected"}`,
                `Service type: ${form.projectType || "Not selected"}`,
                `Key features: ${form.features || "Not provided"}`,
                `Timeline: ${form.timeline || "Not selected"}`,
                `Budget: ${form.budget || "Not selected"}`,
                `Tech preferences: ${form.techPreferences || "Not provided"}`,
              ].join("\n")}
            />
            <input type="hidden" name="_subject" value={`New project request: ${form.projectTitle || form.projectType || "NexCode"}`} />

            <div className={`space-y-4 ${step === 1 ? "" : "hidden"}`}>
              <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Your Information</h2>
              <div>
                <label className="label">Full Name *</label>
                <input
                  className="input-field"
                  name="name"
                  placeholder="John Doe"
                  value={form.clientName}
                  onChange={(e) => update("clientName", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input
                  className="input-field"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.clientEmail}
                  onChange={(e) => update("clientEmail", e.target.value)}
                />
                <ValidationError field="email" prefix="Email" errors={state.errors} />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  className="input-field"
                  name="phone"
                  placeholder="+94 7X XXX XXXX"
                  value={form.clientPhone}
                  onChange={(e) => update("clientPhone", e.target.value)}
                />
              </div>
            </div>

            <div className={`space-y-4 ${step === 2 ? "" : "hidden"}`}>
              <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Project Details & Preferences</h2>
              <div>
                <label className="label">Project Title *</label>
                <input
                  className="input-field"
                  name="project_title"
                  placeholder="e.g. E-commerce Platform"
                  value={form.projectTitle}
                  onChange={(e) => update("projectTitle", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Service Type *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {serviceTypes.map((type) => (
                    <Button
                      variant="radio"
                      key={type}
                      type="button"
                      onClick={() => update("projectType", type)}
                      className={`${form.projectType === type ? "border-primary bg-blue-50 text-primary" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Project Description *</label>
                <textarea
                  className="input-field resize-none h-28"
                  name="message"
                  placeholder="Describe what you want to build..."
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
                <ValidationError field="message" prefix="Description" errors={state.errors} />
              </div>
              <div>
                <label className="label">Key Features (one per line)</label>
                <textarea
                  className="input-field resize-none h-24"
                  name="key_features"
                  placeholder="User authentication&#10;Product catalog&#10;Payment integration"
                  value={form.features}
                  onChange={(e) => update("features", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Expected Timeline</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {timelines.map((t) => (
                    <Button
                      key={t}
                      variant="radio"
                      type="button"
                      onClick={() => update("timeline", t)}
                      className={`${form.timeline === t ? "border-primary bg-blue-50 text-primary" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Budget Range</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {budgets.map((b) => (
                    <Button
                      key={b}
                      variant="radio"
                      type="button"
                      onClick={() => update("budget", b)}
                      className={` ${form.budget === b ? "border-primary bg-blue-50 text-primary" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                    >
                      {b}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Tech Preferences (optional)</label>
                <input
                  className="input-field"
                  name="tech_preferences"
                  placeholder="e.g. React, Node.js, MongoDB"
                  value={form.techPreferences}
                  onChange={(e) => update("techPreferences", e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 self-stretch sm:self-end">
              {step > 1 && (
                <Button variant="radio" type="button" leftIcon={<FaArrowLeft />} onClick={() => setStep((s) => s - 1)} className="w-full sm:w-auto">
                  Back
                </Button>
              )}
              {step < 2 ? (
                <Button variant="primary" type="button" rightIcon={<FaArrowRight />} onClick={() => setStep((s) => s + 1)} className="w-full sm:w-auto">
                  Continue
                </Button>
              ) : (
                <Button variant="primary" type="submit" rightIcon={<FaRocket />} disabled={state.submitting} className="w-full sm:w-auto">
                  {state.submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>Submit Project Request</>
                  )}
                </Button>
              )}
            </div>
          </motion.form>
        </div>
      </section>
    </div>
  );
}
