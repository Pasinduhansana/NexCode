import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { HiCheckCircle, HiExclamationCircle } from "react-icons/hi";
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [errors, setErrors] = useState({});
  usePageTitle("Start a Project");

  useEffect(() => {
    if (state.succeeded) {
      toast.success("Project request submitted!");
    }
  }, [state.succeeded]);

  // Surface Formspree-side failures (quota, spam block, etc.) so it's never silent
  useEffect(() => {
    if (state.errors && state.errors.length > 0 && !state.succeeded && !state.submitting) {
      toast.error("Something went wrong sending your request. Please try again or contact us on WhatsApp.");
      console.error("Formspree submission errors:", state.errors);
    }
  }, [state.errors, state.succeeded, state.submitting]);

  const update = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const validateStep = (targetStep) => {
    const e = {};
    if (!targetStep || targetStep === 1) {
      if (!form.clientName.trim()) e.clientName = "Please enter your name.";
      if (!form.clientEmail.trim()) e.clientEmail = "Please enter your email.";
      else if (!EMAIL_RE.test(form.clientEmail.trim())) e.clientEmail = "Please enter a valid email address.";
    }
    if (!targetStep || targetStep === 2) {
      if (!form.projectTitle.trim()) e.projectTitle = "Please enter a project title.";
      if (!form.projectType.trim()) e.projectType = "Please select a service type.";
      if (!form.description.trim()) e.description = "Please add a project description.";
      else if (form.description.trim().length < 20)
        e.description = "Please provide at least 20 characters (currently " + form.description.trim().length + ").";
    }
    if (!targetStep || targetStep === 3) {
      if (!form.timeline.trim()) e.timeline = "Please select a timeline.";
      if (!form.budget.trim()) e.budget = "Please select a budget range.";
    }
    return e;
  };

  const goToStep = (nextStep) => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    setStep(nextStep);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const allErrors = validateStep();
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      if (allErrors.clientName || allErrors.clientEmail) setStep(1);
      else if (allErrors.projectTitle || allErrors.projectType || allErrors.description) setStep(2);
      else setStep(3);
      toast.error("Please fix the highlighted fields before submitting.");
      return;
    }
    setErrors({});
    try {
      await formspreeHandleSubmit(e);
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error("Couldn't send your request. Please check your connection and try again.");
    }
  };

  const fieldError = (key) =>
    errors[key] ? (
      <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
        <HiExclamationCircle className="shrink-0" /> {errors[key]}
      </p>
    ) : null;

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
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step >= s ? "bg-primary border border-primary text-white" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && <div className={`w-16 h-0.5 transition-all ${step > s ? "bg-primary" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          <motion.form
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100 flex flex-col"
            onSubmit={onSubmit}
            noValidate
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
                  className={`input-field ${errors.clientName ? "border-red-500 focus:border-red-500" : ""}`}
                  name="name"
                  placeholder="John Doe"
                  value={form.clientName}
                  onChange={(e) => update("clientName", e.target.value)}
                />
                {fieldError("clientName")}
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input
                  className={`input-field ${errors.clientEmail ? "border-red-500 focus:border-red-500" : ""}`}
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.clientEmail}
                  onChange={(e) => update("clientEmail", e.target.value)}
                />
                {fieldError("clientEmail")}
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
                  className={`input-field ${errors.projectTitle ? "border-red-500 focus:border-red-500" : ""}`}
                  name="project_title"
                  placeholder="e.g. E-commerce Platform"
                  value={form.projectTitle}
                  onChange={(e) => update("projectTitle", e.target.value)}
                />
                {fieldError("projectTitle")}
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
                {fieldError("projectType")}
              </div>
              <div>
                <label className="label">Project Description *</label>
                <textarea
                  className={`input-field resize-none h-28 ${errors.description ? "border-red-500 focus:border-red-500" : ""}`}
                  name="message"
                  placeholder="Describe what you want to build..."
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
                {fieldError("description")}
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
            </div>

            <div className={`space-y-4 ${step === 3 ? "" : "hidden"}`}>
              <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Your Information</h2>
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
                {fieldError("timeline")}
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
                {fieldError("budget")}
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
              {step < 3 ? (
                <Button variant="primary" type="button" rightIcon={<FaArrowRight />} onClick={() => goToStep(step + 1)} className="w-full sm:w-auto">
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