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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Unwrap response envelope. On 401, attempt refresh, or clear auth and redirect.
api.interceptors.response.use(
    (res) => res.data,          // returns { success, data, error }
    async (err) => {
        const originalConfig = err.config;

        if (err.response?.status === 401 && originalConfig && !originalConfig._retry && originalConfig.url !== '/auth/refresh') {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalConfig);
                }).catch((err) => {
                    return Promise.reject(err);
                });
            }

            originalConfig._retry = true;
            isRefreshing = true;

            try {
                await api.post('/auth/refresh', {}, { withCredentials: true });
                processQueue(null);
                return api(originalConfig);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                localStorage.removeItem('binancesim-auth');
                window.location.href = '/auth/login';
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        if (err.response?.status === 401) {
            localStorage.removeItem('binancesim-auth');
            window.location.href = '/auth/login';
        }
        
        const data = err.response?.data;
        const errorMsg = data?.message || (typeof data?.error === 'string' ? data.error : 'Something went wrong');
        
        return Promise.reject(errorMsg);
    }
)

// ── Auth ──────────────────────────────────────────
export const authAPI = {
    login: (body) => api.post('/auth/login', body),
    register: (body) => api.post('/auth/register', body),
    logout: () => api.post('/auth/logout'),
    sendOtp: (body) => api.post('/auth/sendotp', body),
    verifyOtp: (body) => api.post('/auth/verifyotp', body),
    forgotOtp: (body) => api.post('/auth/forgototp', body),
    changePassword: (body) => api.post('/auth/changepassword', body),
}

// ── Profile ───────────────────────────────────────
export const profileAPI = {
    getProfile: () => api.get('/profile/getprofile'),
    editProfile: (body) => api.post('/profile/editprofile', body),
    changePassword: (body) => api.post('/profile/changepassword', body),
    deleteAccount: () => api.post('/profile/deleteaccount'), // using POST for delete account as per typical implementation unless DELETE was explicitly specified in backend (user only gave URL)
}

