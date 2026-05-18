import { useState, useEffect } from 'react'
import { tradeAPI } from '../../services/api'

export default function MarketTrades({ symbol }) {
    const [trades, setTrades] = useState([])
    const [loading, setLoading] = useState(true)

    const coin = symbol?.replace('USDT', '') || 'BTC'
    const pair = `${coin}-INR`

    useEffect(() => {
        loadTrades()
        const interval = setInterval(loadTrades, 2000)
        return () => clearInterval(interval)
    }, [pair])

    const loadTrades = async () => {
        try {
            const res = await tradeAPI.getTradeHistory(pair, 30)
            setTrades(res?.data || [])
            setLoading(false)
        } catch (err) {
            // silent catch for polling
        }
    }

    return (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 flex flex-col h-full shadow-panel overflow-hidden">
            <div className="flex justify-between items-center pb-3 border-b border-brand-border/60 mb-2">
                <h3 className="font-display text-sm text-white tracking-widest uppercase">Recent Executions</h3>
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Live Market Feed</span>
            </div>

            <div className="grid grid-cols-3 text-[10px] font-bold text-muted uppercase tracking-wider pb-2 px-2">
                <span className="text-left">Price (INR)</span>
                <span className="text-right">Qty ({coin})</span>
                <span className="text-right">Time</span>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-muted text-xs italic font-mono py-12">
                    Loading trades...
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px] no-scrollbar max-h-[450px]">
                    {trades.length > 0 ? (
                        trades.map((t, idx) => {
                            const prev = trades[idx + 1]
                            const isUp = !prev || t.Price >= prev.Price
                            const priceVal = (t.Price || 0) / 100
                            const qty = parseFloat(t.Quantity || t.quantity || 0) / 1e8
                            const timeStr = new Date(t.CreatedAt || t.created_at).toLocaleTimeString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                            })

                            return (
                                <div key={t.ID || idx} className="grid grid-cols-3 py-1.5 px-2 hover:bg-brand-panel/40 rounded transition-colors items-center">
                                    <span className={`font-bold ${isUp ? 'text-up' : 'text-down'}`}>
                                        {priceVal.toLocaleString()}
                                    </span>
                                    <span className="text-white text-right">{qty >= 1 ? qty.toLocaleString() : qty.toFixed(4)}</span>
                                    <span className="text-muted text-right text-[10px]">{timeStr}</span>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center text-muted/50 text-xs italic py-12">No recent executions</div>
                    )}
                </div>
            )}
        </div>
    )
}
