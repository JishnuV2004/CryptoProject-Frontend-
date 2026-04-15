import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { paymentAPI } from '../../services/api'

export default function DepositModal({ onClose }) {
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)

    const handleDeposit = async () => {
        if (!amount || parseFloat(amount) < 100) return toast.error('Minimum deposit is ₹100')
        setLoading(true)
        try {
            const res = await paymentAPI.createOrder(parseFloat(amount))
            const orderId = res.data.razorpay_order_id

            const rzp = new window.Razorpay({
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: parseFloat(amount) * 100,  // paise
                currency: 'INR',
                name: 'BinanceSim',
                description: 'Add money to INR wallet',
                order_id: orderId,
                handler: () => {
                    toast.success('Payment received! Wallet will update shortly.')
                    onClose()
                },
                prefill: { email: 'user@example.com' },
                theme: { color: '#C9A84C' },
            })
            rzp.open()
        } catch (err) {
            toast.error(err || 'Failed to create order')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 w-full max-w-sm
                      animate-fade-up shadow-gold-md">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display text-2xl text-white tracking-[0.1em]">ADD LIQUIDITY</h3>
                    <button onClick={onClose} className="text-muted hover:text-white transition-colors text-xl">✕</button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-muted text-[10px] uppercase font-bold tracking-[0.2em] block">Deposit Amount (INR)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold font-bold">₹</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                min="100"
                                className="w-full bg-brand-panel border border-brand-border rounded-xl
                                pl-8 pr-4 py-4 text-white font-mono text-lg placeholder-dim
                                focus:border-brand-gold transition-all"
                            />
                        </div>
                    </div>

                    {/* Quick amount pills */}
                    <div className="grid grid-cols-2 gap-2">
                        {[500, 1000, 5000, 10000].map((v) => (
                            <button
                                key={v}
                                onClick={() => setAmount(String(v))}
                                className="py-2.5 rounded-xl border border-brand-border text-muted text-[10px] font-bold uppercase tracking-widest
                           hover:border-brand-gold hover:text-brand-gold hover:bg-brand-gold/5 transition-all"
                            >
                                ₹{v.toLocaleString('en-IN')}
                            </button>
                        ))}
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleDeposit}
                            disabled={loading}
                            className="w-full py-4 bg-gold-gradient text-brand-bg font-bold text-xs uppercase tracking-[0.2em]
                           rounded-xl hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all shadow-gold-sm"
                        >
                            {loading ? 'INITIALIZING...' : `PROCEED TO PAY ₹${parseFloat(amount || 0).toLocaleString('en-IN')}`}
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 group">
                        <div className="w-4 h-4 rounded-full bg-brand-gold/10 flex items-center justify-center group-hover:bg-brand-gold/20 transition-all">
                            <span className="text-[10px] text-brand-gold">🔒</span>
                        </div>
                        <p className="text-muted text-[9px] font-bold uppercase tracking-widest">
                            Secured by Razorpay · Test mode enabled
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
