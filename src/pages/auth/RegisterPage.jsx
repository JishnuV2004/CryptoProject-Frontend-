import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function RegisterPage() {
    const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm_password: '', otp: '' })
    const [loading, setLoading] = useState(false)
    const [otpState, setOtpState] = useState({ sending: false, sent: false, verifying: false, verified: false })
    const { setAuth, theme, toggleTheme } = useAuthStore()
    const navigate = useNavigate()

    const handleSendOtp = async () => {
        if (!form.email) return toast.error('Please enter your email first')
        setOtpState(prev => ({ ...prev, sending: true }))
        try {
            await authAPI.sendOtp({ email: form.email })
            setOtpState(prev => ({ ...prev, sending: false, sent: true }))
            toast.success('OTP sent to your email!')
        } catch (err) {
            setOtpState(prev => ({ ...prev, sending: false }))
            toast.error(err.message || err || 'Failed to send OTP')
        }
    }

    const handleVerifyOtp = async () => {
        if (!form.otp) return toast.error('Please enter the OTP')
        setOtpState(prev => ({ ...prev, verifying: true }))
        try {
            await authAPI.verifyOtp({ email: form.email, otp: form.otp })
            setOtpState(prev => ({ ...prev, verifying: false, verified: true }))
            toast.success('Email verified successfully!')
        } catch (err) {
            setOtpState(prev => ({ ...prev, verifying: false }))
            toast.error(err.message || err || 'Invalid OTP')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!otpState.verified) {
            return toast.error('Please verify your email first')
        }
        if (form.password !== form.confirm_password) {
            return toast.error('Passwords do not match')
        }
        setLoading(true)
        try {
            const payload = {
                name: form.full_name,
                email: form.email,
                password: form.password,
                conformpassword: form.confirm_password
            }
            const res = await authAPI.register(payload)
            
            if (res && res.success === false) {
                throw new Error(res.message || 'Registration failed')
            }
            
            // Auto-login to obtain backend HTTPOnly cookies and active session state
            try {
                const loginRes = await authAPI.login({
                    email: form.email,
                    password: form.password
                })
                if (loginRes.success && loginRes.data) {
                    setAuth(loginRes.data, 'session-active')
                }
            } catch (loginErr) {
                console.error('Auto-login failed:', loginErr)
            }
            
            navigate('/kyc')
            toast.success('Account created! Please complete KYC.')
        } catch (err) {
            toast.error(err.message || err || 'Registration failed')
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

                <div className="text-center mb-10">
                    <div className="w-24 h-24 mx-auto mb-5 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(229,9,20,0.3)] bg-brand-bg flex items-center justify-center">
                        <img src="/crytinox-logo.png" alt="Crytinox Logo" className="w-full h-full object-cover" />
                    </div>
                    <p className="font-display text-3xl tracking-[0.15em] text-white">CRYTINOX</p>
                    <p className="text-brand-red text-[10px] mt-2 uppercase font-bold tracking-[0.3em]">Institutional Grade Trading</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">Full Name</label>
                        <input
                            type="text"
                            value={form.full_name}
                            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                            placeholder="John Doe"
                            className="w-full bg-brand-panel/80 border border-brand-border rounded-xl
                         px-4 py-3.5 text-white text-sm placeholder-dim outline-none
                         focus:border-brand-gold/50 focus:bg-brand-panel transition-all shadow-inner"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                disabled={otpState.verified}
                                placeholder="you@email.com"
                                className="w-full bg-brand-panel/80 border border-brand-border rounded-xl
                             px-4 py-3.5 text-white text-sm placeholder-dim outline-none
                             focus:border-brand-gold/50 focus:bg-brand-panel transition-all shadow-inner pr-24"
                                required
                            />
                            {!otpState.verified && (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={otpState.sending || !form.email}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-brand-gold/10 text-brand-gold text-[10px] font-bold tracking-wider rounded-lg hover:bg-brand-gold/20 transition-colors disabled:opacity-50"
                                >
                                    {otpState.sending ? 'SENDING...' : otpState.sent ? 'RESEND' : 'SEND OTP'}
                                </button>
                            )}
                            {otpState.verified && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gold text-xs font-bold">✓ VERIFIED</span>
                            )}
                        </div>
                    </div>

                    {otpState.sent && !otpState.verified && (
                        <div className="animate-fade-in">
                            <label className="text-brand-red text-[10px] uppercase font-bold mb-1.5 block tracking-widest">Verification Code</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={form.otp}
                                    onChange={(e) => setForm({ ...form, otp: e.target.value })}
                                    placeholder="Enter 6-digit OTP"
                                    className="w-full bg-brand-red/5 border border-brand-red/30 rounded-xl
                                 px-4 py-3.5 text-brand-red text-sm font-mono tracking-[0.5em] placeholder-brand-red/30 outline-none
                                 focus:border-brand-red focus:bg-brand-red/10 transition-all shadow-inner pr-24"
                                    maxLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    disabled={otpState.verifying || form.otp.length < 4}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-brand-red text-white text-[10px] font-bold tracking-wider rounded-lg hover:shadow-red-md hover:bg-brand-red/90 transition-all disabled:opacity-50"
                                >
                                    {otpState.verifying ? '...' : 'VERIFY'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full bg-brand-panel/80 border border-brand-border rounded-xl
                         px-4 py-3.5 text-white text-sm placeholder-dim outline-none
                         focus:border-brand-gold/50 focus:bg-brand-panel transition-all shadow-inner"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">Confirm Password</label>
                        <input
                            type="password"
                            value={form.confirm_password}
                            onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full bg-brand-panel/80 border border-brand-border rounded-xl
                         px-4 py-3.5 text-white text-sm placeholder-dim outline-none
                         focus:border-brand-gold/50 focus:bg-brand-panel transition-all shadow-inner"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !otpState.verified}
                        className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-brand-red via-brand-gold to-brand-red bg-[length:200%_auto] text-white
                       font-bold text-xs tracking-[0.2em]
                       hover:shadow-[0_0_25px_rgba(229,9,20,0.5)] hover:bg-right active:scale-[0.98]
                       disabled:opacity-50 disabled:grayscale transition-all duration-300"
                    >
                        {loading ? 'CREATING ACCOUNT...' : 'REGISTER ACCOUNT'}
                    </button>
                </form>

                <div className="flex justify-center mt-8 text-[10px] font-bold tracking-widest">
                    <Link to="/auth/login" className="text-muted hover:text-white uppercase transition-colors">
                        Already have an account? <span className="text-brand-gold ml-2 border-b border-brand-gold/30 pb-0.5 hover:border-brand-gold">Login Here →</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
