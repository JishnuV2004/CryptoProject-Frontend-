import { useEffect, useRef, useState, useCallback } from 'react'

export function usePriceWebSocket() {
    const [prices, setPrices] = useState({})   // { BTCUSDT: 3512400, ... }
    const [flashes, setFlashes] = useState({})   // { BTCUSDT: 'up' | 'down' }
    const prevPrices = useRef({})
    const ws = useRef(null)
    const retryDelay = useRef(1000)

    const connect = useCallback(() => {
        ws.current = new WebSocket(import.meta.env.VITE_WS_URL)

        ws.current.onmessage = (e) => {
            const update = JSON.parse(e.data)  // { symbol: "BTCUSDT", price: 3512400 }
            const { symbol, price } = update

            const prev = prevPrices.current[symbol]
            const dir = prev ? (price > prev ? 'up' : price < prev ? 'down' : null) : null

            prevPrices.current[symbol] = price
            setPrices((p) => ({ ...p, [symbol]: price }))

            if (dir) {
                setFlashes((f) => ({ ...f, [symbol]: dir }))
                setTimeout(() => setFlashes((f) => ({ ...f, [symbol]: null })), 600)
            }
        }

        ws.current.onclose = () => {
            // Exponential backoff reconnect: 1s → 2s → 4s → 8s → cap at 30s
            setTimeout(() => {
                retryDelay.current = Math.min(retryDelay.current * 2, 30000)
                connect()
            }, retryDelay.current)
        }

        ws.current.onopen = () => { retryDelay.current = 1000 }
    }, [])

    useEffect(() => {
        connect()
        return () => ws.current?.close()
    }, [connect])

    return { prices, flashes }
}
