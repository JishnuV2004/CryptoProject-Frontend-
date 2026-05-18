import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { tradeAPI, walletAPI, cryptoWalletAPI } from '../../services/api'
import { formatINR } from '../../utils/format'
import { useAuthStore } from '../../store/authStore'

const ORDER_TYPES = ['Market', 'Limit', 'Stop Loss', 'Take Profit']

export default function TradeForm({ symbol, coin, livePrice }) {
    const [side, setSide] = useState('buy')  // 'buy' | 'sell'
    const [type, setType] = useState('Market')
    const [loading, setLoading] = useState(false)
    const [inrBalance, setInrBalance] = useState(0)
    const [cryptoBalance, setCryptoBalance] = useState(0)
    const user = useAuthStore(s => s.user)
    const [fields, setFields] = useState({
        quantity: '',
        limitPrice: '',
        stopPrice: '',
        targetPrice: '',
    })

    const pair = `${coin || 'BTC'}-INR`

    const fetchBalances = async () => {
        if (!user) return
        try {
            const inrRes = await walletAPI.getMe().catch(() => null)
            if (inrRes?.data) setInrBalance(inrRes.data.balance || 0)

            const cryptoRes = await cryptoWalletAPI.getWallets().catch(() => null)
            if (cryptoRes?.data) {
                const targetCoin = coin || 'BTC'
                const match = cryptoRes.data.find(w => (w.Asset?.Symbol || w.Asset?.symbol || '') === targetCoin)
                if (match) setCryptoBalance(match.Balance || match.balance || 0)
            }
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchBalances()
        window.addEventListener('order_placed', fetchBalances)
        return () => window.removeEventListener('order_placed', fetchBalances)
    }, [user, coin])

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

    const activePrice = parseFloat(fields.limitPrice) || (livePrice || 0)

    const handlePercentage = (pct) => {
        if (side === 'buy') {
            const availableInr = inrBalance / 100
            if (availableInr <= 0 || activePrice <= 0) return
            const maxCoin = availableInr / activePrice
            const targetQty = (maxCoin * (pct / 100)).toFixed(6)
            setFields(f => ({ ...f, quantity: targetQty > 0 ? targetQty : '0' }))
        } else {
            const availableCoin = cryptoBalance / 1e8
            if (availableCoin <= 0) return
            const targetQty = (availableCoin * (pct / 100)).toFixed(6)
            setFields(f => ({ ...f, quantity: targetQty > 0 ? targetQty : '0' }))
        }
    }

    const handleSubmit = async () => {
        if (user?.kyc_status !== 'verified') {
            return toast.error('KYC Verification Required to Trade')
        }
        const qtyFloat = parseFloat(fields.quantity)
        if (isNaN(qtyFloat) || qtyFloat <= 0) {
            return toast.error(`Enter a valid quantity for ${coin}`)
        }

        setLoading(true)
        try {
            const orderTypeMap = {
                'Market': 'market',
                'Limit': 'limit',
                'Stop Loss': 'stop_loss',
                'Take Profit': 'take_profit',
            }

            const payload = {
                symbol: pair,
                side: side,
                type: orderTypeMap[type],
                quantity: Math.round(qtyFloat * 1e8),
                price: Math.round((parseFloat(fields.limitPrice) || 0) * 100),
                stopprice: Math.round((parseFloat(fields.stopPrice) || 0) * 100),
                targetprice: Math.round((parseFloat(fields.targetPrice) || 0) * 100),
            }

            if (type === 'Limit' && payload.price <= 0) {
                setLoading(false)
                return toast.error('Limit price is required')
            }
            if (type === 'Stop Loss' && payload.stopprice <= 0) {
                setLoading(false)
                return toast.error('Stop price is required')
            }
            if (type === 'Take Profit' && payload.targetprice <= 0) {
                setLoading(false)
                return toast.error('Target price is required')
            }

            await tradeAPI.createOrder(payload)
            toast.success(`${type} ${side.toUpperCase()} order placed successfully!`)
            setFields({ quantity: '', limitPrice: '', stopPrice: '', targetPrice: '' })
            window.dispatchEvent(new Event('order_placed'))
        } catch (err) {
            toast.error(err || 'Order placement failed')
        } finally {
            setLoading(false)
        }
    }

    const estTotal = (parseFloat(fields.quantity || 0) * activePrice)
    const fee = estTotal * 0.001

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
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={inputClass}
                >
                    {ORDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {/* Dynamic Fields */}
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-muted text-[10px] uppercase font-bold tracking-widest leading-none">Quantity ({coin})</label>
                        <span className="text-[10px] text-brand-gold font-mono">
                            Avail: {side === 'buy' ? formatINR(inrBalance / 100) : `${(cryptoBalance / 1e8).toFixed(4)} ${coin}`}
                        </span>
                    </div>
                    <input type="number" min="0.000001" step="any" value={fields.quantity} onChange={set('quantity')} placeholder="0.01" className={inputClass} required />
                    <div className="flex gap-1.5 mt-2">
                        {[25, 50, 75, 100].map(pct => (
                            <button
                                key={pct}
                                type="button"
                                onClick={() => handlePercentage(pct)}
                                className="flex-1 py-1 text-[10px] bg-brand-panel hover:bg-brand-gold/20 hover:text-brand-gold text-muted font-mono rounded border border-brand-border transition-all"
                            >
                                {pct}%
                            </button>
                        ))}
                    </div>
                </div>

                {type === 'Limit' && (
                    <div>
                        <label className={labelClass}>Limit Price (INR)</label>
                        <input type="number" step="any" value={fields.limitPrice} onChange={set('limitPrice')} placeholder={(livePrice || 0).toFixed(2)} className={inputClass} required />
                    </div>
                )}

                {type === 'Stop Loss' && (
                    <div>
                        <label className={labelClass}>Stop Loss Price (INR)</label>
                        <input type="number" step="any" value={fields.stopPrice} onChange={set('stopPrice')} placeholder={(livePrice * 0.95 || 0).toFixed(2)} className={inputClass} required />
                    </div>
                )}

                {type === 'Take Profit' && (
                    <div>
                        <label className={labelClass}>Take Profit Target Price (INR)</label>
                        <input type="number" step="any" value={fields.targetPrice} onChange={set('targetPrice')} placeholder={(livePrice * 1.05 || 0).toFixed(2)} className={inputClass} required />
                    </div>
                )}
            </div>

            {/* Calculation */}
            <div className="bg-brand-panel/40 rounded-xl p-4 border border-brand-border/50 space-y-1">
                <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-1">
                    <span className="text-muted">Est. Total</span>
                    <span className="text-white font-mono">{formatINR(estTotal)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase">
                    <span className="text-muted">Est. Fee (0.1%)</span>
                    <span className="text-white font-mono">{formatINR(fee)}</span>
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
                {loading ? 'EXECUTING...' : `${side.toUpperCase()} ${coin}`}
            </button>
        </div>
    )
}
