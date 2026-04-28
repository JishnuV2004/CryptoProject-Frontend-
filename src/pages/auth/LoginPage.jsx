import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [showPw, setShowPw] = useState(false)
    const { setAuth } = useAuthStore()
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
            const user = {
                id: backendUser.ID,
                full_name: backendUser.Name,
                email: backendUser.Email,
                role: backendUser.Role?.toLowerCase() || 'user',
                kyc_status: backendUser.KYCStatus ? 'verified' : 'pending',
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
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4
                    bg-[radial-gradient(ellipse_at_center,_#C9A84C11_0%,_transparent_60%)]">
            <div className="w-full max-w-md bg-brand-surface border border-brand-border
                      rounded-2xl p-8 shadow-panel animate-fade-up">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gold-gradient rounded-2xl mx-auto flex items-center justify-center shadow-gold-md mb-4">
                        <span className="font-display text-4xl tracking-widest text-brand-bg">BS</span>
                    </div>
                    <p className="font-display text-xl tracking-widest text-white">BINANCESIM</p>
                    <p className="text-muted text-xs mt-1 uppercase tracking-tighter">Institutional Grade Simulator</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Email Address</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="you@email.com"
                            className="w-full bg-brand-panel border border-brand-border rounded-lg
                         px-4 py-3 text-white text-sm placeholder-dim
                         focus:border-brand-gold transition-all"
                            required
                        />
                    </div>

                    <div className="relative">
                        <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Password</label>
                        <input
                            type={showPw ? 'text' : 'password'}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full bg-brand-panel border border-brand-border rounded-lg
                         px-4 py-3 text-white text-sm placeholder-dim pr-12
                         focus:border-brand-gold transition-all"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-9 text-muted hover:text-white text-xs font-bold"
                        >
                            {showPw ? 'HIDE' : 'SHOW'}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg bg-gold-gradient text-brand-bg
                       font-bold text-sm tracking-widest
                       hover:shadow-gold-md hover:opacity-90 active:scale-[0.98]
                       disabled:opacity-50 transition-all duration-200"
                    >
                        {loading ? 'AUTHENTICATING...' : 'LOGIN'}
                    </button>
                </form>

                <div className="flex justify-between mt-6 text-[10px] font-bold tracking-widest">
                    <Link to="/auth/register" className="text-brand-gold hover:text-brand-gold-lt uppercase">
                        Create account →
                    </Link>
                    <Link to="/auth/forgot" className="text-muted hover:text-white uppercase">
                        Forgot password?
                    </Link>
                </div>
            </div>
        </div>
    )
}
