import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useDarkMode from '../hooks/useDarkMode';
import { useAuth } from '../contexts/AuthContext';

// ── Zod Schemas ──
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const signupSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Please confirm your password.'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
});

const AuthPage = ({ defaultMode = 'login' }) => {
    const navigate = useNavigate();
    const { isDark, toggleDarkMode } = useDarkMode();
    const { user, loginWithEmail, signupWithEmail, loginWithGoogle, resetPassword, error: authError, clearError } = useAuth();
    const [isLogin, setIsLogin] = useState(defaultMode === 'login');
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [forgotOpen, setForgotOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotSent, setForgotSent] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (user) navigate('/dashboard', { replace: true });
    }, [user, navigate]);

    // Switch between login/signup forms — reset fields
    const loginForm = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
    const signupForm = useForm({ resolver: zodResolver(signupSchema), defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' } });
    const form = isLogin ? loginForm : signupForm;

    // Reset forms when toggling mode
    useEffect(() => {
        loginForm.reset();
        signupForm.reset();
        clearError();
        setShowPassword(false);
        setShowConfirmPassword(false);
    }, [isLogin]);

    const handleAuth = async (data) => {
        setSubmitting(true);
        try {
            if (isLogin) {
                await loginWithEmail(data.email, data.password);
            } else {
                await signupWithEmail(data.email, data.password, data.fullName);
            }
            navigate('/dashboard');
        } catch {
            // Error is set in AuthContext
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        setSubmitting(true);
        try {
            await loginWithGoogle();
            navigate('/dashboard');
        } catch {
            // Error is set in AuthContext
        } finally {
            setSubmitting(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!forgotEmail) return;
        try {
            await resetPassword(forgotEmail);
            setForgotSent(true);
        } catch {
            // Error is set in AuthContext
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden font-sans flex items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-950 transition-colors duration-500">
            {/* Back Arrow */}
            <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/')}
                className="fixed top-6 left-6 z-50 bg-white/60 dark:bg-white/10 backdrop-blur-xl text-emerald-800 dark:text-emerald-200 p-3 rounded-full border border-emerald-900/10 dark:border-white/20 shadow-lg cursor-pointer transition-colors duration-500"
                aria-label="Back to landing"
            >
                <span className="material-icons-round text-xl">arrow_back</span>
            </motion.button>

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

                    {/* Error Banner */}
                    <AnimatePresence>
                        {authError && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                className="mb-6 bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 dark:border-red-500/30 rounded-xl px-4 py-3 flex items-start gap-3"
                            >
                                <span className="material-icons-round text-red-500 text-lg mt-0.5 flex-shrink-0">error</span>
                                <p className="text-red-700 dark:text-red-300 text-sm font-medium flex-1">{authError}</p>
                                <button onClick={clearError} className="text-red-500 hover:text-red-700 cursor-pointer flex-shrink-0">
                                    <span className="material-icons-round text-base">close</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={form.handleSubmit(handleAuth)} className="space-y-5">
                        {/* Full Name (signup only) */}
                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    <label className="text-xs font-bold text-emerald-900/80 dark:text-emerald-200/80 uppercase tracking-widest ml-1 transition-colors duration-500">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                                        <input
                                            type="text"
                                            {...signupForm.register('fullName')}
                                            placeholder="Ahmad Rizal"
                                            className="relative w-full bg-white/50 dark:bg-black/20 border border-emerald-900/10 dark:border-white/10 rounded-xl px-4 py-3.5 text-emerald-950 dark:text-white placeholder-emerald-900/40 dark:placeholder-emerald-200/30 focus:outline-none focus:border-primary/50 focus:bg-white/80 dark:focus:bg-black/40 transition-all font-medium duration-500"
                                        />
                                    </div>
                                    {signupForm.formState.errors.fullName && (
                                        <p className="text-red-500 text-xs font-medium ml-1">{signupForm.formState.errors.fullName.message}</p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                            <label className="text-xs font-bold text-emerald-900/80 dark:text-emerald-200/80 uppercase tracking-widest ml-1 transition-colors duration-500">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                                <input
                                    type="email"
                                    {...form.register('email')}
                                    placeholder="name@example.com"
                                    className="relative w-full bg-white/50 dark:bg-black/20 border border-emerald-900/10 dark:border-white/10 rounded-xl px-4 py-3.5 text-emerald-950 dark:text-white placeholder-emerald-900/40 dark:placeholder-emerald-200/30 focus:outline-none focus:border-primary/50 focus:bg-white/80 dark:focus:bg-black/40 transition-all font-medium duration-500"
                                />
                            </div>
                            {form.formState.errors.email && (
                                <p className="text-red-500 text-xs font-medium ml-1">{form.formState.errors.email.message}</p>
                            )}
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                            <label className="text-xs font-bold text-emerald-900/80 dark:text-emerald-200/80 uppercase tracking-widest ml-1 transition-colors duration-500">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    {...form.register('password')}
                                    placeholder="••••••••"
                                    className="relative w-full bg-white/50 dark:bg-black/20 border border-emerald-900/10 dark:border-white/10 rounded-xl px-4 py-3.5 pr-12 text-emerald-950 dark:text-white placeholder-emerald-900/40 dark:placeholder-emerald-200/30 focus:outline-none focus:border-primary/50 focus:bg-white/80 dark:focus:bg-black/40 transition-all font-medium duration-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-emerald-900/40 dark:text-emerald-200/40 hover:text-primary transition-colors cursor-pointer"
                                >
                                    <span className="material-icons-round text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                            {form.formState.errors.password && (
                                <p className="text-red-500 text-xs font-medium ml-1">{form.formState.errors.password.message}</p>
                            )}
                        </motion.div>

                        {/* Confirm Password (signup only) */}
                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    <label className="text-xs font-bold text-emerald-900/80 dark:text-emerald-200/80 uppercase tracking-widest ml-1 transition-colors duration-500">Confirm Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            {...signupForm.register('confirmPassword')}
                                            placeholder="••••••••"
                                            className="relative w-full bg-white/50 dark:bg-black/20 border border-emerald-900/10 dark:border-white/10 rounded-xl px-4 py-3.5 pr-12 text-emerald-950 dark:text-white placeholder-emerald-900/40 dark:placeholder-emerald-200/30 focus:outline-none focus:border-primary/50 focus:bg-white/80 dark:focus:bg-black/40 transition-all font-medium duration-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-emerald-900/40 dark:text-emerald-200/40 hover:text-primary transition-colors cursor-pointer"
                                        >
                                            <span className="material-icons-round text-lg">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                    {signupForm.formState.errors.confirmPassword && (
                                        <p className="text-red-500 text-xs font-medium ml-1">{signupForm.formState.errors.confirmPassword.message}</p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {isLogin && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setForgotOpen(true); setForgotSent(false); setForgotEmail(''); }}
                                    className="text-xs font-bold tracking-wide text-primary hover:text-emerald-600 dark:hover:text-emerald-200 transition-colors cursor-pointer"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <motion.button
                            whileHover={{ scale: submitting ? 1 : 1.03 }}
                            whileTap={{ scale: submitting ? 1 : 0.98 }}
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-extrabold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 dark:hover:shadow-primary/40 transition-all border border-emerald-50 dark:border-white/20 mt-4 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="material-icons-round text-lg"
                                    >refresh</motion.span>
                                    {isLogin ? 'Signing In…' : 'Creating Account…'}
                                </>
                            ) : (
                                isLogin ? 'Sign In' : 'Create Account'
                            )}
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
                            { name: 'Google', icon: 'https://www.svgrepo.com/show/475656/google-color.svg', action: handleGoogleLogin },
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
                                onClick={social.action}
                                disabled={submitting}
                                className="flex items-center justify-center gap-2 bg-white/40 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 rounded-xl py-3 cursor-pointer transition-colors duration-500 hover:dark:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Forgot Password Modal */}
            <AnimatePresence>
                {forgotOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setForgotOpen(false)}
                            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[90%] max-w-sm bg-white/90 dark:bg-emerald-950/90 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/20 rounded-3xl p-8 shadow-2xl transition-colors duration-500"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-extrabold text-emerald-950 dark:text-white tracking-tight transition-colors duration-500">Reset Password</h3>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setForgotOpen(false)}
                                    className="text-emerald-800/40 dark:text-emerald-200/40 hover:text-primary transition-colors cursor-pointer"
                                >
                                    <span className="material-icons-round">close</span>
                                </motion.button>
                            </div>
                            {forgotSent ? (
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-icons-round text-3xl text-primary">mark_email_read</span>
                                    </div>
                                    <p className="text-emerald-900 dark:text-emerald-100 font-bold mb-2 transition-colors duration-500">Check your inbox</p>
                                    <p className="text-emerald-900/60 dark:text-emerald-100/60 text-sm transition-colors duration-500">We sent a password reset link to <strong>{forgotEmail}</strong></p>
                                </div>
                            ) : (
                                <form onSubmit={handleForgotPassword} className="space-y-4">
                                    <p className="text-emerald-900/60 dark:text-emerald-100/60 text-sm font-medium transition-colors duration-500">
                                        Enter your email address and we'll send you a reset link.
                                    </p>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                                        <input
                                            type="email"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            placeholder="name@example.com"
                                            className="relative w-full bg-white/50 dark:bg-black/20 border border-emerald-900/10 dark:border-white/10 rounded-xl px-4 py-3.5 text-emerald-950 dark:text-white placeholder-emerald-900/40 dark:placeholder-emerald-200/30 focus:outline-none focus:border-primary/50 focus:bg-white/80 dark:focus:bg-black/40 transition-all font-medium duration-500"
                                            required
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-extrabold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all border border-emerald-50 dark:border-white/20 cursor-pointer"
                                    >
                                        Send Reset Link
                                    </motion.button>
                                </form>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AuthPage;
