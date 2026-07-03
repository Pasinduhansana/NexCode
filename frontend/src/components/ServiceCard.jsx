import { motion } from "framer-motion";

export default function ServiceCard({ icon: Icon, title, description, index = 0, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl p-[1px] bg-background"
    >
      {/* Animated Border */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl border border-transparent" />
        <div className="absolute -inset-[150%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(transparent_0deg,#3b82f6_120deg,#06b6d4_180deg,transparent_240deg)]" />
      </div>

      {/* Card */}
      <div className="relative h-full rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 group-hover:shadow-xl sm:p-6">
        {/* ================= MOBILE ================= */}
        <div className="relative flex flex-col items-center text-center sm:hidden">
          <div
            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${
              gradient || "bg-gradient-to-br from-blue-500 to-cyan-400"
            }`}
          >
            <Icon />
          </div>

          <h3 className="mb-3 font-display text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">{title}</h3>

          <p className="text-sm leading-7 text-text_secondary">{description}</p>
        </div>

        {/* ============== TABLET & DESKTOP ============== */}
        <div className="relative hidden sm:block py-2">
          <div className="flex flex-row items-center gap-5 mb-1">
            <div
              className={`mb-5 flex min-h-14 min-w-14 items-center justify-center rounded-xl text-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                gradient || "bg-gradient-to-br from-blue-500 to-cyan-400"
              }`}
            >
              <Icon />
            </div>

            <h3 className="mb-4 font-display text-[16px] font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
              {title}
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-text_secondary">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
