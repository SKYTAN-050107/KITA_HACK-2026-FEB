// src/pages/Dashboard.jsx — Analytics Page (Step 5)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import Confetti from 'react-confetti';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { endpoints } from '../config/api';
import useDarkMode from '../hooks/useDarkMode';

/* ── Chart custom tooltip ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 dark:bg-emerald-950/90 backdrop-blur-xl border border-emerald-900/10 dark:border-white/10 rounded-xl px-4 py-2.5 shadow-xl">
      <p className="text-emerald-800/60 dark:text-emerald-100/60 text-xs font-medium">{label}</p>
      <p className="text-emerald-950 dark:text-white font-bold text-lg">
        {payload[0].value} <span className="text-sm font-medium text-emerald-800/40 dark:text-emerald-100/40">scans</span>
      </p>
    </div>
  );
};

/* ── Generate last-7-days labels with mock counts ── */
const getWeeklyMockData = () => {
  const mockCounts = [3, 5, 2, 7, 4, 6, 1];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { day: d.toLocaleDateString('en', { weekday: 'short' }), count: mockCounts[i] };
  });
};

/* ── Level system ── */
const LEVEL_NAMES = ['Beginner', 'Eco-Learner', 'Green Activist', 'Sustainability Pro', 'Eco-Warrior', 'Planet Guardian'];
const calcLevel = (pts) => {
  const lv = Math.floor(pts / 300) + 1;
  const name = LEVEL_NAMES[Math.min(lv - 1, LEVEL_NAMES.length - 1)];
  const nextName = LEVEL_NAMES[Math.min(lv, LEVEL_NAMES.length - 1)];
  const progress = ((pts % 300) / 300) * 100;
  return { lv, name, nextName, progress };
};

