import { useEffect, useState } from 'react'
import { leaderAPI } from '../../services/api'
import { formatINR } from '../../utils/format'

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState([])

    useEffect(() => {
        leaderAPI.getLeaderboard(10).then((res) => setLeaders(res.data || [])).catch(() => { })
    }, [])

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-up">
            <div className="text-center">
                <h2 className="font-display text-5xl text-white tracking-[0.3em] mb-2 drop-shadow-lg">GLOBAL LEADERBOARD</h2>
                <p className="text-brand-gold text-[10px] uppercase font-bold tracking-[0.5em] opacity-80">Profit Rankings • Updated Hourly</p>
            </div>

            {/* Top 3 Podiums */}
            <div className="flex justify-center items-end gap-4 md:gap-10 px-4">
                {/* Rank 2 */}
                <div className="flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 rounded-2xl bg-brand-surface border-2 border-slate-400/30 flex items-center justify-center text-slate-400 font-bold text-xl shadow-panel group-hover:scale-110 transition-transform">
                        {leaders[1]?.full_name?.[0] ?? '2'}
                    </div>
                    <div className="h-32 w-24 bg-gradient-to-t from-brand-surface to-slate-400/10 border-t-2 border-slate-400/40 rounded-t-2xl flex flex-col items-center justify-center p-2 shadow-panel">
                        <p className="text-white text-[9px] font-bold uppercase tracking-widest text-center truncate w-full">{leaders[1]?.full_name ?? 'Vacant'}</p>
                        <p className="text-up font-mono text-[10px] font-bold mt-1">+{formatINR(leaders[1]?.total_profit_inr || 0)}</p>
                        <span className="text-slate-400 font-display text-2xl mt-2">2ND</span>
                    </div>
                </div>

                {/* Rank 1 */}
                <div className="flex flex-col items-center gap-4 group">
                    <div className="w-20 h-20 rounded-2xl bg-brand-surface border-2 border-brand-gold flex items-center justify-center text-brand-gold font-bold text-2xl shadow-gold-md group-hover:scale-110 transition-all duration-500">
                        {leaders[0]?.full_name?.[0] ?? '1'}
                    </div>
                    <div className="h-44 w-32 bg-gradient-to-t from-brand-surface to-brand-gold/10 border-t-2 border-brand-gold rounded-t-2xl flex flex-col items-center justify-center p-2 shadow-gold-md relative">
                        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 text-xl filter drop-shadow-sm text-brand-gold">👑</div>
                        <p className="text-white text-[10px] font-bold uppercase tracking-widest text-center truncate w-full">{leaders[0]?.full_name ?? 'Champion'}</p>
                        <p className="text-up font-mono text-xs font-bold mt-1">+{formatINR(leaders[0]?.total_profit_inr || 0)}</p>
                        <span className="text-brand-gold font-display text-4xl mt-3">1ST</span>
                    </div>
                </div>

                {/* Rank 3 */}
                <div className="flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 rounded-2xl bg-brand-surface border-2 border-[#CD7F32]/30 flex items-center justify-center text-[#CD7F32] font-bold text-xl shadow-panel group-hover:scale-110 transition-transform">
                        {leaders[2]?.full_name?.[0] ?? '3'}
                    </div>
                    <div className="h-24 w-24 bg-gradient-to-t from-brand-surface to-[#CD7F32]/10 border-t-2 border-[#CD7F32]/40 rounded-t-2xl flex flex-col items-center justify-center p-2 shadow-panel">
                        <p className="text-white text-[9px] font-bold uppercase tracking-widest text-center truncate w-full">{leaders[2]?.full_name ?? 'Vacant'}</p>
                        <p className="text-up font-mono text-[10px] font-bold mt-1">+{formatINR(leaders[2]?.total_profit_inr || 0)}</p>
                        <span className="text-[#CD7F32] font-display text-xl mt-2">3RD</span>
                    </div>
                </div>
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel">
                <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/30">
                    <h3 className="font-display text-lg text-white tracking-widest uppercase">Elite Traders List</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="h-10 bg-brand-panel/10 text-muted text-[9px] uppercase tracking-[0.2em] font-bold">
                                <th className="px-6 py-2 text-left w-16">Rank</th>
                                <th className="px-6 py-2 text-left">Trader Name</th>
                                <th className="px-6 py-2 text-left">Level</th>
                                <th className="px-6 py-2 text-right">Total Volume</th>
                                <th className="px-6 py-2 text-right">P&L (INR)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/40 font-bold uppercase tracking-tighter text-[10px]">
                            {leaders.map((l, i) => (
                                <tr key={l.id} className="hover:bg-brand-panel/40 transition-colors group">
                                    <td className="px-6 py-4 text-muted font-mono">{i + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${i < 3 ? 'border-brand-gold text-brand-gold bg-brand-gold/5' : 'border-brand-border text-white'}`}>
                                                {l.full_name?.[0] ?? 'U'}
                                            </div>
                                            <span className="text-white truncate max-w-[150px]">{l.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold text-[8px] border border-brand-gold/20 leading-none">LEVEL {l.xp_points ? Math.floor(l.xp_points / 100) : 1}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-muted font-mono">{formatINR(l.total_volume || 0)}</td>
                                    <td className="px-6 py-4 text-right text-up font-mono">+{formatINR(l.total_profit_inr || 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
