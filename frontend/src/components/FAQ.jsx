import react from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { HiChevronDown } from "react-icons/hi";
import { useState } from "react";
import { FAQItem } from "../data/faqItems";
import  SectionLabel  from "./SectionLabel";


const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.08,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState(null);
  return (

      <section className="py-8 lg:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-12">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <SectionLabel content="Common Questions" />
            </motion.div>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={1}
              className="font-display text-3xl md:text-4xl font-extrabold text-foreground tracking-tight section-title"
            >
              Frequently Asked <span className="gradient-text">Questions</span>
            </motion.h2>
          </div>

          <div className="space-y-3">
            {FAQItem.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                className="rounded-xl border border-border  overflow-hidden"
              >
                {/* Not Called button component since this is seperate dropdown one */}
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-muted/60 transition-colors"
                >
                  <span className="font-medium text-foreground text-sm">{faq.q}</span>
                  <HiChevronDown
                    className={`flex-shrink-0 text-primary transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                    size={18}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-sm text-text_secondary leading-relaxed border-t border-border pt-4">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
  )}
