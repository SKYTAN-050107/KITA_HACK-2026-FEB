// src/pages/Dashboard.jsx

import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const handleLogout = async () => {
    navigate('/');
    try {
      await logout();
    } catch {
      // Already on landing page
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-500"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-12">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-extrabold text-emerald-950 dark:text-white mb-1 tracking-tight transition-colors duration-500"
          >
            Good Evening, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-primary dark:from-emerald-400 dark:to-primary">{displayName}</span>
          </motion.h1>
          <p className="text-emerald-800/60 dark:text-emerald-100/60 font-medium transition-colors duration-500">Ready to make an impact today?</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(16,185,129,0.1)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="bg-white/50 dark:bg-white/5 text-emerald-900/90 dark:text-emerald-100/90 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-emerald-900/10 dark:border-white/10 shadow-lg backdrop-blur-md hover:dark:bg-white/10"
        >
          Logout
        </motion.button>
      </motion.div>

      {/* Main Action Grid */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Scanner Card - MAIN ACTION */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 relative group cursor-pointer"
          onClick={() => navigate('/dashboard/scanner')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-emerald-600/5 dark:from-primary/30 dark:to-emerald-600/10 rounded-[2.5rem] blur-2xl group-hover:blur-3xl group-hover:from-primary/30 dark:group-hover:from-primary/40 transition-all duration-700"></div>
          <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            className="relative h-full bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden shadow-2xl shadow-emerald-900/10 dark:shadow-emerald-900/50 transition-colors duration-500"
          >
            {/* Animated Icon Background */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="absolute -top-20 -right-20 p-10 opacity-5 dark:opacity-5 pointer-events-none"
            >
              <span className="material-icons-round text-[20rem] text-primary">center_focus_weak</span>
            </motion.div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-emerald-500/5 dark:from-primary/20 dark:to-emerald-500/10 text-primary text-xs font-bold mb-6 border border-primary/20 dark:border-primary/30 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></span>
                AI ENABLED VISION
              </div>
              <h2 className="text-5xl font-extrabold text-emerald-950 dark:text-white mb-4 tracking-tight drop-shadow-sm dark:drop-shadow-md transition-colors duration-500">Scan Waste</h2>
              <p className="text-lg text-emerald-900/70 dark:text-emerald-100/70 max-w-md mb-8 font-medium leading-relaxed transition-colors duration-500">
                Aim your camera. Our advanced AI instantly identifies waste types, estimates carbon offset, and finds the right bin.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 px-8 py-5 rounded-2xl font-extrabold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 dark:hover:shadow-primary/40 transition-all flex items-center justify-center gap-3 border border-white/40 dark:border-white/20"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="material-icons-round"
              >
                qr_code_scanner
              </motion.span>
              Launch AI Scanner
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Side Actions */}
        <div className="space-y-8 flex flex-col">
          {/* Map Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-emerald-900/10 dark:border-white/10 rounded-[2rem] p-8 shadow-xl shadow-black/5 dark:shadow-black/20 group cursor-pointer relative overflow-hidden transition-colors duration-500"
            onClick={() => navigate('/dashboard/map')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400/10 to-blue-600/10 dark:from-blue-400/20 dark:to-blue-600/20 flex items-center justify-center text-blue-500 dark:text-blue-400 border border-blue-400/20 shadow-inner"
                >
                  <span className="material-icons-round text-3xl">map</span>
                </motion.div>
                <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white text-emerald-900/40 dark:text-white/40 transition-all duration-300">
                  <span className="material-icons-round group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-emerald-950 dark:text-white mb-2 transition-colors duration-500">Find Centers</h3>
              <p className="text-emerald-900/60 dark:text-emerald-100/60 text-sm font-medium transition-colors duration-500">Locate nearest recycling hubs & drops.</p>
            </div>
          </motion.div>

          {/* Impact Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -5 }}
            className="flex-1 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-emerald-900/10 dark:border-white/10 rounded-[2rem] p-8 shadow-xl shadow-black/5 dark:shadow-black/20 group relative overflow-hidden transition-colors duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400/10 to-purple-600/10 dark:from-purple-400/20 dark:to-purple-600/20 flex items-center justify-center text-purple-500 dark:text-purple-400 border border-purple-400/20 shadow-inner"
                >
                  <span className="material-icons-round text-3xl">emoji_events</span>
                </motion.div>
                <div className="text-right">
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-400 dark:from-purple-400 dark:to-pink-300">1,250</span>
                  <p className="text-emerald-900/40 dark:text-emerald-100/40 text-xs font-bold uppercase tracking-widest mt-1 transition-colors duration-500">Total Points</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-emerald-950 dark:text-white mb-4 transition-colors duration-500">Impact Level 4</h3>
              <div className="w-full bg-black/5 dark:bg-black/40 rounded-full h-3 backdrop-blur-sm border border-emerald-900/5 dark:border-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  className="bg-gradient-to-r from-purple-500 via-pink-400 to-primary h-full rounded-full relative"
                >
                  <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 blur-sm"></div>
                </motion.div>
              </div>
              <p className="text-emerald-900/50 dark:text-emerald-100/50 text-xs font-bold mt-3 tracking-wide transition-colors duration-500">65% TO LEVEL 5 (ECO-WARRIOR)</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Activity / Stats */}
      <motion.div
        variants={itemVariants}
        className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden transition-colors duration-500"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 dark:bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h3 className="text-2xl font-bold text-emerald-950 dark:text-white tracking-tight transition-colors duration-500">Recent Activity</h3>
          <button className="text-primary text-sm font-bold hover:text-emerald-800 dark:hover:text-white transition-colors flex items-center gap-1">
            View All <span className="material-icons-round text-sm">chevron_right</span>
          </button>
        </div>

        <div className="space-y-4 relative z-10">
          {[
            { icon: 'recycling', color: 'text-primary', bg: 'bg-primary/10 dark:bg-primary/20', border: 'border-primary/20', title: 'Recycled Plastic Bottle', time: '2 hours ago', points: '+50' },
            { icon: 'center_focus_weak', color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-400/10 dark:bg-blue-400/20', border: 'border-blue-400/20', title: 'AI Verified Bin Type', time: '5 hours ago', points: '+20' },
            { icon: 'map', color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-400/10 dark:bg-orange-400/20', border: 'border-orange-400/20', title: 'Visited Collection Point', time: '1 day ago', points: '+100' },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.01, x: 5, backgroundColor: 'rgba(16,185,129,0.05)' }}
              className="flex items-center justify-between p-5 rounded-2xl bg-white/40 dark:bg-black/20 border border-emerald-900/5 dark:border-white/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                  <span className="material-icons-round text-xl">{item.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-emerald-950 dark:text-white text-base group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-emerald-900/50 dark:text-emerald-100/50 text-xs font-medium mt-1 transition-colors duration-500">{item.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-black text-lg ${item.color}`}>{item.points}</span>
                <span className="text-emerald-900/30 dark:text-emerald-100/30 text-xs font-bold uppercase tracking-wider hidden sm:block transition-colors duration-500">pts</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
