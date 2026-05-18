import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { tradeAPI } from '../../services/api'
import { formatINR, formatDate } from '../../utils/format'

const TABS = ['Open Orders', 'Order History', 'My Trades']

export default function OpenOrdersTable() {
    const [tab, setTab] = useState(0)
    const [orders, setOrders] = useState([])
    const [trades, setTrades] = useState([])
    const [loading, setLoading] = useState(false)

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            if (tab === 0) {
                const res = await tradeAPI.getOrders({ status: 'open', limit: 50 })
                setOrders(res?.data || [])
            } else if (tab === 1) {
                const res = await tradeAPI.getOrders({ limit: 50 })
                setOrders(res?.data || [])
            } else if (tab === 2) {
                const res = await tradeAPI.getTrades({ limit: 50 })
                setTrades(res?.data || [])
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [tab])

    useEffect(() => {
        loadData()
        window.addEventListener('order_placed', loadData)
        return () => window.removeEventListener('order_placed', loadData)
    }, [loadData])

    const cancel = async (id) => {
        try {
            await tradeAPI.cancelOrder(id)
            setOrders((o) => o.filter((x) => (x.ID || x.id) !== id))
            toast.success('Order cancelled successfully')
            loadData()
        } catch (err) {
            toast.error(err || 'Failed to cancel order')
        }
    }

    const formatPaisa = (paisa) => formatINR((paisa || 0) / 100)

    return (
        <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel">
            <div className="flex border-b border-brand-border bg-brand-panel/20">
                {TABS.map((t, i) => (
                    <button
                        key={t}
                        onClick={() => setTab(i)}
                        className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all
                            ${tab === i
                                ? 'text-brand-gold border-b-2 border-brand-gold bg-brand-gold/5'
                                : 'text-muted hover:text-white hover:bg-brand-panel/40'
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="overflow-x-auto min-h-[250px] flex flex-col">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-muted italic text-xs py-12">
                        Loading {TABS[tab].toLowerCase()}...
                    </div>
                ) : tab === 2 ? (
                    /* My Trades Table */
                    trades.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-muted uppercase font-bold tracking-widest text-[10px] py-12">
                            No trade executions found
                        </div>
                    ) : (
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-brand-border h-10 bg-brand-panel/10">
                                    {['Trade ID', 'Symbol', 'Price', 'Quantity', 'Total', 'Fee', 'Execution Time'].map(h => (
                                        <th key={h} className="px-6 py-2 text-left text-muted font-bold text-[9px] uppercase tracking-[0.2em]">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/40 font-mono">
                                {trades.map(t => {
                                    const pVal = (t.Price || 0) / 100
                                    const qty = parseFloat(t.Quantity || t.quantity || 0) / 1e8
                                    const total = pVal * qty
                                    const feeVal = (t.Fee || 0) / 100

                                    return (
                                        <tr key={t.ID || t.id} className="hover:bg-brand-panel/30 transition-all">
                                            <td className="px-6 py-4 text-white">#{t.ID || t.id}</td>
                                            <td className="px-6 py-4 text-brand-gold font-bold">{t.Symbol || t.symbol}</td>
                                            <td className="px-6 py-4 text-white font-bold">{formatINR(pVal)}</td>
                                            <td className="px-6 py-4 text-white">{qty >= 1 ? qty.toLocaleString() : qty.toFixed(4)}</td>
                                            <td className="px-6 py-4 text-white">{formatINR(total)}</td>
                                            <td className="px-6 py-4 text-muted">{formatINR(feeVal)}</td>
                                            <td className="px-6 py-4 text-muted text-[10px]">{formatDate(t.CreatedAt || t.created_at)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )
                ) : (
                    /* Orders Table (Open or History) */
                    orders.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-muted uppercase font-bold tracking-widest text-[10px] py-12">
                            No orders found
                        </div>
                    ) : (
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-brand-border h-10 bg-brand-panel/10">
                                    {['Order ID', 'Symbol', 'Type', 'Side', 'Qty / Filled', 'Price / Trigger', 'Status', 'Date', tab === 0 && 'Action']
                                        .filter(Boolean)
                                        .map((h) => (
                                            <th key={h} className="px-6 py-2 text-left text-muted font-bold text-[9px] uppercase tracking-[0.2em]">{h}</th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/40 font-mono">
                                {orders.map(o => {
                                    const id = o.ID || o.id
                                    const symbol = o.Symbol || o.symbol || o.coin
                                    const type = o.Type || o.type || o.order_type
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
                                        <tr key={id} className="hover:bg-brand-panel/30 transition-all group">
                                            <td className="px-6 py-4 text-white">#{id}</td>
                                            <td className="px-6 py-4 text-brand-gold font-bold tracking-tight">{symbol}</td>
                                            <td className="px-6 py-4 text-muted font-bold uppercase text-[10px] tracking-tighter">{type?.replace('_', ' ')}</td>
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
                                            {tab === 0 && (
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => cancel(id)}
                                                        className="px-3 py-1 bg-down/10 rounded border border-down/30 text-down text-[10px] font-bold uppercase tracking-wider hover:bg-down hover:text-white transition-all font-body"
                                                    >
                                                        Cancel
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )
                )}
            </div>
        </div>
    )
}
