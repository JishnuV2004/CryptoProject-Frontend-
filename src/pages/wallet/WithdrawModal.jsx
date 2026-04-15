import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { paymentAPI } from '../../services/api'

export default function WithdrawModal({ onClose }) {
    const [form, setForm] = useState({ amount: '', bank_name: '', account_number: '', ifsc: '' })
    const [loading, setLoading] = useState(false)

    const handleWithdraw = async (e) => {
        e.preventDefault()
        if (parseFloat(form.amount) < 500) return toast.error('Minimum withdrawal is ₹500')
        setLoading(true)
        try {
            await paymentAPI.withdraw(form)
            toast.success('Withdrawal request initiated!')
            onClose()
        } catch (err) {
            toast.error(err || 'Failed to initiate withdrawal')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 w-full max-w-md
                      animate-fade-up shadow-panel">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display text-2xl text-white tracking-[0.1em]">LIQUIDATE ASSETS</h3>
                    <button onClick={onClose} className="text-muted hover:text-white transition-colors text-xl">✕</button>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
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
                        <div className="col-span-2">
                            <label className="text-muted text-[10px] uppercase font-bold tracking-[0.2em] block mb-1">Bank Name</label>
                            <input
                                type="text"
                                value={form.bank_name}
                                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                                placeholder="e.g. HDFC Bank"
                                className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-muted text-[10px] uppercase font-bold tracking-[0.2em] block mb-1">Account Number</label>
                            <input
                                type="password"
                                value={form.account_number}
                                onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                                placeholder="••••••••••••"
                                className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-brand-gold transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-muted text-[10px] uppercase font-bold tracking-[0.2em] block mb-1">IFSC Code</label>
                            <input
                                type="text"
                                value={form.ifsc}
                                onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
                                placeholder="HDFC0001234"
                                className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-brand-gold transition-all"
                                required
                            />
                        </div>
                    </div>

                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest text-center py-2">
                        Withdrawals are processed within 2-3 business days.
                    </p>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-brand-panel border border-brand-border text-white font-bold text-xs uppercase tracking-[0.2em]
                       rounded-xl hover:bg-brand-gold hover:text-brand-bg hover:border-brand-gold transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg"
                    >
                        {loading ? 'PROCESSING...' : 'REQUEST WITHDRAWAL'}
                    </button>
                </form>
            </div>
        </div>
    )
}
