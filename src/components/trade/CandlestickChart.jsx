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
        marketAPI.getKlines(symbol, interval, 100).then((res) => {
            const mapped = (res.data || []).map((k) => ({
                time: k[0] / 1000,
                open: parseFloat(k[1]) * 84,
                high: parseFloat(k[2]) * 84,
                low: parseFloat(k[3]) * 84,
                close: parseFloat(k[4]) * 84,
            }))
            seriesRef.current?.setData(mapped)
        }).catch(() => { })
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
