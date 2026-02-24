// src/pages/GuidelinesPage.jsx

import { motion } from 'framer-motion';

export default function GuidelinesPage() {
  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400/10 to-blue-600/10 dark:from-blue-400/20 dark:to-blue-600/20 flex items-center justify-center text-blue-500 dark:text-blue-400 border border-blue-400/20 shadow-inner">
          <span className="material-icons-round text-3xl">menu_book</span>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-emerald-950 dark:text-white tracking-tight transition-colors duration-500">
            Waste Guidelines
          </h1>
          <p className="text-emerald-800/60 dark:text-emerald-100/60 font-medium transition-colors duration-500">
            Learn how to sort and recycle properly
          </p>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-[2.5rem] p-10 shadow-2xl shadow-emerald-900/10 dark:shadow-emerald-900/50 transition-colors duration-500">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-emerald-500/10 dark:from-primary/20 dark:to-emerald-500/20 flex items-center justify-center text-primary mb-6 border border-primary/20">
            <span className="material-icons-round text-4xl">auto_stories</span>
          </div>
          <h3 className="text-2xl font-bold text-emerald-950 dark:text-white mb-3 transition-colors duration-500">Guidelines Coming Soon</h3>
          <p className="text-emerald-900/60 dark:text-emerald-100/60 font-medium max-w-md transition-colors duration-500">
            Comprehensive waste sorting rules, preparation checklists, and country-specific recycling guidelines will be available here.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
