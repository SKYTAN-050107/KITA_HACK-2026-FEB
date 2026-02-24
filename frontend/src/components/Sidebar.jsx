// src/components/Sidebar.jsx
// Placeholder sidebar — full implementation in Step 2 (collapse/expand, mobile drawer, active states).

import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Analytics', icon: 'analytics', path: '/dashboard', end: true },
  { label: 'Scanner',   icon: 'camera_alt', path: '/dashboard/scanner' },
  { label: 'Map',       icon: 'map',        path: '/dashboard/map' },
  { label: 'History',   icon: 'history',     path: '/dashboard/history' },
  { label: 'Guidelines', icon: 'menu_book',  path: '/dashboard/guidelines' },
  { label: 'Settings',  icon: 'settings',    path: '/dashboard/settings' },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-r border-emerald-900/10 dark:border-white/10 p-6 transition-colors duration-500">
      {/* Brand */}
      <NavLink to="/dashboard" className="flex items-center gap-2 mb-10 group">
        <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-xl border border-primary/20 dark:border-primary/30 group-hover:bg-primary transition-colors">
          <span className="material-icons-round text-primary text-xl group-hover:text-emerald-50 dark:group-hover:text-emerald-950 transition-colors">recycling</span>
        </div>
        <span className="text-xl font-extrabold tracking-tight text-emerald-950 dark:text-white group-hover:text-primary transition-colors">
          Recycle<span className="text-primary font-extrabold">Now</span>
        </span>
      </NavLink>

      {/* Nav Links */}
      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 group ${
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-emerald-800/70 dark:text-emerald-100/60 hover:bg-primary/5 dark:hover:bg-white/5 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`material-icons-round text-xl transition-colors ${isActive ? 'text-primary' : 'text-emerald-800/50 dark:text-emerald-100/40 group-hover:text-primary'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer placeholder */}
      <div className="mt-auto pt-6 border-t border-emerald-900/10 dark:border-white/10 transition-colors duration-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-emerald-400 p-0.5 shadow-lg shadow-primary/30">
            <div className="w-full h-full bg-emerald-50 dark:bg-emerald-950 rounded-full flex items-center justify-center border-[3px] border-emerald-50 dark:border-emerald-950 transition-colors duration-500">
              <span className="material-icons-round text-primary text-base">person</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-emerald-950 dark:text-white truncate transition-colors duration-500">User</p>
            <p className="text-xs text-emerald-800/50 dark:text-emerald-100/40 transition-colors duration-500">Eco Warrior</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
