import { motion } from 'motion/react';
import { Zap, Shield, BarChart3, ArrowRight, Smartphone, Clock, Users } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Work Order Creation',
    description:
      'Create work orders for damaged equipment or maintenance requests with a clear and fast flow.',
    gradient: 'from-yellow-500/10 to-orange-500/10',
    iconGradient: 'from-yellow-600 to-orange-500',
    color: 'text-orange-600',
  },
  {
    icon: Shield,
    title: 'Profile Management',
    description:
      'Update profile data, edit account information, and upload a profile photo directly from the profile page.',
    gradient: 'from-blue-500/10 to-cyan-500/10',
    iconGradient: 'from-blue-600 to-cyan-500',
    color: 'text-blue-600',
  },
  {
    icon: BarChart3,
    title: 'Status Tracking',
    description:
      'Track work order status from draft to submitted and beyond without checking every item manually.',
    gradient: 'from-purple-500/10 to-pink-500/10',
    iconGradient: 'from-purple-600 to-pink-500',
    color: 'text-purple-600',
  },
  {
    icon: Smartphone,
    title: 'Quick Help via AI',
    description:
      'If you do not know how something works, ask AI for a quick guide to the features on this website.',
    gradient: 'from-teal-500/10 to-emerald-500/10',
    iconGradient: 'from-teal-600 to-emerald-500',
    color: 'text-teal-600',
  },
  {
    icon: Clock,
    title: 'First Aid Guidance',
    description:
      'Use the first-aid tutorial when equipment has a problem before creating a work order.',
    gradient: 'from-indigo-500/10 to-blue-500/10',
    iconGradient: 'from-indigo-600 to-blue-500',
    color: 'text-indigo-600',
  },
  {
    icon: Users,
    title: 'Troubleshooting',
    description:
      'Get help for common issues such as login problems, profile data, and app usage errors.',
    gradient: 'from-rose-500/10 to-red-500/10',
    iconGradient: 'from-rose-600 to-red-500',
    color: 'text-rose-600',
  },
];

export function Features() {
  return (
    <section className="py-24 sm:py-32 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-transparent to-slate-50 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/60 mb-6 shadow-[0_8px_20px_rgba(37,99,235,0.08)]"
          >
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" 
            />
            <span className="text-sm font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">Core Features</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight"
          >
            Everything your team
            <br />
            <motion.span
              className="relative inline-block mt-2"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 blur-2xl opacity-60"
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
              />
              <span className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                needs
              </span>
            </motion.span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Focused on the core Assignment Management features: work orders, profiles, first aid, troubleshooting, and the AI assistant.
          </motion.p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative"
              >
                {/* Card Background with gradient border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 group-hover:border-blue-300/60 transition-all duration-300" />
                
                {/* Animated gradient overlay on hover */}
                <div 
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                
                {/* Glow effect on hover */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-200/20 to-cyan-200/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                />

                {/* Content */}
                <div className="relative p-8 h-full">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.iconGradient} bg-opacity-10 flex items-center justify-center mb-6 group-hover:bg-opacity-20 transition-all duration-300`}
                  >
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 + 0.1 }}
                    className="text-xl font-bold text-slate-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-700 group-hover:to-cyan-600 group-hover:bg-clip-text transition-all duration-300"
                  >
                    {feature.title}
                  </motion.h3>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 + 0.15 }}
                    className="text-slate-600 leading-7 group-hover:text-slate-700 transition-colors text-sm"
                  >
                    {feature.description}
                  </motion.p>

                  {/* Animated arrow on hover */}
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="mt-6 inline-flex items-center gap-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="text-sm font-semibold">Explore</span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-24 text-center"
        >
          <p className="text-slate-600 text-lg mb-8 font-light">
            If you are not sure how something works, open the AI chatbot and ask directly.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-[0_16px_32px_rgba(37,99,235,0.22)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all duration-300 inline-flex items-center gap-2"
          >
            <span>Ask AI Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
