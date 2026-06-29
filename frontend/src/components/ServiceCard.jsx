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
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl p-[1px]"
    >
      {/* Animated Border */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl border border-transparent" />
        <div className="absolute -inset-[150%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(transparent_0deg,#3b82f6_120deg,#06b6d4_180deg,transparent_240deg)]" />
      </div>

      {/* Card */}
      <div className="relative h-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 group-hover:shadow-xl sm:p-6">

        {/* Gradient Overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-cyan-50/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* ================= MOBILE ================= */}
        <div className="relative flex flex-col items-center text-center sm:hidden">

          <div
            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${
              gradient || "bg-gradient-to-br from-blue-500 to-cyan-400"
            }`}
          >
            <Icon />
          </div>

          <h3 className="mb-3 font-display text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">
            {title}
          </h3>

          <p className="text-sm leading-7 text-gray-500">
            {description}
          </p>
        </div>

        {/* ============== TABLET & DESKTOP ============== */}
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

          <p className="text-sm leading-relaxed text-gray-500">
            {description}
          </p>

        </div>
      </div>
    </motion.div>
  );
}