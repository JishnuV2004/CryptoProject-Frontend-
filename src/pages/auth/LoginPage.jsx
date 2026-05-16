import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [showPw, setShowPw] = useState(false)
    const { setAuth, theme, toggleTheme } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await authAPI.login(form)
            
            if (!res.success) {
                throw new Error(res.message || res.error || 'Login failed')
            }

            // Map backend keys to frontend expectations
            const backendUser = res.data;
            
            let parsedKycStatus = 'not_submitted';
            const rawKyc = backendUser.KYCStatus || backendUser.kyc_status;
            if (rawKyc === true || rawKyc === 'true') {
                parsedKycStatus = 'verified';
            } else if (rawKyc) {
                const lowerKyc = String(rawKyc).toLowerCase();
                if (lowerKyc === 'verified' || lowerKyc === 'approved' || lowerKyc === 'ok') {
                    parsedKycStatus = 'verified';
                } else {
                    parsedKycStatus = lowerKyc;
                }
            }

            const user = {
                id: backendUser.ID,
                full_name: backendUser.Name,
                email: backendUser.Email,
                role: backendUser.Role?.toLowerCase() || 'user',
                kyc_status: parsedKycStatus,
                created_at: backendUser.created_at
            };

            // Provide a dummy token if the backend uses cookies/sessions and doesn't return a JWT
            setAuth(user, 'session-active')
            
            if (user.role === 'admin') {
                navigate('/admin')
            } else {
                navigate('/market')
            }
            
            toast.success('Welcome back!')
        } catch (err) {
            toast.error(err || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
            {/* Theme Toggle Switcher */}
            <div className="absolute top-6 right-6 z-20">
                <button
                    onClick={toggleTheme}
                    className="p-3 rounded-2xl border border-brand-border bg-brand-surface/60 backdrop-blur-md hover:bg-brand-surface/90 hover:border-brand-gold/40 text-brand-gold shadow-md transition-all duration-300"
                    aria-label="Toggle Theme"
                >
                    {theme === 'dark' ? (
                        <svg className="w-5 h-5 animate-pulse-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Animated Background Gradients */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-gold/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse-gold"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-red/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none animate-pulse-red"></div>

            <div className="w-full max-w-md relative z-10 bg-brand-surface/60 backdrop-blur-2xl border border-brand-border
                      rounded-3xl p-8 shadow-[0_0_50px_rgba(229,9,20,0.05)] animate-fade-up">

                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="w-24 h-24 mx-auto mb-5 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(229,9,20,0.3)] bg-brand-bg flex items-center justify-center">
                        <img src="/crytinox-logo.png" alt="Crytinox Logo" className="w-full h-full object-cover" />
                    </div>
                    <p className="font-display text-3xl tracking-[0.15em] text-white">CRYTINOX</p>
                    <p className="text-brand-red text-[10px] mt-2 uppercase font-bold tracking-[0.3em]">Institutional Grade Trading</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">Email Address</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="you@email.com"
                            className="w-full bg-brand-panel/80 border border-brand-border rounded-xl
                         px-4 py-3.5 text-white text-sm placeholder-dim outline-none
                         focus:border-brand-gold/50 focus:bg-brand-panel transition-all shadow-inner"
                            required
                        />
                    </div>

                    <div className="relative">
                        <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">Password</label>
                        <input
                            type={showPw ? 'text' : 'password'}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full bg-brand-panel/80 border border-brand-border rounded-xl
                         px-4 py-3.5 text-white text-sm placeholder-dim outline-none pr-12
                         focus:border-brand-gold/50 focus:bg-brand-panel transition-all shadow-inner"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-4 top-[38px] text-brand-gold hover:text-white text-[10px] font-bold tracking-widest transition-colors"
                        >
                            {showPw ? 'HIDE' : 'SHOW'}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-brand-red via-brand-gold to-brand-red bg-[length:200%_auto] text-white
                       font-bold text-xs tracking-[0.2em]
                       hover:shadow-[0_0_25px_rgba(229,9,20,0.5)] hover:bg-right active:scale-[0.98]
                       disabled:opacity-50 disabled:grayscale transition-all duration-300"
                    >
                        {loading ? 'AUTHENTICATING...' : 'LOGIN TO ACCOUNT'}
                    </button>
                </form>

                <div className="flex justify-between mt-8 text-[10px] font-bold tracking-widest">
                    <Link to="/auth/register" className="text-brand-gold border-b border-brand-gold/30 pb-0.5 hover:border-brand-gold hover:text-brand-gold-lt uppercase transition-all">
                        Create account →
                    </Link>
                    <Link to="/auth/forgot" className="text-muted hover:text-white uppercase transition-colors">
                        Forgot password?
                    </Link>
                </div>
            </div>
        </div>
    )
}
