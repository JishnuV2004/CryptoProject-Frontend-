import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { tradeAPI } from '../../services/api'
import { formatINR, formatDate } from '../../utils/format'

const TABS = ['Open Orders', 'Order History']

export default function OpenOrdersTable() {
    const [tab, setTab] = useState(0)
    const [orders, setOrders] = useState([])

    const load = () => {
        const status = tab === 0 ? 'pending' : 'filled'
        tradeAPI.getOrders(status).then((res) => setOrders(res.data || [])).catch(() => { })
    }

    useEffect(load, [tab])

    const cancel = async (id) => {
        try {
            await tradeAPI.cancelOrder(id)
            setOrders((o) => o.filter((x) => x.id !== id))
            toast.success('Order cancelled')
        } catch (err) {
            toast.error(err)
        }
    }

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

            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-brand-border h-10 bg-brand-panel/10">
                            {['Coin', 'Type', 'Side', 'Qty', 'Price', 'Status', 'Date', tab === 0 && 'Action']
                                .filter(Boolean)
                                .map((h) => (
                                    <th key={h} className="px-6 py-2 text-left text-muted font-bold text-[9px] uppercase tracking-[0.2em]">{h}</th>
                                ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/40">
                        {orders.length === 0 && (
                            <tr><td colSpan={8} className="px-6 py-12 text-center text-muted uppercase font-bold tracking-widest text-[10px]">No orders found</td></tr>
                        )}
                        {orders.map((o) => (
                            <tr key={o.id} className="hover:bg-brand-panel/30 transition-all group">
                                <td className="px-6 py-4 text-white font-bold tracking-tight">{o.coin}</td>
                                <td className="px-6 py-4 text-muted font-bold uppercase text-[10px] tracking-tighter">{o.order_type}</td>
                                <td className={`px-6 py-4 font-bold uppercase text-[10px] tracking-widest ${o.side === 'buy' ? 'text-up' : 'text-down'}`}>
                                    {o.side}
                                </td>
                                <td className="px-6 py-4 font-mono text-white">{parseFloat(o.quantity).toFixed(8)}</td>
                                <td className="px-6 py-4 font-mono text-muted">
                                    {formatINR(o.limit_price ?? o.stop_price ?? o.target_price ?? 0)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-brand-panel border border-brand-border text-brand-gold">
                                        {o.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-muted text-[10px] font-mono">{formatDate(o.created_at)}</td>
                                {tab === 0 && (
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => cancel(o.id)}
                                            className="px-3 py-1.5 rounded-lg border border-down/40 text-down text-[9px] font-bold uppercase tracking-tighter hover:bg-down hover:text-white transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
