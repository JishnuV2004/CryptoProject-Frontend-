import { useParams } from 'react-router-dom'
import CandlestickChart from '../../components/trade/CandlestickChart'
import TradeForm from '../../components/trade/TradeForm'
import OpenOrdersTable from '../../components/trade/OpenOrdersTable'
import { usePriceWebSocket } from '../../hooks/usePriceWebSocket'
import { formatINR } from '../../utils/format'

export default function TradePage() {
    const { symbol } = useParams()   // e.g. "BTCUSDT"
    const { prices, flashes } = usePriceWebSocket()
    const coin = symbol?.replace('USDT', '')  // "BTC"
    const livePrice = prices[symbol] ?? 0

    return (
        <div className="space-y-4 animate-fade-up">
            {/* Price Header */}
            <div className={`flex items-center justify-between bg-brand-surface border border-brand-border
                       rounded-2xl px-6 py-4 shadow-panel
                       ${flashes[symbol] === 'up' ? 'animate-flash-up' : flashes[symbol] === 'down' ? 'animate-flash-down' : ''}`}>
                <div className="flex items-center gap-6">
                    <h2 className="font-display text-3xl text-white tracking-[0.2em]">{coin}/INR</h2>
                    <div className="h-8 w-px bg-brand-border" />
                    <div className="space-y-0.5">
                        <span className="font-mono text-2xl text-white font-bold block leading-none">
                            {formatINR(livePrice * 84)}
                        </span>
                        <span className="text-muted text-[10px] uppercase font-bold tracking-widest">Live Market Price</span>
                    </div>
                </div>

                <div className="hidden md:flex gap-8">
                    <div className="text-right">
                        <p className="text-muted text-[9px] uppercase font-bold tracking-widest mb-1">Index Price</p>
                        <p className="text-white font-mono text-sm">{formatINR(livePrice * 84)}</p>
                    </div>
                    <div className="text-right border-l border-brand-border pl-8">
                        <p className="text-muted text-[9px] uppercase font-bold tracking-widest mb-1">Mark Price</p>
                        <p className="text-white font-mono text-sm">{formatINR(livePrice * 84 * 1.0001)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                {/* Main Chart Area */}
                <div className="xl:col-span-3 space-y-4">
                    <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel">
                        <CandlestickChart symbol={symbol} />
                    </div>
                    <OpenOrdersTable />
                </div>

                {/* Sidebar Trade Form */}
                <div className="xl:col-span-1">
                    <TradeForm symbol={symbol} coin={coin} livePrice={livePrice * 84} />
                </div>
            </div>
        </div>
    )
}
