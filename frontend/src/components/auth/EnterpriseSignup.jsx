import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useDarkMode from '../../hooks/useDarkMode';

/**
 * EnterpriseSignup.jsx
 *
 * Enterprise Sign Up — For institutional buyers.
 * Mock signup with same design as EnterpriseLogin.
 */

const EnterpriseSignup = () => {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName) { setError('Company name is required'); return; }
    if (!formData.email) { setError('Email is required'); return; }
    if (!formData.password) { setError('Password is required'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const mockEnterprise = {
        uid: 'enterprise_' + Math.random().toString(36).substr(2, 9),
        email: formData.email,
        displayName: formData.companyName,
        userType: 'enterprise',
        companyName: formData.companyName,
        verificationStatus: 'pending',
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem('mockUser', JSON.stringify(mockEnterprise));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userType', 'enterprise');

      navigate('/dashboard/enterprise');
    } catch (err) {
      setError('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans flex items-center justify-center p-4 bg-background-light dark:bg-emerald-950 transition-colors duration-500">
      {/* Back Arrow */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/signup')}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 bg-white/60 dark:bg-white/10 backdrop-blur-xl text-emerald-800 dark:text-emerald-200 p-2 sm:p-3 rounded-full border border-emerald-900/10 dark:border-white/20 shadow-lg cursor-pointer transition-colors duration-500"
        aria-label="Back to signup"
      >
        <span className="material-icons-round text-xl">arrow_back</span>
      </motion.button>

      {/* Dark Mode Toggle */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 bg-white/60 dark:bg-white/10 backdrop-blur-xl text-primary p-2 sm:p-3 rounded-full border border-emerald-900/10 dark:border-white/20 shadow-lg cursor-pointer transition-colors duration-500"
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

      {/* Ambient Lighting Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-radial from-emerald-400/20 dark:from-emerald-400/20 to-transparent blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-500"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-radial from-emerald-600/20 dark:from-emerald-600/20 to-transparent blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-500"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/60 dark:bg-white/10 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/20 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-2xl shadow-emerald-950/20 dark:shadow-emerald-950/80 transition-colors duration-500">
          {/* Role Toggle */}
          <div className="mb-6 sm:mb-8">
            <p className="text-xs font-bold text-emerald-900/60 dark:text-emerald-200/60 uppercase tracking-widest mb-3 text-center transition-colors duration-500">
              Sign up as
            </p>
            <div className="flex gap-2 bg-white/40 dark:bg-black/20 p-1 rounded-xl border border-emerald-900/10 dark:border-white/10 transition-colors duration-500">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/signup')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-extrabold text-sm cursor-pointer transition-all duration-300 text-emerald-900/50 dark:text-emerald-200/50 hover:text-emerald-900/80 dark:hover:text-emerald-200/80"
              >
                <span className="material-icons-round text-lg">person</span>
                <span>User</span>
              </motion.button>
              <motion.button
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-extrabold text-sm cursor-default transition-all duration-300 bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 shadow-lg shadow-primary/20 border border-emerald-50 dark:border-white/20"
              >
                <span className="material-icons-round text-lg">domain</span>
                <span>Enterprise</span>
              </motion.button>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6 sm:mb-10">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 cursor-pointer"
            >
              <img src="/logo.jpg" alt="RecycleNow Logo" className="w-full h-full object-contain filter drop-shadow-lg rounded-2xl" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-white mb-2 tracking-tight transition-colors duration-500">
              Enterprise Sign Up
            </h1>
            <p className="text-emerald-900/70 dark:text-emerald-100/70 text-sm font-medium transition-colors duration-500">
              Create your enterprise account
            </p>
            <span className="inline-block mt-3 px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest rounded-full border border-primary/20 dark:border-primary/30">
              Enterprise Portal
            </span>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-6 bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 dark:border-red-500/30 rounded-xl px-4 py-3 flex items-start gap-3"
              >
                <span className="material-icons-round text-red-500 text-lg mt-0.5 flex-shrink-0">error</span>
                <p className="text-red-700 dark:text-red-300 text-sm font-medium flex-1">{error}</p>
                <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 cursor-pointer flex-shrink-0">
                  <span className="material-icons-round text-base">close</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <label className="text-xs font-bold text-emerald-900/80 dark:text-emerald-200/80 uppercase tracking-widest ml-1 transition-colors duration-500">Company Name</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Demo Manufacturing Inc."
                  className="relative w-full bg-white/50 dark:bg-black/20 border border-emerald-900/10 dark:border-white/10 rounded-xl px-4 py-3.5 text-emerald-950 dark:text-white placeholder-emerald-900/40 dark:placeholder-emerald-200/30 focus:outline-none focus:border-primary/50 focus:bg-white/80 dark:focus:bg-black/40 transition-all font-medium duration-500"
                />
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <label className="text-xs font-bold text-emerald-900/80 dark:text-emerald-200/80 uppercase tracking-widest ml-1 transition-colors duration-500">Company Email</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="company@example.com"
                  className="relative w-full bg-white/50 dark:bg-black/20 border border-emerald-900/10 dark:border-white/10 rounded-xl px-4 py-3.5 text-emerald-950 dark:text-white placeholder-emerald-900/40 dark:placeholder-emerald-200/30 focus:outline-none focus:border-primary/50 focus:bg-white/80 dark:focus:bg-black/40 transition-all font-medium duration-500"
                />
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <label className="text-xs font-bold text-emerald-900/80 dark:text-emerald-200/80 uppercase tracking-widest ml-1 transition-colors duration-500">Password</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••"
                  className="relative w-full bg-white/50 dark:bg-black/20 border border-emerald-900/10 dark:border-white/10 rounded-xl px-4 py-3.5 pr-12 text-emerald-950 dark:text-white placeholder-emerald-900/40 dark:placeholder-emerald-200/30 focus:outline-none focus:border-primary/50 focus:bg-white/80 dark:focus:bg-black/40 transition-all font-medium duration-500"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-emerald-900/40 dark:text-emerald-200/40 hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="material-icons-round text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
              <label className="text-xs font-bold text-emerald-900/80 dark:text-emerald-200/80 uppercase tracking-widest ml-1 transition-colors duration-500">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••"
                  className="relative w-full bg-white/50 dark:bg-black/20 border border-emerald-900/10 dark:border-white/10 rounded-xl px-4 py-3.5 pr-12 text-emerald-950 dark:text-white placeholder-emerald-900/40 dark:placeholder-emerald-200/30 focus:outline-none focus:border-primary/50 focus:bg-white/80 dark:focus:bg-black/40 transition-all font-medium duration-500"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-emerald-900/40 dark:text-emerald-200/40 hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="material-icons-round text-lg">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.03 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-extrabold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 dark:hover:shadow-primary/40 transition-all border border-emerald-50 dark:border-white/20 mt-4 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="material-icons-round text-lg">refresh</motion.span>
                  Creating Account…
                </>
              ) : (
                'Sign Up as Enterprise →'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-900/10 dark:border-white/10 transition-colors duration-500"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-transparent px-4 text-emerald-900/40 dark:text-emerald-200/40 text-xs font-bold uppercase tracking-widest transition-colors duration-500">Demo Access</span>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-xl px-4 py-3 mb-6">
            <div className="flex items-start gap-3">
              <span className="material-icons-round text-primary text-lg mt-0.5 flex-shrink-0">info</span>
              <div>
                <p className="text-emerald-900/80 dark:text-emerald-100/80 text-sm font-bold mb-1 transition-colors duration-500">🔓 Demo Mode</p>
                <p className="text-emerald-900/60 dark:text-emerald-100/60 text-xs font-medium transition-colors duration-500">
                  Sign up with any company details. This is a prototype to showcase enterprise features.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-emerald-900/60 dark:text-emerald-100/60 text-sm font-medium transition-colors duration-500">
              Already have an enterprise account?{' '}
              <button onClick={() => navigate('/login/enterprise')} className="text-primary font-bold hover:text-emerald-700 dark:hover:text-white transition-colors ml-1 cursor-pointer">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EnterpriseSignup;
