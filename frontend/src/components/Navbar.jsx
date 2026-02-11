// src/components/Navbar.jsx

import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <span className="text-2xl group-hover:rotate-12 transition-transform">♻️</span>
                            <span className="text-xl font-bold text-white tracking-tight">
                                KITA_HACK
                            </span>
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link
                                to="/"
                                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/scanner"
                                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg border border-white/30"
                            >
                                Launch Scanner
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
