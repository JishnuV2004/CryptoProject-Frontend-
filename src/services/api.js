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
    upload: (form) => api.post('/kyc/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
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
    getOrders: (status) => api.get(`/orders?status=${status}`),
    cancelOrder: (id) => api.delete(`/orders/${id}`),
}

// ── Wallet ────────────────────────────────────────
export const walletAPI = {
    getWallets: () => api.get('/wallet'),
    getTransactions: (params) => api.get('/wallet/transactions', { params }),
}

// ── Payment ───────────────────────────────────────
export const paymentAPI = {
    createOrder: (amount) => api.post('/payment/create-order', { amount }),
    withdraw: (body) => api.post('/payment/withdraw', body),
    getDeposits: () => api.get('/payment/deposits'),
}

// ── E-Card ────────────────────────────────────────
export const ecardAPI = {
    getCard: () => api.get('/ecard'),
    pay: (body) => api.post('/ecard/pay', body),
    getTransactions: () => api.get('/ecard/transactions'),
}

// ── Staking ───────────────────────────────────────
export const stakingAPI = {
    stake: (body) => api.post('/stake', body),
    unstake: (id) => api.post(`/stake/${id}/unstake`),
    list: () => api.get('/stake'),
}

// ── Leaderboard ───────────────────────────────────
export const leaderAPI = {
    getLeaderboard: (limit) => api.get(`/leaderboard?limit=${limit}`),
}

// ── Reports ───────────────────────────────────────
export const reportAPI = {
    getPnl: (from, to) => api.get(`/reports/pnl?from=${from}&to=${to}`),
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
