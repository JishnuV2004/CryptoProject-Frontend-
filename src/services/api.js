// TODO (API INTEGRATION):
// This file contains all the Axios endpoints for the application.
// When your backend APIs are ready, update the endpoints below to match your actual backend routing.
// Make sure to also set the VITE_API_URL in your .env file to your actual backend URL.

import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

// Attach JWT to every request
api.interceptors.request.use((config) => {
    const raw = localStorage.getItem('binancesim-auth')
    if (raw) {
        const { state } = JSON.parse(raw)
        if (state?.token) config.headers.Authorization = `Bearer ${state.token}`
    }
    return config
})

// Unwrap response envelope. On 401, clear auth and redirect.
api.interceptors.response.use(
    (res) => res.data,          // returns { success, data, error }
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('binancesim-auth')
            window.location.href = '/auth/login'
        }
        return Promise.reject(err.response?.data?.error || 'Something went wrong')
    }
)

// ── Auth ──────────────────────────────────────────
export const authAPI = {
    login: (body) => api.post('/auth/login', body),
    register: (body) => api.post('/auth/register', body),
    logout: () => api.post('/auth/logout'),
}

// ── KYC ──────────────────────────────────────────
export const kycAPI = {
    getStatus: () => api.get('/kyc/status'),
    upload: (form) => api.post('/kyc/upload', form),
}

// ── Market ────────────────────────────────────────
export const marketAPI = {
    getPrices: () => api.get('/market/prices'),
    getKlines: (symbol, interval, limit) =>
        api.get(`/market/klines/${symbol}?interval=${interval}&limit=${limit}`),
}

// ── Trade ─────────────────────────────────────────
export const tradeAPI = {
    marketOrder: (body) => api.post('/trade/market', body),
    createOrder: (body) => api.post('/orders', body),
    getOrders: (status) => Promise.resolve({
        data: status === 'pending' ? [
            { id: 1, coin: 'BTC', order_type: 'LIMIT', side: 'buy', quantity: 0.5, limit_price: 3500000, status: 'pending', created_at: new Date().toISOString() }
        ] : [
            { id: 2, coin: 'ETH', order_type: 'MARKET', side: 'sell', quantity: 2.0, target_price: 150000, status: 'filled', created_at: new Date().toISOString() }
        ]
    }),
    cancelOrder: (id) => Promise.resolve({ success: true }),
}

// ── Wallet ────────────────────────────────────────
export const walletAPI = {
    getWallets: () => Promise.resolve({ data: { balance: 1250000, wallets: [{ coin: 'BTC', balance: 0.5 }, { coin: 'ETH', balance: 2.0 }] } }),
    getTransactions: (params) => Promise.resolve({ data: [] }),
}

// ── Payment ───────────────────────────────────────
export const paymentAPI = {
    createOrder: (amount) => Promise.resolve({ data: { order_id: 'ord_123', amount } }),
    withdraw: (body) => Promise.resolve({ success: true }),
    getDeposits: () => Promise.resolve({ data: [] }),
}

// ── E-Card ────────────────────────────────────────
export const ecardAPI = {
    getCard: () => Promise.resolve({ data: { card_number: '4111222233334444', expiry: '12/28', cvv: '123', status: 'active' } }),
    pay: (body) => Promise.resolve({ success: true }),
    getTransactions: () => Promise.resolve({ data: [] }),
}

// ── Staking ───────────────────────────────────────
export const stakingAPI = {
    stake: (body) => Promise.resolve({ success: true }),
    unstake: (id) => Promise.resolve({ success: true }),
    list: () => Promise.resolve({
        data: [
            { id: 1, coin: 'ETH', amount: 5.5, apy: 4.2, lock_days: 30, status: 'active', end_date: new Date(Date.now() + 30 * 86400000).toISOString() },
            { id: 2, coin: 'SOL', amount: 150, apy: 6.8, lock_days: 60, status: 'active', end_date: new Date(Date.now() + 60 * 86400000).toISOString() }
        ]
    }),
}

// ── Leaderboard ───────────────────────────────────
export const leaderAPI = {
    getLeaderboard: (limit) => Promise.resolve({
        data: Array.from({ length: 10 }).map((_, i) => ({ rank: i + 1, name: `User${i}`, pnl: 50000 - i * 1000, roi: 25 - i * 0.5 }))
    }),
}

// ── Reports ───────────────────────────────────────
export const reportAPI = {
    getPnl: (from, to) => Promise.resolve({
        data: Array.from({ length: 30 }).map((_, i) => ({
            date: new Date(Date.now() - (30 - i) * 86400000).toISOString().split('T')[0],
            pnl: Math.floor(Math.random() * 50000) + 10000
        }))
    }),
    exportPdf: (month) => api.get(`/reports/export?month=${month}`, { responseType: 'blob' }),
}

// ── Admin ─────────────────────────────────────────
export const adminAPI = {
    getKycQueue: () => api.get('/admin/kyc'),
    reviewKyc: (id, body) => api.put(`/admin/kyc/${id}`, body),
    getUsers: () => api.get('/admin/users'),
    freezeUser: (id, body) => api.put(`/admin/users/${id}/freeze`, body),
    adjustBalance: (id, body) => api.put(`/admin/users/${id}/balance`, body),
    getWithdrawals: () => api.get('/admin/withdrawals'),
    reviewWithdrawal: (id, body) => api.put(`/admin/withdrawals/${id}`, body),
}

export default api
