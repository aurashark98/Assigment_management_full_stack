import { motion } from 'motion/react';
import { CheckCircle2, ArrowDown, MessageCircleQuestion } from 'lucide-react';

interface HowItWorksProps {
  isAuthenticated?: boolean;
  onGetStarted?: () => void;
}

const steps = [
  {
    number: '01',
    title: 'Choose the feature you need',
    description: 'Use the work order, profile, analysis, or help pages based on your task.',
  },
  {
    number: '02',
    title: 'Follow a simple flow',
    description: 'Each page is kept concise so users can understand the steps quickly.',
  },
  {
    number: '03',
    title: 'Ask AI if you get stuck',
    description: 'If you are unsure how to use the app, open the AI chatbot and ask for the next step.',
  },
];

export function HowItWorks({ isAuthenticated = false, onGetStarted }: HowItWorksProps) {
  return (
    <section id="about-this-web" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-4"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm font-medium text-blue-700">About</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Help users understand the website right away
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Assignment Management helps users manage work orders, update profiles, read quick guidance, and ask AI when they need help.
          </p>
        </motion.div>

        <div className="space-y-12 relative">
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="hidden md:block absolute left-10 top-20 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-slate-200 origin-top"
          />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="flex flex-col md:flex-row items-start gap-6 md:gap-8 group relative"
            >
              <div className="flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 8, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-xl md:text-2xl text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.4)] transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 rounded-2xl border-2 border-blue-300"
                  />
                  <span className="relative">{step.number}</span>
                </motion.div>
              </div>

              <motion.div className="flex-1 pt-0 md:pt-2">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.2, duration: 0.5 }}
                  className="flex items-center gap-3 mb-3"
                >
                  <h3 className="text-xl md:text-2xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.3, type: 'spring' }}
                  >
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.1, duration: 0.5 }}
                  className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl group-hover:text-slate-700 transition-colors"
                >
                  {step.description}
                </motion.p>
              </motion.div>

              {index < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  className="md:hidden mx-auto mt-4"
                >
                  <ArrowDown className="w-5 h-5 text-blue-600" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 text-center"
          >
            <motion.div
              whileHover={{ scale: 1.04, y: -6 }}
              className="inline-flex flex-col md:flex-row items-center gap-4 px-10 py-8 rounded-2xl bg-gradient-to-r from-white to-blue-50/30 border-2 border-slate-200/80 hover:border-blue-300/60 transition-all duration-300 shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)]"
            >
              <div className="text-left">
                <div className="inline-flex items-center gap-2 mb-2 text-blue-700 font-semibold text-sm uppercase tracking-wide">
                  <MessageCircleQuestion className="w-4 h-4" />
                  AI Help
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">
                  If you are not sure, just ask AI
                </h3>
                <p className="text-sm md:text-base text-slate-600">
                  The chatbot in the bottom-right corner can explain the website features and usage steps.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold whitespace-nowrap hover:shadow-[0_15px_40px_rgba(37,99,235,0.3)] transition-all duration-300 relative overflow-hidden group"
              >
                <motion.span
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative">Get Started</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
