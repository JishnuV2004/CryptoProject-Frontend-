import { useEffect, useState } from 'react'

const TRACKED_SYMBOLS = new Set(['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'DOTUSDT', 'MATICUSDT', 'LINKUSDT'])

const WS_URL = 'ws://localhost:8080/api/market/ws/market'

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

            ws.onopen = () => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ symbols: Array.from(TRACKED_SYMBOLS) }))
                }
            }

            ws.onmessage = (event) => {
                if (!isMounted) return
                
                try {
                    const data = JSON.parse(event.data)
                    const symbol = data.symbol

                    if (!symbol || !TRACKED_SYMBOLS.has(symbol)) return

                    const currentPrice = parseFloat(data.lastPrice)
                    
                    const newPrices = { [symbol]: currentPrice }
                    const newStats = {
                        [symbol]: {
                            change24h: parseFloat(data.changePct),
                            high24h: parseFloat(data.high),
                            low24h: parseFloat(data.low),
                            volume: parseFloat(data.volume)
                        }
                    }
                    
                    let hasFlashes = false
                    const newFlashes = {}

                    const prev = prevPrices[symbol]
                    if (prev && currentPrice !== prev) {
                        const dir = currentPrice > prev ? 'up' : 'down'
                        newFlashes[symbol] = dir
                        hasFlashes = true
                    }
                    prevPrices[symbol] = currentPrice

                    setPrices(p => ({ ...p, ...newPrices }))
                    setStats(s => ({ ...s, ...newStats }))

                    if (hasFlashes) {
                        setFlashes(f => ({ ...f, ...newFlashes }))
                        setTimeout(() => {
                            if (!isMounted) return
                            const clearObj = {}
                            Object.keys(newFlashes).forEach(k => clearObj[k] = null)
                            setFlashes(f => ({ ...f, ...clearObj }))
                        }, 600)
                    }
                } catch (err) {
                    console.error('Error parsing WS message:', err)
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
