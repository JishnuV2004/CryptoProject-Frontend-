import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const KYC_STYLE = {
    pending: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50 shadow-[0_0_10px_rgba(234,179,8,0.15)]',
    verified: 'bg-up/10 text-up border border-up/30 shadow-[0_0_10px_rgba(21,176,109,0.15)]',
    rejected: 'bg-brand-red/10 text-brand-red border border-brand-red/30 shadow-[0_0_10px_rgba(229,9,20,0.15)]',
}

export default function TopBar() {
    const user = useAuthStore((s) => s.user)
    const { theme, toggleTheme } = useAuthStore()

    return (
        <header className="flex items-center justify-between px-6 py-3 h-[64px]
                       bg-brand-surface/80 backdrop-blur-md border-b border-brand-border relative z-30 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse-red" />
                    <span className="text-white text-xs font-bold uppercase tracking-[0.2em]">Dashboard / Portfolio</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {user?.kyc_status && (
                    <span className={`text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-[0.2em] transition-all ${KYC_STYLE[user.kyc_status]}`}>
                        KYC {user.kyc_status}
                    </span>
                )}

                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl border border-brand-border hover:border-brand-gold/40 bg-brand-panel/60 hover:bg-brand-panel transition-all text-brand-gold shadow-sm"
                    title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                >
                    {theme === 'dark' ? (
                        <svg className="w-4 h-4 animate-pulse-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                {/* Avatar */}
                {user ? (
                    <div className="flex items-center gap-3 pl-4 border-l border-brand-border/60">
                        <div className="text-right hidden sm:block">
                            <p className="text-white text-xs font-bold leading-tight tracking-wide">{user.full_name?.split(' ')[0] || user.Name || 'Trader'}</p>
                            <span className="inline-block px-1.5 py-0.5 rounded bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[8px] uppercase font-bold tracking-[0.2em] mt-0.5">
                                VIP ELITE
                            </span>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-red via-brand-gold to-brand-red bg-[length:200%_auto] flex items-center justify-center text-white text-xs font-bold tracking-wider shadow-md border border-brand-gold/30">
                            {user.full_name?.[0] ?? user.Name?.[0] ?? 'V'}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 pl-4 border-l border-brand-border/60">
                        <Link to="/auth/login" className="px-5 py-2 bg-gradient-to-r from-brand-red via-brand-gold to-brand-red bg-[length:200%_auto] text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl shadow-red-sm hover:bg-right transition-all">
                            LOG IN
                        </Link>
                    </div>
                )}
            </div>
        </header>
    )
}
