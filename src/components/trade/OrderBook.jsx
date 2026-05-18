import { useState, useEffect } from 'react'
import { tradeAPI } from '../../services/api'
import { formatINR } from '../../utils/format'

export default function OrderBook({ symbol }) {
    const [bids, setBids] = useState([])
    const [asks, setAsks] = useState([])
    const [loading, setLoading] = useState(true)

    const coin = symbol?.replace('USDT', '') || 'BTC'
    const pair = `${coin}-INR`

    useEffect(() => {
        loadBook()
        const interval = setInterval(loadBook, 2000)
        return () => clearInterval(interval)
    }, [pair])

    const loadBook = async () => {
        try {
            const res = await tradeAPI.getOrderBook(pair)
            const data = res?.data || {}
            // Bids: highest first
            const loadedBids = (data.bids || []).slice(0, 10)
            // Asks: lowest first
            const loadedAsks = (data.asks || []).slice(0, 10)

            setBids(loadedBids)
            setAsks(loadedAsks)
            setLoading(false)
        } catch (err) {
            // silent catch for polling
        }
    }

    // Calculate max volume for depth bars
    const maxBidVol = bids.reduce((acc, b) => acc + (b.RemainingQty || b.Quantity || 0), 0) / 1e8
    const maxAskVol = asks.reduce((acc, a) => acc + (a.RemainingQty || a.Quantity || 0), 0) / 1e8
    const maxVol = Math.max(maxBidVol, maxAskVol, 0.0001)

    let currentBidAcc = 0
    let currentAskAcc = 0

    // For Asks display: we want lowest price nearest to center (bottom of Asks list)
    // So we render Asks in reverse order
    const displayAsks = [...asks].reverse()

    const spread = (asks[0]?.Price && bids[0]?.Price) 
        ? ((asks[0].Price - bids[0].Price) / 100)
        : 0

    return (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 flex flex-col h-full shadow-panel">
            <div className="flex justify-between items-center pb-3 border-b border-brand-border/60 mb-2">
                <h3 className="font-display text-sm text-white tracking-widest uppercase">Order Book</h3>
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">{pair}</span>
            </div>

            <div className="grid grid-cols-3 text-[10px] font-bold text-muted uppercase tracking-wider pb-2 px-2">
                <span className="text-left">Price (INR)</span>
                <span className="text-right">Qty ({coin})</span>
                <span className="text-right">Total</span>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-muted text-xs italic font-mono py-12">
                    Loading book depth...
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-between space-y-2 font-mono text-[11px]">
                    {/* Asks (Sells - Red) */}
                    <div className="space-y-0.5 flex-1 flex flex-col justify-end overflow-hidden">
                        {displayAsks.length > 0 ? (
                            displayAsks.map((a, idx) => {
                                const qty = parseFloat(a.RemainingQty || a.Quantity || 0) / 1e8
                                const price = (a.Price || 0) / 100
                                currentAskAcc += qty
                                const depthPct = Math.min((currentAskAcc / maxVol) * 100, 100)

                                return (
                                    <div key={a.ID || idx} className="grid grid-cols-3 py-1 px-2 relative group hover:bg-brand-panel/40 cursor-pointer rounded transition-colors">
                                        <div className="absolute right-0 top-0 bottom-0 bg-down/10 transition-all pointer-events-none" style={{ width: `${depthPct}%` }} />
                                        <span className="text-down font-bold relative z-10">{price.toLocaleString()}</span>
                                        <span className="text-white text-right relative z-10">{qty >= 1 ? qty.toLocaleString() : qty.toFixed(4)}</span>
                                        <span className="text-muted text-right relative z-10">{(price * qty).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center text-muted/50 text-[10px] italic py-4">No open asks</div>
                        )}
                    </div>

                    {/* Spread Banner */}
                    <div className="py-2 px-3 my-1 bg-brand-panel/60 border-y border-brand-border/60 flex justify-between items-center rounded-lg">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Spread</span>
                        <span className={`font-bold font-mono text-xs ${spread > 0 ? 'text-brand-gold' : 'text-muted'}`}>
                            ₹{spread.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    {/* Bids (Buys - Green) */}
                    <div className="space-y-0.5 flex-1 flex flex-col justify-start overflow-hidden">
                        {bids.length > 0 ? (
                            bids.map((b, idx) => {
                                const qty = parseFloat(b.RemainingQty || b.Quantity || 0) / 1e8
                                const price = (b.Price || 0) / 100
                                currentBidAcc += qty
                                const depthPct = Math.min((currentBidAcc / maxVol) * 100, 100)

                                return (
                                    <div key={b.ID || idx} className="grid grid-cols-3 py-1 px-2 relative group hover:bg-brand-panel/40 cursor-pointer rounded transition-colors">
                                        <div className="absolute right-0 top-0 bottom-0 bg-up/10 transition-all pointer-events-none" style={{ width: `${depthPct}%` }} />
                                        <span className="text-up font-bold relative z-10">{price.toLocaleString()}</span>
                                        <span className="text-white text-right relative z-10">{qty >= 1 ? qty.toLocaleString() : qty.toFixed(4)}</span>
                                        <span className="text-muted text-right relative z-10">{(price * qty).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center text-muted/50 text-[10px] italic py-4">No open bids</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
