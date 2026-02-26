import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useDarkMode from '../hooks/useDarkMode';

const LandingPage = () => {
    const navigate = useNavigate();
    const { isDark, toggleDarkMode } = useDarkMode();

    const fadeUp = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    return (
        <div className="font-display bg-background-light dark:bg-emerald-950 text-emerald-950 dark:text-emerald-50 selection:bg-primary/30 overflow-hidden transition-colors duration-500">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-background-light/80 dark:bg-emerald-950/80 backdrop-blur-md border-b border-emerald-100 dark:border-white/10 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 sm:h-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center group cursor-pointer"
                        >
                            <img
                                src="/logo.jpg"
                                alt="RecycleNow Logo"
                                className="h-10 sm:h-14 w-auto object-contain transition-transform duration-500 group-hover:scale-105 rounded-lg"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="hidden md:flex items-center space-x-8"
                        >
                            <a href="#" className="text-emerald-800 dark:text-emerald-100/70 hover:text-primary dark:hover:text-primary transition-colors duration-500 font-bold text-sm uppercase tracking-wider">Services</a>
                            <a href="#" className="text-emerald-800 dark:text-emerald-100/70 hover:text-primary dark:hover:text-primary transition-colors duration-500 font-bold text-sm uppercase tracking-wider">Impact</a>
                            <a href="#" className="text-emerald-800 dark:text-emerald-100/70 hover:text-primary dark:hover:text-primary transition-colors duration-500 font-bold text-sm uppercase tracking-wider">Pricing</a>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleDarkMode}
                                className="bg-primary/10 dark:bg-primary/20 text-primary p-1.5 sm:p-2 rounded-full border border-primary/20 dark:border-primary/30 cursor-pointer transition-all"
                                aria-label="Toggle dark mode"
                            >
                                <motion.span
                                    key={isDark ? 'dark' : 'light'}
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="material-icons-round text-base sm:text-lg"
                                >
                                    {isDark ? 'light_mode' : 'dark_mode'}
                                </motion.span>
                            </motion.button>
                            <button
                                onClick={() => navigate('/login')}
                                className="text-emerald-800 dark:text-emerald-200 font-bold hover:text-primary transition-colors duration-500 cursor-pointer text-sm sm:text-base"
                            >
                                Login
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/signup')}
                                className="bg-primary text-emerald-950 px-3 py-2 sm:px-6 sm:py-2.5 rounded-xl font-bold text-sm sm:text-base hover:shadow-lg hover:shadow-primary/40 transition-all cursor-pointer border border-primary/50"
                            >
                                Get Started
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-16 pb-24 lg:pt-32 lg:pb-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="max-w-xl"
                        >
                            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-emerald-800 dark:text-primary text-xs font-bold mb-6 tracking-wide uppercase transition-colors duration-500">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                KITA_HACK 2026 Winner
                            </motion.div>
                            <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-extrabold text-emerald-900 dark:text-white leading-[1.1] mb-6 tracking-tight transition-colors duration-500">
                                Waste Management, <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Reimagined.</span>
                            </motion.h1>
                            <motion.p variants={fadeUp} className="text-lg text-emerald-700 dark:text-emerald-100/70 mb-10 leading-relaxed font-medium transition-colors duration-500">
                                Schedule pickups, track your carbon footprint, and earn rewards for sustainable living. We use AI to make saving the planet effortless.
                            </motion.p>
                            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/signup')}
                                    className="bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 px-8 py-4 rounded-2xl font-extrabold text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-50 dark:border-white/20"
                                >
                                    Get Started <span className="material-icons-round">arrow_forward</span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/dashboard/guidelines')}
                                    className="bg-white/60 dark:bg-white/10 backdrop-blur-xl text-emerald-900 dark:text-white px-8 py-4 rounded-2xl font-extrabold text-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-200 dark:border-white/20 hover:border-primary dark:hover:border-primary"
                                >
                                    Learn More <span className="material-icons-round">menu_book</span>
                                </motion.button>
                            </motion.div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1, type: "spring" }}
                            className="mt-16 lg:mt-0 relative"
                        >
                            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
                            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                            <motion.div
                                animate={{ y: [-10, 10, -10] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/10 dark:shadow-emerald-900/50 border border-emerald-900/10 dark:border-white/10 transition-colors duration-500"
                            >
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBANfeQgyqMcHvCEdzZR3dsYrQmDS192ub78mmEbI6DkB9QJvfW85bzhPEHsZFN4bH0rrmnAJ6QrWv0KcXS7NkvoSvMLLIW3OSkch5NZA21i22vg9q6xIhPppYSSoebXNrK9AIELKkUZqbFm7d6ONbCtpe2R7XhEfbsq8AEgCfsnktC9maqj5borMJHYClr2D9p9PdDUsrR9EqDk_3sdsi9mtHSagRu2LyrSfIR6rBd2ETLDi98gjJdSxw9KuClQIBVzltZbxTfVWS9" alt="Sustainable Living" className="w-full h-[500px] object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 dark:from-emerald-950/80 to-transparent"></div>
                                <div className="absolute bottom-8 left-8 right-8 bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-emerald-900/10 dark:border-white/20 p-6 rounded-2xl flex items-center gap-4 transition-colors duration-500">
                                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary border border-primary/30">
                                        <span className="material-icons-round">qr_code_scanner</span>
                                    </div>
                                    <div>
                                        <p className="text-emerald-950 dark:text-white font-bold transition-colors duration-500">AI Scanner Active</p>
                                        <p className="text-emerald-900/70 dark:text-emerald-100/70 text-sm transition-colors duration-500">Identifying recyclable materials in real-time</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* SDG 12 Impact Stats */}
            <section className="py-20 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-80px" }}
                        variants={staggerContainer}
                        className="text-center mb-12"
                    >
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-emerald-800 dark:text-primary text-xs font-bold mb-4 tracking-wide uppercase transition-colors duration-500">
                            <span className="material-icons-round text-sm">public</span>
                            SDG 12 · Responsible Consumption
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold text-emerald-900 dark:text-white tracking-tight transition-colors duration-500">
                            Why It Matters
                        </motion.h2>
                    </motion.div>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-80px" }}
                        variants={staggerContainer}
                        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {[
                            { value: '65%', label: 'JB Non-Recycling Rate', icon: 'delete', color: 'text-red-500' },
                            { value: '8M+', label: 'Tonnes Waste / Year (MY)', icon: 'warning', color: 'text-amber-500' },
                            { value: '70%', label: 'Boost With Proper Sorting', icon: 'trending_up', color: 'text-primary' },
                            { value: '∞', label: 'Glass Is Infinitely Recyclable', icon: 'recycling', color: 'text-primary' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                whileHover={{ y: -6, scale: 1.02 }}
                                className="p-8 rounded-3xl border border-emerald-100 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl text-center transition-all duration-500"
                            >
                                <span className={`material-icons-round text-3xl mb-3 ${stat.color}`}>{stat.icon}</span>
                                <p className="text-4xl font-black text-emerald-900 dark:text-white tracking-tight transition-colors duration-500">{stat.value}</p>
                                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-100/60 mt-2 transition-colors duration-500">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Key Benefits Section */}
            <section className="py-24 bg-white dark:bg-black/20 border-y border-emerald-100 dark:border-white/5 relative z-10 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {[
                            { icon: 'local_shipping', title: 'Smart Pickups', desc: 'Schedule a collection in seconds. We handle everything efficiently.' },
                            { icon: 'center_focus_weak', title: 'AI Classification', desc: 'Aim your camera at trash and get instant bin recommendations.' },
                            { icon: 'redeem', title: 'Eco-Rewards', desc: 'Exchange recycling points for exclusive discounts at local partners.' }
                        ].map((benefit, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="p-10 rounded-3xl border border-emerald-100 dark:border-white/10 bg-background-light dark:bg-white/5 backdrop-blur-xl hover:shadow-2xl hover:shadow-emerald-900/10 dark:hover:shadow-black/50 transition-all duration-500 group"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-emerald-500/20 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-emerald-950 transition-colors border border-primary/20">
                                    <span className="material-icons-round text-3xl">{benefit.icon}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-emerald-900 dark:text-white mb-4 tracking-tight transition-colors duration-500">{benefit.title}</h3>
                                <p className="text-emerald-700 dark:text-emerald-100/60 leading-relaxed font-medium transition-colors duration-500">{benefit.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 relative overflow-hidden text-emerald-950">
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, type: 'spring' }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"
                ></motion.div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-gradient-to-br from-primary to-emerald-400 rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-primary/20 dark:shadow-primary/10 border border-emerald-50 dark:border-white/40 transition-colors duration-500"
                    >
                        <div className="max-w-xl text-center md:text-left">
                            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-emerald-950">Ready to make an impact?</h2>
                            <p className="font-bold text-emerald-900/80 text-xl">Join thousands of others making a real difference. Sign up today and get your first pickup free.</p>
                        </div>
                        <div className="flex-shrink-0">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/signup')}
                                className="bg-emerald-950 text-white px-10 py-5 rounded-2xl font-extrabold text-xl shadow-2xl hover:shadow-black/50 transition-all cursor-pointer border border-emerald-800"
                            >
                                Join Currently
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
