// ₹35,12,400.00 — Indian number format
export const formatINR = (value) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value)

// 0.00123456 BTC — up to 8 decimals, trim trailing zeros
export const formatCrypto = (value, symbol) =>
    `${parseFloat(value.toFixed(8))} ${symbol}`

// +2.34% or -1.20% with color class
export const formatChange = (value) =>
    `${value >= 0 ? '+' : ''}${parseFloat(value).toFixed(2)}%`

export const changeClass = (value) =>
    parseFloat(value) >= 0 ? 'text-up' : 'text-down'

// 14 Apr 2026 at 10:32
export const formatDate = (iso) =>
    new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
