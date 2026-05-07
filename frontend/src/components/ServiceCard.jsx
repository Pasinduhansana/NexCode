import { motion } from 'framer-motion';

export default function ServiceCard({ icon: Icon, title, description, index = 0, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 cursor-default overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

      {/* Icon */}
      <div className={`relative w-14 h-14 rounded-2xl mb-5 flex items-center justify-center text-white text-2xl shadow-lg ${gradient || 'bg-gradient-to-br from-blue-500 to-cyan-400'} group-hover:scale-110 transition-transform duration-300`}>
        <Icon />
      </div>

      {/* Content */}
      <h3 className="relative font-display font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">
        {title}
      </h3>
      <p className="relative text-sm text-gray-500 leading-relaxed">
        {description}
      </p>

      {/* Bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </motion.div>
  );
}
