import { motion } from 'motion/react';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/',
    icon: InstagramIcon,
    className: 'text-[#e1306c]',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/',
    icon: LinkedInIcon,
    className: 'text-[#0a66c2]',
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/',
    icon: WhatsAppIcon,
    className: 'text-[#25d366]',
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-slate-200/60 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/30 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">MaintenanceAI</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Transforming facility maintenance with AI-powered insights and automation.
            </p>
          </motion.div>

          {/* Product Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide">Product</h3>
            <ul className="space-y-3">
              {['Features', 'Pricing', 'Security', 'Integrations'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide">Company</h3>
            <ul className="space-y-3">
              {['About', 'Blog', 'Careers', 'Contact'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide">Legal</h3>
            <ul className="space-y-3">
              {['Privacy', 'Terms', 'Cookies', 'Compliance'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Social Links & Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-slate-200/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2"
          >
            {socialLinks.map((social, idx) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200/60 hover:border-blue-200/60 transition-all shadow-sm hover:shadow-md"
                  title={social.label}
                >
                  <Icon className={`h-5 w-5 ${social.className}`} />
                </motion.a>
              );
            })}
          </motion.div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-center md:text-right"
          >
            <p className="text-sm text-slate-600">
              © 2026 MaintenanceAI. Built with passion for facility management.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}