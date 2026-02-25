// src/pages/ScanResultPage.jsx — Phase 4: Full-screen scan results page
// Receives scan data via React Router location.state
// Uses same design language as original CameraScanner results modal

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, addDoc, collection, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { endpoints } from '../config/api';
import { WASTE_RULES } from '../config/wasteRules';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';

export default function ScanResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Extract scan result and captured image from navigation state
  const scanResult = location.state?.scanResult;
  const result = scanResult?.result;
  const imageData = location.state?.imageData || null;

  // Derive waste data
  const wasteType = result?.wasteType || 'general_waste';
  const ruleData = WASTE_RULES[wasteType] || WASTE_RULES.general_waste;
  const confidence = result?.confidence ?? 0;
  const isLowConfidence = result?.isLowConfidence || false;

  // Checklist state (interactive)
  const [checklist, setChecklist] = useState(
    () => (result?.checklist || ruleData.checklist).map(c => ({ ...c, completed: false }))
  );

  // Save state
  const [savingToHistory, setSavingToHistory] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Confidence display values
  const confPercent = Math.round(confidence * 100);
  const circumference = 2 * Math.PI * 44;
  const strokeDash = circumference * confidence;

  // ── Toggle checklist item ──
  const toggleChecklistItem = (idx) => {
    setChecklist(prev => prev.map((item, i) => i === idx ? { ...item, completed: !item.completed } : item));
  };

  // ── Save scan to history ──
  const saveToHistory = async () => {
    if (!user || savingToHistory) return;
    setSavingToHistory(true);
    try {
      // Get fresh Firebase ID token (authMiddleware verifies this directly)
      let idToken = null;
      try { idToken = await user.getIdToken(); } catch { /* proceed to fallback */ }

      // Try backend API first
      let saved = false;
      if (idToken) {
        try {
          const res = await fetch(endpoints.scans, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
            body: JSON.stringify({
              wasteType,
              confidence,
              disposalMethod: ruleData.disposalMethod,
              rules: ruleData.shortRules,
              checklist: checklist.map(c => ({ step: c.step, completed: c.completed })),
              imageData: imageData,
              imageHash: result?.imageHash || null,
            }),
          });
          if (res.ok) saved = true;
        } catch { /* fallback to direct Firestore */ }
      }

      // Fallback: direct Firestore write
      if (!saved) {
        await addDoc(collection(db, 'scans'), {
          userId: user.uid,
          wasteType,
          confidence,
          disposalMethod: ruleData.disposalMethod,
          rules: ruleData.shortRules,
          checklist: checklist.map(c => ({ step: c.step, completed: c.completed })),
          checklistCompleted: checklist.every(c => c.completed),
          timestamp: serverTimestamp(),
          location: null,
          imageUrl: null,
          imageHash: result?.imageHash || null,
          pointsEarned: 5,
        });

        // Increment user stats
        try {
          const estKg = 0.15 + Math.random() * 0.35;
          await updateDoc(doc(db, 'users', user.uid), {
            totalScans: increment(1),
            impactKg: increment(parseFloat(estKg.toFixed(2))),
            co2Saved: increment(parseFloat((estKg * 0.9).toFixed(2))),
            points: increment(5),
            lastActive: serverTimestamp(),
          });
        } catch { /* stats update is best-effort */ }
      }

      setSavedSuccess(true);
    } catch (err) {
      console.error('Save to history failed:', err);
    } finally {
      setSavingToHistory(false);
    }
  };

  // ── No scan data → redirect back ──
  if (!scanResult || !result) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-sans">
        <span className="material-icons-round text-5xl text-white/30 mb-4">search_off</span>
        <h2 className="text-xl font-black text-white mb-2">No Scan Data</h2>
        <p className="text-white/50 text-sm mb-6">Scan a waste item first to see results.</p>
        <button
          onClick={() => navigate('/dashboard/scanner')}
          className="bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-bold px-6 py-3 rounded-xl cursor-pointer"
        >
          Go to Scanner
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black font-sans">
      {/* ── Scrollable content ── */}
      <div className="max-w-lg mx-auto px-5 pt-6 pb-12">

        {/* ── Back button ── */}
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => navigate('/dashboard/scanner')}
          className="flex items-center gap-2 mb-6 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all">
            <span className="material-icons-round text-white text-lg">arrow_back</span>
          </div>
          <span className="text-white/60 text-sm font-bold uppercase tracking-widest group-hover:text-white transition-colors">Back to Scanner</span>
        </motion.button>

        {/* ── Captured Image Preview ── */}
        {imageData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 rounded-2xl overflow-hidden border border-white/10"
          >
            <img
              src={imageData}
              alt="Scanned waste"
              className="w-full h-48 object-cover"
            />
          </motion.div>
        )}

        {/* ── Header: Waste type + confidence ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start justify-between mb-6"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{ruleData.icon}</span>
              <span
                className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full border"
                style={{ color: ruleData.color, borderColor: `${ruleData.color}40`, backgroundColor: `${ruleData.color}15` }}
              >
                {ruleData.category}
              </span>
              {isLowConfidence && (
                <span className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-400">
                  Low Confidence
                </span>
              )}
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">{ruleData.displayName}</h2>
            <p className="text-white/50 text-xs font-medium mt-1">{ruleData.examples}</p>
          </div>

          {/* Confidence Ring */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="44" fill="none"
                stroke={ruleData.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - strokeDash }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-black">
              {confPercent}%
            </span>
          </div>
        </motion.div>

        {/* ── Confidence Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">AI Confidence</span>
            <span className="text-xs font-black" style={{ color: ruleData.color }}>{confPercent}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: ruleData.color }}
            />
          </div>
        </motion.div>

        {/* ── Correct Bin Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 p-4 rounded-2xl border border-white/10 bg-white/5"
        >
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Correct Disposal</p>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: `${ruleData.correctBin.color}25`, border: `1px solid ${ruleData.correctBin.color}40` }}
            >
              {ruleData.correctBin.symbol}
            </div>
            <div>
              <p className="text-white font-bold text-sm">{ruleData.correctBin.name}</p>
              <p className="text-white/40 text-xs">
                {ruleData.disposalMethod === 'donate' ? 'Take to donation center' : ruleData.disposalMethod === 'special' ? 'Special disposal required' : 'Clean before placing in bin'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Short Rules ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Quick Rules</p>
          <div className="space-y-2">
            {ruleData.shortRules.map((rule, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + 0.1 * i }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
              >
                <span className="material-icons-round text-sm mt-0.5" style={{ color: ruleData.color }}>check_circle</span>
                <span className="text-white/80 text-sm font-medium leading-relaxed">{rule}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Preparation Checklist ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Preparation Checklist</p>
          <div className="space-y-2">
            {checklist.map((item, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + 0.05 * i }}
                onClick={() => toggleChecklistItem(i)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all text-left ${item.completed ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/5 hover:bg-white/8'}`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${item.completed ? 'bg-primary' : 'border-2 border-white/20'}`}>
                  {item.completed && <span className="material-icons-round text-white text-sm">check</span>}
                </div>
                <span className={`text-sm font-medium transition-all ${item.completed ? 'text-primary line-through' : 'text-white/80'}`}>
                  {item.step}
                </span>
              </motion.button>
            ))}
          </div>
          <p className="text-white/30 text-xs font-medium mt-2 text-center">
            {checklist.filter(c => c.completed).length}/{checklist.length} completed
          </p>
        </motion.div>

        {/* ── Action Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-3"
        >
          {/* Save to History */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={saveToHistory}
            disabled={savingToHistory || savedSuccess}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${savedSuccess ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 shadow-lg shadow-primary/20'}`}
          >
            {savingToHistory ? (
              <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="material-icons-round text-lg">progress_activity</motion.span> Saving...</>
            ) : savedSuccess ? (
              <><span className="material-icons-round text-lg">check_circle</span> Saved to History!</>
            ) : (
              <><span className="material-icons-round text-lg">save</span> Save to History</>
            )}
          </motion.button>

          {/* Find Nearest Station */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/map', { state: { wasteType } })}
            className="w-full py-3 rounded-xl font-bold text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-500/20 transition-all"
          >
            <span className="material-icons-round text-lg">map</span> Find Nearest Station
          </motion.button>

          {/* Scan Again */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/dashboard/scanner')}
            className="w-full py-3 rounded-xl font-bold text-sm bg-white/5 text-white/60 border border-white/10 flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-all"
          >
            <span className="material-icons-round text-lg">photo_camera</span> Scan Again
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
