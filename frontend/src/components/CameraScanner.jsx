// src/components/CameraScanner.jsx

import { useRef, useEffect, useState, useCallback } from 'react';
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
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* HUD Top - Only Status */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">
              {scanMode === SCAN_MODES.WASTE ? 'Waste Scanner' : 'Bin Verifier'}
            </span>
          </div>
          <p className="text-white/60 text-[9px] font-mono">VISION_OS v1.0.4</p>
        </div>
      </div>

      {/* Center Reticle */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-64 h-64 border-2 border-white/20 rounded-3xl relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
          {isScanning && <div className="absolute inset-0 bg-white/5 animate-pulse rounded-3xl" />}
        </div>
      </div>

      {/* Results HUD - Floating above controls */}
      <div className="absolute bottom-48 left-0 right-0 px-6 z-20 pointer-events-none">
        <div className="max-w-md mx-auto space-y-3 pointer-events-auto">
          {scannedWaste && scanMode === SCAN_MODES.WASTE && (
            <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border-l-8 border-green-500">
              <span className="text-xs font-bold text-green-600 uppercase">Detection</span>
              <h3 className="text-2xl font-black text-gray-900">{scannedWaste.displayName}</h3>
            </div>
          )}

          {validationResult && (
            <div className={`p-4 rounded-xl shadow-2xl text-center font-bold text-white ${validationResult.isCorrect ? 'bg-green-600' : 'bg-red-600'}`}>
              {validationResult.message}
            </div>
          )}
        </div>
      </div>

      {/* Control Unit - Solid Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-xl border-t border-white/10 p-8 pb-12">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">

          {/* Switch Mode */}
          <button onClick={switchMode} className="flex flex-col items-center gap-2 flex-1">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
              <span className="text-2xl">{scanMode === SCAN_MODES.WASTE ? '🗑️' : '🔍'}</span>
            </div>
            <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Mode</span>
          </button>

          {/* Master Shutter */}
          <div className="relative">
            {isScanning && <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping scale-150" />}
            <button
              onClick={toggleScanning}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center border-8 transition-all active:scale-90 ${isScanning ? 'bg-red-500 border-white/20' : 'bg-white border-white/10'
                }`}
            >
              {isScanning ? <div className="w-8 h-8 bg-white rounded-sm" /> : <div className="w-12 h-12 bg-blue-500 rounded-full border-4 border-white" />}
            </button>
          </div>

          {/* Reset */}
          <button onClick={resetScan} className="flex flex-col items-center gap-2 flex-1">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
              <span className="text-2xl">🔄</span>
            </div>
            <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Reset</span>
          </button>

        </div>
      </div>

      {/* Error / Loading overlays */}
      {(loading || error) && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-center">
          {loading && <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto" />}
          {error && <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold mt-4">{error}</div>}
        </div>
      )}
    </div>
  );
}
