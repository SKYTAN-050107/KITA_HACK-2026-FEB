import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAuth = (e) => {
        e.preventDefault();
        // Mock authentication logic
        console.log(`Authenticating with ${email}...`);
        // Navigate to dashboard on success
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen relative overflow-hidden font-sans flex items-center justify-center p-4 bg-emerald-950">
            {/* Background Image */}
            <div 
                className="absolute inset-0 z-0 opacity-40 mix-blend-overlay pointer-events-none"
                    style={{
                        backgroundImage: `url('/auth-bg.png')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
            />

            {/* Ambient Lighting Orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-radial from-emerald-400/20 to-transparent blur-[120px] rounded-full mix-blend-screen"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-radial from-emerald-600/20 to-transparent blur-[120px] rounded-full mix-blend-screen"></div>
            </div>

            <div className="w-full max-w-md relative z-10 perspective-1000">
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-8 shadow-2xl shadow-emerald-900/50">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/10 shadow-inner">
                            <span className="material-icons-round text-4xl text-emerald-300 drop-shadow-lg">eco</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                            {isLogin ? 'Welcome Back' : 'Join the Movement'}
                        </h1>
                        <p className="text-emerald-100/70 text-sm font-medium">
                            {isLogin ? 'Sign in to access your dashboard' : 'Start your sustainable journey today'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-emerald-200/80 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-emerald-400/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="relative w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-emerald-200/30 focus:outline-none focus:border-emerald-400/50 focus:bg-black/30 transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-emerald-200/80 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-emerald-400/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="relative w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-emerald-200/30 focus:outline-none focus:border-emerald-400/50 focus:bg-black/30 transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {isLogin && (
                            <div className="flex justify-end">
                                <button type="button" className="text-sm font-medium text-emerald-300 hover:text-emerald-200 transition-colors">
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-white/10"
                        >
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-transparent px-4 text-emerald-200/40 text-xs font-bold uppercase tracking-widest">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Auth */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { name: 'Google', icon: 'https://www.svgrepo.com/show/475656/google-color.svg' },
                            { name: 'Apple', icon: 'apple', isIcon: true },
                            { name: 'Meta', icon: 'facebook', isIcon: true, color: 'text-blue-400' }
                        ].map((social) => (
                            <button key={social.name} className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl py-3 transition-all active:scale-95 group">
                                {social.isIcon ? (
                                    <span className={`material-icons-round text-lg ${social.color || 'text-white'} group-hover:scale-110 transition-transform`}>{social.icon}</span>
                                ) : (
                                    <img src={social.icon} className="w-5 h-5 group-hover:scale-110 transition-transform" alt={social.name} />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-emerald-100/60 text-sm font-medium">
                            {isLogin ? "New here? " : "Already member? "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-emerald-300 font-bold hover:text-white transition-colors ml-1"
                            >
                                {isLogin ? 'Create account' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
