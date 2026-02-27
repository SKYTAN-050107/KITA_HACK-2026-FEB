// src/components/Sidebar.jsx
// Desktop: Fixed 256px→72px collapse with toggle. Mobile: overlay drawer via Framer Motion.

import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useIsMobile from '../hooks/useIsMobile';
import { useAuth } from '../contexts/AuthContext';
import useDarkMode from '../hooks/useDarkMode';
import DayNightToggle from './DayNightToggle';

// APP_FLOW.md §2 — 5 nav items
const NAV_ITEMS = [
  { label: 'Analytics', icon: 'analytics', path: '/dashboard', end: true },
  { label: 'Scanner', icon: 'camera_alt', path: '/dashboard/scanner' },
  { label: 'Map', icon: 'map', path: '/dashboard/map' },
  { label: 'History', icon: 'history', path: '/dashboard/history' },
  { label: 'Guidelines', icon: 'menu_book', path: '/dashboard/guidelines' },
  { label: 'Marketplace', icon: 'storefront', path: '/dashboard/marketplace' },
  { label: 'Settings', icon: 'settings', path: '/dashboard/settings' },
];

// Enterprise-specific nav items
const ENTERPRISE_NAV_ITEMS = [
  { label: 'Overview', icon: 'bar_chart', path: '/dashboard/enterprise', end: true },
  { label: 'Pricing Tiers', icon: 'attach_money', path: '/dashboard/enterprise/pricing' },
  { label: 'Analytics', icon: 'pie_chart', path: '/dashboard/enterprise/analytics' },
];

const EXPANDED_WIDTH = 256;
const COLLAPSED_WIDTH = 72;

export default function Sidebar({ mobileOpen = false, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();

  // Detect enterprise context from URL
  const isEnterprise = location.pathname.startsWith('/dashboard/enterprise');
  const navItems = isEnterprise ? ENTERPRISE_NAV_ITEMS : NAV_ITEMS;

  // Enterprise mock user from localStorage
  const enterpriseUser = isEnterprise
    ? JSON.parse(localStorage.getItem('mockUser') || '{}')
    : null;

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

  const handleLogout = async () => {
    if (isEnterprise) {
      localStorage.removeItem('mockUser');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userType');
      navigate('/');
      return;
    }
    navigate('/');
    try {
      await logout();
    } catch {
      // Already on landing page
    }
  };

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  /* ─── Shared nav content (used by both desktop & mobile) ─── */
  const brandPath = isEnterprise ? '/dashboard/enterprise' : '/dashboard';

  const renderBrand = () => (
    <NavLink to={brandPath} className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} mb-10 group`}>
      <div className="relative w-12 h-12 flex-shrink-0 transition-all duration-300 group-hover:scale-105">
        <img
          src="/logo.jpg"
          alt="RecycleNow Logo"
          className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(16,185,129,0.2)] rounded-xl"
        />
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
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            `relative flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 group ${showLabels ? '' : 'justify-center'} ${isActive
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
                className={`material-icons-round text-xl transition-all flex-shrink-0 ${isActive
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
    <div className="mt-auto pt-6 border-t border-emerald-900/10 dark:border-white/10 transition-colors duration-500 flex flex-col gap-4">
      {/* Theme Toggle - 1:1 Design from Settings */}
      <div className={`flex flex-col items-center px-2 ${showLabels ? '' : 'overflow-hidden'}`}>
        {showLabels && (
          <div className="w-full flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-emerald-800/50 dark:text-emerald-100/40 uppercase tracking-wider">Appearance</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 transition-colors">
              {isDark ? 'NIGHT' : 'DAY'}
            </span>
          </div>
        )}
        <div
          className="transition-all duration-500 origin-center"
          style={{
            transform: showLabels ? 'scale(1)' : 'scale(0.5)',
            margin: showLabels ? '0' : '-10px 0'
          }}
        >
          <DayNightToggle isDark={isDark} onToggle={toggleDarkMode} />
        </div>
      </div>

      <div className={`flex items-center ${showLabels ? 'gap-3' : 'justify-center'}`}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-emerald-400 p-0.5 shadow-lg shadow-primary/30 flex-shrink-0">
          <div className="w-full h-full bg-emerald-50 dark:bg-emerald-950 rounded-full flex items-center justify-center border-[3px] border-emerald-50 dark:border-emerald-950 transition-colors duration-500 overflow-hidden">
            {isEnterprise ? (
              <span className="material-icons-round text-primary text-base">domain</span>
            ) : user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="material-icons-round text-primary text-base">person</span>
            )}
          </div>
        </div>
        {showLabels && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-emerald-950 dark:text-white truncate transition-colors duration-500">
              {isEnterprise ? (enterpriseUser?.displayName || 'Enterprise') : (user?.displayName || 'User')}
            </p>
            <p className="text-xs text-emerald-800/50 dark:text-emerald-100/40 transition-colors duration-500">
              {isEnterprise ? 'Enterprise' : 'Eco Warrior'}
            </p>
          </div>
        )}
      </div>
      {showLabels && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 dark:text-red-400 bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 dark:border-red-500/20 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-all cursor-pointer"
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
