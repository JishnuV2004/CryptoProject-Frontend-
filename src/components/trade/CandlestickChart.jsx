import { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'
import { marketAPI } from '../../services/api'

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1D', '1W']

export default function CandlestickChart({ symbol }) {
    const containerRef = useRef(null)
    const chartRef = useRef(null)
    const seriesRef = useRef(null)
    const [interval, setInterval] = useState('1h')

    // Init chart once
    useEffect(() => {
        if (!containerRef.current) return
        chartRef.current = createChart(containerRef.current, {
            layout: { background: { color: '#111208' }, textColor: '#6B7063' },
            grid: { vertLines: { color: '#2A2D1A' }, horzLines: { color: '#2A2D1A' } },
            crosshair: { mode: 1 },
            rightPriceScale: { borderColor: '#2A2D1A' },
            timeScale: { borderColor: '#2A2D1A', timeVisible: true, secondsVisible: false },
            width: containerRef.current.clientWidth,
            height: 450,
        })
        seriesRef.current = chartRef.current.addCandlestickSeries({
            upColor: '#4CAF50',
            downColor: '#F44336',
            borderUpColor: '#4CAF50',
            borderDownColor: '#F44336',
            wickUpColor: '#4CAF50',
            wickDownColor: '#F44336',
        })
        const ro = new ResizeObserver(() => {
            chartRef.current?.applyOptions({ width: containerRef.current.clientWidth })
        })
        ro.observe(containerRef.current)
        return () => { ro.disconnect(); chartRef.current?.remove() }
    }, [])

    // Load data when symbol or interval changes
    useEffect(() => {
        let isMounted = true;
        let ws;

        // 1. Fetch historical Klines directly from Binance REST API
        fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`)
            .then(res => res.json())
            .then(data => {
                if (!isMounted) return;

                const mapped = data.map((k) => ({
                    time: k[0] / 1000,
                    open: parseFloat(k[1]) * 84,
                    high: parseFloat(k[2]) * 84,
                    low: parseFloat(k[3]) * 84,
                    close: parseFloat(k[4]) * 84,
                }))
                
                try {
                    seriesRef.current?.setData(mapped)
                } catch (e) {
                    console.warn("Chart data set error:", e)
                }

                // 2. Connect to live Binance Kline stream for real-time candle updates
                ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`)
                ws.onmessage = (e) => {
                    if (!isMounted) return;
                    
                    const message = JSON.parse(e.data)
                    const k = message.k
                    if (k) {
                        try {
                            seriesRef.current?.update({
                                time: k.t / 1000,
                                open: parseFloat(k.o) * 84,
                                high: parseFloat(k.h) * 84,
                                low: parseFloat(k.l) * 84,
                                close: parseFloat(k.c) * 84,
                            })
                        } catch (err) {
                            // Lightweight Charts throws an error if a websocket tick is older than the latest candle.
                            // We can safely ignore these stale out-of-order ticks.
                        }
                    }
                }
            })
            .catch((err) => {
                if (isMounted) console.error("Failed to load chart data:", err)
            })

        return () => {
            isMounted = false;
            if (ws) ws.close();
        }
    }, [symbol, interval])

    return (
        <div className="relative">
            {/* Chart Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-brand-border bg-brand-panel/20">
                <div className="flex gap-1">
                    {INTERVALS.map((i) => (
                        <button
                            key={i}
                            onClick={() => setInterval(i)}
                            className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all
                ${interval === i
                                    ? 'bg-brand-gold text-brand-bg'
                                    : 'text-muted hover:text-white hover:bg-brand-panel'
                                }`}
                        >
                            {i}
                        </button>
                    ))}
                </div>
                <div className="flex gap-4">
                    <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Main Chart</span>
                    <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest">Technicals</span>
                </div>
            </div>
            <div ref={containerRef} className="w-full" />
        </div>
    )
}
