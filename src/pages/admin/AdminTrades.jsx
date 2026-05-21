import { useState, useEffect, useCallback } from 'react'
import { tradeAdminAPI, adminAPI } from '../../services/api'
import { formatINR, formatDate } from '../../utils/format'
import { toast } from 'react-hot-toast'

export default function AdminTrades() {
    const [activeTab, setActiveTab] = useState('orders') // 'orders' | 'trades'
    const [orders, setOrders] = useState([])
    const [trades, setTrades] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [filterUserId, setFilterUserId] = useState('')
    const [page, setPage] = useState(1)

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            // Load users for mapping
            if (users.length === 0) {
                const uRes = await adminAPI.getUsers().catch(() => ({ data: [] }))
                const clientsOnly = (uRes?.data || []).filter(u => (u.Role || u.role) !== 'admin')
                setUsers(clientsOnly)
            }

            if (activeTab === 'orders') {
                let res
                if (filterUserId && !isNaN(parseInt(filterUserId, 10))) {
                    res = await tradeAdminAPI.getUserOrders(parseInt(filterUserId, 10), { limit: 50, page })
                } else {
                    res = await tradeAdminAPI.getAllOrders({ limit: 50, page })
                }
                setOrders(res?.data || [])
            } else {
                const res = await tradeAdminAPI.getAllTrades({ limit: 50, page })
                setTrades(res?.data || [])
            }
        } catch (err) {
            toast.error('Failed to load trade engine data')
        } finally {
            setLoading(false)
        }
    }, [activeTab, filterUserId, page, users.length])

    useEffect(() => {
        loadData()
    }, [loadData])

    const userMap = Object.fromEntries(users.map(u => [u.ID || u.id, u]))

    const formatPaisa = (p) => formatINR((p || 0) / 100)

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                    <h2 className="font-display text-4xl text-white tracking-[0.2em] mb-1">TRADE ENGINE OVERSIGHT</h2>
                    <p className="text-muted text-[10px] uppercase font-bold tracking-[0.3em]">Institutional Liquidity & Order Monitoring</p>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    {/* User ID Filter for Orders */}
                    {activeTab === 'orders' && (
                        <div className="flex items-center gap-2 bg-brand-panel px-3 py-1.5 rounded-xl border border-brand-border">
                            <span className="text-[10px] uppercase font-bold text-muted tracking-widest">User ID:</span>
                            <input
                                type="text"
                                value={filterUserId}
                                onChange={(e) => { setFilterUserId(e.target.value); setPage(1); }}
                                placeholder="All Users"
                                className="bg-transparent text-white font-mono text-xs w-20 focus:outline-none placeholder-dim"
                            />
                            {filterUserId && (
                                <button onClick={() => { setFilterUserId(''); setPage(1); }} className="text-muted hover:text-white text-xs">✕</button>
                            )}
                        </div>
                    )}

                    {/* Mode Toggle */}
                    <div className="flex bg-brand-panel p-1.5 rounded-2xl border border-brand-border">
                        <button
                            onClick={() => { setActiveTab('orders'); setPage(1); }}
                            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                activeTab === 'orders' ? 'bg-gold-gradient text-brand-bg shadow-gold-sm font-bold' : 'text-muted hover:text-white'
                            }`}
                        >
                            Global Orders ({orders.length})
                        </button>
                        <button
                            onClick={() => { setActiveTab('trades'); setPage(1); }}
                            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                activeTab === 'trades' ? 'bg-gold-gradient text-brand-bg shadow-gold-sm font-bold' : 'text-muted hover:text-white'
                            }`}
                        >
                            Matched Trades ({trades.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel">
                <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/30 flex justify-between items-center">
                    <h3 className="font-display text-lg text-white tracking-widest uppercase">
                        {activeTab === 'orders' ? 'System Open & Historical Orders' : 'System Settled Executions'}
                    </h3>
                    <div className="flex gap-2 items-center">
                        <button
                            disabled={page <= 1 || loading}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 bg-brand-panel border border-brand-border rounded text-muted hover:text-white disabled:opacity-30 text-xs font-mono font-bold"
                        >
                            ◀ Prev
                        </button>
                        <span className="text-muted text-xs font-mono px-2">Page {page}</span>
                        <button
                            disabled={(activeTab === 'orders' ? orders.length : trades.length) < 50 || loading}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 bg-brand-panel border border-brand-border rounded text-muted hover:text-white disabled:opacity-30 text-xs font-mono font-bold"
                        >
                            Next ▶
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px] flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-muted italic font-mono py-12 text-xs">
                            Loading {activeTab} oversight data...
                        </div>
                    ) : activeTab === 'orders' ? (
                        orders.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-muted uppercase font-bold tracking-widest text-xs py-12 italic">
                                No orders registered matching criteria
                            </div>
                        ) : (
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-brand-border h-10 bg-brand-panel/10">
                                        {['Order ID', 'Client', 'Symbol', 'Type', 'Side', 'Qty (Filled/Total)', 'Price/Trigger', 'Status', 'Placed Time'].map(h => (
                                            <th key={h} className="px-6 py-2 text-left text-muted font-bold text-[9px] uppercase tracking-[0.2em]">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border/40 font-mono">
                                    {orders.map(o => {
                                        const uObj = userMap[o.UserID || o.user_id] || {}
                                        const id = o.ID || o.id
                                        const symbol = o.Symbol || o.symbol || o.coin
                                        const type = o.Type || o.type || o.order_type || 'limit'
                                        const side = o.Side || o.side
                                        const qty = parseFloat(o.Quantity || o.quantity || 0) / 1e8
                                        const filledQty = parseFloat(o.FilledQty || o.filled_qty || 0) / 1e8
                                        const status = o.Status || o.status || 'open'
                                        const price = o.Price !== undefined ? o.Price : (o.price || 0)
                                        const stopPrice = o.StopPrice || o.stop_price || 0
                                        const targetPrice = o.TargetPrice || o.target_price || 0

                                        let priceDisplay = formatPaisa(price)
                                        if (type === 'stop_loss') priceDisplay = `Stop: ${formatPaisa(stopPrice)}`
                                        if (type === 'take_profit') priceDisplay = `Target: ${formatPaisa(targetPrice)}`
                                        if (type === 'market') priceDisplay = 'Market Price'

                                        return (
                                            <tr key={id} className="hover:bg-brand-panel/30 transition-all">
                                                <td className="px-6 py-4 text-white font-bold">#{id}</td>
                                                <td className="px-6 py-4 font-body">
                                                    <p className="text-white font-bold text-xs uppercase tracking-wider">{uObj.Name || uObj.full_name || `User #${o.UserID || o.user_id}`}</p>
                                                    <p className="text-muted text-[10px] font-mono lowercase tracking-normal">{uObj.Email || uObj.email || 'System user'}</p>
                                                </td>
                                                <td className="px-6 py-4 text-brand-gold font-bold">{symbol}</td>
                                                <td className="px-6 py-4 text-muted uppercase text-[10px] font-bold tracking-tight">{type?.replace('_', ' ')}</td>
                                                <td className={`px-6 py-4 font-bold uppercase text-[10px] tracking-widest ${side === 'buy' ? 'text-up' : 'text-down'}`}>
                                                    {side}
                                                </td>
                                                <td className="px-6 py-4 text-white">
                                                    <span>{filledQty >= 1 ? filledQty.toLocaleString() : filledQty.toFixed(4)}</span> / <span className="text-muted">{qty >= 1 ? qty.toLocaleString() : qty.toFixed(4)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-white font-bold">{priceDisplay}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                                                        status === 'filled' ? 'bg-up/10 text-up border-up/30' :
                                                        status === 'open' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                                                        status === 'partial' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' :
                                                        'bg-brand-panel text-muted border-brand-border'
                                                    }`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-muted text-[10px]">{formatDate(o.CreatedAt || o.created_at)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )
                    ) : (
                        trades.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-muted uppercase font-bold tracking-widest text-xs py-12 italic">
                                No trade executions registered
                            </div>
                        ) : (
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-brand-border h-10 bg-brand-panel/10">
                                        {['Trade ID', 'Symbol', 'Buyer', 'Seller', 'Price', 'Quantity', 'Gross Total', 'Platform Fee', 'Settled Time'].map(h => (
                                            <th key={h} className="px-6 py-2 text-left text-muted font-bold text-[9px] uppercase tracking-[0.2em]">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border/40 font-mono">
                                    {trades.map(t => {
                                        const bObj = userMap[t.BuyerID || t.buyer_id] || {}
                                        const sObj = userMap[t.SellerID || t.seller_id] || {}
                                        const pVal = (t.Price || 0) / 100
                                        const qty = parseFloat(t.Quantity || t.quantity || 0) / 1e8
                                        const totalVal = pVal * qty
                                        const feeVal = (t.Fee || 0) / 100

                                        return (
                                            <tr key={t.ID || t.id} className="hover:bg-brand-panel/30 transition-all">
                                                <td className="px-6 py-4 text-white font-bold">#{t.ID || t.id}</td>
                                                <td className="px-6 py-4 text-brand-gold font-bold">{t.Symbol || t.symbol}</td>
                                                <td className="px-6 py-4 font-body">
                                                    <span className="text-up font-bold text-xs uppercase tracking-wider">{bObj.Name || bObj.full_name || `User #${t.BuyerID || t.buyer_id}`}</span>
                                                </td>
                                                <td className="px-6 py-4 font-body">
                                                    <span className="text-down font-bold text-xs uppercase tracking-wider">{sObj.Name || sObj.full_name || `User #${t.SellerID || t.seller_id}`}</span>
                                                </td>
                                                <td className="px-6 py-4 text-white font-bold">{formatINR(pVal)}</td>
                                                <td className="px-6 py-4 text-white">{qty >= 1 ? qty.toLocaleString() : qty.toFixed(4)}</td>
                                                <td className="px-6 py-4 text-white font-bold">{formatINR(totalVal)}</td>
                                                <td className="px-6 py-4 text-muted">{formatINR(feeVal)}</td>
                                                <td className="px-6 py-4 text-muted text-[10px]">{formatDate(t.CreatedAt || t.created_at)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
