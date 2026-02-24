// src/components/CameraScanner.jsx

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { endpoints } from '../config/api';
import { SCAN_MODES, SCAN_INTERVAL, CAMERA_CONSTRAINTS } from '../config/constants';

export default function CameraScanner() {
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // State
  const [scanMode, setScanMode] = useState(SCAN_MODES.WASTE);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedWaste, setScannedWaste] = useState(null);
  const [scannedBin, setScannedBin] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
    }
  };

  const cleanup = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

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

  const scanFrame = useCallback(async () => {
    if (!cameraActive) return;
    try {
      setLoading(true);
      const imageData = captureFrame();
      if (!imageData) return;

      const response = await fetch(endpoints.scan, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, scanMode: scanMode })
      });

      if (!response.ok) throw new Error('Scan failed');
      const data = await response.json();

      if (scanMode === SCAN_MODES.WASTE) {
        setScannedWaste(data.result);
        if (scannedBin) validateWasteInBin(scannedBin.binType, data.result.wasteType);
      } else {
        setScannedBin(data.result);
        if (scannedWaste) validateWasteInBin(data.result.binType, scannedWaste.wasteType);
      }
      setError(null);
    } catch (err) {
      setError('Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [cameraActive, scanMode, scannedBin, scannedWaste, captureFrame]);

  const validateWasteInBin = async (binType, wasteType) => {
    try {
      const response = await fetch(endpoints.validate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ binType, wasteType })
      });
      const data = await response.json();
      setValidationResult(data.validation);
    } catch (err) { }
  };

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

  const switchMode = () => {
    setScanMode(prev => prev === SCAN_MODES.WASTE ? SCAN_MODES.BIN : SCAN_MODES.WASTE);
    if (isScanning) toggleScanning();
  };

  const resetScan = () => {
    setScannedWaste(null);
    setScannedBin(null);
    setValidationResult(null);
    setError(null);
    if (isScanning) toggleScanning();
  };

  return (
    <div className="relative w-full h-full bg-emerald-950 overflow-hidden font-sans">
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

      {/* HUD Top - Status */}
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
              {scanMode === SCAN_MODES.WASTE ? 'Identifing Waste' : 'Verifying Bin'}
            </span>
          </div>
          <p className="text-primary/70 text-[10px] font-mono tracking-widest uppercase ml-6">AI_VISION_OS v2.4</p>
        </div>
      </motion.div>

      {/* Center Reticle */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{
            scale: isScanning ? [1, 1.05, 1] : 1,
            rotate: isScanning ? [0, 90, 180, 270, 360] : 0
          }}
          transition={{
            scale: { duration: 1, repeat: Infinity },
            rotate: { duration: 10, repeat: Infinity, ease: "linear" }
          }}
          className="w-64 h-64 border border-white/10 rounded-[3rem] relative shadow-[0_0_50px_rgba(16,185,129,0.1)]"
        >
          {/* Reticle Corners */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />

          {/* Scanning Animation */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-primary w-full shadow-[0_0_20px_rgba(16,185,129,1)]"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Results HUD */}
      <div className="absolute bottom-48 left-0 right-0 px-6 z-20 pointer-events-none">
        <AnimatePresence>
          <div className="max-w-md mx-auto space-y-4 pointer-events-auto">
            {scannedWaste && scanMode === SCAN_MODES.WASTE && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-black/60 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
                <div className="ml-4">
                  <span className="text-xs font-black tracking-widest text-primary uppercase mb-1 block">AI Analysis Complete</span>
                  <h3 className="text-3xl font-black text-white drop-shadow-md">{scannedWaste.displayName}</h3>
                  <p className="text-emerald-100/70 text-sm font-medium mt-2 leading-relaxed">Scan the corresponding bin to verify and earn points.</p>
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
                <span className={`font-black text-lg ${validationResult.isCorrect ? 'text-white' : 'text-white'}`}>
                  {validationResult.message}
                </span>
              </motion.div>
            )}
          </div>
        </AnimatePresence>
      </div>

      {/* Control Unit */}
      <motion.div
        initial={{ y: 150, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
        className="absolute bottom-0 left-0 right-0 z-30 bg-black/40 backdrop-blur-3xl border-t border-white/10 p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] rounded-t-[3rem]"
      >
        <div className="max-w-md mx-auto flex items-center justify-between gap-6 px-4">

          {/* Switch Mode */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={switchMode}
            className="flex flex-col items-center gap-3 flex-1 cursor-pointer group"
          >
            <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all shadow-inner">
              <span className="material-icons-round text-3xl text-white group-hover:text-primary transition-colors">
                {scanMode === SCAN_MODES.WASTE ? 'recycling' : 'search'}
              </span>
            </div>
            <span className="text-[10px] text-white/60 font-black uppercase tracking-widest group-hover:text-white transition-colors">Mode</span>
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

      {/* Error / Loading overlays */}
      <AnimatePresence>
        {(loading || error) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            {loading && (
              <div className="flex flex-col items-center p-8 bg-black/40 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="absolute inset-0 flex items-center justify-center material-icons-round text-primary animate-pulse">memory</span>
                </div>
                <span className="text-white font-extrabold tracking-widest uppercase text-sm">Processing Visuals...</span>
              </div>
            )}
            {error && (
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
                <button onClick={resetScan} className="mt-2 bg-red-500 text-white font-bold px-6 py-2 rounded-xl w-full hover:bg-red-600 transition-colors">Dismiss</button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
