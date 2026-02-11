// src/pages/ScannerPage.jsx

import { Link } from 'react-router-dom';
import CameraScanner from '../components/CameraScanner';

export default function ScannerPage() {
  return (
    <div className="relative h-screen">
      {/* Back Button */}
      <Link 
        to="/"
        className="absolute top-6 left-6 z-20 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium hover:bg-white/30 transition-colors shadow-lg"
      >
        ← Back to Home
      </Link>
      
      {/* Camera Component */}
      <CameraScanner />
    </div>
  );
}
