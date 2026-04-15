import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { reportAPI } from '../../services/api'
import { formatINR, formatDate } from '../../utils/format'

export default function ReportsPage() {
    const [pnlData, setPnlData] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        reportAPI.getPnl().then((res) => setPnlData(res.data || [])).catch(() => { })
    }, [])

    const downloadPdf = async () => {
        setLoading(true)
        try {
            const blob = await reportAPI.exportPdf('2026-04')
            const url = window.URL.createObjectURL(new Blob([blob]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'BinanceSim_Report_Apr2026.pdf')
            document.body.appendChild(link)
            link.click()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="font-display text-4xl text-white tracking-[0.2em] mb-1">P&L REPORTS</h2>
                    <p className="text-muted text-[10px] uppercase font-bold tracking-[0.3em]">Performance Analytics & Auditing</p>
                </div>
                <button
                    onClick={downloadPdf}
                    disabled={loading}
                    className="px-6 py-3 bg-brand-panel border border-brand-border text-brand-gold font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-brand-gold hover:text-brand-bg hover:border-brand-gold transition-all active:scale-[0.98] shadow-lg flex items-center gap-2"
                >
                    <span>⬇</span> {loading ? 'GENERATING...' : 'Export PDF Statement'}
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 xl:col-span-2 shadow-panel">
                    <h3 className="font-display text-xl text-white tracking-widest mb-6">Cumulative Profits</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={pnlData}>
                                <defs>
                                    <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2A2D1A" vertical={false} />
                                <XAxis dataKey="date" stroke="#6B7063" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6B7063" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ background: '#181A0E', border: '1px solid #2A2D1A', borderRadius: '12px' }}
                                    itemStyle={{ color: '#E8E8D8', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                                    labelStyle={{ color: '#6B7063', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                                />
                                <Area type="monotone" dataKey="pnl" stroke="#4CAF50" fillOpacity={1} fill="url(#colorPnl)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-6 shadow-panel">
                    <h3 className="font-display text-xl text-white tracking-widest">Key Metrics</h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-brand-panel/40 border border-brand-border/30">
                            {/* TODO (API INTEGRATION): Fetch these metrics from backend */}
                            <p className="text-muted text-[10px] uppercase font-bold tracking-widest mb-1">Total Trading Volume</p>
                            <p className="text-white text-xl font-mono font-bold">{formatINR(12500000)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-panel/40 border border-brand-border/30">
                            <p className="text-muted text-[10px] uppercase font-bold tracking-widest mb-1">Net ROI (Simulation)</p>
                            <p className="text-up text-xl font-mono font-bold">+18.42%</p>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-panel/40 border border-brand-border/30">
                            <p className="text-muted text-[10px] uppercase font-bold tracking-widest mb-1">Win Rate</p>
                            <p className="text-white text-xl font-mono font-bold">64.5%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Table */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel">
                <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/30">
                    <h3 className="font-display text-lg text-white tracking-widest">DETAILED AUDIT LOG</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="h-10 bg-brand-panel/10 text-muted text-[9px] uppercase tracking-[0.2em] font-bold">
                                <th className="px-6 py-2 text-left">UID / Ref</th>
                                <th className="px-6 py-2 text-left">Type</th>
                                <th className="px-6 py-2 text-left">Volume</th>
                                <th className="px-6 py-2 text-left">Fee (INR)</th>
                                <th className="px-6 py-2 text-left">Date</th>
                                <th className="px-6 py-2 text-left">Execution</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/40 font-bold uppercase tracking-tighter text-[10px]">
                            {/* TODO (API INTEGRATION): Replace this mapped array with actual audit logs from the backend */}
                            {[1, 2, 3, 4, 5].map(i => (
                                <tr key={i} className="hover:bg-brand-panel/40 transition-colors">
                                    <td className="px-6 py-4 text-muted font-mono">#{i}829-3A02</td>
                                    <td className="px-6 py-4 text-white">BTC/INR SETTLEMENT</td>
                                    <td className="px-6 py-4 text-white font-mono">{formatINR(35000 * i)}</td>
                                    <td className="px-6 py-4 text-down font-mono">{formatINR(35 * i)}</td>
                                    <td className="px-6 py-4 text-muted font-mono">{formatDate(new Date())}</td>
                                    <td className="px-6 py-4"><span className="text-up opacity-80 select-none">Confirmed</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
