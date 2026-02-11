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
  
  /**
   * Initialize camera on mount
   */
  useEffect(() => {
    initializeCamera();
    
    return () => {
      cleanup();
    };
  }, []);
  
  /**
   * Start camera stream
   */
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
      console.error('Camera error:', err);
      setError('Camera access denied. Please enable camera permissions.');
    }
  };
  
  /**
   * Cleanup camera and intervals
   */
  const cleanup = () => {
    // Stop scanning
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    
    // Stop camera stream
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };
  
  /**
   * Capture frame from video and convert to base64
   */
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 640;
    canvas.height = 480;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    return imageData;
  }, []);
  
  /**
   * Send frame to backend for classification
   */
  const scanFrame = useCallback(async () => {
    if (!cameraActive) return;
    
    try {
      setLoading(true);
      
      const imageData = captureFrame();
      if (!imageData) {
        setError('Failed to capture frame');
        return;
      }
      
      // Send to backend
      const response = await fetch(endpoints.scan, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: imageData,
          scanMode: scanMode
        })
      });
      
      if (!response.ok) {
        throw new Error('Scan failed');
      }
      
      const data = await response.json();
      
      if (scanMode === SCAN_MODES.WASTE) {
        setScannedWaste(data.result);
        
        // If bin already scanned, validate
        if (scannedBin) {
          await validateWasteInBin(scannedBin.binType, data.result.wasteType);
        }
      } else {
        setScannedBin(data.result);
        
        // If waste already scanned, validate
        if (scannedWaste) {
          await validateWasteInBin(data.result.binType, scannedWaste.wasteType);
        }
      }
      
      setError(null);
      
    } catch (err) {
      console.error('Scan error:', err);
      setError('Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [cameraActive, scanMode, scannedBin, scannedWaste, captureFrame]);
  
  /**
   * Validate if waste belongs in bin
   */
  const validateWasteInBin = async (binType, wasteType) => {
    try {
      const response = await fetch(endpoints.validate, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ binType, wasteType })
      });
      
      const data = await response.json();
      setValidationResult(data.validation);
      
    } catch (err) {
      console.error('Validation error:', err);
    }
  };
  
  /**
   * Toggle continuous scanning
   */
  const toggleScanning = () => {
    if (isScanning) {
      // Stop scanning
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      setIsScanning(false);
    } else {
      // Start scanning
      scanFrame(); // Immediate first scan
      scanIntervalRef.current = setInterval(scanFrame, SCAN_INTERVAL);
      setIsScanning(true);
    }
  };
  
  /**
   * Switch scan mode and reset state
   */
  const switchMode = () => {
    const newMode = scanMode === SCAN_MODES.WASTE ? SCAN_MODES.BIN : SCAN_MODES.WASTE;
    setScanMode(newMode);
    
    // Stop scanning when switching modes
    if (isScanning) {
      toggleScanning();
    }
  };
  
  /**
   * Reset all scanned data
   */
  const resetScan = () => {
    setScannedWaste(null);
    setScannedBin(null);
    setValidationResult(null);
    setError(null);
    
    if (isScanning) {
      toggleScanning();
    }
  };
  
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Video Stream */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />
      
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Mode Indicator */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
        <div className={`px-6 py-3 rounded-full font-bold text-white shadow-lg ${
          scanMode === SCAN_MODES.WASTE 
            ? 'bg-green-500' 
            : 'bg-blue-500'
        }`}>
          {scanMode === SCAN_MODES.WASTE ? '🔍 Scanning Waste' : '🗑️ Scanning Bin'}
        </div>
      </div>
      
      {/* Waste Result Display */}
      {scannedWaste && scanMode === SCAN_MODES.WASTE && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl max-w-sm w-11/12 z-10">
          <h3 className="text-3xl font-bold text-gray-800 mb-2">
            {scannedWaste.displayName}
          </h3>
          {scannedWaste.correctBins && scannedWaste.correctBins.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Dispose in:</p>
              <div className="flex flex-wrap gap-2">
                {scannedWaste.correctBins.map((bin) => (
                  <span 
                    key={bin.id}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {bin.symbol} {bin.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Bin Result Display */}
      {scannedBin && scanMode === SCAN_MODES.BIN && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl max-w-md w-11/12 z-10">
          <h3 className="text-3xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-4xl">{scannedBin.binInfo.symbol}</span>
            {scannedBin.binInfo.name}
          </h3>
          
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2">✅ Accepts:</p>
            <div className="flex flex-wrap gap-2">
              {scannedBin.binInfo.accepts.slice(0, 6).map((item, idx) => (
                <span 
                  key={idx}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium capitalize"
                >
                  {item.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
          
          <p className="text-xs text-gray-500 italic mt-3">
            💡 {scannedBin.binInfo.tips}
          </p>
          
          <p className="text-sm text-blue-600 font-medium mt-4">
            Now scan your waste to verify!
          </p>
        </div>
      )}
      
      {/* Validation Result */}
      {validationResult && (
        <div className={`absolute bottom-40 left-1/2 -translate-x-1/2 px-8 py-6 rounded-2xl shadow-2xl z-10 ${
          validationResult.isCorrect 
            ? 'bg-green-500' 
            : 'bg-red-500'
        }`}>
          <p className="text-white text-2xl font-bold text-center">
            {validationResult.message}
          </p>
          {!validationResult.isCorrect && validationResult.correctBins && (
            <p className="text-white text-sm mt-2 text-center">
              Use: {validationResult.correctBins.map(b => b.name).join(' or ')}
            </p>
          )}
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-sm w-11/12 z-10">
          <p className="font-medium">{error}</p>
        </div>
      )}
      
      {/* Loading Indicator */}
      {loading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
        </div>
      )}
      
      {/* Control Panel */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-10">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Main Scan Button */}
          <button
            onClick={toggleScanning}
            disabled={!cameraActive || loading}
            className={`w-full py-5 px-8 rounded-full text-xl font-bold shadow-2xl transition-all transform active:scale-95 ${
              isScanning
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isScanning ? '⏹️ STOP SCAN' : '🔍 START SCAN'}
          </button>
          
          {/* Secondary Controls */}
          <div className="flex gap-3">
            <button
              onClick={switchMode}
              className="flex-1 py-3 px-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-medium hover:bg-white/30 transition-colors"
            >
              Switch to {scanMode === SCAN_MODES.WASTE ? 'Bin' : 'Waste'} Mode
            </button>
            
            <button
              onClick={resetScan}
              className="flex-1 py-3 px-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-medium hover:bg-white/30 transition-colors"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
