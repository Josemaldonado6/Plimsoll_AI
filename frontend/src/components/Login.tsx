import React, { useState } from 'react';
import { Lock, User, Shield, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useStore, getApiUrl } from '../store/useStore';

export const Login: React.FC = () => {
    const login = useStore((state) => state.login);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await axios.post(getApiUrl('/api/auth/login'), formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (response.data.access_token) {
                login(response.data.user, response.data.access_token);
            }
        } catch (err: any) {
            console.error('[AUTH_ERROR]', err);
            setError(err.response?.data?.detail || 'Maritime Identity Verification Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.05),transparent_50%)]" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />

            <div className="max-w-md w-full relative">
                {/* Tactical Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-yellow-400 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                        <Lock size={32} className="text-black" strokeWidth={3} />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase italic">
                        Plimsoll <span className="text-yellow-400">Identity</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                        Notarized Access Protocol // v2.2
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                Maritime Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User size={18} className="text-slate-500" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="cargo@plimsoll.ai"
                                    className="block w-full pl-12 pr-4 py-4 bg-black/40 border border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/50 transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                Access Key
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Shield size={18} className="text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="block w-full pl-12 pr-4 py-4 bg-black/40 border border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/50 transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold animate-shake">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:hover:bg-yellow-400 text-black font-black uppercase tracking-widest text-sm rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(234,179,8,0.15)]"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    Verify Identity
                                    <ChevronRight size={18} strokeWidth={3} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center space-y-4">
                    <p className="text-slate-600 text-[10px] font-medium leading-relaxed max-w-[280px] mx-auto uppercase tracking-wider">
                        By logging in, you certify compliance with the Plimsoll Maritime Protocol and ISO 17020 data integrity standards.
                    </p>
                    <div className="flex items-center justify-center gap-6 opacity-30 grayscale">
                        <span className="text-[10px] font-black tracking-tighter text-white">ISO 17020</span>
                        <span className="text-[10px] font-black tracking-tighter text-white">BIMCO</span>
                        <span className="text-[10px] font-black tracking-tighter text-white">IMO v2.1</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
