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
import AdminPage from './pages/admin/AdminPage'

import HomePage from './pages/home/HomePage'
import ServiceDetailPage from './pages/services/ServiceDetailPage'

function AuthGuard({ children }) {
    const token = useAuthStore((s) => s.token)
    return token ? children : <Navigate to="/auth/login" replace />
}

function AdminGuard({ children }) {
    const user = useAuthStore((s) => s.user)
    return user?.role === 'admin' ? children : <Navigate to="/market" replace />
}

export default function App() {
    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#181A0E',
                        color: '#E8E8D8',
                        border: '1px solid #2A2D1A',
                        fontFamily: 'DM Sans, sans-serif',
                    },
                    success: { iconTheme: { primary: '#C9A84C', secondary: '#0A0B06' } },
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
                    <Route path="/kyc" element={<KycPage />} />
                    <Route path="/trade/:symbol" element={<AuthGuard><TradePage /></AuthGuard>} />
                    <Route path="/wallet" element={<AuthGuard><WalletPage /></AuthGuard>} />
                    <Route path="/ecard" element={<AuthGuard><ECardPage /></AuthGuard>} />
                    <Route path="/staking" element={<AuthGuard><StakingPage /></AuthGuard>} />
                    <Route path="/leaderboard" element={<AuthGuard><LeaderboardPage /></AuthGuard>} />
                    <Route path="/reports" element={<AuthGuard><ReportsPage /></AuthGuard>} />
                    <Route path="/admin" element={<AuthGuard><AdminGuard><AdminPage /></AdminGuard></AuthGuard>} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
