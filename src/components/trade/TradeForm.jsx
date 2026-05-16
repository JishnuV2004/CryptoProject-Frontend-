import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { tradeAPI } from '../../services/api'
import { formatINR } from '../../utils/format'
import { useAuthStore } from '../../store/authStore'

const ORDER_TYPES = ['Market', 'Limit', 'Stop-Market', 'Stop-Limit', 'Take Profit', 'OCO', 'Trailing Stop']

export default function TradeForm({ symbol, coin, livePrice }) {
    const [side, setSide] = useState('buy')  // 'buy' | 'sell'
    const [type, setType] = useState('Market')
    const [loading, setLoading] = useState(false)
    const user = useAuthStore(s => s.user)
    const [fields, setFields] = useState({
        quantity: '',
        inrAmount: '',
        limitPrice: '',
        stopPrice: '',
        targetPrice: '',
        trailPct: '',
        stopLimit: '',
    })

    const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }))

    const inputClass = `w-full bg-brand-panel border border-brand-border rounded-lg
                      px-3 py-2.5 text-white text-sm font-mono placeholder-dim
                      focus:border-brand-gold transition-all`
    const labelClass = `text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest`

    if (!user) {
        return (
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-6 shadow-panel flex flex-col items-center justify-center text-center py-12 sticky top-4">
                <div className="w-16 h-16 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold mb-4">
                    <svg className="w-8 h-8 animate-pulse-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <div className="space-y-2">
                    <h3 className="text-base font-bold text-white">Login Required</h3>
                    <p className="text-muted text-xs leading-relaxed max-w-[200px] mx-auto">
                        Please log in or register your institutional account to trade {coin}.
                    </p>
                </div>
                <div className="w-full space-y-3 font-display">
                    <a 
                        href="/auth/login"
                        className="w-full py-3.5 bg-brand-gold text-black text-xs font-bold tracking-widest rounded-xl hover:shadow-gold-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                        LOG IN TO ACCOUNT
                    </a>
                    <a 
                        href="/auth/register"
                        className="w-full py-3.5 bg-brand-panel border border-brand-border text-white text-xs font-semibold tracking-widest rounded-xl hover:bg-brand-surface transition-all flex items-center justify-center"
                    >
                        CREATE ACCOUNT
                    </a>
                </div>
            </div>
        )
    }

    const handleSubmit = async () => {
        if (user?.kyc_status !== 'verified') {
            return toast.error('KYC Verification Required to Trade')
        }
        setLoading(true)
        try {
            const orderTypeMap = {
                'Market': 'market',
                'Limit': 'limit',
                'Stop-Market': 'stop_market',
                'Stop-Limit': 'stop_limit',
                'Take Profit': 'take_profit',
                'OCO': 'oco',
                'Trailing Stop': 'trailing_stop',
            }
            const payload = {
                side,
                coin,
                order_type: orderTypeMap[type],
                quantity: parseFloat(fields.quantity),
                limit_price: parseFloat(fields.limitPrice) || undefined,
                stop_price: parseFloat(fields.stopPrice) || undefined,
                target_price: parseFloat(fields.targetPrice) || undefined,
                trail_percent: parseFloat(fields.trailPct) || undefined,
            }

            if (type === 'Market') {
                await tradeAPI.marketOrder({ side, coin, quantity: payload.quantity })
            } else {
                await tradeAPI.createOrder(payload)
            }
            toast.success(`${type} ${side} order placed!`)
            setFields({ quantity: '', inrAmount: '', limitPrice: '', stopPrice: '', targetPrice: '', trailPct: '', stopLimit: '' })
        } catch (err) {
            toast.error(err || 'Order failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 space-y-4 shadow-panel sticky top-4">
            {user?.kyc_status !== 'verified' && (
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-3 py-2 mb-2">
                    <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest text-center">
                        ⚠️ Verify KYC to enable trading
                    </p>
                </div>
            )}

            {/* Buy / Sell Tabs */}
            <div className="flex rounded-xl overflow-hidden border border-brand-border p-1 bg-brand-panel/50">
                {['buy', 'sell'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setSide(s)}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-lg
              ${side === s
                                ? s === 'buy' ? 'bg-up text-white shadow-lg' : 'bg-down text-white shadow-lg'
                                : 'text-muted hover:text-white'
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Order Type Select */}
            <div className="space-y-1">
                <label className={labelClass}>Order Type</label>
                <div className="grid grid-cols-2 gap-2">
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className={inputClass}
                    >
                        {ORDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {/* Dynamic Fields */}
            <div className="space-y-3">
                {(type === 'Market' || type === 'Limit' || type === 'Stop-Market' || type === 'Stop-Limit' || type === 'Take Profit' || type === 'OCO') && (
                    <div>
                        <label className={labelClass}>Quantity ({coin})</label>
                        <input value={fields.quantity} onChange={set('quantity')} placeholder="0.00000000" className={inputClass} />
                    </div>
                )}

                {(type === 'Limit' || type === 'Stop-Limit' || type === 'OCO') && (
                    <div>
                        <label className={labelClass}>Limit Price (INR)</label>
                        <input value={fields.limitPrice} onChange={set('limitPrice')} placeholder="0.00" className={inputClass} />
                    </div>
                )}

                {(type === 'Stop-Market' || type === 'Stop-Limit' || type === 'OCO') && (
                    <div>
                        <label className={labelClass}>Stop Price (INR)</label>
                        <input value={fields.stopPrice} onChange={set('stopPrice')} placeholder="0.00" className={inputClass} />
                    </div>
                )}

                {(type === 'Take Profit' || type === 'OCO') && (
                    <div>
                        <label className={labelClass}>Target Price (INR)</label>
                        <input value={fields.targetPrice} onChange={set('targetPrice')} placeholder="0.00" className={inputClass} />
                    </div>
                )}

                {type === 'Trailing Stop' && (
                    <div>
                        <label className={labelClass}>Trailing Callback (%)</label>
                        <input value={fields.trailPct} onChange={set('trailPct')} placeholder="2.0" className={inputClass} />
                    </div>
                )}
            </div>

            {/* Calculation */}
            <div className="bg-brand-panel/40 rounded-xl p-4 border border-brand-border/50">
                <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2">
                    <span className="text-muted">Est. Total</span>
                    <span className="text-white">{formatINR((parseFloat(fields.quantity || 0) * (parseFloat(fields.limitPrice) || livePrice)))}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase">
                    <span className="text-muted">Fee (0.1%)</span>
                    <span className="text-white">{formatINR((parseFloat(fields.quantity || 0) * (parseFloat(fields.limitPrice) || livePrice) * 0.001))}</span>
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading || user?.kyc_status !== 'verified'}
                className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em]
                    transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale
                    ${side === 'buy'
                        ? 'bg-up hover:bg-up/90 text-white shadow-lg shadow-up/20'
                        : 'bg-down hover:bg-down/90 text-white shadow-lg shadow-down/20'
                    }`}
            >
                {loading ? 'EXECUTING...' : `${side === 'buy' ? 'BUY' : 'SELL'} ${coin}`}
            </button>
        </div>
    )
}
