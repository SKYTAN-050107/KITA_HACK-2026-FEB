// src/pages/ScannerPage.jsx

import { Link } from 'react-router-dom';
import CameraScanner from '../components/CameraScanner';

export default function ScannerPage() {
  return (
    <div className="h-screen bg-black relative flex flex-col">
      {/* Minimal Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-40 p-6 flex justify-end">
        <Link
          to="/"
          className="bg-white/10 backdrop-blur-md text-white/80 px-5 py-2 rounded-full text-xs font-bold border border-white/10 hover:bg-white/20 hover:text-white transition-all"
        >
          ✕ CLOSE
        </Link>
      </div>

      {/* Full Screen Scanner */}
      <div className="flex-1 overflow-hidden relative">
        <CameraScanner />
      </div>
    </div>
  );
}
