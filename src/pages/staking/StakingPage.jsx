import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { stakingAPI } from '../../services/api'
import { formatINR, formatCrypto } from '../../utils/format'

// TODO (API INTEGRATION): Fetch these dynamic staking options from the backend
const STAKE_OPTIONS = [
    { coin: 'BTC', apr: '5.2%', duration: '30 Days', min: 0.001 },
    { coin: 'ETH', apr: '7.4%', duration: '60 Days', min: 0.01 },
    { coin: 'SOL', apr: '12.8%', duration: '90 Days', min: 1.0 },
    { coin: 'BNB', apr: '9.5%', duration: '120 Days', min: 0.5 },
]

export default function StakingPage() {
    const [activeStakes, setActiveStakes] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        stakingAPI.list().then((res) => setActiveStakes(res.data || [])).catch(() => { })
    }, [])

    const handleStake = async (o) => {
        setLoading(true)
        try {
            await stakingAPI.stake({ coin: o.coin, amount: o.min, duration_days: parseInt(o.duration) })
            toast.success(`Successfully staked ${o.min} ${o.coin}`)
            const res = await stakingAPI.list()
            setActiveStakes(res.data || [])
        } catch (err) {
            toast.error(err || 'Staking failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-10 animate-fade-up">
            <div>
                <h2 className="font-display text-4xl text-white tracking-[0.2em] mb-1">ASSET STAKING</h2>
                <p className="text-muted text-[10px] uppercase font-bold tracking-[0.3em]">Institutional Yield Generation Protocol</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {STAKE_OPTIONS.map((o) => (
                    <div key={o.coin} className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-5 hover:border-brand-gold/40 transition-all shadow-panel group relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-brand-gold/5 blur-2xl group-hover:bg-brand-gold/10 transition-all" />

                        <div className="flex justify-between items-center">
                            <div className="w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold font-mono text-xl">
                                {o.coin[0]}
                            </div>
                            <div className="text-right">
                                <p className="text-up font-mono text-xl font-bold">{o.apr}</p>
                                <p className="text-muted text-[8px] uppercase font-bold tracking-widest leading-none">Annual Est. Yield</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-white text-lg font-bold tracking-tight">{o.coin} Locked Staking</p>
                            <div className="flex justify-between items-center">
                                <span className="text-muted text-[10px] uppercase font-bold tracking-widest">Duration</span>
                                <span className="text-white text-xs font-bold uppercase">{o.duration}</span>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            onClick={() => handleStake(o)}
                            className="w-full py-3 bg-brand-panel border border-brand-border text-brand-gold text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-gold hover:text-brand-bg hover:border-brand-gold transition-all active:scale-[0.98] shadow-lg"
                        >
                            Stake Min {o.min}
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel">
                <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/30">
                    <h3 className="font-display text-lg text-white tracking-widest">ACTIVE PROTOCOLS</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="h-10 bg-brand-panel/10 text-muted text-[9px] uppercase tracking-[0.2em] font-bold">
                                <th className="px-6 py-2 text-left">Asset</th>
                                <th className="px-6 py-2 text-left">Principle</th>
                                <th className="px-6 py-2 text-left">APY</th>
                                <th className="px-6 py-2 text-left">Release Date</th>
                                <th className="px-6 py-2 text-left">Rewards</th>
                                <th className="px-6 py-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/40 font-bold uppercase tracking-tighter text-[10px]">
                            {activeStakes.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted tracking-widest italic">No active staking protocols found</td></tr>
                            )}
                            {activeStakes.map(s => (
                                <tr key={s.id} className="hover:bg-brand-panel/40 transition-colors">
                                    <td className="px-6 py-4 text-white">{s.coin}</td>
                                    <td className="px-6 py-4 text-white font-mono">{s.amount}</td>
                                    <td className="px-6 py-4 text-up font-mono">{s.apr}%</td>
                                    <td className="px-6 py-4 text-muted font-mono">{new Date(s.end_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-brand-gold font-mono">{s.reward_earned}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20">Staking</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
