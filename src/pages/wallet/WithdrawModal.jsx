import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { walletAPI, kycAPI } from '../../services/api'

export default function WithdrawModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({ amount: '', pin: '' })
    const [kycDetails, setKycDetails] = useState(null)
    const [loadingKyc, setLoadingKyc] = useState(true)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchKyc = async () => {
            try {
                const res = await kycAPI.getMe()
                if (res.success && res.data) {
                    setKycDetails(res.data)
                }
            } catch (err) {
                console.error('Failed to load bank details:', err)
            } finally {
                setLoadingKyc(false)
            }
        }
        fetchKyc()
    }, [])

    const handleWithdraw = async (e) => {
        e.preventDefault()
        if (parseFloat(form.amount) < 500) return toast.error('Minimum withdrawal is ₹500')
        if (!form.pin || form.pin.length !== 4) return toast.error('Valid 4-digit PIN required')
        
        setLoading(true)
        try {
            const res = await walletAPI.withdraw({
                amount: Math.round(parseFloat(form.amount) * 100),
                pin: form.pin
            })
            toast.success(res?.message || 'Withdrawal request initiated!')
            if (onSuccess) onSuccess()
            onClose()
        } catch (err) {
            toast.error(err || 'Failed to initiate withdrawal')
        } finally {
            setLoading(false)
        }
    }

    const formatMaskedAccount = (acc) => {
        if (!acc) return '•••• •••• ••••'
        if (acc.length > 4) {
            return `•••• •••• ${acc.slice(-4)}`
        }
        return acc
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 w-full max-w-md
                      animate-fade-up shadow-panel">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display text-2xl text-white tracking-[0.1em]">LIQUIDATE ASSETS</h3>
                    <button onClick={onClose} className="text-muted hover:text-white transition-colors text-xl">✕</button>
                </div>

                {loadingKyc ? (
                    <div className="py-12 text-center text-muted animate-pulse font-mono text-xs uppercase tracking-widest">
                        Retrieving Settlement Profile...
                    </div>
                ) : (
                    <form onSubmit={handleWithdraw} className="space-y-6">
                        {/* Target Account Display */}
                        <div className="bg-brand-panel/40 border border-brand-border rounded-2xl p-4 space-y-3">
                            <p className="text-brand-gold text-[10px] uppercase font-bold tracking-[0.2em]">Settlement Destination</p>
                            
                            {kycDetails ? (
                                <div className="space-y-2 font-mono text-xs text-white">
                                    <div className="flex justify-between">
                                        <span className="text-muted uppercase text-[9px] tracking-wider">Beneficiary:</span>
                                        <span className="font-bold uppercase">{kycDetails.FullName || kycDetails.full_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted uppercase text-[9px] tracking-wider">Account:</span>
                                        <span className="font-bold">{formatMaskedAccount(kycDetails.AccountNumber || kycDetails.account_number)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted uppercase text-[9px] tracking-wider">IFSC Code:</span>
                                        <span className="font-bold uppercase">{kycDetails.IFSCCode || kycDetails.ifsc}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-2 text-down text-xs font-bold uppercase tracking-wider">
                                    No verified bank details found. Please complete KYC.
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-muted text-[10px] uppercase font-bold tracking-[0.2em] block mb-1">Amount (INR)</label>
                                <input
                                    type="number"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    placeholder="Min ₹500"
                                    className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-brand-gold transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-muted text-[10px] uppercase font-bold tracking-[0.2em] block mb-1">Wallet PIN</label>
                                <input
                                    type="password"
                                    value={form.pin}
                                    onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                    placeholder="****"
                                    className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white font-mono tracking-[0.5em] text-center text-lg focus:border-brand-gold transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <p className="text-[10px] text-muted font-bold uppercase tracking-widest text-center">
                            Withdrawals are processed within 2-3 business days.
                        </p>

                        <button
                            type="submit"
                            disabled={loading || !kycDetails}
                            className="w-full py-4 bg-brand-panel border border-brand-border text-white font-bold text-xs uppercase tracking-[0.2em]
                           rounded-xl hover:bg-brand-gold hover:text-brand-bg hover:border-brand-gold transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg"
                        >
                            {loading ? 'PROCESSING...' : 'REQUEST WITHDRAWAL'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
