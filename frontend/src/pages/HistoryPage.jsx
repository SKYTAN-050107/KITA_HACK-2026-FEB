// src/pages/HistoryPage.jsx — Step 8.1–8.3, 8.5: Scan history with expand, filter, search

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, orderBy, getDocs, limit, startAfter } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../config/api';
import { WASTE_RULES } from '../config/wasteRules';
import useDarkMode from '../hooks/useDarkMode';

const PAGE_SIZE = 20;

/* ── Relative time helper ── */
const relativeTime = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDate = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useDarkMode();

  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // ── 8.1 Firestore scans query (timestamp DESC) ──
  useEffect(() => {
    if (!user) return;
    fetchScans();
  }, [user]);

  const fetchScans = async (after = null) => {
    if (!user) return;
    const isLoadMore = !!after;
    if (isLoadMore) setLoadingMore(true); else setLoading(true);

    try {
      // Try backend API first
      const jwt = localStorage.getItem('jwt');
      let fetched = false;

      if (jwt && !after) {
        try {
          const res = await fetch(`${endpoints.scans}?page=1&limit=${PAGE_SIZE}`, {
            headers: { Authorization: `Bearer ${jwt}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.scans) {
              setScans(data.scans);
              setHasMore(data.hasMore || false);
              fetched = true;
            }
          }
        } catch { /* fallback */ }
      }

      // Fallback: direct Firestore
      if (!fetched) {
        let q = query(
          collection(db, 'scans'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(PAGE_SIZE)
        );
        if (after) q = query(collection(db, 'scans'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'), startAfter(after), limit(PAGE_SIZE));

        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (isLoadMore) setScans(prev => [...prev, ...docs]);
        else setScans(docs);

        setHasMore(snap.docs.length === PAGE_SIZE);
        setLastDoc(snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null);
      }
    } catch (err) {
      console.error('Failed to load scan history:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ── 8.5 Search + Filter ──
  const filteredScans = useMemo(() => {
    let result = scans;
    if (filterType !== 'all') {
      result = result.filter(s => s.wasteType === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => {
        const rule = WASTE_RULES[s.wasteType];
        return (
          (s.wasteType || '').toLowerCase().includes(q) ||
          (rule?.displayName || '').toLowerCase().includes(q) ||
          (rule?.category || '').toLowerCase().includes(q) ||
          (s.disposalMethod || '').toLowerCase().includes(q)
        );
      });
    }
    return result;
  }, [scans, filterType, searchQuery]);

  // ── Waste type filter chips ──
  const wasteTypes = useMemo(() => {
    const types = new Set(scans.map(s => s.wasteType).filter(Boolean));
    return ['all', ...Array.from(types)];
  }, [scans]);

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-500"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400/10 to-orange-600/10 dark:from-orange-400/20 dark:to-orange-600/20 flex items-center justify-center text-orange-500 dark:text-orange-400 border border-orange-400/20 shadow-inner">
          <span className="material-icons-round text-3xl">history</span>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-emerald-950 dark:text-white tracking-tight transition-colors duration-500">
            Scan History
          </h1>
          <p className="text-emerald-800/60 dark:text-emerald-100/60 font-medium transition-colors duration-500">
            {scans.length > 0 ? `${scans.length} scan${scans.length !== 1 ? 's' : ''} recorded` : 'View your past scans and recycling activity'}
          </p>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      {scans.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          {/* Search */}
          <div className="relative">
            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800/40 dark:text-emerald-200/40 text-xl">search</span>
            <input
              type="text"
              placeholder="Search by waste type, category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-emerald-900/10 dark:border-white/10 rounded-2xl text-emerald-950 dark:text-white placeholder:text-emerald-800/30 dark:placeholder:text-emerald-200/30 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-300"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-800/40 dark:text-emerald-200/40 hover:text-emerald-950 dark:hover:text-white transition-colors cursor-pointer">
                <span className="material-icons-round text-lg">close</span>
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {wasteTypes.map(type => {
              const rule = WASTE_RULES[type];
              const isActive = filterType === type;
              return (
                <motion.button
                  key={type}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterType(type)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all duration-300 ${isActive
                    ? 'bg-primary/15 dark:bg-primary/20 text-primary border-primary/30 shadow-sm'
                    : 'bg-white/40 dark:bg-white/5 text-emerald-800/60 dark:text-emerald-200/40 border-emerald-900/10 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
                  }`}
                >
                  {type === 'all' ? '🏷️ All' : `${rule?.icon || '📦'} ${rule?.displayName || type}`}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Loading State ── */}
      {loading && (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-[2.5rem] p-10 shadow-2xl shadow-emerald-900/10 dark:shadow-emerald-900/50 transition-colors duration-500">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-emerald-800/60 dark:text-emerald-100/60 font-bold text-sm uppercase tracking-widest">Loading scan history...</p>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && scans.length === 0 && (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-[2.5rem] p-10 shadow-2xl shadow-emerald-900/10 dark:shadow-emerald-900/50 transition-colors duration-500">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-emerald-500/10 dark:from-primary/20 dark:to-emerald-500/20 flex items-center justify-center text-primary mb-6 border border-primary/20">
              <span className="material-icons-round text-4xl">inbox</span>
            </div>
            <h3 className="text-2xl font-bold text-emerald-950 dark:text-white mb-3 transition-colors duration-500">No Scans Yet</h3>
            <p className="text-emerald-900/60 dark:text-emerald-100/60 font-medium max-w-md mb-8 transition-colors duration-500">
              Your scan history will appear here once you start scanning waste items with the AI scanner.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard/scanner')}
              className="px-8 py-3.5 bg-gradient-to-r from-primary to-emerald-500 text-emerald-950 font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer"
            >
              <span className="material-icons-round text-lg">qr_code_scanner</span>
              Start Scanning
            </motion.button>
          </div>
        </div>
      )}

      {/* ── No Results (filter/search applied) ── */}
      {!loading && scans.length > 0 && filteredScans.length === 0 && (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-[2.5rem] p-10 shadow-2xl shadow-emerald-900/10 dark:shadow-emerald-900/50 transition-colors duration-500 text-center py-16">
          <span className="material-icons-round text-5xl text-emerald-800/20 dark:text-emerald-200/20 mb-4 block">filter_list_off</span>
          <h3 className="text-xl font-bold text-emerald-950 dark:text-white mb-2">No matching scans</h3>
          <p className="text-emerald-800/60 dark:text-emerald-100/60 font-medium text-sm">Try adjusting your search or filter.</p>
        </div>
      )}

      {/* ── 8.2 Scan Cards List ── */}
      {!loading && filteredScans.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {filteredScans.map((scan, index) => {
              const rule = WASTE_RULES[scan.wasteType] || WASTE_RULES.general_waste;
              const isExpanded = expandedId === scan.id;
              const confPercent = Math.round((scan.confidence || 0) * 100);

              return (
                <motion.div
                  key={scan.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.03 }}
                  layout
                  className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-3xl shadow-lg shadow-emerald-900/5 dark:shadow-emerald-900/30 overflow-hidden transition-colors duration-500"
                >
                  {/* ── Card Header (always visible) ── */}
                  <motion.button
                    onClick={() => toggleExpand(scan.id || index)}
                    className="w-full p-5 sm:p-6 flex items-center gap-4 cursor-pointer text-left hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
                  >
                    {/* Waste Type Icon */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border shadow-inner"
                      style={{
                        backgroundColor: `${rule.color}15`,
                        borderColor: `${rule.color}30`,
                      }}
                    >
                      {rule.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-bold text-emerald-950 dark:text-white truncate transition-colors duration-500">
                          {rule.displayName}
                        </h3>
                        <span
                          className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border"
                          style={{ color: rule.color, borderColor: `${rule.color}40`, backgroundColor: `${rule.color}10` }}
                        >
                          {rule.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-emerald-800/50 dark:text-emerald-200/40 font-medium">
                        <span className="flex items-center gap-1">
                          <span className="material-icons-round text-xs">schedule</span>
                          {relativeTime(scan.timestamp)}
                        </span>
                        {confPercent > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="material-icons-round text-xs">insights</span>
                            {confPercent}% confidence
                          </span>
                        )}
                        {scan.pointsEarned && (
                          <span className="flex items-center gap-1 text-primary">
                            <span className="material-icons-round text-xs">star</span>
                            +{scan.pointsEarned}pts
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bin Match Status (8.2) */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {scan.binMatch !== null && scan.binMatch !== undefined && (
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${scan.binMatch ? 'bg-primary/15 text-primary' : 'bg-red-500/15 text-red-500'}`}>
                          <span className="material-icons-round text-lg">
                            {scan.binMatch ? 'check_circle' : 'cancel'}
                          </span>
                        </div>
                      )}
                      <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="material-icons-round text-emerald-800/30 dark:text-emerald-200/30 text-xl"
                      >
                        expand_more
                      </motion.span>
                    </div>
                  </motion.button>

                  {/* ── 8.3 Expanded Detail ── */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-6 border-t border-emerald-900/5 dark:border-white/5 pt-5 space-y-5">
                          {/* Scan Details */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-white/50 dark:bg-white/5 rounded-xl p-3 border border-emerald-900/5 dark:border-white/5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 dark:text-emerald-200/30 mb-1">Date</p>
                              <p className="text-xs font-bold text-emerald-950 dark:text-white">{formatDate(scan.timestamp)}</p>
                            </div>
                            <div className="bg-white/50 dark:bg-white/5 rounded-xl p-3 border border-emerald-900/5 dark:border-white/5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 dark:text-emerald-200/30 mb-1">Disposal</p>
                              <p className="text-xs font-bold text-emerald-950 dark:text-white capitalize">{scan.disposalMethod || rule.disposalMethod}</p>
                            </div>
                            <div className="bg-white/50 dark:bg-white/5 rounded-xl p-3 border border-emerald-900/5 dark:border-white/5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 dark:text-emerald-200/30 mb-1">Confidence</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-emerald-900/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${confPercent}%`, backgroundColor: rule.color }} />
                                </div>
                                <span className="text-xs font-bold" style={{ color: rule.color }}>{confPercent}%</span>
                              </div>
                            </div>
                            <div className="bg-white/50 dark:bg-white/5 rounded-xl p-3 border border-emerald-900/5 dark:border-white/5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 dark:text-emerald-200/30 mb-1">Correct Bin</p>
                              <p className="text-xs font-bold text-emerald-950 dark:text-white">{rule.correctBin.symbol} {rule.correctBin.name.split(' ').slice(0, 2).join(' ')}</p>
                            </div>
                          </div>

                          {/* Short Rules from scan data or fallback to WASTE_RULES */}
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 dark:text-emerald-200/30 mb-3">Quick Rules</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(scan.rules || rule.shortRules).map((r, i) => (
                                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-emerald-900/5 dark:border-white/5">
                                  <span className="material-icons-round text-sm mt-0.5" style={{ color: rule.color }}>check_circle</span>
                                  <span className="text-xs font-medium text-emerald-900/70 dark:text-emerald-100/70 leading-relaxed">{r}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Checklist from scan data or fallback */}
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 dark:text-emerald-200/30 mb-3">
                              Preparation Checklist
                              {scan.checklistCompleted && (
                                <span className="ml-2 text-primary">✓ Completed</span>
                              )}
                            </p>
                            <div className="space-y-2">
                              {(scan.checklist || rule.checklist).map((item, i) => {
                                const step = typeof item === 'string' ? item : item.step;
                                const completed = typeof item === 'object' ? item.completed : false;
                                return (
                                  <div
                                    key={i}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${completed
                                      ? 'bg-primary/10 dark:bg-primary/10 border-primary/20'
                                      : 'bg-white/40 dark:bg-white/5 border-emerald-900/5 dark:border-white/5'
                                    }`}
                                  >
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${completed ? 'bg-primary' : 'border-2 border-emerald-900/15 dark:border-white/15'}`}>
                                      {completed && <span className="material-icons-round text-white text-xs">check</span>}
                                    </div>
                                    <span className={`text-xs font-medium ${completed ? 'text-primary line-through' : 'text-emerald-900/70 dark:text-emerald-100/70'}`}>
                                      {step}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3 pt-2">
                            <motion.button
                              whileTap={{ scale: 0.98 }}
                              onClick={() => navigate('/dashboard/scanner')}
                              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-primary/10 dark:bg-primary/15 text-primary border border-primary/20 flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/20 transition-all"
                            >
                              <span className="material-icons-round text-sm">qr_code_scanner</span> Scan Again
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.98 }}
                              onClick={() => navigate('/dashboard/map')}
                              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-blue-500/10 dark:bg-blue-500/15 text-blue-500 border border-blue-500/20 flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-500/20 transition-all"
                            >
                              <span className="material-icons-round text-sm">map</span> Find Bin
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Load More */}
          {hasMore && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fetchScans(lastDoc)}
                disabled={loadingMore}
                className="px-8 py-3 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-emerald-900/10 dark:border-white/10 rounded-2xl text-sm font-bold text-emerald-950 dark:text-white flex items-center gap-2 cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 transition-all"
              >
                {loadingMore ? (
                  <><span className="material-icons-round animate-spin text-sm">progress_activity</span> Loading...</>
                ) : (
                  <><span className="material-icons-round text-sm">expand_more</span> Load More</>
                )}
              </motion.button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
