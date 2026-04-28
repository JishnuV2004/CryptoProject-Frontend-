import { useEffect, useState } from 'react'

const TRACKED_SYMBOLS = new Set(['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'DOTUSDT', 'MATICUSDT', 'LINKUSDT', 'AVAXUSDT'])

// Generate combined stream URL for stats (!ticker@arr) and ultra-fast price ticks (kline_1s)
const streams = ['!ticker@arr', ...Array.from(TRACKED_SYMBOLS).map(s => `${s.toLowerCase()}@kline_1s`)].join('/')
const WS_URL = `wss://stream.binance.com:9443/stream?streams=${streams}`

export function usePriceWebSocket() {
    const [prices, setPrices] = useState({})
    const [stats, setStats] = useState({})
    const [flashes, setFlashes] = useState({})

    useEffect(() => {
        let isMounted = true
        let ws = null
        let reconnectTimeout = null
        let prevPrices = {}

        const connect = () => {
            ws = new WebSocket(WS_URL)

            ws.onmessage = (event) => {
                if (!isMounted) return
                
                const raw = JSON.parse(event.data)
                // Binance combined stream payload wraps data in { stream: "...", data: ... }
                const data = raw.data || raw

                const newPrices = {}
                const newStats = {}
                const newFlashes = {}
                let hasFlashes = false

                // 1. Handle !ticker@arr (Array) for 24h stats
                if (Array.isArray(data)) {
                    data.forEach((coin) => {
                        const symbol = coin.s
                        if (!TRACKED_SYMBOLS.has(symbol)) return
                        
                        newStats[symbol] = {
                            change24h: parseFloat(coin.P),
                            high24h: parseFloat(coin.h),
                            low24h: parseFloat(coin.l),
                            volume: parseFloat(coin.v)
                        }
                    })
                    if (Object.keys(newStats).length > 0) setStats(s => ({ ...s, ...newStats }))
                } 
                // 2. Handle kline_1s (Object) for ultra-fast, second-by-second live price actions
                else if (data.e === 'kline') {
                    const symbol = data.s
                    if (!TRACKED_SYMBOLS.has(symbol)) return

                    const currentPrice = parseFloat(data.k.c)
                    newPrices[symbol] = currentPrice

                    const prev = prevPrices[symbol]
                    if (prev && currentPrice !== prev) {
                        const dir = currentPrice > prev ? 'up' : 'down'
                        newFlashes[symbol] = dir
                        hasFlashes = true
                    }
                    prevPrices[symbol] = currentPrice

                    setPrices(p => ({ ...p, ...newPrices }))

                    if (hasFlashes) {
                        setFlashes(f => ({ ...f, ...newFlashes }))
                        setTimeout(() => {
                            if (!isMounted) return
                            const clearObj = {}
                            Object.keys(newFlashes).forEach(k => clearObj[k] = null)
                            setFlashes(f => ({ ...f, ...clearObj }))
                        }, 600)
                    }
                }
            }

            ws.onclose = () => {
                if (!isMounted) return
                reconnectTimeout = setTimeout(connect, 3000)
            }
        }

        connect()

        return () => {
            isMounted = false
            if (reconnectTimeout) clearTimeout(reconnectTimeout)
            if (ws) {
                if (ws.readyState === 1) {
                    ws.close()
                } else if (ws.readyState === 0) {
                    ws.onopen = () => ws.close()
                } else {
                    ws.close()
                }
            }
        }
    }, [])

    return { prices, stats, flashes }
}
