import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="font-display bg-background-light dark:bg-background-dark text-emerald-950 dark:text-emerald-50 selection:bg-primary/30">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-emerald-100 dark:border-emerald-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary p-1.5 rounded-lg">
                                <span className="material-icons-round text-white text-2xl">recycling</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-emerald-900 dark:text-white">Recycle<span className="text-primary">Now</span></span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#" className="text-emerald-800 dark:text-emerald-200 hover:text-primary dark:hover:text-primary transition-colors font-medium">Services</a>
                            <a href="#" className="text-emerald-800 dark:text-emerald-200 hover:text-primary dark:hover:text-primary transition-colors font-medium">Impact</a>
                            <a href="#" className="text-emerald-800 dark:text-emerald-200 hover:text-primary dark:hover:text-primary transition-colors font-medium">Pricing</a>
                            <a href="#" className="text-emerald-800 dark:text-emerald-200 hover:text-primary dark:hover:text-primary transition-colors font-medium">Community</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="hidden sm:block text-emerald-800 dark:text-emerald-200 font-semibold hover:opacity-80"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="bg-primary text-emerald-950 px-6 py-2.5 rounded-lg font-bold hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
                            >
                                Start Recycling
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-emerald-800 dark:text-primary text-sm font-semibold mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                Join 15,000+ Eco-Conscious Households
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold text-emerald-900 dark:text-white leading-[1.1] mb-6">
                                Recycling Made <span className="text-primary">Simple</span> for a Greener Tomorrow.
                            </h1>
                            <p className="text-lg text-emerald-700 dark:text-emerald-300 mb-10 leading-relaxed">
                                Schedule pickups, track your environmental footprint, and earn rewards for sustainable living. We make saving the planet as easy as taking out the trash.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="bg-primary text-emerald-950 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 cursor-pointer">
                                    Get Started Now <span className="material-icons-round">arrow_forward</span>
                                </button>
                                <button className="bg-white dark:bg-emerald-900 border-2 border-emerald-100 dark:border-emerald-800 text-emerald-900 dark:text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-50 dark:hover:bg-emerald-800/50 transition-colors cursor-pointer">
                                    How it Works
                                </button>
                            </div>
                        </div>
                        <div className="mt-16 lg:mt-0 relative">
                            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white dark:border-emerald-800 transform lg:rotate-2">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBANfeQgyqMcHvCEdzZR3dsYrQmDS192ub78mmEbI6DkB9QJvfW85bzhPEHsZFN4bH0rrmnAJ6QrWv0KcXS7NkvoSvMLLIW3OSkch5NZA21i22vg9q6xIhPppYSSoebXNrK9AIELKkUZqbFm7d6ONbCtpe2R7XhEfbsq8AEgCfsnktC9maqj5borMJHYClr2D9p9PdDUsrR9EqDk_3sdsi9mtHSagRu2LyrSfIR6rBd2ETLDi98gjJdSxw9KuClQIBVzltZbxTfVWS9" alt="Sustainable Living" className="w-full h-[500px] object-cover" data-alt="Close up of diverse hands putting items into a green recycling bin" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Key Benefits Section */}
            <section className="py-24 bg-white dark:bg-emerald-950/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-emerald-900 dark:text-white mb-4">Why Choose RecycleNow?</h2>
                        <p className="text-emerald-700 dark:text-emerald-300">We've reimagined waste management to be more rewarding, transparent, and convenient for everyone.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Benefit 1 */}
                        <div className="p-8 rounded-2xl border border-emerald-100 dark:border-emerald-800 bg-background-light dark:bg-background-dark hover:shadow-xl transition-shadow group">
                            <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <span className="material-icons-round text-3xl">local_shipping</span>
                            </div>
                            <h3 className="text-xl font-bold text-emerald-900 dark:text-white mb-3">Easy Pickup</h3>
                            <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed">Schedule a collection in seconds via our app. We handle everything from plastics to electronics right at your doorstep.</p>
                        </div>
                        {/* Benefit 2 */}
                        <div className="p-8 rounded-2xl border border-emerald-100 dark:border-emerald-800 bg-background-light dark:bg-background-dark hover:shadow-xl transition-shadow group">
                            <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <span className="material-icons-round text-3xl">insights</span>
                            </div>
                            <h3 className="text-xl font-bold text-emerald-900 dark:text-white mb-3">Track Impact</h3>
                            <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed">See exactly how much CO2 and waste you've saved with our real-time impact dashboard and monthly sustainability reports.</p>
                        </div>
                        {/* Benefit 3 */}
                        <div className="p-8 rounded-2xl border border-emerald-100 dark:border-emerald-800 bg-background-light dark:bg-background-dark hover:shadow-xl transition-shadow group">
                            <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <span className="material-icons-round text-3xl">redeem</span>
                            </div>
                            <h3 className="text-xl font-bold text-emerald-900 dark:text-white mb-3">Eco-Rewards</h3>
                            <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed">Exchange recycling points for exclusive discounts at sustainable brands and eco-friendly local businesses.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_honL8K0G8UgCBIXz0AhZWA2f7FUN3o63Fsrsv5PtOjh3-0tPULGOgD98FRffR6zADa8mgxov0tZkxsGiMaFoCy8pDEUaOqZ8DZiSU8M0lkxsa5kDkz2CQ-JS-Lnib2PYaN0nKCcxAgcxvviTfTMzRkxbx9DN5tYX9A9HidoeM0zEJFYNq7DA6xFXEYi4_7lkH5N0A1GZqp2o5A_maT2Akh8SHiwYjzs2zd5zuSE0YLKkF6SI0G8UYK4hIAljBzKAgQM8A1mXU5If" alt="Recycling Process" className="rounded-2xl shadow-lg w-full aspect-video object-cover" data-alt="A clean, minimalist kitchen with organized recycling bins" />
                        </div>
                        <div className="order-1 lg:order-2">
                            <h2 className="text-3xl font-bold text-emerald-900 dark:text-white mb-8">How it Works</h2>
                            <div className="space-y-8">
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-emerald-900 flex items-center justify-center font-bold">1</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-emerald-900 dark:text-white mb-1">Sort your waste</h4>
                                        <p className="text-emerald-700 dark:text-emerald-300">Use our smart guide to separate recyclables, compostables, and glass effortlessly.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-emerald-900 flex items-center justify-center font-bold">2</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-emerald-900 dark:text-white mb-1">Book a collection</h4>
                                        <p className="text-emerald-700 dark:text-emerald-300">Choose a time that works for you through our mobile app or web portal in just two clicks.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-emerald-900 flex items-center justify-center font-bold">3</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-emerald-900 dark:text-white mb-1">Earn and Track</h4>
                                        <p className="text-emerald-700 dark:text-emerald-300">Watch your points grow and see your carbon footprint shrink as we process your waste responsibly.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Statistics */}
            <section className="py-24 bg-emerald-900 text-white overflow-hidden relative">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Our Collective Community Impact</h2>
                        <p className="text-emerald-200">Real-time statistics of what we've achieved together so far.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                            <div className="text-4xl lg:text-5xl font-extrabold text-primary mb-2">1.2M+</div>
                            <div className="text-emerald-200 text-sm font-medium uppercase tracking-wider">Tons Diverted</div>
                        </div>
                        <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                            <div className="text-4xl lg:text-5xl font-extrabold text-primary mb-2">500k</div>
                            <div className="text-emerald-200 text-sm font-medium uppercase tracking-wider">Trees Saved</div>
                        </div>
                        <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                            <div className="text-4xl lg:text-5xl font-extrabold text-primary mb-2">15k</div>
                            <div className="text-emerald-200 text-sm font-medium uppercase tracking-wider">Active Homes</div>
                        </div>
                        <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                            <div className="text-4xl lg:text-5xl font-extrabold text-primary mb-2">850+</div>
                            <div className="text-emerald-200 text-sm font-medium uppercase tracking-wider">Partner Brands</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-primary rounded-[2rem] p-8 md:p-16 text-emerald-950 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="max-w-md text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start your green journey?</h2>
                            <p className="font-medium text-emerald-900/80">Join thousands of others making a real difference. Sign up today and get your first pickup free.</p>
                        </div>
                        <div className="flex-shrink-0">
                            <button className="bg-emerald-950 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer">
                                Sign Up for Free
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-emerald-50 dark:bg-background-dark border-t border-emerald-100 dark:border-emerald-900 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="bg-primary p-1.5 rounded-lg">
                                    <span className="material-icons-round text-white text-xl">recycling</span>
                                </div>
                                <span className="text-xl font-bold tracking-tight text-emerald-900 dark:text-white">Recycle<span className="text-primary">Now</span></span>
                            </div>
                            <p className="text-emerald-700 dark:text-emerald-400 max-w-xs mb-6">Empowering communities to manage waste effectively and build a sustainable future for everyone.</p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-800 dark:text-emerald-200 hover:bg-primary hover:text-white transition-colors">
                                    <span className="material-icons-round text-lg">public</span>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-800 dark:text-emerald-200 hover:bg-primary hover:text-white transition-colors">
                                    <span className="material-icons-round text-lg">camera</span>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-800 dark:text-emerald-200 hover:bg-primary hover:text-white transition-colors">
                                    <span className="material-icons-round text-lg">alternate_email</span>
                                </a>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-emerald-900 dark:text-white mb-6">Services</h4>
                            <ul className="space-y-4 text-emerald-700 dark:text-emerald-400">
                                <li><a href="#" className="hover:text-primary transition-colors">Residential</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Commercial</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">E-Waste</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Smart Bins</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-emerald-900 dark:text-white mb-6">Company</h4>
                            <ul className="space-y-4 text-emerald-700 dark:text-emerald-400">
                                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Sustainability</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                            <h4 className="font-bold text-emerald-900 dark:text-white mb-6">Newsletter</h4>
                            <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-4">Get eco-tips and platform updates.</p>
                            <form className="flex flex-col gap-2">
                                <input type="email" placeholder="Your email" className="bg-white dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary outline-offset-2 outline-primary" />
                                <button className="bg-primary text-emerald-950 font-bold py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer">Subscribe</button>
                            </form>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-emerald-200 dark:border-emerald-900 text-center text-emerald-600 dark:text-emerald-500 text-sm">
                        © 2024 RecycleNow Platform. All rights reserved. Built with love for the Planet.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
