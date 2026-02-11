// src/components/MainLayout.jsx

import Navbar from './Navbar';

export default function MainLayout({ children, hideNavbar = false }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-500 via-blue-600 to-indigo-800 font-sans selection:bg-white/30 selection:text-white">
            {!hideNavbar && <Navbar />}
            <main className="transition-all duration-300">
                {children}
            </main>

            {/* Footer */}
            <footer className="py-8 bg-black/10 backdrop-blur-sm border-t border-white/10 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-white/60 text-sm">
                        © 2026 KITA_HACK • SDG 12.5 Waste Management Solution
                    </p>
                </div>
            </footer>
        </div>
    );
}
