import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const MapPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const filterType = searchParams.get('type') || 'all';

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    // Mock locations
    const locations = [
        { id: 1, name: "Johor Recycling Hub", type: "recycle", lat: "50%", left: "40%", distance: "0.5km" },
        { id: 2, name: "City Orphanage Donation", type: "clothes", lat: "30%", left: "60%", distance: "1.2km" },
        { id: 3, name: "E-Waste Collection Point", type: "electric", lat: "70%", left: "20%", distance: "2.5km" }
    ];

    const filteredLocations = filterType === 'all'
        ? locations
        : locations.filter(l => [filterType, 'all'].includes(l.type) || (filterType === 'plastic' && l.type === 'recycle')); // simple mock logic

    return (
        <div className="h-screen w-full bg-black relative flex flex-col">
            {/* Map Background (Mock) */}
            <div className="absolute inset-0 bg-neutral-900 overflow-hidden">
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }}
                ></div>

                {/* Mock Roads */}
                <div className="absolute top-1/2 left-0 right-0 h-4 bg-gray-800 rotate-12"></div>
                <div className="absolute top-0 bottom-0 left-1/3 w-4 bg-gray-800 -rotate-6"></div>

                {/* Pins */}
                {!loading && filteredLocations.map(loc => (
                    <div key={loc.id} className="absolute flex flex-col items-center group cursor-pointer" style={{ top: loc.lat, left: loc.left }}>
                        <div className="bg-primary text-emerald-950 font-bold px-3 py-1 rounded-lg text-xs mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                            {loc.name} ({loc.distance})
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary border-4 border-white shadow-xl flex items-center justify-center animate-bounce">
                            <span className="material-icons-round text-sm">place</span>
                        </div>
                    </div>
                ))}

                {/* User Location */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg z-0">
                    <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping"></div>
                </div>
            </div>

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-40 p-6 flex items-center justify-between pointer-events-none">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-white/10 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all pointer-events-auto cursor-pointer"
                >
                    <span className="material-icons-round">arrow_back</span>
                </button>

                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
                    <span className="text-white font-bold text-sm">
                        {filterType === 'all' ? 'Nearby Centers' : `Nearest ${filterType.charAt(0).toUpperCase() + filterType.slice(1)} Drop-off`}
                    </span>
                </div>

                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center p-6 bg-white/10 rounded-2xl border border-white/10">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <span className="text-white font-bold">Locating Centers...</span>
                    </div>
                </div>
            )}

            {/* Bottom Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-40">
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <span className="material-icons-round text-2xl">near_me</span>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Johor Recycling Hub</h3>
                            <p className="text-white/60 text-sm">0.5km away • Open until 8 PM</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-primary text-emerald-950 font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
                    >
                        Navigate & Earn Points
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MapPage;
