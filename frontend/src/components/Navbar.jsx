// src/components/Navbar.jsx

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ showHamburger = false, onHamburgerClick }) {
    const { user } = useAuth();

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="sticky top-0 z-50 bg-white/80 dark:bg-emerald-950/80 backdrop-blur-xl border-b border-emerald-900/10 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20 transition-colors duration-500"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-20">
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        {showHamburger && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onHamburgerClick}
                                className="bg-primary/10 dark:bg-primary/20 text-primary p-2 sm:p-2.5 rounded-full transition-all border border-primary/20 dark:border-primary/30 flex items-center justify-center cursor-pointer"
                                aria-label="Open menu"
                            >
                                <span className="material-icons-round text-[1.1rem] sm:text-[1.3rem]">menu</span>
                            </motion.button>
                        )}
                    </div>
                    <div className="flex items-center">
                        <Link
                            to="/dashboard/scanner"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(16,185,129,0.2)' }}
                                whileTap={{ scale: 0.9 }}
                                className="bg-primary/10 dark:bg-primary/20 text-primary p-2 sm:p-2.5 rounded-full transition-all border border-primary/20 dark:border-primary/30 flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.1)] dark:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            >
                                <span className="material-icons-round text-[1.1rem] sm:text-[1.3rem]">qr_code_scanner</span>
                            </motion.div>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
