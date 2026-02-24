// src/components/Navbar.jsx

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useDarkMode from '../hooks/useDarkMode';

export default function Navbar() {
    const { isDark, toggleDarkMode } = useDarkMode();

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="sticky top-0 z-50 bg-white/80 dark:bg-emerald-950/80 backdrop-blur-xl border-b border-emerald-900/10 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20 transition-colors duration-500"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center gap-2 group">
                            <motion.div
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.5 }}
                                className="bg-primary/10 dark:bg-primary/20 p-2 rounded-xl border border-primary/20 dark:border-primary/30 group-hover:bg-primary transition-colors cursor-pointer"
                            >
                                <span className="material-icons-round text-primary text-xl group-hover:text-emerald-50 dark:group-hover:text-emerald-950 transition-colors drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] dark:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">recycling</span>
                            </motion.div>
                            <span className="text-xl font-extrabold tracking-tight text-emerald-950 dark:text-white group-hover:text-primary transition-colors ml-1">
                                Recycle<span className="text-primary font-extrabold">Now</span>
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-5">
                        {/* Dark Mode Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleDarkMode}
                            className="bg-primary/10 dark:bg-primary/20 text-primary p-2.5 rounded-full transition-all border border-primary/20 dark:border-primary/30 flex items-center justify-center cursor-pointer"
                            aria-label="Toggle dark mode"
                        >
                            <motion.span
                                key={isDark ? 'dark' : 'light'}
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="material-icons-round text-[1.3rem]"
                            >
                                {isDark ? 'light_mode' : 'dark_mode'}
                            </motion.span>
                        </motion.button>

                        <Link
                            to="/dashboard/scanner"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(16,185,129,0.2)' }}
                                whileTap={{ scale: 0.9 }}
                                className="bg-primary/10 dark:bg-primary/20 text-primary p-2.5 rounded-full transition-all border border-primary/20 dark:border-primary/30 flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.1)] dark:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            >
                                <span className="material-icons-round text-[1.3rem]">qr_code_scanner</span>
                            </motion.div>
                        </Link>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-emerald-400 p-0.5 shadow-lg shadow-primary/30 cursor-pointer"
                        >
                            <div className="w-full h-full bg-emerald-50 dark:bg-emerald-950 rounded-full flex items-center justify-center border-[3px] border-emerald-50 dark:border-emerald-950 relative overflow-hidden group transition-colors duration-500">
                                <span className="material-icons-round text-primary text-base group-hover:scale-110 transition-transform">person</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
