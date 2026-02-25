// src/components/ProtectedRoute.jsx
// Firebase Auth protection: loading → spinner, unauth → /login, auth → children

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Auth state still resolving — show spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-emerald-950 transition-colors duration-500">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center border border-primary/20 dark:border-primary/30"
          >
            <span className="material-icons-round text-primary text-2xl">recycling</span>
          </motion.div>
          <p className="text-emerald-900/60 dark:text-emerald-100/60 text-sm font-bold uppercase tracking-widest transition-colors duration-500">
            Loading…
          </p>
        </motion.div>
      </div>
    );
  }

  // Not authenticated — redirect to /login, preserving the intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated — render children
  return <Outlet />;
}