const toTwoDecimals = (value) => parseFloat(Number(value || 0).toFixed(2));

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark } = useDarkMode();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  /* ── State ── */
  const [stats, setStats] = useState({
    totalScans: 0, impactKg: 0, co2Saved: 0, points: 0, streak: 0, lastCheckIn: null,
  });
  const [weeklyData, setWeeklyData] = useState(getWeeklyMockData());
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : 1200, h: typeof window !== 'undefined' ? window.innerHeight : 800 });

  /* ── Dynamic greeting ── */
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  /* ── Can check in today? ── */
  const today = new Date().toISOString().slice(0, 10);
  const canCheckIn = stats.lastCheckIn !== today;

  /* ── Level calc ── */
  const { lv: level, name: levelName, nextName: nextLevelName, progress: levelProgress } = calcLevel(stats.points);

  /* ── Fetch user stats from Firestore ── */
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchStats = async () => {
      try {
        // Try backend API first
        const jwt = localStorage.getItem('jwt');
        if (jwt) {
          const res = await fetch(endpoints.userStats, { headers: { Authorization: `Bearer ${jwt}` } });
          if (res.ok) {
            const data = await res.json();
            if (!cancelled) {
              setStats({
                totalScans: data.totalScans ?? 0,
                impactKg: toTwoDecimals(data.impactKg),
                co2Saved: toTwoDecimals(data.co2Saved),
                points: data.points ?? 0,
                streak: data.streak ?? 0,
                lastCheckIn: data.lastCheckIn ?? null,
              });
              setStatsLoaded(true);
              return;
            }
          }
        }
        // Fallback: read Firestore directly
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!cancelled && snap.exists()) {
          const d = snap.data();
          setStats({
            totalScans: d.totalScans ?? 0,
            impactKg: toTwoDecimals(d.impactKg),
            co2Saved: toTwoDecimals(d.co2Saved),
            points: d.points ?? 0,
            streak: d.streak ?? 0,
            lastCheckIn: d.lastCheckIn ?? null,
          });
        }
      } catch {
        // Stats will remain at defaults
      } finally {
        if (!cancelled) setStatsLoaded(true);
      }
    };
    fetchStats();
    return () => { cancelled = true; };
  }, [user]);

  /* ── Fetch weekly scans ── */
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchWeekly = async () => {
      try {
        const jwt = localStorage.getItem('jwt');
        if (jwt) {
          const res = await fetch(endpoints.scansWeekly, { headers: { Authorization: `Bearer ${jwt}` } });
          if (res.ok) {
            const data = await res.json();
            if (!cancelled && data.days?.length) {
              setWeeklyData(data.days.map((d) => ({
                day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
                count: d.count,
              })));
            }
          }
        }
        // If backend unavailable, keep mock data — will be replaced when scanner (Step 6) is active
      } catch {
        // Keep mock data
      }
    };
    fetchWeekly();
    return () => { cancelled = true; };
  }, [user]);

  /* ── Window resize for confetti ── */
  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ── Logout (navigate-first pattern) ── */
  const handleLogout = async () => {
    navigate('/');
    try {
      await logout();
    } catch {
      // Already on landing page
    }
  };

  /* ── Daily check-in ── */
  const handleClaimCheckin = async () => {
    if (!user || checkinLoading) return;
    setCheckinLoading(true);
    try {
      // Try backend API
      const jwt = localStorage.getItem('jwt');
      let success = false;
      if (jwt) {
        const res = await fetch(endpoints.checkin, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats((prev) => ({
            ...prev,
            points: prev.points + (data.pointsEarned || 10),
            streak: data.streak ?? prev.streak + 1,
            lastCheckIn: today,
          }));
          success = true;
        }
      }

      // Fallback: direct Firestore write
      if (!success) {
        const checkinRef = doc(db, 'dailyCheckins', `${user.uid}_${today}`);
        const checkinSnap = await getDoc(checkinRef);
        if (checkinSnap.exists()) {
          // Already checked in — just update local state
          setStats((prev) => ({ ...prev, lastCheckIn: today }));
        } else {
          await setDoc(checkinRef, {
            uid: user.uid,
            date: today,
            pointsEarned: 10,
            createdAt: serverTimestamp(),
          });
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().slice(0, 10);
          const newStreak = stats.lastCheckIn === yesterdayStr ? stats.streak + 1 : 1;
          await updateDoc(doc(db, 'users', user.uid), {
            points: increment(10),
            streak: newStreak,
            lastCheckIn: today,
            lastActive: serverTimestamp(),
          });
          setStats((prev) => ({
            ...prev,
            points: prev.points + 10,
            streak: newStreak,
            lastCheckIn: today,
          }));
        }
      }

      setCheckinSuccess(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (err) {
      console.error('Check-in failed:', err);
    } finally {
      setCheckinLoading(false);
    }
  };

  /* ── Animation variants (preserved) ── */
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  /* ── Today index for chart highlighting ── */
  const todayIndex = weeklyData.length - 1;

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-500"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ══════ Confetti Overlay ══════ */}
      {showConfetti && (
        <Confetti
          width={windowSize.w}
          height={windowSize.h}
          recycle={false}
          numberOfPieces={400}
          gravity={0.25}
          colors={['#13ec13', '#10b981', '#059669', '#a855f7', '#ec4899', '#f59e0b', '#3b82f6']}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 100, pointerEvents: 'none' }}
        />
      )}

      {/* ══════ Header (PRESERVED) ══════ */}
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-12">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-extrabold text-emerald-950 dark:text-white mb-1 tracking-tight transition-colors duration-500"
          >
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-primary dark:from-emerald-400 dark:to-primary">{displayName}</span>
          </motion.h1>
          <p className="text-emerald-800/60 dark:text-emerald-100/60 font-medium transition-colors duration-500">Ready to make an impact today?</p>
        </div>
      </motion.div>

      {/* ══════ Stat Summary Cards (NEW — 5.1 & 5.3 & 5.4) ══════ */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {/* Total Scans */}
        <motion.div
          variants={itemVariants}
          className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-emerald-900/10 dark:border-white/10 rounded-[2rem] p-7 shadow-xl relative overflow-hidden group transition-colors duration-500"
        >
          <div className="absolute -top-6 -right-6 opacity-5 pointer-events-none">
            <span className="material-icons-round text-[8rem] text-primary">center_focus_weak</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-emerald-600/10 dark:from-primary/20 dark:to-emerald-600/20 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                <span className="material-icons-round text-2xl">document_scanner</span>
              </div>
              <div>
                <p className="text-emerald-800/50 dark:text-emerald-100/50 text-xs font-bold uppercase tracking-widest transition-colors duration-500">Total Scans</p>
                <motion.p
                  key={stats.totalScans}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-black text-emerald-950 dark:text-white transition-colors duration-500"
                >
                  {stats.totalScans}
                </motion.p>
              </div>
            </div>
            <p className="text-xs text-emerald-800/40 dark:text-emerald-100/40 font-medium transition-colors duration-500">Lifetime waste items classified</p>
          </div>
        </motion.div>

        {/* Environmental Impact */}
        <motion.div
          variants={itemVariants}
          className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-emerald-900/10 dark:border-white/10 rounded-[2rem] p-7 shadow-xl relative overflow-hidden group transition-colors duration-500"
        >
          <div className="absolute -top-6 -right-6 opacity-5 pointer-events-none">
            <span className="material-icons-round text-[8rem] text-blue-500">public</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400/10 to-blue-600/10 dark:from-blue-400/20 dark:to-blue-600/20 flex items-center justify-center text-blue-500 dark:text-blue-400 border border-blue-400/20 shadow-inner">
                <span className="material-icons-round text-2xl">eco</span>
              </div>
              <div>
                <p className="text-emerald-800/50 dark:text-emerald-100/50 text-xs font-bold uppercase tracking-widest transition-colors duration-500">Estimated disposal impact</p>
                <motion.p
                  key={stats.impactKg}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-black text-emerald-950 dark:text-white transition-colors duration-500"
                >
                  {Number(stats.impactKg || 0).toFixed(2)}<span className="text-lg text-emerald-800/40 dark:text-emerald-100/40 ml-1">kg</span>
                </motion.p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-icons-round text-sm text-blue-400">cloud</span>
              <p className="text-xs text-blue-500 dark:text-blue-400 font-bold transition-colors duration-500">{Number(stats.co2Saved || 0).toFixed(2)} kg CO₂ saved</p>
            </div>
          </div>
        </motion.div>

        {/* Points & Streak + Check-In CTA */}
        <motion.div
          variants={itemVariants}
          className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-emerald-900/10 dark:border-white/10 rounded-[2rem] p-7 shadow-xl relative overflow-hidden group transition-colors duration-500"
        >
          <div className="absolute -top-6 -right-6 opacity-5 pointer-events-none">
            <span className="material-icons-round text-[8rem] text-purple-500">local_fire_department</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400/10 to-purple-600/10 dark:from-purple-400/20 dark:to-purple-600/20 flex items-center justify-center text-purple-500 dark:text-purple-400 border border-purple-400/20 shadow-inner">
                  <span className="material-icons-round text-2xl">stars</span>
                </div>
                <div>
                  <p className="text-emerald-800/50 dark:text-emerald-100/50 text-xs font-bold uppercase tracking-widest transition-colors duration-500">Points</p>
                  <motion.p
                    key={stats.points}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-400 dark:from-purple-400 dark:to-pink-300"
                  >
                    {stats.points.toLocaleString()}
                  </motion.p>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="material-icons-round text-orange-400 text-xl"
                  >
                    local_fire_department
                  </motion.span>
                  <span className="text-2xl font-black text-orange-500 dark:text-orange-400">{stats.streak}</span>
                </div>
                <p className="text-[10px] text-emerald-800/40 dark:text-emerald-100/40 font-bold uppercase tracking-wider transition-colors duration-500">Day Streak</p>
              </div>
            </div>
            <motion.button
              whileHover={canCheckIn ? { scale: 1.02 } : {}}
              whileTap={canCheckIn ? { scale: 0.98 } : {}}
              onClick={() => canCheckIn && setShowCheckinModal(true)}
              disabled={!canCheckIn}
              className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                canCheckIn
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 cursor-pointer'
                  : 'bg-emerald-900/5 dark:bg-white/5 text-emerald-800/40 dark:text-emerald-100/40 cursor-not-allowed'
              }`}
            >
              {canCheckIn ? '🎯 Daily Check-In' : '✅ Checked In Today'}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ══════ Weekly Scans BarChart (NEW — 5.2) ══════ */}
      <motion.div
        variants={itemVariants}
        className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl mb-12 relative overflow-hidden transition-colors duration-500"
      >
        <div className="absolute top-0 left-0 w-48 h-48 bg-primary/10 dark:bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h3 className="text-2xl font-bold text-emerald-950 dark:text-white tracking-tight transition-colors duration-500">Weekly Scans</h3>
            <p className="text-emerald-800/50 dark:text-emerald-100/50 text-sm font-medium mt-1 transition-colors duration-500">Your scanning activity over the last 7 days</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="text-primary text-xs font-bold">{weeklyData.reduce((s, d) => s + d.count, 0)} total</span>
          </div>
        </div>
        <div className="relative z-10 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barCategoryGap="20%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(16,185,129,0.08)'}
                vertical={false}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? 'rgba(236,253,245,0.5)' : 'rgba(6,95,70,0.5)', fontSize: 12, fontWeight: 700 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? 'rgba(236,253,245,0.4)' : 'rgba(6,95,70,0.4)', fontSize: 11, fontWeight: 600 }}
                allowDecimals={false}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(16,185,129,0.05)', radius: 8 }}
              />
              <Bar dataKey="count" radius={[10, 10, 4, 4]} maxBarSize={48}>
                {weeklyData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === todayIndex ? '#13ec13' : isDark ? '#10b981' : '#059669'}
                    fillOpacity={i === todayIndex ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ══════ Quick Actions Grid (PRESERVED — 5.6) ══════ */}
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

          {/* Impact Level Card (DYNAMIC) */}
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
                  <motion.span
                    key={stats.points}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-400 dark:from-purple-400 dark:to-pink-300"
                  >
                    {stats.points.toLocaleString()}
                  </motion.span>
                  <p className="text-emerald-900/40 dark:text-emerald-100/40 text-xs font-bold uppercase tracking-widest mt-1 transition-colors duration-500">Total Points</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-emerald-950 dark:text-white mb-4 transition-colors duration-500">Impact Level {level}</h3>
              <div className="w-full bg-black/5 dark:bg-black/40 rounded-full h-3 backdrop-blur-sm border border-emerald-900/5 dark:border-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  className="bg-gradient-to-r from-purple-500 via-pink-400 to-primary h-full rounded-full relative"
                >
                  <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 blur-sm"></div>
                </motion.div>
              </div>
              <p className="text-emerald-900/50 dark:text-emerald-100/50 text-xs font-bold mt-3 tracking-wide transition-colors duration-500">
                {Math.round(levelProgress)}% TO LEVEL {level + 1} ({nextLevelName.toUpperCase()})
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ══════ Recent Activity (PRESERVED) ══════ */}
      <motion.div
        variants={itemVariants}
        className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden transition-colors duration-500"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 dark:bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h3 className="text-2xl font-bold text-emerald-950 dark:text-white tracking-tight transition-colors duration-500">Recent Activity</h3>
          <button
            onClick={() => navigate('/dashboard/history')}
            className="text-primary text-sm font-bold hover:text-emerald-800 dark:hover:text-white transition-colors flex items-center gap-1"
          >
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

      {/* ══════ Daily Check-In Modal (NEW — 5.4 & 5.5) ══════ */}
      <AnimatePresence>
        {showCheckinModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowCheckinModal(false); setCheckinSuccess(false); }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white/95 dark:bg-emerald-950/95 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl pointer-events-auto text-center transition-colors duration-500">
                {checkinSuccess ? (
                  /* ── Success state ── */
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.3, 1] }}
                      transition={{ duration: 0.5 }}
                      className="text-6xl mb-4"
                    >
                      🎉
                    </motion.div>
                    <h3 className="text-2xl font-extrabold text-emerald-950 dark:text-white mb-2 transition-colors duration-500">Points Claimed!</h3>
                    <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-400 mb-2">+10 Points</p>
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <span className="material-icons-round text-orange-400">local_fire_department</span>
                      <span className="font-bold text-orange-500 dark:text-orange-400">{stats.streak} day streak!</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setShowCheckinModal(false); setCheckinSuccess(false); }}
                      className="bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer"
                    >
                      Awesome!
                    </motion.button>
                  </>
                ) : (
                  /* ── Pre-claim state ── */
                  <>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      🎯
                    </motion.div>
                    <h3 className="text-2xl font-extrabold text-emerald-950 dark:text-white mb-2 transition-colors duration-500">Daily Check-In</h3>
                    <p className="text-emerald-800/60 dark:text-emerald-100/60 mb-2 font-medium transition-colors duration-500">Keep your streak alive!</p>
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <motion.span
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="material-icons-round text-orange-400"
                      >
                        local_fire_department
                      </motion.span>
                      <span className="font-bold text-orange-500 dark:text-orange-400">{stats.streak} day streak</span>
                    </div>
                    <div className="bg-purple-500/5 dark:bg-purple-500/10 rounded-xl p-4 mb-6 border border-purple-500/10 dark:border-purple-500/20">
                      <p className="text-purple-500 dark:text-purple-400 font-bold text-lg">+10 Points</p>
                      <p className="text-emerald-800/40 dark:text-emerald-100/40 text-xs font-medium transition-colors duration-500">Stay consistent to earn bonus rewards</p>
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setShowCheckinModal(false); setCheckinSuccess(false); }}
                        className="flex-1 py-3 rounded-xl text-sm font-bold text-emerald-800/60 dark:text-emerald-100/60 bg-emerald-900/5 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 cursor-pointer transition-colors duration-500"
                      >
                        Later
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleClaimCheckin}
                        disabled={checkinLoading}
                        className="flex-1 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        {checkinLoading ? (
                          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="material-icons-round text-lg">progress_activity</motion.span>
                        ) : (
                          'Claim Points'
                        )}
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
