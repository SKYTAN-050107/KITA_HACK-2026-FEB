// src/pages/HistoryPage.jsx — Step D: Image-grid scan history with expandable modal + DisposalCheckbox

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, orderBy, getDocs, limit, startAfter } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../config/api';
import { WASTE_RULES } from '../config/wasteRules';
import useDarkMode from '../hooks/useDarkMode';
import DisposalCheckbox, { STATUS_CONFIG } from '../components/DisposalCheckbox';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [lastDoc, setLastDoc] = useState(null); // Firestore fallback pagination
  const [selectedScan, setSelectedScan] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // ── Fetch scans (page-based API pagination, Firestore fallback) ──
  useEffect(() => {
    if (!user) return;
    fetchScans(1);
  }, [user]);

  const fetchScans = async (pageNum = 1) => {
    if (!user) return;
    const isLoadMore = pageNum > 1;
    if (isLoadMore) setLoadingMore(true); else setLoading(true);

    try {
      let idToken = null;
      try { idToken = await user.getIdToken(); } catch { /* proceed to fallback */ }
      let fetched = false;

      if (idToken) {
        try {
          const res = await fetch(`${endpoints.scans}?page=${pageNum}&limit=${PAGE_SIZE}`, {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.scans) {
              // Map scanId → id for consistent keying (bug fix: backend returns scanId not id)
              const mapped = data.scans.map(s => ({ ...s, id: s.scanId || s.id }));
              if (isLoadMore) setScans(prev => [...prev, ...mapped]);
              else setScans(mapped);
              setHasMore(data.hasMore || false);
              setCurrentPage(pageNum);
              fetched = true;
            }
          }
        } catch { /* fallback to direct Firestore */ }
      }

      // Fallback: direct Firestore
      if (!fetched) {
        let q = query(
          collection(db, 'scans'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(PAGE_SIZE)
        );
        if (isLoadMore && lastDoc) {
          q = query(collection(db, 'scans'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));
        }

        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (isLoadMore) setScans(prev => [...prev, ...docs]);
        else setScans(docs);

        setHasMore(snap.docs.length === PAGE_SIZE);
        setLastDoc(snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null);
        setCurrentPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to load scan history:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ── DisposalCheckbox status change handler (Step 13) ──
  const handleStatusChange = (scanId, newStatus) => {
    setScans(prev => prev.map(s => s.id === scanId ? { ...s, disposalStatus: newStatus } : s));
    if (selectedScan?.id === scanId) {
      setSelectedScan(prev => prev ? { ...prev, disposalStatus: newStatus } : prev);
    }
  };

  // ── Search + Filter ──
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

  // ── Expanded modal derived data ──
  const modalRule = selectedScan ? (WASTE_RULES[selectedScan.wasteType] || WASTE_RULES.general_waste) : null;
  const modalConfPercent = selectedScan ? Math.round((selectedScan.confidence || 0) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-500">

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

      {/* ── Image Grid (Step 12) ── */}
      {!loading && filteredScans.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {filteredScans.map((scan, index) => {
              const rule = WASTE_RULES[scan.wasteType] || WASTE_RULES.general_waste;
              const statusConfig = STATUS_CONFIG[scan.disposalStatus] || STATUS_CONFIG.pending;

              return (
                <motion.div
                  key={scan.id || index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => setSelectedScan(scan)}
                  className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group border border-emerald-900/10 dark:border-white/10 shadow-lg shadow-emerald-900/5 dark:shadow-emerald-900/30"
                >
                  {/* Image or fallback placeholder */}
                  {scan.imageUrl ? (
                    <img
                      src={scan.imageUrl}
                      alt={rule.displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center bg-white/60 dark:bg-white/5"
                      style={{ backgroundColor: `${rule.color}10` }}
                    >
                      <span className="text-5xl opacity-50">{rule.icon}</span>
                    </div>
                  )}

                  {/* Status indicator (top-right) */}
                  <div className="absolute top-2 right-2 z-10">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20"
                      title={statusConfig.label}
                    >
                      <span className="material-icons-round text-xs" style={{ color: statusConfig.color }}>
                        {statusConfig.icon}
                      </span>
                    </div>
                  </div>

                  {/* Bottom overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm">{rule.icon}</span>
                      <span className="text-white text-xs font-bold truncate">{rule.displayName}</span>
                    </div>
                    <span className="text-white/60 text-[10px] font-medium">{relativeTime(scan.timestamp)}</span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
                </motion.div>
              );
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fetchScans(currentPage + 1)}
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

      {/* ── Expanded Scan Detail Modal ── */}
      <AnimatePresence>
        {selectedScan && (
          <>
            {/* Backdrop */}
            <motion.div
              key="history-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedScan(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide-up panel */}
            <motion.div
              key="history-modal-panel"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-emerald-950/95 backdrop-blur-2xl border-t border-emerald-900/10 dark:border-white/10 rounded-t-[2.5rem] shadow-2xl"
            >
              <div className="max-w-lg mx-auto p-6 pb-12">
                {/* Drag handle */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-1.5 bg-emerald-900/10 dark:bg-white/20 rounded-full"></div>
                </div>

                {/* Close button */}
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => setSelectedScan(null)}
                    className="w-8 h-8 rounded-full bg-emerald-900/5 dark:bg-white/5 flex items-center justify-center cursor-pointer hover:bg-emerald-900/10 dark:hover:bg-white/10 transition-colors"
                  >
                    <span className="material-icons-round text-emerald-800/60 dark:text-emerald-200/60 text-lg">close</span>
                  </button>
                </div>

                {/* Full image */}
                {selectedScan.imageUrl && (
                  <div className="mb-6 rounded-2xl overflow-hidden border border-emerald-900/10 dark:border-white/10">
                    <img src={selectedScan.imageUrl} alt={modalRule?.displayName} className="w-full h-48 sm:h-56 object-cover" />
                  </div>
                )}

                {/* Header: waste type + confidence */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{modalRule?.icon}</span>
                      <span
                        className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border"
                        style={{ color: modalRule?.color, borderColor: `${modalRule?.color}40`, backgroundColor: `${modalRule?.color}10` }}
                      >
                        {modalRule?.category}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-emerald-950 dark:text-white tracking-tight transition-colors duration-500">{modalRule?.displayName}</h2>
                    <p className="text-emerald-800/50 dark:text-emerald-100/50 text-xs mt-1">{modalRule?.examples}</p>
                  </div>
                  {modalConfPercent > 0 && (
                    <div className="text-right flex-shrink-0 ml-4">
                      <span className="text-lg font-black" style={{ color: modalRule?.color }}>{modalConfPercent}%</span>
                      <p className="text-[10px] text-emerald-800/40 dark:text-emerald-200/30 font-bold uppercase tracking-widest">Confidence</p>
                    </div>
                  )}
                </div>

                {/* Disposal Status with DisposalCheckbox (Step 13) */}
                <div className="mb-5 flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-emerald-900/5 dark:border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 dark:text-emerald-200/30">Disposal Status</p>
                  <DisposalCheckbox
                    scanId={selectedScan.id}
                    currentStatus={selectedScan.disposalStatus || 'pending'}
                    disposalMethod={selectedScan.disposalMethod || modalRule?.disposalMethod}
                    onStatusChange={handleStatusChange}
                  />
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="bg-white/50 dark:bg-white/5 rounded-xl p-3 border border-emerald-900/5 dark:border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 dark:text-emerald-200/30 mb-1">Date</p>
                    <p className="text-xs font-bold text-emerald-950 dark:text-white">{formatDate(selectedScan.timestamp)}</p>
                  </div>
                  <div className="bg-white/50 dark:bg-white/5 rounded-xl p-3 border border-emerald-900/5 dark:border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 dark:text-emerald-200/30 mb-1">Disposal</p>
                    <p className="text-xs font-bold text-emerald-950 dark:text-white capitalize">{selectedScan.disposalMethod || modalRule?.disposalMethod}</p>
                  </div>
                  <div className="bg-white/50 dark:bg-white/5 rounded-xl p-3 border border-emerald-900/5 dark:border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 dark:text-emerald-200/30 mb-1">Confidence</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-emerald-900/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${modalConfPercent}%`, backgroundColor: modalRule?.color }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: modalRule?.color }}>{modalConfPercent}%</span>
                    </div>
                  </div>
                  <div className="bg-white/50 dark:bg-white/5 rounded-xl p-3 border border-emerald-900/5 dark:border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 dark:text-emerald-200/30 mb-1">Correct Bin</p>
                    <p className="text-xs font-bold text-emerald-950 dark:text-white">{modalRule?.correctBin.symbol} {modalRule?.correctBin.name.split(' ').slice(0, 2).join(' ')}</p>
                  </div>
                </div>

                {/* Short Rules */}
                <div className="mb-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 dark:text-emerald-200/30 mb-3">Quick Rules</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(selectedScan.rules || modalRule?.shortRules || []).map((r, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-emerald-900/5 dark:border-white/5">
                        <span className="material-icons-round text-sm mt-0.5" style={{ color: modalRule?.color }}>check_circle</span>
                        <span className="text-xs font-medium text-emerald-900/70 dark:text-emerald-100/70 leading-relaxed">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checklist */}
                <div className="mb-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 dark:text-emerald-200/30 mb-3">
                    Preparation Checklist
                    {selectedScan.checklistCompleted && (
                      <span className="ml-2 text-primary">✓ Completed</span>
                    )}
                  </p>
                  <div className="space-y-2">
                    {(selectedScan.checklist || modalRule?.checklist || []).map((item, i) => {
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
                    onClick={() => { setSelectedScan(null); navigate('/dashboard/scanner'); }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-primary/10 dark:bg-primary/15 text-primary border border-primary/20 flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/20 transition-all"
                  >
                    <span className="material-icons-round text-sm">qr_code_scanner</span> Scan Again
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedScan(null); navigate('/dashboard/map'); }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-blue-500/10 dark:bg-blue-500/15 text-blue-500 border border-blue-500/20 flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-500/20 transition-all"
                  >
                    <span className="material-icons-round text-sm">map</span> Find Bin
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
