// src/pages/Dashboard.jsx

import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-7xl font-extrabold text-white mb-6 drop-shadow-2xl tracking-tighter uppercase italic">
          KITA<span className="text-green-400 font-black">HACK</span>
        </h1>
        <p className="text-3xl text-white/90 font-light mb-4">
          Smart Waste Management for Johor
        </p>
        <div className="inline-block px-4 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium border border-white/10 ring-1 ring-white/20">
          SDG 12.5 • Responsible Consumption & Production
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-10 mb-16">
        {/* Waste Scanner Card */}
        <Link to="/scanner" className="group">
          <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-12 text-center hover:scale-[1.02] hover:bg-white/15 transition-all duration-500 shadow-2xl group-hover:ring-2 group-hover:ring-green-400/50">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-9xl">📸</span>
            </div>
            <div className="relative z-10">
              <div className="text-8xl mb-8 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                📸
              </div>
              <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">
                Waste Scanner
              </h2>
              <p className="text-xl text-white/80 leading-relaxed mb-8">
                Point your camera at any item to instantly identify its waste type and get disposal guidance.
              </p>
              <div className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all active:scale-95 group-hover:bg-green-400 group-hover:text-green-900">
                Launch Scanner <span>→</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Bin Verifier Card */}
        <Link to="/scanner" className="group">
          <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-12 text-center hover:scale-[1.02] hover:bg-white/15 transition-all duration-500 shadow-2xl group-hover:ring-2 group-hover:ring-blue-400/50">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-9xl">🗑️</span>
            </div>
            <div className="relative z-10">
              <div className="text-8xl mb-8 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                🗑️
              </div>
              <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">
                Bin Verifier
              </h2>
              <p className="text-xl text-white/80 leading-relaxed mb-8">
                Verify if a bin is the correct one for your waste or check what items a specific bin accepts.
              </p>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all active:scale-95 group-hover:border-blue-400/50">
                Identify Bin <span>→</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center hover:border-white/20 transition-colors">
          <div className="text-5xl font-black text-white/60 mb-2 italic tracking-tighter">65%</div>
          <p className="text-white/70 text-sm font-medium leading-snug">
            Confusion-driven contamination in local recycling streams
          </p>
        </div>
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center ring-2 ring-white/10 hover:ring-white/20 transition-all">
          <div className="text-5xl font-black text-green-400 mb-2 italic tracking-tighter">AI AGENT</div>
          <p className="text-white/70 text-sm font-medium leading-snug">
            Automated sorting via Google Cloud Vision API
          </p>
        </div>
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center hover:border-white/20 transition-colors">
          <div className="text-5xl font-black text-white/60 mb-2 italic tracking-tighter">SDG 12.5</div>
          <p className="text-white/70 text-sm font-medium leading-snug">
            Reducing waste through prevention and instant education
          </p>
        </div>
      </div>
    </div>
  );
}
