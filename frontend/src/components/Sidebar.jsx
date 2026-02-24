// src/components/Sidebar.jsx
// Desktop: Fixed 256px→72px collapse with toggle. Mobile: overlay drawer via Framer Motion.

import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useIsMobile from '../hooks/useIsMobile';

// APP_FLOW.md §2 — 5 nav items
const NAV_ITEMS = [
  { label: 'Analytics', icon: 'analytics',  path: '/dashboard',          end: true },
  { label: 'Scanner',   icon: 'camera_alt', path: '/dashboard/scanner' },
  { label: 'Map',       icon: 'map',        path: '/dashboard/map' },
  { label: 'History',   icon: 'history',     path: '/dashboard/history' },
  { label: 'Settings',  icon: 'settings',    path: '/dashboard/settings' },
];

const EXPANDED_WIDTH = 256;
const COLLAPSED_WIDTH = 72;

export default function Sidebar({ mobileOpen = false, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-dismiss mobile drawer on nav
  useEffect(() => {
    if (isMobile && mobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    if (!isMobile || !mobileOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onMobileClose?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isMobile, mobileOpen, onMobileClose]);

  const handleLogout = () => {
    // TODO (Step 4): signOut(auth) → /
    navigate('/');
  };

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  /* ─── Shared nav content (used by both desktop & mobile) ─── */
  const renderBrand = () => (
    <NavLink to="/dashboard" className="flex items-center gap-2 mb-10 group">
      <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-xl border border-primary/20 dark:border-primary/30 group-hover:bg-primary transition-colors flex-shrink-0">
        <span className="material-icons-round text-primary text-xl group-hover:text-emerald-50 dark:group-hover:text-emerald-950 transition-colors">recycling</span>
      </div>
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          className="text-xl font-extrabold tracking-tight text-emerald-950 dark:text-white group-hover:text-primary transition-colors whitespace-nowrap"
        >
          Recycle<span className="text-primary font-extrabold">Now</span>
        </motion.span>
      )}
    </NavLink>
  );

  const renderNav = (showLabels = true) => (
    <nav className="flex-1 space-y-2">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            `relative flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 group ${showLabels ? '' : 'justify-center'} ${
              isActive
                ? 'bg-primary/15 text-primary border border-primary/20'
                : 'text-emerald-800/70 dark:text-emerald-100/60 hover:bg-primary/5 dark:hover:bg-white/5 border border-transparent'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {/* Active indicator bar (left edge) */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-bar"
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-primary to-emerald-400"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span
                className={`material-icons-round text-xl transition-all flex-shrink-0 ${
                  isActive
                    ? 'text-primary'
                    : 'text-emerald-800/50 dark:text-emerald-100/40 group-hover:text-primary'
                } ${item.icon === 'settings' ? 'group-hover:rotate-90 transition-transform duration-500' : ''}`}
              >
                {item.icon}
              </span>
              {showLabels && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  const renderFooter = (showLabels = true) => (
    <div className="mt-auto pt-6 border-t border-emerald-900/10 dark:border-white/10 transition-colors duration-500">
      <div className={`flex items-center ${showLabels ? 'gap-3' : 'justify-center'}`}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-emerald-400 p-0.5 shadow-lg shadow-primary/30 flex-shrink-0">
          <div className="w-full h-full bg-emerald-50 dark:bg-emerald-950 rounded-full flex items-center justify-center border-[3px] border-emerald-50 dark:border-emerald-950 transition-colors duration-500">
            <span className="material-icons-round text-primary text-base">person</span>
          </div>
        </div>
        {showLabels && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-emerald-950 dark:text-white truncate transition-colors duration-500">User</p>
            <p className="text-xs text-emerald-800/50 dark:text-emerald-100/40 transition-colors duration-500">Eco Warrior</p>
          </div>
        )}
      </div>
      {showLabels && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 dark:text-red-400 bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 dark:border-red-500/20 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-all cursor-pointer"
        >
          <span className="material-icons-round text-lg">logout</span>
          Logout
        </motion.button>
      )}
    </div>
  );

  /* ─── Mobile: overlay drawer ─── */
  if (isMobile) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: -EXPANDED_WIDTH }}
              animate={{ x: 0 }}
              exit={{ x: -EXPANDED_WIDTH }}
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              className="fixed top-0 left-0 bottom-0 z-[70] flex flex-col bg-white/95 dark:bg-emerald-950/95 backdrop-blur-2xl border-r border-emerald-900/10 dark:border-white/10 p-6 shadow-2xl transition-colors duration-500"
              style={{ width: EXPANDED_WIDTH }}
            >
              {/* Close button */}
              <div className="flex justify-end mb-2">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onMobileClose}
                  className="bg-primary/10 dark:bg-primary/20 text-primary w-10 h-10 rounded-full flex items-center justify-center border border-primary/20 dark:border-primary/30 cursor-pointer transition-colors"
                >
                  <span className="material-icons-round text-xl">close</span>
                </motion.button>
              </div>

              {renderBrand()}
              {renderNav(true)}
              {renderFooter(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  /* ─── Desktop: fixed panel with collapse toggle ─── */
  return (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={{ type: 'spring', stiffness: 350, damping: 32 }}
      className="hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-r border-emerald-900/10 dark:border-white/10 p-4 relative select-none transition-colors duration-500 overflow-hidden"
    >
      <div className={`flex flex-col h-full ${collapsed ? 'items-center px-0' : 'px-2'}`}>
        {renderBrand()}
        {renderNav(!collapsed)}
        {renderFooter(!collapsed)}
      </div>

      {/* Toggle button — sticks out on the right edge */}
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCollapsed(prev => !prev)}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-white dark:bg-emerald-950 border border-emerald-900/10 dark:border-white/10 shadow-lg flex items-center justify-center text-emerald-800 dark:text-emerald-200 cursor-pointer transition-colors duration-500 hover:bg-primary/10 dark:hover:bg-primary/20"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <motion.span
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="material-icons-round text-base"
        >
          chevron_left
        </motion.span>
      </motion.button>
    </motion.aside>
  );
}
