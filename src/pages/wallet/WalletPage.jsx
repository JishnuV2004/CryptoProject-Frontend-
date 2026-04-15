import { useEffect, useState } from 'react'
import { walletAPI } from '../../services/api'
import { formatINR, formatCrypto } from '../../utils/format'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'

const COIN_ICONS = {
    INR: { icon: '₹', name: 'Indian Rupee' },
    BTC: { icon: '₿', name: 'Bitcoin' },
    ETH: { icon: 'Ξ', name: 'Ethereum' },
    SOL: { icon: '◎', name: 'Solana' },
}

export default function WalletPage() {
    const [wallets, setWallets] = useState([])
    const [showDeposit, setShowDeposit] = useState(false)
    const [showWithdraw, setShowWithdraw] = useState(false)

    useEffect(() => {
        walletAPI.getWallets().then((res) => setWallets(res.data || [])).catch(() => { })
    }, [])

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="font-display text-4xl text-white tracking-[0.2em] mb-1">YOUR PORTFOLIO</h2>
                    <p className="text-muted text-[10px] uppercase font-bold tracking-widest leading-none">Global Asset Overview</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowDeposit(true)}
                        className="px-6 py-2.5 bg-gold-gradient text-brand-bg font-bold text-[10px] uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-gold-sm"
                    >
                        Add Funds
                    </button>
                    <button
                        onClick={() => setShowWithdraw(true)}
                        className="px-6 py-2.5 bg-brand-panel border border-brand-border text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-brand-gold hover:text-brand-bg hover:border-brand-gold transition-all"
                    >
                        Withdraw
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {wallets.map((w) => (
                    <div key={w.currency} className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-4 hover:border-brand-gold/30 transition-all shadow-panel group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 blur-3xl -mr-12 -mt-12 group-hover:bg-brand-gold/10 transition-all" />

                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/20
                                flex items-center justify-center text-brand-gold font-mono text-xl shadow-inner">
                                    {COIN_ICONS[w.currency]?.icon ?? w.currency[0]}
                                </div>
                                <div>
                                    <p className="text-white font-bold tracking-tight">{w.currency}</p>
                                    <p className="text-muted text-[10px] uppercase font-bold tracking-widest">{COIN_ICONS[w.currency]?.name ?? 'Crypto Asset'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1 relative z-10">
                            <p className="font-mono text-3xl text-white group-hover:text-brand-gold transition-colors">
                                {w.currency === 'INR' ? formatINR(w.balance) : parseFloat(w.balance).toFixed(6)}
                            </p>
                            {w.currency !== 'INR' && (
                                <p className="text-muted text-[10px] font-bold uppercase tracking-widest">
                                    {/* TODO (API INTEGRATION): Replace 5000000 with real live price conversion */}
                                    ≈ {formatINR(w.balance * 5000000)}
                                </p>
                            )}
                        </div>

                        {parseFloat(w.reserved_balance) > 0 && (
                            <div className="pt-3 border-t border-brand-border/50 flex justify-between items-center relative z-10">
                                <span className="text-muted text-[9px] uppercase font-bold tracking-widest">In Orders</span>
                                <span className="text-yellow-500 font-mono text-xs">{parseFloat(w.reserved_balance).toFixed(4)}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Transaction History Section could go here */}

            {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} />}
            {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} />}
        </div>
    )
}
