// src/pages/Dashboard.jsx

import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-6">
      <div className="max-w-4xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            KITA_HACK
          </h1>
          <p className="text-2xl text-white/90 font-medium">
            Smart Waste Management System
          </p>
          <p className="text-lg text-white/80 mt-2">
            Scan • Classify • Recycle Right
          </p>
        </div>
        
        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Waste Scanner Card */}
          <Link to="/scanner" className="group">
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-10 text-center hover:scale-105 hover:bg-white/25 transition-all duration-300 shadow-2xl">
              <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform">
                📸
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Waste Scanner
              </h2>
              <p className="text-lg text-white/90 leading-relaxed">
                Point camera at any waste item and get instant classification with disposal instructions
              </p>
              <div className="mt-6 inline-block bg-white/20 px-6 py-2 rounded-full text-white font-medium">
                Start Scanning →
              </div>
            </div>
          </Link>
          
          {/* Bin Verifier Card */}
          <Link to="/scanner" className="group">
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-10 text-center hover:scale-105 hover:bg-white/25 transition-all duration-300 shadow-2xl">
              <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform">
                🗑️
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Bin Verifier
              </h2>
              <p className="text-lg text-white/90 leading-relaxed">
                Scan any recycling bin to see what items belong and verify your waste disposal
              </p>
              <div className="mt-6 inline-block bg-white/20 px-6 py-2 rounded-full text-white font-medium">
                Verify Bin →
              </div>
            </div>
          </Link>
        </div>
        
        {/* SDG Impact Section */}
        <div className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              🌍 SDG 12.5 Impact
            </h3>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white/10 rounded-2xl p-6">
                <div className="text-4xl font-bold text-red-300 mb-2">
                  65.6%
                </div>
                <p className="text-white/90 text-sm">
                  Johor residents avoid recycling due to confusion
                </p>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6">
                <div className="text-4xl font-bold text-yellow-300 mb-2">
                  3.8M
                </div>
                <p className="text-white/90 text-sm">
                  Tonnes of waste generated annually in Malaysia
                </p>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6">
                <div className="text-4xl font-bold text-green-300 mb-2">
                  Real-time
                </div>
                <p className="text-white/90 text-sm">
                  Education through instant AI classification
                </p>
              </div>
            </div>
            
            <p className="text-white/80 mt-8 text-lg">
              KITA_HACK reduces contamination and increases recycling rates through instant, accurate waste identification
            </p>
          </div>
        </div>
        
        {/* How It Works */}
        <div className="mt-12 bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            How It Works
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-4xl mb-3">1️⃣</div>
              <p className="text-white text-sm">Open Camera Scanner</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">2️⃣</div>
              <p className="text-white text-sm">Point at Waste or Bin</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">3️⃣</div>
              <p className="text-white text-sm">Get Instant Classification</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">4️⃣</div>
              <p className="text-white text-sm">Dispose Correctly!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
