import { useEffect, useState } from 'react'
import VirtualCard from '../../components/ecard/VirtualCard'
import { ecardAPI } from '../../services/api'
import { formatINR, formatDate } from '../../utils/format'

export default function ECardPage() {
    const [card, setCard] = useState(null)
    const [txs, setTxs] = useState([])

    useEffect(() => {
        ecardAPI.getCard().then((res) => setCard(res.data)).catch(() => { })
        ecardAPI.getTransactions().then((res) => setTxs(res.data || [])).catch(() => { })
    }, [])

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-up">
            <div className="text-center md:text-left">
                <h2 className="font-display text-4xl text-white tracking-[0.2em] mb-1">VIRTUAL E-CARD</h2>
                <p className="text-muted text-[10px] uppercase font-bold tracking-[0.3em]">Instant Liquidity For Real World Use</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
                {/* Card Display Container */}
                <div className="lg:col-span-2 flex flex-col items-center gap-6">
                    <VirtualCard card={card} />

                    <div className="w-full bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 shadow-panel">
                        <div className="flex justify-between items-center border-b border-brand-border pb-3">
                            <span className="text-muted text-[10px] uppercase font-bold tracking-widest">Card Status</span>
                            <span className="text-up font-mono text-[10px] font-bold uppercase tracking-widest bg-up/10 px-2 py-0.5 rounded-full border border-up/20">Active</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-brand-border pb-3">
                            <span className="text-muted text-[10px] uppercase font-bold tracking-widest">Linked Wallet</span>
                            <span className="text-white font-mono text-xs font-bold uppercase">INR MAINNET</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted text-[10px] uppercase font-bold tracking-widest">Monthly Limit</span>
                            {/* TODO (API INTEGRATION): Fetch virtual card limit from backend if supported */}
                            <span className="text-white font-mono text-xs font-bold">{formatINR(100000)}</span>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-3 bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel">
                    <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/30">
                        <h3 className="font-display text-lg text-white tracking-widest">CARD SETTLEMENTS</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="h-10 bg-brand-panel/10 text-muted text-[9px] uppercase tracking-[0.2em]">
                                    <th className="px-6 py-2 text-left">Merchant / Utility</th>
                                    <th className="px-6 py-2 text-left">Amount</th>
                                    <th className="px-6 py-2 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/40 font-bold uppercase tracking-tighter text-[10px]">
                                {txs.length === 0 && (
                                    <tr><td colSpan={3} className="px-6 py-12 text-center text-muted tracking-widest italic">No card activity found</td></tr>
                                )}
                                {txs.map(tx => (
                                    <tr key={tx.id} className="hover:bg-brand-panel/40 transition-colors">
                                        <td className="px-6 py-4 text-white">{tx.merchant_name}</td>
                                        <td className="px-6 py-4 text-down">-{formatINR(tx.amount)}</td>
                                        <td className="px-6 py-4 text-muted font-mono">{formatDate(tx.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
