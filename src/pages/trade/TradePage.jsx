import { useParams } from 'react-router-dom'
import CandlestickChart from '../../components/trade/CandlestickChart'
import TradeForm from '../../components/trade/TradeForm'
import OpenOrdersTable from '../../components/trade/OpenOrdersTable'
import OrderBook from '../../components/trade/OrderBook'
import MarketTrades from '../../components/trade/MarketTrades'
import { usePriceWebSocket } from '../../hooks/usePriceWebSocket'
import { formatINR } from '../../utils/format'

export default function TradePage() {
    const { symbol } = useParams()   // e.g. "BTCUSDT"
    const { prices, flashes } = usePriceWebSocket()
    const coin = symbol?.replace('USDT', '') || 'BTC'
    const livePrice = prices[symbol] ?? (coin === 'BTC' ? 95000 : coin === 'ETH' ? 3200 : 150)

    const inrLivePrice = livePrice * 84

    return (
        <div className="space-y-4 animate-fade-up pb-12">
            {/* Price Header */}
            <div className={`flex items-center justify-between bg-brand-surface border border-brand-border
                       rounded-2xl px-6 py-4 shadow-panel transition-all
                       ${flashes[symbol] === 'up' ? 'animate-flash-up' : flashes[symbol] === 'down' ? 'animate-flash-down' : ''}`}>
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold font-mono font-bold text-xl">
                        {coin[0]}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="font-display text-3xl text-white tracking-[0.2em]">{coin}/INR</h2>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-gold/10 text-brand-gold border border-brand-gold/20 uppercase tracking-widest font-mono">Spot</span>
                        </div>
                        <p className="text-muted text-[10px] uppercase font-bold tracking-widest leading-none">Instant Multi-Asset Settlement</p>
                    </div>
                    <div className="h-8 w-px bg-brand-border mx-2 hidden sm:block" />
                    <div className="space-y-0.5 hidden sm:block">
                        <span className="font-mono text-2xl text-brand-gold font-bold block leading-none">
                            {formatINR(inrLivePrice)}
                        </span>
                        <span className="text-muted text-[10px] uppercase font-bold tracking-widest block">Live Market Price</span>
                    </div>
                </div>

                <div className="flex gap-8 items-center">
                    <div className="text-right hidden md:block">
                        <p className="text-muted text-[9px] uppercase font-bold tracking-widest mb-1">24h Change</p>
                        <p className="text-up font-mono text-xs font-bold">+2.45%</p>
                    </div>
                    <div className="text-right border-l border-brand-border pl-8 hidden lg:block">
                        <p className="text-muted text-[9px] uppercase font-bold tracking-widest mb-1">Index Price</p>
                        <p className="text-white font-mono text-xs font-bold">{formatINR(inrLivePrice)}</p>
                    </div>
                    <div className="text-right border-l border-brand-border pl-8 hidden lg:block">
                        <p className="text-muted text-[9px] uppercase font-bold tracking-widest mb-1">Mark Price</p>
                        <p className="text-white font-mono text-xs font-bold">{formatINR(inrLivePrice * 1.0001)}</p>
                    </div>
                </div>
            </div>

            {/* Terminal Layout Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                {/* Left Column: OrderBook */}
                <div className="xl:col-span-3 xl:sticky xl:top-4 h-[750px] flex flex-col">
                    <OrderBook symbol={symbol} />
                </div>

                {/* Center Column: Candlestick Chart & Open Orders Table */}
                <div className="xl:col-span-6 space-y-4 flex flex-col min-w-0">
                    <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel">
                        <CandlestickChart symbol={symbol} />
                    </div>
                    <OpenOrdersTable />
                </div>

                {/* Right Column: Trade Form & Market Trades */}
                <div className="xl:col-span-3 space-y-4 flex flex-col">
                    <TradeForm symbol={symbol} coin={coin} livePrice={inrLivePrice} />
                    <div className="h-[380px] flex flex-col">
                        <MarketTrades symbol={symbol} />
                    </div>
                </div>
            </div>
        </div>
    )
}
