import { useState, useEffect } from 'react'
import { formatINR, formatDate } from '../../utils/format'
import { adminAPI, cryptoAdminAPI, assetAPI } from '../../services/api'
import { toast } from 'react-hot-toast'

export default function AdminWallets() {
    const [activeTab, setActiveTab] = useState('inr') // 'inr' | 'crypto'
    const [users, setUsers] = useState([])
    const [cryptoWallets, setCryptoWallets] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [selectedCryptoWallet, setSelectedCryptoWallet] = useState(null)
    const [loading, setLoading] = useState(false)

    // Modals
    const [showCreditModal, setShowCreditModal] = useState(false)
    const [showDebitModal, setShowDebitModal] = useState(false)
    const [actionAmount, setActionAmount] = useState('')

    useEffect(() => {
        loadData()
    }, [activeTab])

    const loadData = async () => {
        try {
            setLoading(true)
            const usersRes = await adminAPI.getUsers().catch(() => ({ data: [] }))
            const loadedUsers = usersRes.data || []
            setUsers(loadedUsers)

            if (activeTab === 'crypto') {
                const cryptoRes = await cryptoAdminAPI.getAllWallets().catch(() => ({ data: [] }))
                setCryptoWallets(cryptoRes.data || [])
            }
        } catch (err) {
            toast.error('Failed to load wallet data')
        } finally {
            setLoading(false)
        }
    }

    const userMap = Object.fromEntries(users.map(u => [u.ID || u.id, u]))

    // INR Actions
    const handleInrAction = async (action) => {
        if (!selectedUser) return
        try {
            setLoading(true)
            const id = selectedUser.ID || selectedUser.id
            if (action === 'block') await adminAPI.blockWallet(id)
            if (action === 'freeze') await adminAPI.freezeWallet(id)
            if (action === 'unblock') await adminAPI.unblockWallet(id)
            toast.success(`INR Wallet ${action}ed successfully`)
            loadData()
        } catch (err) {
            toast.error(err || `Failed to ${action} INR wallet`)
        } finally {
            setLoading(false)
        }
    }

    const handleInrCredit = async (e) => {
        e.preventDefault()
        if (!actionAmount || parseFloat(actionAmount) <= 0) return toast.error('Enter a valid amount')
        try {
            setLoading(true)
            await adminAPI.creditWallet(selectedUser.ID || selectedUser.id, { amount: parseFloat(actionAmount) })
            toast.success('INR funds credited successfully')
            setShowCreditModal(false)
            setActionAmount('')
            loadData()
        } catch (err) {
            toast.error(err || 'Failed to credit INR funds')
        } finally {
            setLoading(false)
        }
    }

    // Crypto Actions
    const handleCryptoAction = async (action, w) => {
        const walletTarget = w || selectedCryptoWallet
        if (!walletTarget) return
        try {
            setLoading(true)
            if (action === 'freeze') {
                await cryptoAdminAPI.freeze(walletTarget.UserID || walletTarget.user_id)
                toast.success('User crypto wallets frozen')
            } else if (action === 'unfreeze') {
                await cryptoAdminAPI.unfreeze(walletTarget.UserID || walletTarget.user_id)
                toast.success('User crypto wallets activated')
            }
            loadData()
        } catch (err) {
            toast.error(err || `Failed to ${action} crypto wallet`)
        } finally {
            setLoading(false)
        }
    }

    const handleCryptoAmountAction = async (e, isCredit) => {
        e.preventDefault()
        if (!selectedCryptoWallet || !actionAmount || parseFloat(actionAmount) <= 0) {
            return toast.error('Enter a valid amount')
        }
        try {
            setLoading(true)
            const userId = selectedCryptoWallet.UserID || selectedCryptoWallet.user_id
            const symbol = selectedCryptoWallet.Asset?.Symbol || selectedCryptoWallet.Asset?.symbol || ''
            const precision = selectedCryptoWallet.Asset?.Precision !== undefined ? selectedCryptoWallet.Asset.Precision : 8
            const integerAmount = Math.round(parseFloat(actionAmount) * Math.pow(10, precision))

            const body = { symbol, amount: integerAmount }

            if (isCredit) {
                await cryptoAdminAPI.credit(userId, body)
                toast.success(`${symbol} credited successfully`)
                setShowCreditModal(false)
            } else {
                await cryptoAdminAPI.debit(userId, body)
                toast.success(`${symbol} debited successfully`)
                setShowDebitModal(false)
            }
            setActionAmount('')
            loadData()
        } catch (err) {
            toast.error(err || 'Failed to process crypto balance action')
        } finally {
            setLoading(false)
        }
    }

    const formatCryptoVal = (balance, precision) => {
        const p = precision !== undefined ? precision : 8
        return (parseInt(balance || 0, 10) / Math.pow(10, p)).toFixed(p)
    }

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                    <h2 className="font-display text-4xl text-white tracking-[0.2em] mb-1">USER WALLETS</h2>
                    <p className="text-muted text-[10px] uppercase font-bold tracking-[0.3em]">Financial Oversight & Asset Management</p>
                </div>
                {/* Mode Switcher */}
                <div className="flex bg-brand-panel p-1.5 rounded-2xl border border-brand-border">
                    <button
                        onClick={() => { setActiveTab('inr'); setSelectedUser(null); }}
                        className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'inr' ? 'bg-gold-gradient text-brand-bg shadow-gold-sm' : 'text-muted hover:text-white'
                        }`}
                    >
                        INR Wallets
                    </button>
                    <button
                        onClick={() => { setActiveTab('crypto'); setSelectedCryptoWallet(null); }}
                        className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'crypto' ? 'bg-gold-gradient text-brand-bg shadow-gold-sm' : 'text-muted hover:text-white'
                        }`}
                    >
                        Crypto Wallets
                    </button>
                </div>
            </div>

            {/* INR Wallets View */}
            {activeTab === 'inr' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User List */}
                    <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel lg:col-span-1">
                        <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/30">
                            <h3 className="font-display text-lg text-white tracking-widest uppercase">Client Balances</h3>
                        </div>
                        <div className="divide-y divide-brand-border/40 max-h-[600px] overflow-y-auto no-scrollbar">
                            {users.map(u => (
                                <button
                                    key={u.ID || u.id}
                                    onClick={() => setSelectedUser(u)}
                                    className={`w-full text-left px-6 py-4 transition-colors hover:bg-brand-panel/40 ${(selectedUser?.ID || selectedUser?.id) === (u.ID || u.id) ? 'bg-brand-panel/60 border-l-2 border-brand-gold' : ''}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-white font-bold text-xs uppercase tracking-wider">{u.Name || u.full_name || 'User'}</p>
                                            <p className="text-muted text-[10px] font-mono lowercase tracking-normal">{u.Email || u.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-brand-gold font-mono font-bold text-sm">{formatINR(u.wallet_balance || 0)}</p>
                                            {u.wallet_status && u.wallet_status !== 'active' && (
                                                <span className="text-[9px] uppercase font-bold text-down border border-down/30 px-1.5 py-0.5 rounded bg-down/10">
                                                    {u.wallet_status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* INR Actions Panel */}
                    <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel lg:col-span-2 flex flex-col min-h-[400px]">
                        <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/30 flex justify-between items-center flex-wrap gap-4">
                            <h3 className="font-display text-lg text-white tracking-widest uppercase">
                                {selectedUser ? `Actions: ${selectedUser.Name || selectedUser.full_name || 'User'}` : 'Select a user'}
                            </h3>
                            {selectedUser && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleInrAction('block')}
                                        disabled={loading}
                                        className="px-4 py-2 border border-down/30 text-down hover:bg-down/10 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-colors"
                                    >
                                        Block
                                    </button>
                                    <button
                                        onClick={() => handleInrAction('freeze')}
                                        disabled={loading}
                                        className="px-4 py-2 border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-colors"
                                    >
                                        Freeze
                                    </button>
                                    <button
                                        onClick={() => handleInrAction('unblock')}
                                        disabled={loading}
                                        className="px-4 py-2 border border-up/30 text-up hover:bg-up/10 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-colors"
                                    >
                                        Unblock
                                    </button>
                                    <button
                                        onClick={() => { setActionAmount(''); setShowCreditModal(true); }}
                                        disabled={loading}
                                        className="px-4 py-2 bg-gold-gradient text-brand-bg rounded-lg text-[10px] uppercase font-bold tracking-widest transition-colors"
                                    >
                                        Credit Funds
                                    </button>
                                </div>
                            )}
                        </div>
                        {selectedUser ? (
                            <div className="p-8 flex flex-col items-center justify-center flex-1 text-center border-t border-brand-border/40">
                                <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold mb-4">
                                    <span className="text-2xl">₹</span>
                                </div>
                                <h4 className="text-white font-display tracking-widest uppercase text-xl mb-2">{selectedUser.Name || selectedUser.full_name || 'User'}</h4>
                                <p className="text-brand-gold font-mono text-2xl font-bold mb-4">{formatINR(selectedUser.wallet_balance || 0)}</p>
                                <p className="text-muted text-xs uppercase tracking-widest font-bold max-w-sm">
                                    Use the controls above to modify wallet state or grant promotional/correctional credits.
                                </p>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted font-bold tracking-widest uppercase text-xs italic">
                                Select a user from the list to view their INR wallet.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Crypto Wallets View */}
            {activeTab === 'crypto' && (
                <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel">
                    <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/30 flex justify-between items-center">
                        <h3 className="font-display text-lg text-white tracking-widest uppercase">Client Crypto Accounts</h3>
                        <span className="text-muted text-xs font-mono">{cryptoWallets.length} Wallets Active</span>
                    </div>
                    <div className="overflow-x-auto">
                        {cryptoWallets.length > 0 ? (
                            <table className="w-full text-xs text-left uppercase tracking-wider font-bold">
                                <thead>
                                    <tr className="h-10 bg-brand-panel/10 text-muted text-[9px] tracking-[0.2em]">
                                        <th className="px-6 py-2">Client / Email</th>
                                        <th className="px-6 py-2">Asset</th>
                                        <th className="px-6 py-2 text-right">Total Balance</th>
                                        <th className="px-6 py-2 text-right">Locked (In Orders)</th>
                                        <th className="px-6 py-2 text-center">Status</th>
                                        <th className="px-6 py-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border/40 font-mono text-[11px]">
                                    {cryptoWallets.map(w => {
                                        const userObj = userMap[w.UserID || w.user_id] || {}
                                        const symbol = w.Asset?.Symbol || w.Asset?.symbol || 'CRYPTO'
                                        const precision = w.Asset?.Precision !== undefined ? w.Asset.Precision : 8
                                        const status = w.Status || w.status || 'active'

                                        return (
                                            <tr key={w.ID || w.id} className="hover:bg-brand-panel/40 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-white font-bold text-xs font-body tracking-wider">{userObj.Name || userObj.full_name || `User ID #${w.UserID || w.user_id}`}</p>
                                                        <p className="text-muted text-[10px] lowercase tracking-normal font-mono">{userObj.Email || userObj.email || 'No email'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-md bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold text-xs font-bold font-mono">
                                                            {symbol[0]}
                                                        </div>
                                                        <span className="text-white font-bold tracking-tight">{symbol}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-brand-gold font-bold font-mono text-sm">
                                                    {formatCryptoVal(w.Balance || w.balance, precision)} {symbol}
                                                </td>
                                                <td className="px-6 py-4 text-right text-yellow-500 font-bold font-mono">
                                                    {formatCryptoVal(w.Locked || w.locked, precision)} {symbol}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-1 rounded border text-[9px] uppercase tracking-widest ${
                                                        status === 'active' ? 'bg-up/10 text-up border-up/30' : 'bg-down/10 text-down border-down/30'
                                                    }`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => { setSelectedCryptoWallet(w); setActionAmount(''); setShowCreditModal(true); }}
                                                        className="px-2.5 py-1 bg-up/10 border border-up/30 text-up rounded hover:bg-up text-[10px] hover:text-brand-bg transition-all font-body font-bold"
                                                    >
                                                        Credit
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedCryptoWallet(w); setActionAmount(''); setShowDebitModal(true); }}
                                                        className="px-2.5 py-1 bg-down/10 border border-down/30 text-down rounded hover:bg-down text-[10px] hover:text-brand-bg transition-all font-body font-bold"
                                                    >
                                                        Debit
                                                    </button>
                                                    {status === 'active' ? (
                                                        <button
                                                            onClick={() => handleCryptoAction('freeze', w)}
                                                            className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded hover:bg-yellow-500 text-[10px] hover:text-brand-bg transition-all font-body font-bold"
                                                        >
                                                            Freeze
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleCryptoAction('unfreeze', w)}
                                                            className="px-2.5 py-1 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold rounded hover:bg-brand-gold text-[10px] hover:text-brand-bg transition-all font-body font-bold"
                                                        >
                                                            Unfreeze
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center text-muted font-body text-xs tracking-widest uppercase italic">
                                {loading ? 'Loading crypto wallets...' : 'No crypto wallets registered across users'}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* INR Credit Modal */}
            {showCreditModal && activeTab === 'inr' && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-sm overflow-hidden shadow-panel">
                        <div className="p-6 border-b border-brand-border flex justify-between items-center">
                            <h3 className="font-display text-xl text-white tracking-widest uppercase">Credit INR Funds</h3>
                            <button onClick={() => setShowCreditModal(false)} className="text-muted hover:text-white transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleInrCredit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block">Amount to Credit (INR)</label>
                                <input
                                    type="number"
                                    value={actionAmount}
                                    onChange={(e) => setActionAmount(e.target.value)}
                                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors font-mono"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !actionAmount}
                                className="w-full py-3 bg-gold-gradient text-brand-bg rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Confirm Credit'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Crypto Credit / Debit Modal */}
            {(showCreditModal || showDebitModal) && activeTab === 'crypto' && selectedCryptoWallet && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-sm overflow-hidden shadow-panel">
                        <div className="p-6 border-b border-brand-border flex justify-between items-center">
                            <h3 className="font-display text-xl text-white tracking-widest uppercase">
                                {showCreditModal ? 'Credit' : 'Debit'} {selectedCryptoWallet.Asset?.Symbol || selectedCryptoWallet.Asset?.symbol}
                            </h3>
                            <button onClick={() => { setShowCreditModal(false); setShowDebitModal(false); }} className="text-muted hover:text-white transition-colors">✕</button>
                        </div>
                        <form onSubmit={(e) => handleCryptoAmountAction(e, showCreditModal)} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block">Amount ({selectedCryptoWallet.Asset?.Symbol || selectedCryptoWallet.Asset?.symbol})</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={actionAmount}
                                    onChange={(e) => setActionAmount(e.target.value)}
                                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors font-mono"
                                    placeholder="0.00000000"
                                    required
                                />
                                <p className="text-[9px] text-muted font-mono tracking-wider">
                                    Current Balance: {formatCryptoVal(selectedCryptoWallet.Balance || selectedCryptoWallet.balance, selectedCryptoWallet.Asset?.Precision)} {selectedCryptoWallet.Asset?.Symbol}
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !actionAmount}
                                className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 ${
                                    showCreditModal ? 'bg-up text-brand-bg' : 'bg-down text-white'
                                }`}
                            >
                                {loading ? 'Processing...' : `Confirm ${showCreditModal ? 'Credit' : 'Debit'}`}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
