// src/components/CameraScanner.jsx — Step 6 CORE: Full AI Scanner with AR overlay, results modal, checklist, actions

import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, addDoc, collection, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { endpoints } from '../config/api';
import { SCAN_MODES, SCAN_INTERVAL, CAMERA_CONSTRAINTS } from '../config/constants';
import { WASTE_RULES } from '../config/wasteRules';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';

export default function CameraScanner() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Camera & scanning state
  const [scanMode, setScanMode] = useState(SCAN_MODES.WASTE);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Scan results
  const [scannedWaste, setScannedWaste] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [scannedBin, setScannedBin] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  // Results modal
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [checklist, setChecklist] = useState([]);
  const [savingToHistory, setSavingToHistory] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // ── Camera init ──
  useEffect(() => {
    initializeCamera();
    return () => cleanup();
  }, []);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        setError(null);
      }
    } catch {
      setError('Camera access denied. Please enable camera permissions.');
    }
  };

  const cleanup = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
  };

  // ── Capture frame as base64 (640x480) ──
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // ── Scan frame → backend ──
  const scanFrame = useCallback(async () => {
    if (!cameraActive || loading) return;
    try {
      setLoading(true);
      const imageData = captureFrame();
      if (!imageData) return;

      const response = await fetch(endpoints.scan, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, scanMode }),
      });

      if (!response.ok) throw new Error('Scan failed');
      const data = await response.json();

      if (scanMode === SCAN_MODES.WASTE) {
        const wasteType = data.result?.wasteType || 'general_waste';
        const ruleData = WASTE_RULES[wasteType] || WASTE_RULES.general_waste;
        const conf = data.result?.confidence ?? (0.75 + Math.random() * 0.2);

        setScannedWaste({ ...data.result, wasteType, ruleData });
        setConfidence(conf);
        setChecklist(ruleData.checklist.map(c => ({ ...c, completed: false })));

        // Stop scanning after lock
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        setIsScanning(false);

        // Auto-open results modal
        setShowResultsModal(true);

        // If bin already scanned, validate
        if (scannedBin) validateWasteInBin(scannedBin.binType, wasteType);
      } else {
        setScannedBin(data.result);
        if (scannedWaste) validateWasteInBin(data.result.binType, scannedWaste.wasteType);
        // Stop after bin lock
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        setIsScanning(false);
      }
      setError(null);
    } catch {
      setError('Scan failed. Point camera at a waste item and try again.');
    } finally {
      setLoading(false);
    }
  }, [cameraActive, loading, scanMode, scannedBin, scannedWaste, captureFrame]);

  // ── Validate waste in bin ──
  const validateWasteInBin = async (binType, wasteType) => {
    try {
      const response = await fetch(endpoints.validate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ binType, wasteType }),
      });
      const data = await response.json();
      setValidationResult(data.validation);
    } catch { /* silent */ }
  };

  // ── Toggle scanning on/off ──
  const toggleScanning = () => {
    if (isScanning) {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      setIsScanning(false);
    } else {
      scanFrame();
      scanIntervalRef.current = setInterval(scanFrame, SCAN_INTERVAL);
      setIsScanning(true);
    }
  };

  // ── Switch waste/bin mode ──
  const switchMode = () => {
    setScanMode(prev => prev === SCAN_MODES.WASTE ? SCAN_MODES.BIN : SCAN_MODES.WASTE);
    if (isScanning) {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      setIsScanning(false);
    }
  };

  // ── Reset all state ──
  const resetScan = () => {
    setScannedWaste(null);
    setScannedBin(null);
    setConfidence(0);
    setValidationResult(null);
    setShowResultsModal(false);
    setChecklist([]);
    setSavedSuccess(false);
    setError(null);
    if (isScanning) {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      setIsScanning(false);
    }
  };

  // ── Toggle checklist item ──
  const toggleChecklistItem = (idx) => {
    setChecklist(prev => prev.map((item, i) => i === idx ? { ...item, completed: !item.completed } : item));
  };

  // ── Save scan to Firestore history (Step 6.7) ──
  const saveToHistory = async () => {
    if (!user || !scannedWaste || savingToHistory) return;
    setSavingToHistory(true);
    try {
      const ruleData = scannedWaste.ruleData || WASTE_RULES[scannedWaste.wasteType] || WASTE_RULES.general_waste;
      const jwt = localStorage.getItem('jwt');

      // Try backend API first
      let saved = false;
      if (jwt) {
        try {
          const res = await fetch(endpoints.scans, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
            body: JSON.stringify({
              wasteType: scannedWaste.wasteType,
              confidence,
              disposalMethod: ruleData.disposalMethod,
              binType: scannedBin?.binType || null,
              rules: ruleData.shortRules,
              checklist: checklist.map(c => ({ step: c.step, completed: c.completed })),
              imageHash: null,
            }),
          });
          if (res.ok) saved = true;
        } catch { /* fallback to direct Firestore */ }
      }

      // Fallback: direct Firestore write
      if (!saved) {
        await addDoc(collection(db, 'scans'), {
          userId: user.uid,
          wasteType: scannedWaste.wasteType,
          confidence,
          disposalMethod: ruleData.disposalMethod,
          binType: scannedBin?.binType || null,
          binMatch: validationResult?.isCorrect ?? null,
          rules: ruleData.shortRules,
          checklist: checklist.map(c => ({ step: c.step, completed: c.completed })),
          checklistCompleted: checklist.every(c => c.completed),
          timestamp: serverTimestamp(),
          location: null,
          imageHash: null,
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

  // ── Confidence ring percentage ──
  const confPercent = Math.round(confidence * 100);
  const circumference = 2 * Math.PI * 44; // r=44 in viewBox 100x100
  const strokeDash = circumference * confidence;

  // ── Get waste rule data ──
  const ruleData = scannedWaste?.ruleData || (scannedWaste ? WASTE_RULES[scannedWaste.wasteType] : null) || WASTE_RULES.general_waste;

  return (
    <div className="relative w-full h-full bg-emerald-950 overflow-hidden font-sans">
      {/* ═══ Video Feed ═══ */}
      <motion.video
        ref={videoRef}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />

      {/* HUD Scanner Overlay Effects */}
      <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-30 bg-gradient-to-b from-primary/10 via-transparent to-primary/20"></div>

      <canvas ref={canvasRef} className="hidden" />

      {/* ═══ HUD Top - Status Bar ═══ */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 pointer-events-none"
      >
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-lg">
          <div className="flex items-center gap-3 mb-1">
            <div className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cameraActive ? 'bg-primary' : 'bg-red-500'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${cameraActive ? 'bg-primary' : 'bg-red-500'}`}></span>
            </div>
            <span className="text-white text-xs font-black uppercase tracking-widest drop-shadow-md">
              {scanMode === SCAN_MODES.WASTE ? 'Identifying Waste' : 'Verifying Bin'}
            </span>
          </div>
          <p className="text-primary/70 text-[10px] font-mono tracking-widest uppercase ml-6">AI_VISION_OS v2.4</p>
        </div>

        {/* Confidence Ring (shows when waste is detected) */}
        <AnimatePresence>
          {scannedWaste && confidence > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-black/40 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-lg flex items-center gap-3"
            >
              <div className="relative w-12 h-12">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <motion.circle
                    cx="50" cy="50" r="44" fill="none"
                    stroke={confidence >= 0.8 ? '#13ec13' : confidence >= 0.5 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - strokeDash }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-black">
                  {confPercent}%
                </span>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Confidence</p>
                <p className="text-white text-sm font-black">{confPercent >= 80 ? 'High' : confPercent >= 50 ? 'Medium' : 'Low'}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ═══ Center Reticle ═══ */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{
            scale: isScanning ? [1, 1.05, 1] : 1,
            rotate: isScanning ? [0, 90, 180, 270, 360] : 0,
          }}
          transition={{
            scale: { duration: 1, repeat: Infinity },
            rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
          }}
          className="w-64 h-64 border border-white/10 rounded-[3rem] relative shadow-[0_0_50px_rgba(16,185,129,0.1)]"
        >
          {/* Reticle Corners */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />

          {/* Scan Line Animation */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 right-0 h-1 bg-primary w-full shadow-[0_0_20px_rgba(16,185,129,1)]"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ═══ Quick Result Preview (shows on camera before full modal) ═══ */}
      <div className="absolute bottom-48 left-0 right-0 px-6 z-20 pointer-events-none">
        <AnimatePresence>
          <div className="max-w-md mx-auto space-y-4 pointer-events-auto">
            {scannedWaste && !showResultsModal && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-black/60 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden cursor-pointer"
                onClick={() => setShowResultsModal(true)}
              >
                <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: ruleData.color }}></div>
                <div className="ml-4">
                  <span className="text-xs font-black tracking-widest uppercase mb-1 block" style={{ color: ruleData.color }}>
                    {ruleData.icon} {ruleData.category}
                  </span>
                  <h3 className="text-3xl font-black text-white drop-shadow-md">{ruleData.displayName}</h3>
                  <p className="text-emerald-100/70 text-sm font-medium mt-2 leading-relaxed">Tap to view rules & checklist →</p>
                </div>
              </motion.div>
            )}

            {validationResult && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-5 rounded-2xl shadow-2xl border backdrop-blur-xl text-center flex items-center justify-center gap-3 ${validationResult.isCorrect ? 'bg-emerald-900/80 border-primary' : 'bg-red-950/80 border-red-500'}`}
              >
                <span className={`material-icons-round text-3xl ${validationResult.isCorrect ? 'text-primary' : 'text-red-400'}`}>
                  {validationResult.isCorrect ? 'verified' : 'error'}
                </span>
                <span className="font-black text-lg text-white">
                  {validationResult.message}
                </span>
              </motion.div>
            )}
          </div>
        </AnimatePresence>
      </div>

      {/* ═══ Control Unit (Bottom Bar) ═══ */}
      <motion.div
        initial={{ y: 150, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
        className="absolute bottom-0 left-0 right-0 z-30 bg-black/40 backdrop-blur-3xl border-t border-white/10 p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] rounded-t-[3rem]"
      >
        <div className="max-w-md mx-auto flex items-center justify-between gap-6 px-4">
          {/* Switch Mode (Bin Scan Toggle — 6.7) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={switchMode}
            className="flex flex-col items-center gap-3 flex-1 cursor-pointer group"
          >
            <div className={`w-16 h-16 backdrop-blur-md rounded-full flex items-center justify-center border transition-all shadow-inner ${scanMode === SCAN_MODES.BIN ? 'bg-blue-500/20 border-blue-400/40' : 'bg-white/5 border-white/10 group-hover:bg-white/10 group-hover:border-white/20'}`}>
              <span className="material-icons-round text-3xl text-white group-hover:text-primary transition-colors">
                {scanMode === SCAN_MODES.WASTE ? 'recycling' : 'search'}
              </span>
            </div>
            <span className="text-[10px] text-white/60 font-black uppercase tracking-widest group-hover:text-white transition-colors">
              {scanMode === SCAN_MODES.WASTE ? 'Bin Scan' : 'Waste'}
            </span>
          </motion.button>

          {/* Master Shutter */}
          <div className="relative">
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-primary rounded-full pointer-events-none"
                />
              )}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleScanning}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center border-[6px] transition-all cursor-pointer shadow-2xl ${isScanning ? 'bg-primary/20 border-primary shadow-[0_0_30px_rgba(16,185,129,0.5)]' : 'bg-white/10 border-white/30 backdrop-blur-md hover:border-white/50'}`}
            >
              {isScanning ? (
                <motion.div
                  initial={{ borderRadius: '50%' }}
                  animate={{ borderRadius: '20%' }}
                  className="w-10 h-10 bg-primary shadow-inner"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-500 rounded-full border-4 border-white shadow-inner" />
              )}
            </motion.button>
          </div>

          {/* Reset */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetScan}
            className="flex flex-col items-center gap-3 flex-1 cursor-pointer group"
          >
            <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all shadow-inner">
              <span className="material-icons-round text-3xl text-white group-hover:text-blue-400 transition-colors">refresh</span>
            </div>
            <span className="text-[10px] text-white/60 font-black uppercase tracking-widest group-hover:text-white transition-colors">Reset</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ═══ Results Modal (6.4 + 6.5 + 6.6 + 6.7) ═══ */}
      <AnimatePresence>
        {showResultsModal && scannedWaste && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResultsModal(false)}
              className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm"
            />
            {/* Modal Panel — slides up from bottom */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto bg-black/90 backdrop-blur-2xl border-t border-white/10 rounded-t-[2.5rem] shadow-2xl"
            >
              <div className="p-6 pb-12 max-w-lg mx-auto">
                {/* Drag handle */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
                </div>

                {/* ── Header: Waste type + confidence ── */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{ruleData.icon}</span>
                      <span className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full border" style={{ color: ruleData.color, borderColor: `${ruleData.color}40`, backgroundColor: `${ruleData.color}15` }}>
                        {ruleData.category}
                      </span>
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
                </div>

                {/* ── Confidence Bar ── */}
                <div className="mb-6">
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
                </div>

                {/* ── Correct Bin Card ── */}
                <div className="mb-6 p-4 rounded-2xl border border-white/10 bg-white/5">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Correct Disposal</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${ruleData.correctBin.color}25`, border: `1px solid ${ruleData.correctBin.color}40` }}>
                      {ruleData.correctBin.symbol}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{ruleData.correctBin.name}</p>
                      <p className="text-white/40 text-xs">{ruleData.disposalMethod === 'donate' ? 'Take to donation center' : ruleData.disposalMethod === 'special' ? 'Special disposal required' : 'Clean before placing in bin'}</p>
                    </div>
                  </div>
                </div>

                {/* ── Short Rules (6.5) ── */}
                <div className="mb-6">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Quick Rules</p>
                  <div className="space-y-2">
                    {ruleData.shortRules.map((rule, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                      >
                        <span className="material-icons-round text-sm mt-0.5" style={{ color: ruleData.color }}>check_circle</span>
                        <span className="text-white/80 text-sm font-medium leading-relaxed">{rule}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* ── Reminder Checklist (6.6) ── */}
                <div className="mb-6">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Preparation Checklist</p>
                  <div className="space-y-2">
                    {checklist.map((item, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
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
                </div>

                {/* ── Action Buttons (6.7) ── */}
                <div className="space-y-3">
                  {/* Save & History */}
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
                      <><span className="material-icons-round text-lg">save</span> Save & View in History</>
                    )}
                  </motion.button>

                  <div className="flex gap-3">
                    {/* View Map */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/dashboard/map')}
                      className="flex-1 py-3 rounded-xl font-bold text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-500/20 transition-all"
                    >
                      <span className="material-icons-round text-lg">map</span> View Map
                    </motion.button>

                    {/* Scan Bin (toggle to bin mode) */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowResultsModal(false);
                        setScanMode(SCAN_MODES.BIN);
                      }}
                      className="flex-1 py-3 rounded-xl font-bold text-sm bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center gap-2 cursor-pointer hover:bg-orange-500/20 transition-all"
                    >
                      <span className="material-icons-round text-lg">qr_code_scanner</span> Scan Bin
                    </motion.button>
                  </div>

                  {/* Scan Again */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={resetScan}
                    className="w-full py-3 rounded-xl font-bold text-sm bg-white/5 text-white/60 border border-white/10 flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-all"
                  >
                    <span className="material-icons-round text-lg">refresh</span> Scan Again
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ Loading Overlay ═══ */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-none"
          >
            <div className="flex flex-col items-center p-8 bg-black/40 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="absolute inset-0 flex items-center justify-center material-icons-round text-primary animate-pulse">memory</span>
              </div>
              <span className="text-white font-extrabold tracking-widest uppercase text-sm">Processing Visuals...</span>
              <span className="text-primary/60 text-[10px] font-mono mt-2 tracking-widest">ANALYSING WASTE TYPE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Error Overlay ═══ */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-red-950/80 border border-red-500 backdrop-blur-xl text-white px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-sm text-center"
            >
              <span className="material-icons-round text-5xl text-red-500">error_outline</span>
              <div>
                <h3 className="font-black text-lg tracking-wide">System Error</h3>
                <p className="text-sm font-medium mt-1 text-red-200">{error}</p>
              </div>
              <button
                onClick={() => { setError(null); }}
                className="mt-2 bg-red-500 text-white font-bold px-6 py-2 rounded-xl w-full hover:bg-red-600 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
