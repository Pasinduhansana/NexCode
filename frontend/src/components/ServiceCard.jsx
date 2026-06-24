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
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="group relative rounded-2xl p-[1px] overflow-hidden"
    >
      {/* Animated Border */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 rounded-2xl border border-transparent" />
        <div className="absolute -inset-[150%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(transparent_0deg,#3b82f6_120deg,#06b6d4_180deg,transparent_240deg)]" />
      </div>
      
      {/* Card Content */}
      <div className="relative h-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-300">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

        {/* Icon */}
        <div
          className={`relative w-14 h-14 rounded-2xl mb-5 flex items-center justify-center text-white text-2xl shadow-lg ${
            gradient || "bg-gradient-to-br from-blue-500 to-cyan-400"
          } group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon />
        </div>

        {/* Content */}
        <h3 className="relative font-display font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-700 transition-colors duration-300">
          {title}
        </h3>

        <p className="relative text-sm text-gray-500 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}