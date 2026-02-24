// src/components/MainLayout.jsx

import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function MainLayout({ children, hideNavbar = false }) {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background-light dark:bg-emerald-950 font-sans selection:bg-primary/30 selection:text-emerald-950 dark:selection:text-white relative overflow-hidden transition-colors duration-500">
            {/* Ambient Lighting Orbs for Native App Feel */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden fixed">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-radial from-emerald-400/20 dark:from-emerald-400/10 to-transparent blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen"
                ></motion.div>
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-radial from-emerald-600/20 dark:from-emerald-600/10 to-transparent blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen"
                ></motion.div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {!hideNavbar && <Navbar />}

                <AnimatePresence mode="wait">
                    <motion.main
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="flex-1 transition-all duration-300"
                    >
                        {children}
                    </motion.main>
                </AnimatePresence>

                {/* Footer */}
                <motion.footer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="py-6 bg-white/50 dark:bg-black/20 backdrop-blur-md border-t border-emerald-900/5 dark:border-white/5 mt-auto transition-colors duration-500"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                            <span className="material-icons-round text-primary text-sm">eco</span>
                            <p className="text-emerald-900/40 dark:text-emerald-200/40 text-[10px] font-black uppercase tracking-widest transition-colors duration-500">
                                KITA_HACK 2026
                            </p>
                        </div>
                    </div>
                </motion.footer>
            </div>
        </div>
    );
}
