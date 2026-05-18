import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const USER_NAV = [
    { to: '/market', icon: '◈', label: 'Markets' },
    { to: '/trade/BTCUSDT', icon: '⟁', label: 'Trade' },
    { to: '/wallet/cash', icon: '💵', label: 'Cash Wallet' },
    { to: '/wallet/crypto', icon: '🪙', label: 'Crypto Wallet' },
    { to: '/ecard', icon: '▣', label: 'E-Card' },
    { to: '/staking', icon: '◆', label: 'Staking' },
    { to: '/leaderboard', icon: '◉', label: 'Leaderboard' },
    { to: '/reports', icon: '◧', label: 'Reports' },
]

const ADMIN_NAV = [
    { to: '/admin', icon: '⊞', label: 'Dashboard' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/kyc', icon: '🛡️', label: 'KYC' },
    { to: '/admin/wallets', icon: '💼', label: 'Wallets' },
    { to: '/admin/assets', icon: '🪙', label: 'Assets' },
    { to: '/admin/trades', icon: '📈', label: 'Trades' },
    { to: '/admin/config', icon: '⚙️', label: 'Settings' },
]

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const { user, logout } = useAuthStore()

    const navLinks = user?.role === 'admin' ? ADMIN_NAV : USER_NAV

    return (
        <aside className={`
      flex flex-col bg-brand-surface border-r border-brand-border
      transition-all duration-300 shadow-panel relative
      ${collapsed ? 'w-16' : 'w-56'}
    `}>
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-brand-border h-[64px] overflow-hidden">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-brand-bg flex items-center justify-center border border-brand-gold/30 shadow-[0_0_15px_rgba(229,9,20,0.2)] flex-shrink-0">
                    <img src="/crytinox-logo.png" alt="Crytinox Logo" className="w-full h-full object-cover" />
                </div>
                {!collapsed && (
                    <div className="flex flex-col">
                        <span className="text-white font-display text-lg tracking-[0.15em] font-bold leading-none">
                            CRYTINOX
                        </span>
                        <span className="text-brand-red text-[8px] font-bold uppercase tracking-[0.2em] mt-1">
                            Institutional
                        </span>
                    </div>
                )}
            </div>

            {/* Nav Links */}
            <nav className="flex-1 py-4 px-2 overflow-y-auto no-scrollbar">
                {user?.role === 'admin' && (
                    <div className="mb-6 space-y-1">
                        {!collapsed && <div className="px-3 py-1 mb-2 text-[9px] font-bold text-brand-red uppercase tracking-[0.2em]">Admin Controls</div>}
                        {ADMIN_NAV.map(({ to, icon, label }) => (
                            <NavLink key={to} to={to} end className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                font-body text-sm transition-all duration-200 group
                ${isActive
                                    ? 'bg-gradient-to-r from-brand-red/20 to-brand-gold/10 text-brand-gold border-l-2 border-brand-red shadow-[0_0_15px_rgba(229,9,20,0.15)] font-semibold'
                                    : 'text-muted hover:text-white hover:bg-brand-panel'
                                }
              `}>
                                <span className="text-lg group-hover:scale-110 transition-transform">{icon}</span>
                                {!collapsed && <span className="truncate tracking-wide">{label}</span>}
                            </NavLink>
                        ))}
                    </div>
                )}

                <div className="space-y-1">
                    {user?.role === 'admin' && !collapsed && (
                        <div className="px-3 py-1 mb-2 mt-2 border-t border-brand-border/50 pt-4 text-[9px] font-bold text-muted uppercase tracking-[0.2em]">User Views</div>
                    )}
                    {USER_NAV.map(({ to, icon, label }) => (
                        <NavLink key={to} to={to} end className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-xl
            font-body text-sm transition-all duration-200 group
            ${isActive
                                ? 'bg-gradient-to-r from-brand-red/20 to-brand-gold/10 text-brand-gold border-l-2 border-brand-red shadow-[0_0_15px_rgba(229,9,20,0.15)] font-semibold'
                                : 'text-muted hover:text-white hover:bg-brand-panel'
                            }
          `}>
                            <span className="text-lg group-hover:scale-110 transition-transform">{icon}</span>
                            {!collapsed && <span className="truncate tracking-wide">{label}</span>}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Bottom — User + Logout */}
            <div className="border-t border-brand-border p-3 space-y-2 bg-brand-panel/30">
                {user ? (
                    <>
                        {!collapsed && (
                            <Link to="/profile" className="block px-3 py-2.5 rounded-xl bg-brand-surface/80 hover:bg-brand-panel border border-brand-border hover:border-brand-gold/30 transition-all cursor-pointer group">
                                <p className="text-white text-xs font-bold tracking-wider truncate group-hover:text-brand-gold transition-colors">{user.full_name || user.Name || user.name || 'My Profile'}</p>
                                <p className="text-muted text-[10px] truncate font-mono">{user.email || user.Email}</p>
                            </Link>
                        )}
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-brand-red text-xs hover:bg-brand-red/10 transition-all font-bold tracking-wider uppercase justify-center border border-brand-red/20"
                        >
                            <span>⏻</span>
                            {!collapsed && <span>LOGOUT</span>}
                        </button>
                    </>
                ) : (
                    <NavLink
                        to="/auth/login"
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-brand-red via-brand-gold to-brand-red bg-[length:200%_auto] text-white text-xs hover:bg-right transition-all font-bold tracking-[0.2em] uppercase justify-center shadow-red-sm"
                    >
                        <span>⏵</span>
                        {!collapsed && <span>LOG IN</span>}
                    </NavLink>
                )}
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 bg-brand-surface border border-brand-border hover:border-brand-gold
                   rounded-full w-6 h-6 flex items-center justify-center shadow-md
                   text-muted hover:text-brand-gold text-xs transition-all z-20"
            >
                {collapsed ? '›' : '‹'}
            </button>
        </aside>
    )
}
