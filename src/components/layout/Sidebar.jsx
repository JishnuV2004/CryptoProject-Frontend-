import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const NAV = [
    { to: '/market', icon: '◈', label: 'Markets' },
    { to: '/trade/BTCUSDT', icon: '⟁', label: 'Trade' },
    { to: '/wallet', icon: '◎', label: 'Wallet' },
    { to: '/ecard', icon: '▣', label: 'E-Card' },
    { to: '/staking', icon: '◆', label: 'Staking' },
    { to: '/leaderboard', icon: '◉', label: 'Leaderboard' },
    { to: '/reports', icon: '◧', label: 'Reports' },
]

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const { user, logout } = useAuthStore()

    return (
        <aside className={`
      flex flex-col bg-brand-surface border-r border-brand-border
      transition-all duration-300 shadow-panel relative
      ${collapsed ? 'w-16' : 'w-56'}
    `}>
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-brand-border h-[64px]">
                <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center shadow-gold-sm">
                    <span className="text-brand-bg font-display text-xl tracking-wider">BS</span>
                </div>
                {!collapsed && (
                    <span className="text-brand-gold font-display text-lg tracking-widest truncate">
                        BINANCESIM
                    </span>
                )}
            </div>

            {/* Nav Links */}
            <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto no-scrollbar">
                {NAV.map(({ to, icon, label }) => (
                    <NavLink key={to} to={to} className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg
            font-body text-sm transition-all duration-200
            ${isActive
                            ? 'bg-brand-gold/10 text-brand-gold border-l-2 border-brand-gold shadow-gold-sm'
                            : 'text-muted hover:text-white hover:bg-brand-panel'
                        }
          `}>
                        <span className="text-lg">{icon}</span>
                        {!collapsed && <span className="truncate">{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom — User + Logout */}
            <div className="border-t border-brand-border p-3 space-y-2">
                {user ? (
                    <>
                        {!collapsed && (
                            <div className="px-2 py-1">
                                <p className="text-white text-sm font-medium truncate">{user.full_name}</p>
                                <p className="text-muted text-xs truncate">{user.email}</p>
                            </div>
                        )}
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-down text-sm hover:bg-down/10 transition-all font-bold"
                        >
                            <span>⏻</span>
                            {!collapsed && <span>Logout</span>}
                        </button>
                    </>
                ) : (
                    <NavLink
                        to="/auth/login"
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-brand-gold text-sm hover:bg-brand-gold/10 transition-all font-bold border border-brand-gold/10"
                    >
                        <span>⏵</span>
                        {!collapsed && <span>Log In</span>}
                    </NavLink>
                )}
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 bg-brand-surface border border-brand-border
                   rounded-full w-6 h-6 flex items-center justify-center
                   text-muted hover:text-brand-gold text-xs transition-all z-10"
            >
                {collapsed ? '›' : '‹'}
            </button>
        </aside>
    )
}
