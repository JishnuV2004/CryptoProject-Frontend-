import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { marketAPI } from '../../services/api'
import { usePriceWebSocket } from '../../hooks/usePriceWebSocket'
import { formatINR, formatChange, changeClass } from '../../utils/format'

// TODO (API INTEGRATION): Fetch available market pairs dynamically from the backend
const COINS = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', abbr: 'BTC', icon: '₿' },
    { symbol: 'ETHUSDT', name: 'Ethereum', abbr: 'ETH', icon: 'Ξ' },
    { symbol: 'SOLUSDT', name: 'Solana', abbr: 'SOL', icon: '◎' },
    { symbol: 'BNBUSDT', name: 'BNB', abbr: 'BNB', icon: 'B' },
]

export default function MarketPage() {
    const [market, setMarket] = useState([])
    const { prices, flashes } = usePriceWebSocket()
    const navigate = useNavigate()

    useEffect(() => {
        marketAPI.getPrices().then((res) => setMarket(res.data || [])).catch(() => { })
    }, [])

    // Merge live WS prices into market data
    const rows = COINS.map((coin) => {
        const base = market.find((m) => m.symbol === coin.symbol) || {}
        return {
            ...coin,
            price: prices[coin.symbol] ?? base.price ?? 0,
            change24h: base.change_24h ?? 0,
            high24h: base.high_24h ?? 0,
            low24h: base.low_24h ?? 0,
            flash: flashes[coin.symbol] ?? null,
        }
    })

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Ticker Strip */}
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {rows.map((coin) => (
                    <div
                        key={coin.symbol}
                        onClick={() => navigate(`/trade/${coin.symbol}`)}
                        className={`
              flex-shrink-0 bg-brand-surface border border-brand-border rounded-xl px-5 py-4 min-w-[180px]
              cursor-pointer hover:border-brand-gold/40 transition-all group
              ${coin.flash === 'up' ? 'animate-flash-up' : coin.flash === 'down' ? 'animate-flash-down' : ''}
            `}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-brand-gold font-mono text-sm">{coin.icon}</span>
                                <span className="text-white text-xs font-bold tracking-widest">{coin.abbr}</span>
                            </div>
                            <p className={`text-[10px] font-mono font-bold ${changeClass(coin.change24h)}`}>
                                {formatChange(coin.change24h)}
                            </p>
                        </div>
                        <p className="font-mono text-white text-lg font-medium group-hover:text-brand-gold transition-colors">
                            {formatINR(coin.price * 84)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Market Table */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel">
                <div className="px-6 py-5 border-b border-brand-border flex justify-between items-center bg-brand-panel/30">
                    <h3 className="font-display text-xl text-white tracking-widest">LIVE MARKETS</h3>
                    <div className="flex gap-2">
                        <span className="w-2 h-2 rounded-full bg-up animate-pulse" />
                        <span className="text-[10px] text-muted font-bold tracking-widest uppercase">Live Data</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-brand-border h-12 bg-brand-panel/10">
                                {['#', 'Coin', 'Price (INR)', '24h Change', '24h High', '24h Low', 'Action']
                                    .map((h) => (
                                        <th key={h} className="px-6 py-3 text-left text-muted font-bold text-[10px] uppercase tracking-[0.2em]">
                                            {h}
                                        </th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((coin, i) => (
                                <tr
                                    key={coin.symbol}
                                    className={`
                    border-b border-brand-border/50 hover:bg-brand-panel/40 transition-all cursor-pointer group
                    ${coin.flash === 'up' ? 'animate-flash-up' : coin.flash === 'down' ? 'animate-flash-down' : ''}
                  `}
                                    onClick={() => navigate(`/trade/${coin.symbol}`)}
                                >
                                    <td className="px-6 py-4 text-muted font-mono">{i + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-brand-gold/5 border border-brand-gold/10
                                      flex items-center justify-center text-brand-gold text-lg font-mono
                                      group-hover:bg-brand-gold/10 group-hover:border-brand-gold/30 transition-all">
                                                {coin.icon}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold tracking-tight">{coin.name}</p>
                                                <p className="text-muted text-[10px] font-bold tracking-widest uppercase">{coin.abbr}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-white text-base">
                                        {formatINR(coin.price * 84)}
                                    </td>
                                    <td className={`px-6 py-4 font-mono font-bold ${changeClass(coin.change24h)}`}>
                                        {formatChange(coin.change24h)}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-muted text-xs">{formatINR(coin.high24h * 84)}</td>
                                    <td className="px-6 py-4 font-mono text-muted text-xs">{formatINR(coin.low24h * 84)}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            className="px-5 py-2 bg-brand-panel border border-brand-border text-brand-gold text-[10px]
                                 font-bold uppercase tracking-widest rounded-lg transition-all
                                 hover:bg-brand-gold hover:text-brand-bg hover:border-brand-gold active:scale-95"
                                        >
                                            Trade
                                        </button>
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
