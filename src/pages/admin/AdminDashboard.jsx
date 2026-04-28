import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatINR } from '../../utils/format'

const DUMMY_DATA = [
    { date: 'Mon', volume: 1200000 },
    { date: 'Tue', volume: 1800000 },
    { date: 'Wed', volume: 1500000 },
    { date: 'Thu', volume: 2200000 },
    { date: 'Fri', volume: 2800000 },
    { date: 'Sat', volume: 2400000 },
    { date: 'Sun', volume: 3100000 },
]

export default function AdminDashboard() {
    return (
        <div className="space-y-8 animate-fade-up">
            <div>
                <h2 className="font-display text-4xl text-white tracking-[0.2em] mb-1">SYSTEM OVERVIEW</h2>
                <p className="text-muted text-[10px] uppercase font-bold tracking-[0.3em]">Platform Metrics & Analytics</p>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-panel">
                    <p className="text-muted text-[10px] uppercase font-bold tracking-widest mb-2">Total Users</p>
                    <p className="text-white text-3xl font-mono font-bold">12,458</p>
                    <p className="text-up text-[10px] font-bold mt-2">+12% this week</p>
                </div>
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-panel">
                    <p className="text-muted text-[10px] uppercase font-bold tracking-widest mb-2">Total Managed Assets</p>
                    <p className="text-brand-gold text-3xl font-mono font-bold">{formatINR(84500000)}</p>
                    <p className="text-up text-[10px] font-bold mt-2">+5.4% this week</p>
                </div>
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-panel">
                    <p className="text-muted text-[10px] uppercase font-bold tracking-widest mb-2">Active Sessions</p>
                    <p className="text-white text-3xl font-mono font-bold">1,204</p>
                    <p className="text-muted text-[10px] font-bold mt-2">Currently online</p>
                </div>
            </div>

            {/* Chart Area */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-panel">
                <h3 className="font-display text-xl text-white tracking-widest mb-6">Trading Volume (7 Days)</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={DUMMY_DATA}>
                            <defs>
                                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#E5B842" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#E5B842" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D1A" vertical={false} />
                            <XAxis dataKey="date" stroke="#6B7063" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#6B7063" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 100000}L`} />
                            <Tooltip
                                contentStyle={{ background: '#181A0E', border: '1px solid #2A2D1A', borderRadius: '12px' }}
                                itemStyle={{ color: '#E8E8D8', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                                labelStyle={{ color: '#6B7063', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                            />
                            <Area type="monotone" dataKey="volume" stroke="#E5B842" fillOpacity={1} fill="url(#colorVol)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
