import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useDarkMode from '../../hooks/useDarkMode';

/**
 * RoleSelector.jsx
 *
 * Wraps existing login/signup pages with a role toggle (User | Enterprise).
 * Renders the existing AuthPage component unchanged below the toggle.
 * Selecting Enterprise redirects to /login/enterprise.
 *
 * Uses the original project design: emerald theme, glassmorphism,
 * Material Symbols icons, framer-motion, dark mode support.
 */

const RoleSelector = ({
  mode = 'login',
  LoginComponent = null,
  SignupComponent = null,
}) => {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [role, setRole] = useState('user');

  const handleEnterpriseSelect = () => {
    setRole('enterprise');
    if (mode === 'login') {
      navigate('/login/enterprise');
    }
  };

  const handleUserSelect = () => {
    setRole('user');
  };

  const UserComponent = mode === 'login' ? LoginComponent : SignupComponent;

  return (
    <div className="min-h-screen relative overflow-hidden font-sans bg-background-light dark:bg-emerald-950 transition-colors duration-500">
      {/* Ambient Lighting Orbs — matching AuthPage */}
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

      {/* Role Toggle Bar — sticky at top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-20 bg-white/60 dark:bg-white/10 backdrop-blur-2xl border-b border-emerald-900/10 dark:border-white/10 transition-colors duration-500"
      >
        <div className="max-w-md mx-auto px-4 py-4">
          {/* Label */}
          <p className="text-xs font-bold text-emerald-900/60 dark:text-emerald-200/60 uppercase tracking-widest mb-3 text-center transition-colors duration-500">
            {mode === 'login' ? 'Login as' : 'Sign up as'}
          </p>

          {/* Toggle Pills */}
          <div className="flex gap-2 bg-white/40 dark:bg-black/20 p-1 rounded-xl border border-emerald-900/10 dark:border-white/10 transition-colors duration-500">
            {/* User Tab */}
            <motion.button
              whileHover={{ scale: role === 'user' ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUserSelect}
              className={`
                flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg
                font-extrabold text-sm cursor-pointer transition-all duration-300
                ${role === 'user'
                  ? 'bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 shadow-lg shadow-primary/20 border border-emerald-50 dark:border-white/20'
                  : 'text-emerald-900/50 dark:text-emerald-200/50 hover:text-emerald-900/80 dark:hover:text-emerald-200/80'
                }
              `}
            >
              <span className="material-icons-round text-lg">person</span>
              <span>User</span>
            </motion.button>

            {/* Enterprise Tab */}
            <motion.button
              whileHover={{ scale: role === 'enterprise' ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEnterpriseSelect}
              className={`
                flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg
                font-extrabold text-sm cursor-pointer transition-all duration-300
                ${role === 'enterprise'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-lg shadow-blue-500/20 border border-blue-300 dark:border-blue-400/30'
                  : 'text-emerald-900/50 dark:text-emerald-200/50 hover:text-emerald-900/80 dark:hover:text-emerald-200/80'
                }
              `}
            >
              <span className="material-icons-round text-lg">domain</span>
              <span>Enterprise</span>
            </motion.button>
          </div>

          {/* Role description — subtle banner */}
          <motion.div
            key={role}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3"
          >
            {role === 'user' && (
              <div className="flex items-center gap-2 bg-primary/10 dark:bg-primary/20 rounded-lg px-3 py-2 border border-primary/20 dark:border-primary/30 transition-colors duration-500">
                <span className="material-icons-round text-primary text-sm">eco</span>
                <p className="text-xs font-bold text-emerald-900/70 dark:text-emerald-200/70 transition-colors duration-500">
                  Scan waste, list items for sale, receive offers & earn money.
                </p>
              </div>
            )}
            {role === 'enterprise' && (
              <div className="flex items-center gap-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg px-3 py-2 border border-blue-500/20 dark:border-blue-500/30 transition-colors duration-500">
                <span className="material-icons-round text-blue-500 text-sm">business</span>
                <p className="text-xs font-bold text-emerald-900/70 dark:text-emerald-200/70 transition-colors duration-500">
                  Buy waste in bulk, post requests, manage suppliers with analytics.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="relative z-10">
        {/* User Role: Render existing login/signup component unchanged */}
        {role === 'user' && UserComponent && (
          <UserComponent />
        )}

        {/* Enterprise Role: Show redirect card */}
        {role === 'enterprise' && (
          <div className="flex items-center justify-center p-4 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-full max-w-md"
            >
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/20 rounded-[2rem] p-8 shadow-2xl shadow-emerald-950/20 dark:shadow-emerald-950/80 text-center transition-colors duration-500">
                <div className="w-16 h-16 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons-round text-3xl text-blue-500">domain</span>
                </div>
                <h3 className="text-xl font-extrabold text-emerald-950 dark:text-white mb-2 tracking-tight transition-colors duration-500">
                  Enterprise Portal
                </h3>
                <p className="text-emerald-900/60 dark:text-emerald-100/60 text-sm font-medium mb-6 transition-colors duration-500">
                  Redirecting you to the enterprise login...
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login/enterprise')}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all border border-blue-300 dark:border-blue-400/30 cursor-pointer flex items-center justify-center gap-2"
                >
                  Go to Enterprise Login
                  <span className="material-icons-round text-lg">arrow_forward</span>
                </motion.button>
                <button
                  onClick={handleUserSelect}
                  className="w-full mt-4 py-2 text-sm font-bold text-emerald-900/50 dark:text-emerald-200/50 hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="material-icons-round text-xs align-middle mr-1">arrow_back</span>
                  Back to User Login
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSelector;
