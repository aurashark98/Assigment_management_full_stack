import { motion } from 'motion/react';
import { Sparkles, MessageCircleQuestion } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[72vh] flex items-center justify-center px-6 overflow-hidden pt-12 sm:pt-16">
      {/* Background Effects - Modernized */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100" />
        
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-gradient-to-br from-blue-600/30 to-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.4, 0.25],
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-[-15%] right-[-5%] w-96 h-96 bg-gradient-to-tl from-cyan-600/20 to-teal-500/25 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.35, 0.2],
            x: [0, -40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(37,99,235,.08)_25%,rgba(37,99,235,.08)_26%,transparent_27%,transparent_74%,rgba(37,99,235,.08)_75%,rgba(37,99,235,.08)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(37,99,235,.08)_25%,rgba(37,99,235,.08)_26%,transparent_27%,transparent_74%,rgba(37,99,235,.08)_75%,rgba(37,99,235,.08)_76%,transparent_77%,transparent)] bg-[length:50px_50px] opacity-30" />
      </div>

      {/* Content */}
      <div className="relative max-w-5xl mx-auto text-center pt-12 sm:pt-16 lg:pt-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.05, y: -2 }}
          className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/85 border border-slate-200 backdrop-blur-sm mb-6 sm:mb-8 hover:bg-white hover:border-slate-300 transition-all duration-300 cursor-pointer shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
          </motion.div>
          <span className="text-xs md:text-sm text-slate-600">Assignment Management for work orders, profiles, and AI help</span>
        </motion.div>

        {/* Headline - Premium styling */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 mb-6 sm:mb-8 leading-[1.0] tracking-tighter px-2 sm:px-4"
        >
          Assignment
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
              Management
            </span>
          </motion.span>
        </motion.h1>

        {/* Subtitle - Enhanced typography */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-12 sm:mb-16 max-w-3xl mx-auto leading-relaxed font-light"
        >
          This website helps users create and track work orders, manage profiles, read quick guidance, and ask AI when they need help.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-20 sm:mb-24 flex items-center justify-center"
        >
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.08)] text-slate-700">
            <MessageCircleQuestion className="w-5 h-5 text-blue-600" />
            <span className="text-sm sm:text-base font-medium">If you're unsure, ask AI using the chat button in the bottom-right corner.</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}