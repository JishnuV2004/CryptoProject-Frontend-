import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function RegisterPage() {
    const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm_password: '' })
    const [loading, setLoading] = useState(false)
    const { setAuth } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (form.password !== form.confirm_password) {
            return toast.error('Passwords do not match')
        }
        setLoading(true)
        try {
            const res = await authAPI.register(form)
            setAuth(res.data.user, res.data.token)
            navigate('/kyc')
            toast.success('Account created! Please complete KYC.')
        } catch (err) {
            toast.error(err || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4
                    bg-[radial-gradient(ellipse_at_center,_#C9A84C11_0%,_transparent_60%)]">
            <div className="w-full max-w-md bg-brand-surface border border-brand-border
                      rounded-2xl p-8 shadow-panel animate-fade-up">

                <div className="text-center mb-8">
                    <p className="font-display text-4xl tracking-widest text-brand-gold">JOIN THE ELITE</p>
                    <p className="text-muted text-[10px] mt-1 uppercase font-bold tracking-[0.2em]">Start Your Simulation Journey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Full Name</label>
                        <input
                            type="text"
                            value={form.full_name}
                            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                            placeholder="John Doe"
                            className="w-full bg-brand-panel border border-brand-border rounded-lg
                         px-4 py-3 text-white text-sm placeholder-dim
                         focus:border-brand-gold transition-all"
                            required
                        />
                    </div>

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

                    <div>
                        <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full bg-brand-panel border border-brand-border rounded-lg
                         px-4 py-3 text-white text-sm placeholder-dim
                         focus:border-brand-gold transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Confirm Password</label>
                        <input
                            type="password"
                            value={form.confirm_password}
                            onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full bg-brand-panel border border-brand-border rounded-lg
                         px-4 py-3 text-white text-sm placeholder-dim
                         focus:border-brand-gold transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg bg-gold-gradient text-brand-bg
                       font-bold text-sm tracking-widest
                       hover:shadow-gold-md hover:opacity-90 active:scale-[0.98]
                       disabled:opacity-50 transition-all duration-200"
                    >
                        {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
                    </button>
                </form>

                <div className="flex justify-center mt-6 text-[10px] font-bold tracking-widest">
                    <Link to="/auth/login" className="text-muted hover:text-white uppercase">
                        Already have an account? <span className="text-brand-gold ml-1">Login →</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
