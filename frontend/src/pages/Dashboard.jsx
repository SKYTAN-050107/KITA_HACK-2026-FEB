// src/pages/Dashboard.jsx

import { Link } from 'react-router-dom';

import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Good Evening, <span className="text-primary">Sky</span>
          </h1>
          <p className="text-white/60">Ready to make an impact today?</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10 cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* Main Action Grid */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Scanner Card - MAIN ACTION */}
        <div className="lg:col-span-2 relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-xl group-hover:bg-primary/30 transition-all"></div>
          <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden hover:scale-[1.01] transition-transform">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <span className="material-icons-round text-9xl text-white">center_focus_weak</span>
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold mb-6 border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                AI ENABLED
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Scan Waste</h2>
              <p className="text-xl text-white/70 max-w-md mb-8">
                Use our advanced AI to instantly identify waste types and find the right bin.
              </p>
            </div>

            <button
              onClick={() => navigate('/scanner')}
              className="w-full sm:w-auto bg-primary text-emerald-950 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-3 group-hover:scale-[1.02] cursor-pointer"
            >
              <span className="material-icons-round">qr_code_scanner</span>
              Open Scanner
            </button>
          </div>
        </div>

        {/* Side Actions */}
        <div className="space-y-8">
          {/* Map Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 hover:bg-white/10 transition-colors cursor-pointer group" onClick={() => navigate('/map')}>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <span className="material-icons-round text-2xl">map</span>
              </div>
              <span className="material-icons-round text-white/40 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Find Centers</h3>
            <p className="text-white/60 text-sm">Locate nearest recycling points and orphanages.</p>
          </div>

          {/* Impact Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <span className="material-icons-round text-2xl">emoji_events</span>
              </div>
              <span className="text-2xl font-bold text-white">1,250</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Your Impact</h3>
            <div className="w-full bg-white/10 rounded-full h-2 mt-4">
              <div className="bg-gradient-to-r from-primary to-emerald-400 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-white/40 text-xs mt-2 text-right">65% to next Level</p>
          </div>
        </div>
      </div>

      {/* Recent Activity / Stats */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8">
        <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { icon: 'recycling', color: 'text-green-400', bg: 'bg-green-400/10', title: 'Recycled Plastic Bottle', time: '2 hours ago', points: '+50' },
            { icon: 'check_circle', color: 'text-blue-400', bg: 'bg-blue-400/10', title: 'Verified Bin Type', time: '5 hours ago', points: '+20' },
            { icon: 'map', color: 'text-orange-400', bg: 'bg-orange-400/10', title: 'Visited Collection Point', time: '1 day ago', points: '+100' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center ${item.color}`}>
                  <span className="material-icons-round text-lg">{item.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{item.title}</h4>
                  <p className="text-white/40 text-xs">{item.time}</p>
                </div>
              </div>
              <span className="font-bold text-primary">{item.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
