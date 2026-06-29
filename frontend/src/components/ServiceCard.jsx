import { motion } from "framer-motion";

export default function ServiceCard({
  icon: Icon,
  title,
  description,
  index = 0,
  gradient,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl p-[1px]"
    >
      {/* Animated Border */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl border border-transparent" />
        <div className="absolute -inset-[150%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(transparent_0deg,#3b82f6_120deg,#06b6d4_180deg,transparent_240deg)]" />
      </div>

      {/* Card Content */}
      <div className="relative h-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 group-hover:shadow-xl sm:p-6">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-cyan-50/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* ---------- Mobile Layout ---------- */}
        <div className="relative flex items-center gap-4 sm:hidden">
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${
              gradient || "bg-gradient-to-br from-blue-500 to-cyan-400"
            }`}
          >
            <Icon />
          </div>

          <h3 className="font-display text-base font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">
            {title}
          </h3>
        </div>

        {/* ---------- Tablet & Desktop Layout ---------- */}
        <div className="relative hidden sm:block">
          <div
            className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${
              gradient || "bg-gradient-to-br from-blue-500 to-cyan-400"
            }`}
          >
            <Icon />
          </div>

          <h3 className="mb-2 font-display text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="relative mt-4 text-sm leading-relaxed text-gray-500 sm:mt-0">
          {description}
        </p>
      </div>
    </motion.div>
  );
}