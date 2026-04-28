import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import KycPage from './pages/kyc/KycPage'
import MarketPage from './pages/market/MarketPage'
import TradePage from './pages/trade/TradePage'
import WalletPage from './pages/wallet/WalletPage'
import ECardPage from './pages/ecard/ECardPage'
import StakingPage from './pages/staking/StakingPage'
import LeaderboardPage from './pages/leaderboard/LeaderboardPage'
import ReportsPage from './pages/reports/ReportsPage'
import HomePage from './pages/home/HomePage'
import ServiceDetailPage from './pages/services/ServiceDetailPage'

// New Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminKyc from './pages/admin/AdminKyc'
import AdminWallets from './pages/admin/AdminWallets'
import AdminConfig from './pages/admin/AdminConfig'

function AuthGuard({ children }) {
    const token = useAuthStore((s) => s.token)
    return token ? children : <Navigate to="/auth/login" replace />
}

function AdminGuard({ children }) {
    const user = useAuthStore((s) => s.user)
    return user?.role === 'admin' ? children : <Navigate to="/market" replace />
}

export default function App() {
    const theme = useAuthStore((s) => s.theme)

    useEffect(() => {
        if (theme === 'light') {
            document.body.classList.add('theme-light')
        } else {
            document.body.classList.remove('theme-light')
        }
    }, [theme])

    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Toaster
                position="top-right"
                toastOptions={{
                    className: 'bg-brand-panel text-white border border-brand-border text-sm font-mono',
                    style: { background: '#111111', color: '#fff', borderColor: '#222222' }
                }}
            />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/service/:id" element={<ServiceDetailPage />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />

                <Route element={<AppLayout />}>
                    {/* Publicly accessible within AppLayout */}
                    <Route path="/market" element={<MarketPage />} />

                    {/* Protected Routes */}
                    <Route path="/kyc" element={<AuthGuard><KycPage /></AuthGuard>} />
                    <Route path="/trade/:symbol" element={<TradePage />} />
                    <Route path="/wallet" element={<WalletPage />} />
                    <Route path="/ecard" element={<ECardPage />} />
                    <Route path="/staking" element={<StakingPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    {/* <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} /> */}
                    <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
                    <Route path="/admin/kyc" element={<AdminGuard><AdminKyc /></AdminGuard>} />
                    <Route path="/admin/wallets" element={<AdminWallets />} />
                    <Route path="/admin/config" element={<AdminConfig />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
