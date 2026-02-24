import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useDarkMode from '../hooks/useDarkMode';

const AuthPage = ({ defaultMode = 'login' }) => {
    const navigate = useNavigate();
    const { isDark, toggleDarkMode } = useDarkMode();
    const [isLogin, setIsLogin] = useState(defaultMode === 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAuth = (e) => {
        e.preventDefault();
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen relative overflow-hidden font-sans flex items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-950 transition-colors duration-500">
            {/* Dark Mode Toggle */}
            <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleDarkMode}
                className="fixed top-6 right-6 z-50 bg-white/60 dark:bg-white/10 backdrop-blur-xl text-primary p-3 rounded-full border border-emerald-900/10 dark:border-white/20 shadow-lg cursor-pointer transition-colors duration-500"
                aria-label="Toggle dark mode"
            >
                <motion.span
                    key={isDark ? 'dark' : 'light'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="material-icons-round text-xl"
                >
                    {isDark ? 'light_mode' : 'dark_mode'}
                </motion.span>
            </motion.button>

            {/* Background Image */}
            <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.2, scale: 1 }}
                transition={{ duration: 2 }}
                className="absolute inset-0 z-0 mix-blend-overlay dark:opacity-40 pointer-events-none transition-opacity duration-500"
                style={{
                    backgroundImage: `url('/auth-bg.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* Ambient Lighting Orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-radial from-emerald-400/20 dark:from-emerald-400/20 to-transparent blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-500"
                ></motion.div>
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-radial from-emerald-600/20 dark:from-emerald-600/20 to-transparent blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-500"
                ></motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-full max-w-md relative z-10 perspective-1000"
            >
                <div className="bg-white/60 dark:bg-white/10 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/20 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-emerald-950/20 dark:shadow-emerald-950/80 transition-colors duration-500">
                    {/* Header */}
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={isLogin ? 'login' : 'register'}
                            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                            transition={{ duration: 0.3 }}
                            className="text-center mb-10"
                        >
                            <motion.div
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.5 }}
                                className="w-20 h-20 bg-gradient-to-br from-primary/10 to-emerald-600/10 dark:from-primary/20 dark:to-emerald-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-emerald-900/5 dark:border-white/10 shadow-inner cursor-pointer transition-colors duration-500"
                            >
                                <span className="material-icons-round text-5xl text-primary drop-shadow-sm dark:drop-shadow-lg transition-colors duration-500">eco</span>
                            </motion.div>
                            <h1 className="text-3xl font-extrabold text-emerald-950 dark:text-white mb-2 tracking-tight transition-colors duration-500">
                                {isLogin ? 'Welcome Back' : 'Join the Movement'}
                            </h1>
                            <p className="text-emerald-900/70 dark:text-emerald-100/70 text-sm font-medium transition-colors duration-500">
                                {isLogin ? 'Sign in to access your dashboard' : 'Start your sustainable journey today'}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleAuth} className="space-y-6">
                        <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                            <label className="text-xs font-bold text-emerald-900/80 dark:text-emerald-200/80 uppercase tracking-widest ml-1 transition-colors duration-500">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="relative w-full bg-white/50 dark:bg-black/20 border border-emerald-900/10 dark:border-white/10 rounded-xl px-4 py-3.5 text-emerald-950 dark:text-white placeholder-emerald-900/40 dark:placeholder-emerald-200/30 focus:outline-none focus:border-primary/50 focus:bg-white/80 dark:focus:bg-black/40 transition-all font-medium duration-500"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                            <label className="text-xs font-bold text-emerald-900/80 dark:text-emerald-200/80 uppercase tracking-widest ml-1 transition-colors duration-500">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="relative w-full bg-white/50 dark:bg-black/20 border border-emerald-900/10 dark:border-white/10 rounded-xl px-4 py-3.5 text-emerald-950 dark:text-white placeholder-emerald-900/40 dark:placeholder-emerald-200/30 focus:outline-none focus:border-primary/50 focus:bg-white/80 dark:focus:bg-black/40 transition-all font-medium duration-500"
                                    required
                                />
                            </div>
                        </motion.div>

                        {isLogin && (
                            <div className="flex justify-end">
                                <button type="button" className="text-xs font-bold tracking-wide text-primary hover:text-emerald-600 dark:hover:text-emerald-200 transition-colors">
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-extrabold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 dark:hover:shadow-primary/40 transition-all border border-emerald-50 dark:border-white/20 mt-4 cursor-pointer"
                        >
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-emerald-900/10 dark:border-white/10 transition-colors duration-500"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-transparent px-4 text-emerald-900/40 dark:text-emerald-200/40 text-xs font-bold uppercase tracking-widest transition-colors duration-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Auth */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { name: 'Google', icon: 'https://www.svgrepo.com/show/475656/google-color.svg' },
                            { name: 'Apple', icon: 'apple', isIcon: true },
                            { name: 'Meta', icon: 'facebook', isIcon: true, color: 'text-blue-500 dark:text-blue-400' }
                        ].map((social, i) => (
                            <motion.button
                                key={social.name}
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(16,185,129,0.1)' }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                className="flex items-center justify-center gap-2 bg-white/40 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 rounded-xl py-3 cursor-pointer transition-colors duration-500 hover:dark:bg-white/10"
                            >
                                {social.isIcon ? (
                                    <span className={`material-icons-round text-xl ${social.color || 'text-emerald-950 dark:text-white transition-colors duration-500'}`}>{social.icon}</span>
                                ) : (
                                    <img src={social.icon} className="w-5 h-5" alt={social.name} />
                                )}
                            </motion.button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-emerald-900/60 dark:text-emerald-100/60 text-sm font-medium transition-colors duration-500">
                            {isLogin ? "New here? " : "Already a member? "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-primary font-bold hover:text-emerald-700 dark:hover:text-white transition-colors ml-1 cursor-pointer"
                            >
                                {isLogin ? 'Create account' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
