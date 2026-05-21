import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { walletAPI, cryptoWalletAPI, assetAPI } from '../../services/api'
import { formatINR, formatDate, changeClass, formatChange } from '../../utils/format'
import { usePriceWebSocket } from '../../hooks/usePriceWebSocket'
import { toast } from 'react-hot-toast'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'
import SetPinModal from './SetPinModal'
import ChangePinModal from './ChangePinModal'

const COIN_ICONS = {
    INR: { icon: '₹', name: 'Indian Rupee' },
    BTC: { icon: '₿', name: 'Bitcoin' },
    ETH: { icon: 'Ξ', name: 'Ethereum' },
    SOL: { icon: '◎', name: 'Solana' },
    USDT: { icon: '₮', name: 'Tether' },
    BNB: { icon: '⟁', name: 'BNB' },
    ADA: { icon: '₳', name: 'Cardano' },
    XRP: { icon: '✕', name: 'Ripple' },
    DOGE: { icon: 'Ð', name: 'Dogecoin' },
    DOT: { icon: '●', name: 'Polkadot' },
    MATIC: { icon: '⬡', name: 'Polygon' },
    LINK: { icon: '🔗', name: 'Chainlink' },
}

export default function WalletPage() {
    const [wallets, setWallets] = useState([])
    const [cryptoWalletsRaw, setCryptoWalletsRaw] = useState([])
    const [allAssets, setAllAssets] = useState([])
    const [inrTransactions, setInrTransactions] = useState([])
    const [cryptoTransactions, setCryptoTransactions] = useState([])
    const [txTab, setTxTab] = useState('inr') // 'inr' | 'crypto'
    const [walletInfo, setWalletInfo] = useState(null)
    const [loading, setLoading] = useState(false)

    // Live price WS
    const { prices, stats } = usePriceWebSocket()
    const navigate = useNavigate()
    const { tab } = useParams()
    const activeTab = tab === 'crypto' ? 'crypto' : 'cash'

    useEffect(() => {
        if (activeTab === 'cash') setTxTab('inr')
        else if (activeTab === 'crypto') setTxTab('crypto')
    }, [activeTab])

    // Modals
    const [showDeposit, setShowDeposit] = useState(false)
    const [showWithdraw, setShowWithdraw] = useState(false)
    const [showSetPin, setShowSetPin] = useState(false)
    const [showChangePin, setShowChangePin] = useState(false)
    const [showAddCryptoModal, setShowAddCryptoModal] = useState(false)
    const [creatingSymbol, setCreatingSymbol] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            // Fetch INR Wallet
            const inrRes = await walletAPI.getMe().catch(() => ({ data: null }))
            const inrData = inrRes?.data || inrRes
            let combined = []

            if (inrData && (inrData.Currency || inrData.currency || inrData.Balance !== undefined || inrData.balance !== undefined)) {
                setWalletInfo(inrData)
                combined.push({
                    currency: inrData.Currency || inrData.currency || 'INR',
                    name: 'Indian Rupee',
                    balance: inrData.Balance !== undefined ? inrData.Balance : (inrData.balance || 0),
                    reserved_balance: 0,
                    isCrypto: false
                })
            } else {
                combined.push({
                    currency: 'INR',
                    name: 'Indian Rupee',
                    balance: 0,
                    reserved_balance: 0,
                    isCrypto: false
                })
            }

            // Fetch Assets & Crypto Wallets
            const assetsRes = await assetAPI.getAssets().catch(() => ({ data: [] }))
            const activeAssets = (Array.isArray(assetsRes) ? assetsRes : (assetsRes?.data || [])).filter(a => (a.Status || a.status) === 'active')
            setAllAssets(activeAssets)

            const cryptoRes = await cryptoWalletAPI.getWallets().catch(() => ({ data: [] }))
            const cryptoData = Array.isArray(cryptoRes) ? cryptoRes : (cryptoRes?.data || [])
            setCryptoWalletsRaw(cryptoData)

            // Populate ONLY the crypto wallets the user has actually created
            cryptoData.forEach(w => {
                const sym = w.Asset?.Symbol || w.Asset?.symbol || w.Symbol || w.symbol
                if (sym) {
                    const matchedAsset = activeAssets.find(a => (a.Symbol || a.symbol) === sym)
                    combined.push({
                        currency: sym,
                        name: matchedAsset?.Name || matchedAsset?.name || w.Asset?.Name || w.Asset?.name || sym,
                        precision: matchedAsset?.Precision !== undefined ? matchedAsset.Precision : (w.Asset?.Precision !== undefined ? w.Asset.Precision : 8),
                        balance: w.Balance !== undefined ? w.Balance : (w.balance || 0),
                        reserved_balance: w.Locked !== undefined ? w.Locked : (w.locked || 0),
                        isCrypto: true,
                        status: w.Status || w.status || 'active'
                    })
                }
            })

            setWallets(combined)

            // Transactions
            const inrTxRes = await walletAPI.getTransactions().catch(() => ({ data: [] }))
            setInrTransactions(Array.isArray(inrTxRes) ? inrTxRes : (inrTxRes?.data || []))

            const cryptoTxRes = await cryptoWalletAPI.getTransactions({ limit: 50 }).catch(() => ({ data: [] }))
            setCryptoTransactions(Array.isArray(cryptoTxRes) ? cryptoTxRes : (cryptoTxRes?.data || []))
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCryptoWallet = async (symbol) => {
        try {
            setCreatingSymbol(symbol)
            const res = await cryptoWalletAPI.createWallet({ symbol })
            toast.success(res?.message || `${symbol} wallet created successfully!`)
            setShowAddCryptoModal(false)
            loadData()
        } catch (err) {
            toast.error(err || `Failed to create ${symbol} wallet`)
        } finally {
            setCreatingSymbol(null)
        }
    }

    const hasPin = Boolean(walletInfo?.PinHash || walletInfo?.pin_hash)

    // Filter active assets that user doesn't already have a wallet for
    const existingSymbols = new Set(
        cryptoWalletsRaw.map(w => w.Asset?.Symbol || w.Asset?.symbol || w.Symbol || w.symbol || '').filter(Boolean)
    )
    const availableNewAssets = allAssets.filter(a => !existingSymbols.has(a.Symbol || a.symbol))

    const formatCryptoVal = (balance, precision) => {
        const p = precision !== undefined ? precision : 8
        return (parseInt(balance || 0, 10) / Math.pow(10, p)).toFixed(p)
    }

    const activeTransactions = txTab === 'inr' ? inrTransactions : cryptoTransactions

    // Separate INR vs Crypto
    const inrWallet = wallets.find(w => !w.isCrypto) || {
        currency: 'INR', name: 'Indian Rupee', balance: walletInfo?.Balance ?? walletInfo?.balance ?? 0, reserved_balance: 0, isCrypto: false
    };
    const cryptoWallets = wallets.filter(w => w.isCrypto);

    // Calculate Portfolio Valuation with Real-Time WS Prices
    let totalCryptoValueINR = 0;
    let totalCryptoPnLINR = 0;

    const enrichedCryptoWallets = cryptoWallets.map(w => {
        const symbolPair = `${w.currency}USDT`;
        const defaultUSD = w.currency === 'BTC' ? 96000 : w.currency === 'ETH' ? 3300 : w.currency === 'SOL' ? 170 : w.currency === 'BNB' ? 620 : w.currency === 'USDT' ? 1 : 1;
        const livePriceUSD = prices[symbolPair] ?? defaultUSD;
        const livePriceINR = livePriceUSD * 84;

        const balanceNum = parseFloat(formatCryptoVal(w.balance, w.precision));
        const valueINR = balanceNum * livePriceINR;
        totalCryptoValueINR += valueINR;

        const change24h = stats[symbolPair]?.change24h ?? (w.currency === 'BTC' ? +3.4 : w.currency === 'ETH' ? +1.8 : w.currency === 'SOL' ? +4.2 : 0);
        const pnlINR = valueINR * (change24h / 100);
        totalCryptoPnLINR += pnlINR;

        return {
            ...w,
            livePriceINR,
            valueINR,
            change24h,
            pnlINR
        };
    });

    const totalCashINR = inrWallet.balance / 100;
    const totalNetWorthINR = totalCashINR + totalCryptoValueINR;

    return (
        <div className="space-y-8 animate-fade-up pb-12">
            {/* Header & Controls tailored to active tab */}
            <div className="flex flex-wrap justify-between items-end gap-4 border-b border-brand-border/60 pb-6">
                {activeTab === 'cash' ? (
                    <>
                        <div>
                            <h2 className="font-display text-4xl text-white tracking-[0.2em] mb-1 font-bold">CASH WALLET</h2>
                            <p className="text-brand-red text-xs uppercase font-bold tracking-[0.3em]">Fiat Depository & Security PIN Management</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {!hasPin ? (
                                <button
                                    onClick={() => setShowSetPin(true)}
                                    className="px-5 py-2.5 bg-brand-red/10 border border-brand-red text-brand-red font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-brand-red hover:text-white transition-all shadow-red-sm"
                                >
                                    ⚠️ SET SECURITY PIN
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowChangePin(true)}
                                    className="px-5 py-2.5 bg-brand-surface border border-brand-border text-muted font-bold text-[10px] uppercase tracking-widest rounded-xl hover:text-white hover:border-brand-gold/40 transition-all"
                                >
                                    🔒 Change PIN
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <h2 className="font-display text-4xl text-white tracking-[0.2em] mb-1 font-bold">CRYPTO PORTFOLIO</h2>
                            <p className="text-brand-gold text-xs uppercase font-bold tracking-[0.3em]">Multi-Chain Holdings & Live Valuations</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowAddCryptoModal(true)}
                                className="px-6 py-2.5 bg-brand-panel border border-brand-gold/30 text-brand-gold font-bold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-brand-gold hover:text-brand-bg hover:border-brand-gold shadow-gold-sm transition-all duration-300"
                            >
                                + ADD CRYPTO ASSET WALLET
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Valuation Overview Summary Cards (Strictly Domain-Isolated) */}
            {activeTab === 'cash' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cash Balance */}
                    <div className="bg-gradient-to-br from-brand-surface via-brand-panel to-brand-surface border border-brand-red/30 rounded-2xl p-6 shadow-panel relative overflow-hidden group hover:border-brand-red/50 transition-all">
                        <div className="absolute -right-12 -bottom-12 w-36 h-36 bg-brand-red/10 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-red/20 transition-all animate-pulse-red"></div>
                        <p className="text-muted text-[10px] uppercase font-bold tracking-[0.2em] mb-2">CASH WALLET BALANCE (INR)</p>
                        <p className="font-mono text-3xl font-extrabold text-white tracking-tight mb-1">
                            {formatINR(totalCashINR)}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-brand-red font-bold uppercase tracking-wider">Available for withdrawals and trading</span>
                        </div>
                    </div>

                    {/* Security PIN Status Card */}
                    <div className="bg-gradient-to-br from-brand-surface via-brand-panel to-brand-surface border border-brand-border rounded-2xl p-6 shadow-panel relative overflow-hidden group hover:border-brand-red/30 transition-all">
                        <p className="text-muted text-[10px] uppercase font-bold tracking-[0.2em] mb-2">SECURITY STATUS</p>
                        <p className="text-xl font-extrabold text-white tracking-tight mb-3 font-display uppercase">
                            {hasPin ? '🔒 Secured by Transaction PIN' : '⚠️ Transaction PIN Not Set'}
                        </p>
                        <p className="text-xs text-muted max-w-sm font-medium">
                            {hasPin 
                                ? 'Your withdrawals and pin modifications are fully protected by your secure 6-digit PIN.' 
                                : 'Please configure a secure transaction PIN immediately to enable withdrawals.'
                            }
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Crypto Valuation */}
                    <div className="bg-gradient-to-br from-brand-surface via-brand-panel to-brand-surface border border-brand-gold/30 rounded-2xl p-6 shadow-panel relative overflow-hidden group hover:border-brand-gold/50 transition-all">
                        <div className="absolute -right-12 -bottom-12 w-36 h-36 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-gold/20 transition-all animate-pulse-gold"></div>
                        <p className="text-muted text-[10px] uppercase font-bold tracking-[0.2em] mb-2">CRYPTO PORTFOLIO VALUATION</p>
                        <p className="font-mono text-3xl font-extrabold text-white tracking-tight mb-1">
                            {formatINR(totalCryptoValueINR)}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-brand-gold font-bold uppercase tracking-wider">Total Value of Crypto Holdings</span>
                        </div>
                    </div>

                    {/* Crypto Valuation & PnL */}
                    <div className="bg-gradient-to-br from-brand-surface via-brand-panel to-brand-surface border border-brand-border rounded-2xl p-6 shadow-panel relative overflow-hidden group hover:border-brand-gold/40 transition-all">
                        <div className="absolute -right-12 -bottom-12 w-36 h-36 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-gold/20 transition-all animate-pulse-gold"></div>
                        <p className="text-muted text-[10px] uppercase font-bold tracking-[0.2em] mb-2">24H PORTFOLIO ESTIMATED P&L</p>
                        <div className="flex items-baseline justify-between">
                            <p className={`font-mono text-3xl font-extrabold tracking-tight mb-1 ${totalCryptoPnLINR >= 0 ? 'text-up' : 'text-down'}`}>
                                {totalCryptoPnLINR >= 0 ? '+' : ''}{formatINR(totalCryptoPnLINR)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted font-bold tracking-wider">Based on 24h percentage movements of active assets</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Section Tab Switcher */}
            <div className="flex border-b border-brand-border gap-8 mb-6">
                <button
                    onClick={() => navigate('/wallet/cash')}
                    className={`pb-4 font-display tracking-widest text-sm font-bold uppercase border-b-2 transition-all ${
                        activeTab === 'cash' ? 'border-brand-red text-white font-extrabold shadow-[0_10px_20px_-10px_rgba(229,9,20,0.5)]' : 'border-transparent text-muted hover:text-white'
                    }`}
                >
                    💵 CASH WALLET (INR)
                </button>
                <button
                    onClick={() => navigate('/wallet/crypto')}
                    className={`pb-4 font-display tracking-widest text-sm font-bold uppercase border-b-2 transition-all ${
                        activeTab === 'crypto' ? 'border-brand-gold text-white font-extrabold shadow-[0_10px_20px_-10px_rgba(201,168,76,0.5)]' : 'border-transparent text-muted hover:text-white'
                    }`}
                >
                    🪙 CRYPTO ASSET WALLETS
                </button>
            </div>

            {/* SECTION 1: CASH WALLET (INR) */}
            {activeTab === 'cash' && (
                <div className="bg-brand-surface/90 border-2 border-brand-red/30 rounded-3xl p-8 shadow-panel relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex flex-wrap justify-between items-center gap-6 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-red via-brand-gold to-brand-red bg-[length:200%_auto] flex items-center justify-center text-white font-mono text-3xl font-bold shadow-red-md animate-pulse-red">
                                ₹
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-display font-bold text-white tracking-wider">CASH WALLET</h3>
                                    <span className="bg-brand-red/20 border border-brand-red/50 text-brand-red px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
                                        Active Fiat
                                    </span>
                                </div>
                                <p className="text-muted text-xs uppercase tracking-widest mt-1">Indian Rupee (INR) Depository</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="text-right sm:pr-6 sm:border-r border-brand-border/60">
                                <p className="text-muted text-[10px] uppercase font-bold tracking-widest mb-1">AVAILABLE CASH</p>
                                <p className="font-mono text-3xl font-extrabold text-white">{formatINR(totalCashINR)}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeposit(true)}
                                    className="px-7 py-3.5 bg-gradient-to-r from-brand-red via-brand-gold to-brand-red bg-[length:200%_auto] text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl shadow-red-md hover:bg-right active:scale-95 transition-all duration-300"
                                >
                                    ADD INR FUNDS
                                </button>
                                <button
                                    onClick={() => setShowWithdraw(true)}
                                    className="px-7 py-3.5 bg-brand-panel border border-brand-border text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-brand-gold hover:text-brand-bg hover:border-brand-gold active:scale-95 transition-all duration-300"
                                >
                                    WITHDRAW
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 2: CRYPTO ASSET WALLETS */}
            {activeTab === 'crypto' && (
                <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 shadow-panel relative overflow-hidden space-y-6">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex justify-between items-center flex-wrap gap-4 border-b border-brand-border/60 pb-6 relative z-10">
                        <div>
                            <h3 className="text-2xl font-display font-bold text-white tracking-wider flex items-center gap-3">
                                <span>CRYPTO PORTFOLIO</span>
                                <span className="bg-brand-gold/20 border border-brand-gold/50 text-brand-gold px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
                                    Multi-Chain Holdings
                                </span>
                            </h3>
                            <p className="text-muted text-xs uppercase tracking-widest mt-1">Real-Time WebSocket Valuations & 24h PnL</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto relative z-10">
                        {enrichedCryptoWallets.length > 0 ? (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-brand-border/80 h-12 text-muted text-[10px] uppercase tracking-[0.2em] font-bold bg-brand-panel/30">
                                        <th className="px-6 py-3 rounded-l-xl">Asset / Symbol</th>
                                        <th className="px-6 py-3 text-right">Available Balance</th>
                                        <th className="px-6 py-3 text-right">Locked In Orders</th>
                                        <th className="px-6 py-3 text-right">Live Price (INR)</th>
                                        <th className="px-6 py-3 text-right">Estimated Value</th>
                                        <th className="px-6 py-3 text-right">24h PnL</th>
                                        <th className="px-6 py-3 text-center rounded-r-xl">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border/50 text-sm font-medium">
                                    {enrichedCryptoWallets.map(w => {
                                        const availableStr = formatCryptoVal(w.balance, w.precision);
                                        const lockedStr = formatCryptoVal(w.reserved_balance, w.precision);

                                        return (
                                            <tr key={w.currency} className="hover:bg-brand-panel/40 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold font-mono font-bold text-xl shadow-inner group-hover:scale-110 transition-transform">
                                                            {COIN_ICONS[w.currency]?.icon ?? w.currency[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-bold text-base tracking-tight">{w.currency}</p>
                                                            <p className="text-muted text-[10px] uppercase font-bold tracking-widest">{w.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right font-mono font-bold text-white text-base">
                                                    {availableStr} {w.currency}
                                                </td>
                                                <td className="px-6 py-5 text-right font-mono text-yellow-500 font-semibold text-xs">
                                                    {parseFloat(lockedStr) > 0 ? `${lockedStr} ${w.currency}` : '—'}
                                                </td>
                                                <td className="px-6 py-5 text-right font-mono text-white text-base font-semibold">
                                                    {formatINR(w.livePriceINR)}
                                                </td>
                                                <td className="px-6 py-5 text-right font-mono text-brand-gold font-bold text-base">
                                                    {formatINR(w.valueINR)}
                                                </td>
                                                <td className="px-6 py-5 text-right font-mono">
                                                    <div className={`flex flex-col items-end ${w.pnlINR >= 0 ? 'text-up' : 'text-down'}`}>
                                                        <span className="font-bold text-sm">
                                                            {w.pnlINR >= 0 ? '+' : ''}{formatINR(w.pnlINR)}
                                                        </span>
                                                        <span className="text-[10px] font-bold">
                                                            ({formatChange(w.change24h)})
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <button
                                                        onClick={() => navigate(`/trade/${w.currency}USDT`)}
                                                        className="px-6 py-2 bg-gradient-to-r from-brand-red via-brand-gold to-brand-red bg-[length:200%_auto] text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-red-sm hover:bg-right active:scale-95 transition-all duration-300"
                                                    >
                                                        TRADE
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-16 text-center text-muted font-bold text-sm uppercase tracking-widest italic bg-brand-panel/20 rounded-2xl border border-dashed border-brand-border">
                                No Crypto Asset Wallets Created Yet. Click "+ ADD CRYPTO ASSET WALLET" above to begin.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SECTION 3: TRANSACTION HISTORY */}
            <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-panel">
                <div className="px-8 py-6 border-b border-brand-border bg-brand-panel/40 flex justify-between items-center flex-wrap gap-4">
                    <h3 className="font-display text-xl text-white tracking-widest uppercase font-bold">
                        {activeTab === 'cash' ? 'INR TRANSACTION HISTORY' : 'CRYPTO TRANSACTION HISTORY'}
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    {activeTransactions.length > 0 ? (
                        <table className="w-full text-xs text-left">
                            <thead>
                                <tr className="h-12 bg-brand-panel/20 text-muted text-[10px] uppercase tracking-[0.2em] font-bold border-b border-brand-border/60">
                                    <th className="px-8 py-3">Type / Action</th>
                                    <th className="px-8 py-3 text-right">Amount</th>
                                    <th className="px-8 py-3 text-center">Status</th>
                                    <th className="px-8 py-3 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/50 font-bold uppercase tracking-wider text-xs">
                                {activeTransactions.map((tx, idx) => {
                                    const isCredit = tx.type === 'deposit' || tx.type === 'credit' || tx.Type === 'credit' || tx.Type === 'unlock' || tx.Source === 'deposit' || tx.source === 'deposit' || tx.Source === 'refund' || tx.source === 'refund';
                                    const typeName = tx.Source || tx.source || tx.Type || tx.type || 'Transaction';
                                    const statusName = tx.Status || tx.status || 'success';
                                    const rawAmt = tx.Amount !== undefined ? tx.Amount : (tx.amount || 0);
                                    const amountVal = txTab === 'inr' 
                                        ? formatINR(rawAmt / 100) 
                                        : `${formatCryptoVal(rawAmt, tx.Asset?.Precision ?? tx.Asset?.precision ?? 8)} ${tx.Asset?.Symbol ?? tx.Asset?.symbol ?? ''}`;
                                    const desc = tx.Description || tx.description;

                                    return (
                                        <tr key={tx.ID || tx.id || idx} className="hover:bg-brand-panel/40 transition-colors">
                                            <td className="px-8 py-5 flex items-center gap-3">
                                                <span className={`w-2.5 h-2.5 rounded-full shadow-md ${isCredit ? 'bg-up shadow-up/50' : 'bg-down shadow-down/50'}`} />
                                                <span className="text-white font-body text-sm font-extrabold">{typeName}</span>
                                                {desc && <span className="text-xs text-muted font-normal lowercase tracking-normal">({desc})</span>}
                                            </td>
                                            <td className="px-8 py-5 text-right font-mono font-bold text-white text-sm">
                                                {isCredit ? '+' : '-'}{amountVal}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-md border text-[10px] font-extrabold tracking-widest ${
                                                    statusName === 'completed' || statusName === 'success' ? 'bg-up/10 text-up border-up/30 shadow-[0_0_10px_rgba(21,176,109,0.15)]' :
                                                    statusName === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.15)]' :
                                                    'bg-down/10 text-down border-down/30 shadow-[0_0_10px_rgba(229,9,20,0.15)]'
                                                }`}>
                                                    {statusName}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right text-muted font-mono font-normal text-xs">
                                                {formatDate(tx.CreatedAt || tx.created_at)}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-16 text-center text-muted font-bold text-sm uppercase tracking-widest italic bg-brand-panel/10">
                            No {txTab.toUpperCase()} transactions found
                        </div>
                    )}
                </div>
            </div>

            {/* Add Crypto Asset Modal */}
            {showAddCryptoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-brand-surface border border-brand-gold/40 rounded-3xl w-full max-w-md overflow-hidden shadow-gold-md relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="p-6 border-b border-brand-border flex justify-between items-center relative z-10">
                            <h3 className="font-display text-xl text-white tracking-widest uppercase font-bold">Add Crypto Asset Wallet</h3>
                            <button onClick={() => setShowAddCryptoModal(false)} className="text-muted hover:text-white transition-colors text-xl">✕</button>
                        </div>

                        <div className="p-6 space-y-5 relative z-10">
                            <p className="text-muted text-xs uppercase tracking-widest font-bold leading-relaxed">
                                Select an active cryptocurrency to instantly generate your secure on-chain wallet depository.
                            </p>

                            <div className="space-y-3 max-h-[320px] overflow-y-auto no-scrollbar pt-2">
                                {availableNewAssets.length > 0 ? (
                                    availableNewAssets.map(a => (
                                        <div key={a.ID || a.id} className="flex justify-between items-center p-4 bg-brand-panel border border-brand-border rounded-2xl hover:border-brand-gold/40 transition-all shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold font-mono font-bold text-xl shadow-inner">
                                                    {COIN_ICONS[a.Symbol || a.symbol]?.icon ?? (a.Symbol || a.symbol)?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold tracking-tight text-base">{a.Symbol || a.symbol}</p>
                                                    <p className="text-muted text-[10px] uppercase font-bold tracking-widest">{a.Name || a.name}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleCreateCryptoWallet(a.Symbol || a.symbol)}
                                                disabled={creatingSymbol === (a.Symbol || a.symbol)}
                                                className="px-5 py-2.5 bg-gradient-to-r from-brand-red via-brand-gold to-brand-red bg-[length:200%_auto] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-right active:scale-95 transition-all shadow-red-sm disabled:opacity-50"
                                            >
                                                {creatingSymbol === (a.Symbol || a.symbol) ? 'CREATING...' : 'CREATE'}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-muted text-xs italic tracking-widest uppercase bg-brand-panel/30 rounded-2xl border border-brand-border">
                                        All available active asset wallets have already been created.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} onSuccess={loadData} />}
            {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} onSuccess={loadData} />}
            {showSetPin && <SetPinModal onClose={() => setShowSetPin(false)} onSuccess={loadData} />}
            {showChangePin && <ChangePinModal onClose={() => setShowChangePin(false)} />}
        </div>
    )
}
