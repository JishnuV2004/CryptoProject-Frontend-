import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const KYC_STYLE = {
    pending: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50',
    verified: 'bg-up/10 text-up border border-up/30',
    rejected: 'bg-down/10 text-down border border-down/30',
}

export default function TopBar() {
    const user = useAuthStore((s) => s.user)

    return (
        <header className="flex items-center justify-between px-6 py-3 h-[64px]
                       bg-brand-surface border-b border-brand-border">
            <div className="flex items-center gap-4">
                {/* Breadcrumbs or Page Title could go here */}
                <span className="text-muted text-sm font-medium">Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
                {user?.kyc_status && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${KYC_STYLE[user.kyc_status]}`}>
                        KYC {user.kyc_status}
                    </span>
                )}

                {/* Global Search Hook could go here */}

                {/* Notification Bell */}
                <button className="relative p-2 rounded-lg hover:bg-brand-panel transition-all text-muted hover:text-brand-gold">
                    <span className="text-xl">◐</span>
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand-gold rounded-full" />
                </button>

                {/* Avatar */}
                {user ? (
                    <div className="flex items-center gap-3 pl-2 border-l border-brand-border">
                        <div className="text-right hidden sm:block">
                            <p className="text-white text-xs font-semibold leading-tight">{user.full_name?.split(' ')[0]}</p>
                            <p className="text-brand-gold text-[10px] uppercase tracking-tighter">LVL 12</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-brand-bg text-xs font-bold border border-brand-border">
                            {user.full_name?.[0] ?? 'U'}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 pl-2 border-l border-brand-border">
                        <Link to="/auth/login" className="px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-[10px] font-bold uppercase tracking-widest rounded border border-brand-gold/20 hover:bg-brand-gold hover:text-brand-bg transition-colors">
                            Log In
                        </Link>
                    </div>
                )}
            </div>
        </header>
    )
}