// ── KYC ──────────────────────────────────────────
export const kycAPI = {
    getStatus: () => api.get('/kyc/status'),
    getMe: () => api.get('/kyc/me'),
    submit: (form) => api.post('/kyc/submit', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (form) => api.put('/kyc/update', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

// ── Market ────────────────────────────────────────
export const marketAPI = {
    getPrices: () => api.get('/market/prices'),
    getKlines: (symbol, interval, limit) =>
        api.get(`/market/klines/${symbol}?interval=${interval}&limit=${limit}`),
}

// ── Trade ─────────────────────────────────────────
export const tradeAPI = {
    createOrder: (body) => api.post('/trade/order', body),
    getOrders: (params) => api.get('/trade/orders', { params }),
    getOrder: (id) => api.get(`/trade/order/${id}`),
    cancelOrder: (id) => api.delete(`/trade/order/${id}`),
    getTrades: (params) => api.get('/trade/trades', { params }),
    getOrderFills: (id) => api.get(`/trade/order/${id}/fills`),
    getOrderBook: (symbol) => api.get(`/trade/orderbook?symbol=${symbol}`),
    getTradeHistory: (symbol, limit = 20) => api.get(`/trade/history?symbol=${symbol}&limit=${limit}`),
}

// ── Wallet ────────────────────────────────────────
export const walletAPI = {
    getMe: () => api.get('/wallet/me'),
    getBalance: () => api.get('/wallet/balance'),
    getTransactions: () => api.get('/wallet/transactions'),
    deposit: (body) => api.post('/wallet/deposit', body),
    verifyDeposit: (body) => api.post('/wallet/verify-deposit', body),
    withdraw: (body) => api.post('/wallet/withdraw', body),
    setPin: (body) => api.post('/wallet/set-pin', body),
    changePin: (body) => api.post('/wallet/change-pin', body),
}

// ── Payment ───────────────────────────────────────
export const paymentAPI = {
    createOrder: (amount) => Promise.resolve({ data: { order_id: 'ord_123', amount } }),
    withdraw: (body) => Promise.resolve({ success: true }),
    getDeposits: () => Promise.resolve({ data: [] }),
}

// ── E-Card ────────────────────────────────────────
export const ecardAPI = {
    getCard: () => api.get('/ecard/me'),
    block: () => api.post('/ecard/block'),
    unblock: () => api.post('/ecard/unblock'),
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
    getKycById: (id) => api.put(`/admin/kyc/${id}`),
    reviewKyc: (id, body) => api.put(`/admin/kyc/${id}`, body),
    getUsers: () => api.get('/admin/getallusers'),
    getUserById: (id) => api.get(`/admin/getbyid/${id}`),
    editUserProfile: (id, body) => api.post(`/admin/editprofile/${id}`, body),
    blockUnblockUser: (id) => api.post(`/admin/blockunblock/${id}`),
    adjustBalance: (id, body) => api.put(`/admin/users/${id}/balance`, body),
    getWithdrawals: () => api.get('/admin/withdrawals'),
    reviewWithdrawal: (id, body) => api.put(`/admin/withdrawals/${id}`, body),
    
    // Wallet Actions
    blockWallet: (userId) => api.post(`/admin/wallet/${userId}/block`),
    freezeWallet: (userId) => api.post(`/admin/wallet/${userId}/freeze`),
    unblockWallet: (userId) => api.post(`/admin/wallet/${userId}/unblock`),
    creditWallet: (userId, body) => api.post(`/admin/wallet/${userId}/credit`, body),

    // RBAC
    createPermission: (body) => api.post('/admin/permission', body),
    getPermissions: () => api.get('/admin/permissions'),
    toggleRolePermission: (body) => api.patch('/admin/roles/toggle', body),
    createRole: (body) => api.post('/admin/role', body),
    getRoles: () => api.get('/admin/roles'),
    getRolePermissions: (name) => api.get(`/admin/roles/${name}/permissions`),
}

// ── Crypto Wallet (User) ──────────────────────────
export const cryptoWalletAPI = {
    createWallet: (body) => api.post('/crypto-wallet/', body),
    getWallets: () => api.get('/crypto-wallet/'),
    getSummary: () => api.get('/crypto-wallet/summary'),
    getTransactions: (params) => api.get('/crypto-wallet/transactions', { params }),
    getLocks: () => api.get('/crypto-wallet/locks'),
    getWallet: (symbol) => api.get(`/crypto-wallet/${symbol}`),
}

// ── Crypto Wallet (Admin) ─────────────────────────
export const cryptoAdminAPI = {
    getAllWallets: () => api.get('/admin/crypto-wallet/'),
    getUserWallets: (userId) => api.get(`/admin/crypto-wallet/${userId}`),
    getUserTransactions: (userId, params) => api.get(`/admin/crypto-wallet/${userId}/transactions`, { params }),
    getUserWalletBySymbol: (userId, symbol) => api.get(`/admin/crypto-wallet/${userId}/${symbol}`),
    credit: (userId, body) => api.post(`/admin/crypto-wallet/${userId}/credit`, body),
    debit: (userId, body) => api.post(`/admin/crypto-wallet/${userId}/debit`, body),
    freeze: (userId) => api.post(`/admin/crypto-wallet/${userId}/freeze`),
    unfreeze: (userId) => api.post(`/admin/crypto-wallet/${userId}/unfreeze`),
    getAllTransactions: (params) => api.get('/admin/crypto-wallet/transactions', { params }),
}

// ── Assets (Global & Admin) ───────────────────────
export const assetAPI = {
    getAssets: () => api.get('/assets'),
    createAsset: (body) => api.post('/admin/assets/', body),
    updateAsset: (id, body) => api.put(`/admin/assets/${id}`, body),
    updateStatus: (id, body) => api.put(`/admin/assets/${id}/status`, body),
}

// ── Trade Engine (Admin) ──────────────────────────
export const tradeAdminAPI = {
    getAllOrders: (params) => api.get('/admin/trade/orders', { params }),
    getAllTrades: (params) => api.get('/admin/trade/trades', { params }),
    getUserOrders: (userId, params) => api.get(`/admin/trade/user/${userId}/orders`, { params }),
}

export default api
