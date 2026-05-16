import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { authAPI } from '../../services/api'

export default function ForgotPasswordPage() {
    const [form, setForm] = useState({ email: '', otp: '', newpassword: '', confirmpassword: '' })
    const [loading, setLoading] = useState(false)
    const [otpState, setOtpState] = useState({ sending: false, sent: false, verifying: false, verified: false })
    const navigate = useNavigate()

    const handleSendOtp = async () => {
        if (!form.email) return toast.error('Please enter your email first')
        setOtpState(prev => ({ ...prev, sending: true }))
        try {
            await authAPI.forgotOtp({ email: form.email })
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
            // Using the existing verifyOtp endpoint since backend typically verifies matching email/otp
            await authAPI.verifyOtp({ email: form.email, otp: form.otp })
            setOtpState(prev => ({ ...prev, verifying: false, verified: true }))
            toast.success('Email verified successfully! You can now change your password.')
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
        if (form.newpassword !== form.confirmpassword) {
            return toast.error('Passwords do not match')
        }
        setLoading(true)
        try {
            const payload = {
                email: form.email,
                newpassword: form.newpassword,
                confirmpassword: form.confirmpassword
            }
            const res = await authAPI.changePassword(payload)
            
            if (res && res.success === false) {
                throw new Error(res.message || 'Failed to change password')
            }
            
            toast.success('Password changed successfully!')
            navigate('/auth/login')
        } catch (err) {
            toast.error(err.message || err || 'Failed to change password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-gold/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse-gold"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-red/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none animate-pulse-red"></div>

            <div className="w-full max-w-md relative z-10 bg-brand-surface/60 backdrop-blur-2xl border border-brand-border
                      rounded-3xl p-8 shadow-[0_0_50px_rgba(229,9,20,0.05)] animate-fade-up">

                <div className="text-center mb-10">
                    <div className="w-24 h-24 mx-auto mb-5 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(229,9,20,0.3)] bg-brand-bg flex items-center justify-center">
                        <img src="/crytinox-logo.png" alt="Crytinox Logo" className="w-full h-full object-cover" />
                    </div>
                    <p className="font-display text-3xl tracking-[0.15em] text-white">RECOVER</p>
                    <p className="text-brand-red text-[10px] mt-2 uppercase font-bold tracking-[0.3em]">Reset Your Password</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Step 1: Email Entry */}
                    {!otpState.verified && (
                        <div>
                            <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    disabled={otpState.verified || otpState.sent}
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
                            </div>
                        </div>
                    )}

                    {/* Step 2: OTP Entry */}
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

                    {/* Step 3: Password Reset */}
                    {otpState.verified && (
                        <div className="animate-fade-in space-y-5">
                            <div>
                                <label className="text-brand-gold text-[10px] uppercase font-bold mb-1.5 block tracking-widest">Email Verified</label>
                                <div className="w-full bg-brand-panel/80 border border-brand-gold/50 rounded-xl px-4 py-3.5 text-white text-sm shadow-inner flex justify-between items-center opacity-70">
                                    <span>{form.email}</span>
                                    <span className="text-brand-gold text-xs font-bold">✓ VERIFIED</span>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">New Password</label>
                                <input
                                    type="password"
                                    value={form.newpassword}
                                    onChange={(e) => setForm({ ...form, newpassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-brand-panel/80 border border-brand-border rounded-xl
                                 px-4 py-3.5 text-white text-sm placeholder-dim outline-none
                                 focus:border-brand-gold/50 focus:bg-brand-panel transition-all shadow-inner"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={form.confirmpassword}
                                    onChange={(e) => setForm({ ...form, confirmpassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-brand-panel/80 border border-brand-border rounded-xl
                                 px-4 py-3.5 text-white text-sm placeholder-dim outline-none
                                 focus:border-brand-gold/50 focus:bg-brand-panel transition-all shadow-inner"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-brand-red via-brand-gold to-brand-red bg-[length:200%_auto] text-white
                               font-bold text-xs tracking-[0.2em]
                               hover:shadow-[0_0_25px_rgba(229,9,20,0.5)] hover:bg-right active:scale-[0.98]
                               disabled:opacity-50 disabled:grayscale transition-all duration-300"
                            >
                                {loading ? 'UPDATING...' : 'CHANGE PASSWORD'}
                            </button>
                        </div>
                    )}
                </form>

                <div className="flex justify-center mt-8 text-[10px] font-bold tracking-widest">
                    <Link to="/auth/login" className="text-muted hover:text-white uppercase transition-colors">
                        Remember your password? <span className="text-brand-gold ml-2 border-b border-brand-gold/30 pb-0.5 hover:border-brand-gold">Login Here →</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
