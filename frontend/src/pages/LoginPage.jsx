import React, { useState } from 'react';
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, Github, Sparkles } from 'lucide-react';

export default function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onLogin({ name: name || 'EcoWarrior', email });
        }, 1200);
    };

    const handleGoogleSSO = () => {
        setLoading(true);
        // In production, this would redirect to Google OAuth
        // For demo, simulate SSO flow
        setTimeout(() => {
            setLoading(false);
            onLogin({ name: 'EcoWarrior', email: 'user@gmail.com', provider: 'google' });
        }, 1500);
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 0 }}
            >
                <source src="/sfhacks_background.mp4" type="video/mp4" />
            </video>

            {/* Light overlay for text readability - minimal tint */}
            <div className="absolute inset-0 bg-black/20" style={{ zIndex: 1 }} />

            {/* Subtle grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                zIndex: 2,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '60px 60px'
            }} />

            {/* Left Panel - Hero */}
            <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative z-10">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 backdrop-blur-sm rounded-xl border border-emerald-500/20">
                        <Leaf className="w-7 h-7 text-emerald-400 fill-emerald-400" />
                    </div>
                    <span className="text-2xl font-bold text-white tracking-tight">GreenLoop</span>
                </div>

                {/* Hero Content */}
                <div className="max-w-lg space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 text-sm backdrop-blur-sm">
                            <Sparkles size={14} />
                            <span>Join 10,000+ eco-warriors making a difference</span>
                        </div>
                        <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
                            Build a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">greener</span> tomorrow,
                            <br />one action at a time.
                        </h1>
                        <p className="text-lg text-emerald-100/60 leading-relaxed">
                            Track your environmental impact, discover eco-friendly swaps,
                            find local nurseries, and compete with your community to reduce your carbon footprint.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <div className="text-3xl font-bold text-white">2.4M</div>
                            <div className="text-sm text-emerald-300/60">Trees Planted</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl font-bold text-white">850K</div>
                            <div className="text-sm text-emerald-300/60">Eco Swaps Made</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl font-bold text-white">12.5t</div>
                            <div className="text-sm text-emerald-300/60">CO₂ Reduced</div>
                        </div>
                    </div>
                </div>

                {/* Testimonial */}
                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 max-w-md">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                        AK
                    </div>
                    <div>
                        <p className="text-white/80 text-sm italic">"GreenLoop changed how I shop and commute. My eco score went from 20 to 94 in just two months!"</p>
                        <p className="text-emerald-400/60 text-xs mt-1 font-medium">— Aria Kim, Level 8 EcoWarrior</p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 relative z-10">
                <div className="w-full max-w-md">
                    {/* Mobile Logo (shows only on small screens) */}
                    <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
                        <div className="p-2 bg-emerald-500/20 backdrop-blur-sm rounded-xl border border-emerald-500/20">
                            <Leaf className="w-6 h-6 text-emerald-400 fill-emerald-400" />
                        </div>
                        <span className="text-xl font-bold text-white">GreenLoop</span>
                    </div>

                    {/* Glass Card */}
                    <div className="bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] rounded-3xl p-8 shadow-2xl shadow-black/20">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {isSignUp ? 'Create your account' : 'Welcome back'}
                            </h2>
                            <p className="text-sm text-white/50">
                                {isSignUp ? 'Start your sustainability journey today' : 'Continue your green journey'}
                            </p>
                        </div>

                        {/* Google SSO Button */}
                        <button
                            onClick={handleGoogleSSO}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-white/[0.15] bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium text-sm transition-all duration-200 mb-6 group disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Continue with Google</span>
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-xs text-white/30 uppercase tracking-wider">or</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {isSignUp && (
                                <div>
                                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Full Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full h-12 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Email</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full h-12 bg-white/[0.05] border border-white/[0.1] rounded-xl pl-11 pr-4 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full h-12 bg-white/[0.05] border border-white/[0.1] rounded-xl pl-11 pr-12 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {!isSignUp && (
                                <div className="flex justify-end">
                                    <button type="button" className="text-xs text-emerald-400/80 hover:text-emerald-300 transition-colors">
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50 group"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isSignUp ? 'Create Account' : 'Sign In'}
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Toggle Sign Up / Sign In */}
                        <div className="text-center mt-6">
                            <span className="text-sm text-white/40">
                                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                            </span>
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                            >
                                {isSignUp ? 'Sign in' : 'Sign up'}
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-white/20 mt-6">
                        By continuing, you agree to GreenLoop's Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
