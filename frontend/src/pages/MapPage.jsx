import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="h-screen w-full bg-emerald-50 dark:bg-emerald-950 relative flex flex-col font-sans overflow-hidden transition-colors duration-500">
            {/* Map Background (Mock) */}
            <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 bg-emerald-100/60 dark:bg-emerald-900/40 overflow-hidden transition-colors duration-500"
            >
                <div className="absolute inset-0 opacity-40 dark:opacity-20 transition-opacity duration-500"
                    style={{
                        backgroundImage: "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }}
                ></div>

                {/* Mock Roads */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="absolute top-1/2 left-0 right-0 h-4 bg-white/80 dark:bg-emerald-950/80 rotate-12 transition-colors duration-500"
                ></motion.div>
                <div className="absolute top-0 bottom-0 left-1/3 w-4 bg-white/80 dark:bg-emerald-950/80 -rotate-6 transition-colors duration-500"></div>

                {/* Pins */}
                <AnimatePresence>
                    {!loading && filteredLocations.map((loc, i) => (
                        <motion.div
                            key={loc.id}
                            initial={{ opacity: 0, scale: 0, y: -50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: "spring", delay: 0.2 + (i * 0.1), stiffness: 300, damping: 15 }}
                            whileHover={{ scale: 1.2, zIndex: 50 }}
                            className="absolute flex flex-col items-center group cursor-pointer"
                            style={{ top: loc.lat, left: loc.left }}
                        >
                            <div className="bg-primary text-emerald-950 font-bold px-3 py-1 rounded-lg text-xs mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                                {loc.name} ({loc.distance})
                            </div>
                            <div className="w-8 h-8 rounded-full bg-primary border-4 border-white dark:border-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center justify-center animate-bounce transition-colors duration-500">
                                <span className="material-icons-round text-sm text-emerald-950">place</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* User Location */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg z-0">
                    <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                </div>
            </motion.div>

            {/* Top Bar */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute top-0 left-0 right-0 z-40 p-6 flex items-center justify-between pointer-events-none"
            >
                <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(16,185,129,0.2)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/dashboard')}
                    className="bg-white/60 dark:bg-white/10 backdrop-blur-md text-emerald-950 dark:text-white w-12 h-12 rounded-full flex items-center justify-center border border-emerald-900/10 dark:border-white/10 shadow-lg pointer-events-auto cursor-pointer transition-colors duration-500 hover:dark:bg-white/20"
                >
                    <span className="material-icons-round">arrow_back</span>
                </motion.button>

                <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl px-6 py-3 rounded-full border border-emerald-900/10 dark:border-white/10 shadow-xl dark:shadow-2xl transition-colors duration-500">
                    <span className="text-emerald-950 dark:text-white font-extrabold tracking-wide text-sm transition-colors duration-500">
                        {filterType === 'all' ? 'Nearby Centers' : `Nearest ${filterType.charAt(0).toUpperCase() + filterType.slice(1)} Drop-off`}
                    </span>
                </div>

                <div className="w-12"></div> {/* Spacer */}
            </motion.div>

            {/* Loading Overlay */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/80 dark:bg-emerald-950/80 backdrop-blur-md z-50 flex items-center justify-center transition-colors duration-500"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            className="flex flex-col items-center p-8 bg-white/60 dark:bg-black/40 rounded-3xl border border-emerald-900/10 dark:border-white/10 shadow-2xl backdrop-blur-xl transition-colors duration-500"
                        >
                            <div className="relative w-16 h-16 mb-6">
                                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <span className="absolute inset-0 flex items-center justify-center material-icons-round text-primary animate-pulse">satellite_alt</span>
                            </div>
                            <span className="text-emerald-950 dark:text-white font-extrabold tracking-widest uppercase text-sm transition-colors duration-500">Locating Centers...</span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Actions */}
            <motion.div
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", delay: 0.5, stiffness: 200, damping: 20 }}
                className="absolute bottom-0 left-0 right-0 p-6 z-40"
            >
                <div className="bg-white/80 dark:bg-black/40 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden transition-colors duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl transition-colors duration-500"></div>

                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-1.5 bg-emerald-900/10 dark:bg-white/20 rounded-full transition-colors duration-500"></div>
                    </div>

                    <div className="flex items-center gap-5 mb-8 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 dark:from-primary/20 dark:to-emerald-500/20 shadow-inner flex items-center justify-center text-primary border border-primary/20 transition-colors duration-500">
                            <span className="material-icons-round text-3xl">near_me</span>
                        </div>
                        <div>
                            <h3 className="text-emerald-950 dark:text-white font-bold text-xl drop-shadow-sm dark:drop-shadow-md transition-colors duration-500">Johor Recycling Hub</h3>
                            <p className="text-primary font-medium text-sm drop-shadow-sm dark:drop-shadow-md mt-1 transition-colors duration-500">0.5km away <span className="text-emerald-900/40 dark:text-emerald-100/40 px-1">•</span> <span className="text-emerald-900/60 dark:text-emerald-100/60 font-semibold dark:font-normal">Open until 8 PM</span></p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-extrabold text-lg py-5 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 dark:hover:shadow-primary/40 transition-all border border-emerald-50 dark:border-white/20 cursor-pointer flex items-center justify-center gap-2"
                    >
                        Navigate & Earn Points
                        <span className="material-icons-round text-xl">directions</span>
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default MapPage;
