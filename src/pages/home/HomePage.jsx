import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const INITIAL_COINS = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 64250.40, change24h: 1.84, volume24h: '28.4B', category: 'hot', sparkline: [62100, 62400, 61800, 63000, 63500, 62900, 63800, 64100, 63900, 64250] },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 3450.25, change24h: -0.62, volume24h: '14.1B', category: 'hot', sparkline: [3550, 3510, 3480, 3490, 3460, 3440, 3420, 3460, 3430, 3450] },
    { id: 'bnb', name: 'BNB', symbol: 'BNB', price: 582.10, change24h: 4.52, volume24h: '1.8B', category: 'hot', sparkline: [550, 555, 560, 558, 564, 570, 575, 572, 578, 582] },
    { id: 'sol', name: 'Solana', symbol: 'SOL', price: 148.75, change24h: 12.35, volume24h: '3.9B', category: 'gainers', sparkline: [128, 131, 134, 132, 138, 140, 142, 145, 144, 148.75] },
    { id: 'xrp', name: 'Ripple', symbol: 'XRP', price: 0.5210, change24h: -1.20, volume24h: '850M', category: 'hot', sparkline: [0.535, 0.531, 0.528, 0.529, 0.525, 0.524, 0.520, 0.522, 0.519, 0.521] },
    { id: 'ada', name: 'Cardano', symbol: 'ADA', price: 0.4650, change24h: 2.15, volume24h: '410M', category: 'gainers', sparkline: [0.450, 0.452, 0.455, 0.451, 0.458, 0.460, 0.462, 0.461, 0.463, 0.465] },
    { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', price: 0.1450, change24h: -3.40, volume24h: '1.2B', category: 'gainers', sparkline: [0.155, 0.152, 0.150, 0.148, 0.149, 0.146, 0.143, 0.145, 0.142, 0.145] },
    { id: 'crx', name: 'Crytinox Coin', symbol: 'CRX', price: 0.1500, change24h: 25.40, volume24h: '12.5M', category: 'new', sparkline: [0.110, 0.115, 0.120, 0.118, 0.125, 0.135, 0.140, 0.142, 0.145, 0.150] },
    { id: 'near', name: 'NEAR Protocol', symbol: 'NEAR', price: 6.20, change24h: -2.10, volume24h: '280M', category: 'new', sparkline: [6.40, 6.35, 6.28, 6.30, 6.25, 6.22, 6.15, 6.18, 6.16, 6.20] },
    { id: 'rndr', name: 'Render Token', symbol: 'RNDR', price: 9.85, change24h: 8.30, volume24h: '510M', category: 'new', sparkline: [9.05, 9.15, 9.20, 9.10, 9.35, 9.50, 9.62, 9.70, 9.65, 9.85] },
];

export default function HomePage() {
    const { theme, toggleTheme, token, user, logout } = useAuthStore();
    const [coins, setCoins] = useState(INITIAL_COINS);
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'hot' | 'gainers' | 'new'
    const [calcUsd, setCalcUsd] = useState('1000');
    const [calcCrypto, setCalcCrypto] = useState('BTC');
    const [stats, setStats] = useState({ accounts: 412850, volume: 4210450890, uptime: 99.99 });
    
    // Store flashes: { [coinSymbol]: { direction: 'up'|'down', time: timestamp } }
    const [flashes, setFlashes] = useState({});

    // Price Tick simulator mimicking real-time Binance WebSocket data
    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly pick 1 to 3 coins to fluctuate
            const updatedCoins = [...coins];
            const numCoinsToUpdate = Math.floor(Math.random() * 3) + 1;
            const updatedFlashes = { ...flashes };

            for (let i = 0; i < numCoinsToUpdate; i++) {
                const randIndex = Math.floor(Math.random() * updatedCoins.length);
                const coin = updatedCoins[randIndex];
                
                // Random fluctuation (-0.2% to +0.25%)
                const delta = (Math.random() * 0.45 - 0.2) / 100;
                const oldPrice = coin.price;
                const newPrice = oldPrice * (1 + delta);
                
                coin.price = Number(newPrice.toFixed(coin.price < 1 ? 4 : 2));
                coin.change24h = Number((coin.change24h + delta * 100).toFixed(2));
                
                // Add to sparkline and drop oldest
                const newSpark = [...coin.sparkline.slice(1), coin.price];
                coin.sparkline = newSpark;

                const direction = delta >= 0 ? 'up' : 'down';
                updatedFlashes[coin.symbol] = { direction, time: Date.now() };
            }

            setCoins(updatedCoins);
            setFlashes(updatedFlashes);

            // Slightly increment platform stats to feel dynamic
            setStats(prev => ({
                accounts: prev.accounts + (Math.random() > 0.4 ? 1 : 0),
                volume: prev.volume + Math.floor(Math.random() * 12500),
                uptime: 99.99
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, [coins, flashes]);

    // Cleanup stale flashes every 1000ms
    useEffect(() => {
        const cleanup = setInterval(() => {
            const now = Date.now();
            let changed = false;
            const nextFlashes = { ...flashes };
            
            Object.keys(nextFlashes).forEach(symbol => {
                if (now - nextFlashes[symbol].time > 800) {
                    delete nextFlashes[symbol];
                    changed = true;
                }
            });

            if (changed) {
                setFlashes(nextFlashes);
            }
        }, 500);

        return () => clearInterval(cleanup);
    }, [flashes]);

    // Filter coins according to active tab
    const filteredCoins = coins.filter(coin => {
        if (activeTab === 'all') return true;
        return coin.category === activeTab;
    });

    // Helper to render sparklines dynamically
    const getSparklinePath = (points, width = 120, height = 36) => {
        const min = Math.min(...points);
        const max = Math.max(...points);
        const range = max - min === 0 ? 1 : max - min;
        return points.map((p, i) => {
            const x = (i / (points.length - 1)) * width;
            const y = height - ((p - min) / range) * height;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    };

    // Calculate converted crypto amount based on live prices
    const getCalculatedCrypto = () => {
        const coin = coins.find(c => c.symbol === calcCrypto);
        if (!coin) return '0.0000';
        const parsedUsd = parseFloat(calcUsd);
        if (isNaN(parsedUsd) || parsedUsd <= 0) return '0.0000';
        return (parsedUsd / coin.price).toFixed(coin.price < 1 ? 2 : 5);
    };

    return (
        <div className="min-h-screen bg-brand-bg text-white font-display selection:bg-brand-gold/30 scroll-smooth relative overflow-x-hidden transition-colors duration-300">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-brand-gold/5 dark:bg-brand-gold/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-[600px] left-[-200px] w-[500px] h-[500px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none z-0" />

            {/* Binance-Style Navigation Header */}
            <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-brand-border sticky top-0 bg-brand-bg/80 backdrop-blur-md z-50 transition-colors duration-300">
                <div className="flex items-center gap-10">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-brand-border flex items-center justify-center p-1 group-hover:shadow-gold-sm transition-all">
                            <img src="/crytinox-logo.png" alt="Crytinox Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xl md:text-2xl font-semibold tracking-[0.1em] text-white flex items-center">
                            CRYTINOX<span className="text-brand-gold font-bold ml-1">.</span>
                        </span>
                    </Link>
                    
                    {/* Navigation Links */}
                    <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-muted">
                        <Link to="/market" className="hover:text-brand-gold transition-colors">Markets</Link>
                        <Link to="/trade/BTCUSDT" className="hover:text-brand-gold transition-colors">Trade</Link>
                        <Link to="/staking" className="hover:text-brand-gold transition-colors flex items-center gap-1.5">
                            Staking <span className="text-[10px] bg-brand-gold/20 text-brand-gold px-1.5 py-0.2 rounded-full font-bold">HOT</span>
                        </Link>
                        <Link to="/leaderboard" className="hover:text-brand-gold transition-colors">Leaderboard</Link>
                        {token && <Link to="/wallet" className="hover:text-brand-gold transition-colors">Wallet</Link>}
                        {token && <Link to="/reports" className="hover:text-brand-gold transition-colors">Reports</Link>}
                        {token && user?.role === 'admin' && (
                            <Link to="/admin" className="text-brand-gold/90 hover:text-brand-gold transition-colors font-semibold">Admin</Link>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    {/* Theme Switcher Button */}
                    <button 
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl border border-brand-border bg-brand-surface/40 hover:bg-brand-surface/80 hover:border-brand-gold/40 text-brand-gold transition-all duration-300 flex items-center justify-center shadow-inner"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? (
                            // Sun Icon
                            <svg className="w-5 h-5 animate-pulse-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                            </svg>
                        ) : (
                            // Moon Icon
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    {/* Auth Status CTAs */}
                    <div className="flex items-center gap-4">
                        {token ? (
                            <>
                                <Link 
                                    to="/market" 
                                    className="hidden sm:inline-block px-5 py-2 border border-brand-gold/30 hover:border-brand-gold hover:shadow-gold-sm rounded-xl text-xs font-semibold text-white tracking-wide transition-all"
                                >
                                    Dashboard
                                </Link>
                                <button 
                                    onClick={logout}
                                    className="px-5 py-2 bg-brand-panel border border-brand-border hover:bg-[#ff4d4d]/10 hover:border-[#ff4d4d]/50 text-[#ff4d4d] rounded-xl text-xs font-semibold tracking-wide transition-all"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link 
                                    to="/auth/login" 
                                    className="px-5 py-2 hover:text-brand-gold text-xs font-semibold text-white transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link 
                                    to="/auth/register" 
                                    className="px-5 py-2.5 bg-gradient-to-r from-brand-gold-lt to-brand-gold text-black hover:shadow-gold-sm hover:scale-[1.02] rounded-xl text-xs font-bold transition-all shadow-md"
                                >
                                    Register Now
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section Container */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Side Info Banner */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full text-brand-gold text-[10px] font-bold uppercase tracking-wider">
                        <span className="flex h-1.5 w-1.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-gold"></span>
                        </span>
                        New High-Velocity Server Live
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
                        Institutional Grade <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold-lt via-brand-gold to-brand-gold-dk">
                            Crypto Trading
                        </span>
                    </h1>
                    
                    <p className="text-muted text-base md:text-lg leading-relaxed max-w-2xl">
                        Experience lightning-fast order routing, precision charts, and AI-driven bottom/top alerts on Forex, Indices, and Crypto assets. Backed by institutional liquidity pools.
                    </p>
                    
                    {/* Stats Counters */}
                    <div className="grid grid-cols-3 gap-6 pt-6 border-t border-brand-border max-w-xl">
                        <div>
                            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                                ${ (stats.volume / 1e9).toFixed(2) }B
                            </div>
                            <div className="text-xs text-muted font-semibold mt-1">24h Vol Traded</div>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                                { stats.accounts.toLocaleString() }
                            </div>
                            <div className="text-xs text-muted font-semibold mt-1">Traders Enrolled</div>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                                { stats.uptime }%
                            </div>
                            <div className="text-xs text-muted font-semibold mt-1">Core Engine Uptime</div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link 
                            to={token ? "/market" : "/auth/register"} 
                            className="px-8 py-4 bg-gradient-to-r from-brand-gold-lt to-brand-gold text-black font-bold text-sm rounded-xl hover:shadow-gold-md hover:scale-[1.01] transition-all flex items-center gap-2"
                        >
                            Get Started
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </Link>
                        <Link 
                            to="/trade/BTCUSDT" 
                            className="px-8 py-4 bg-brand-panel border border-brand-border text-white font-semibold text-sm rounded-xl hover:bg-brand-surface/80 transition-all"
                        >
                            View Live Markets
                        </Link>
                    </div>
                </div>

                {/* Right Side Convertor/Calculator & Mini Watchlist Widget */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* Live Ticker Convertor Widget */}
                    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-panel relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-[40px] rounded-full pointer-events-none" />
                        
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Quick Conversion</h3>
                            <span className="text-[10px] font-mono text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-md font-semibold">Live Feed</span>
                        </div>

                        <div className="space-y-4">
                            {/* Input Field */}
                            <div>
                                <label className="text-[10px] text-muted font-bold uppercase tracking-widest block mb-2">You Pay (USD)</label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        value={calcUsd}
                                        onChange={(e) => setCalcUsd(e.target.value)}
                                        className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3.5 text-white font-mono text-base placeholder-dim outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted font-bold">USD</span>
                                </div>
                            </div>

                            {/* Dropdown Crypto Select */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-muted font-bold uppercase tracking-widest block mb-2">Receive Asset</label>
                                    <select 
                                        value={calcCrypto}
                                        onChange={(e) => setCalcCrypto(e.target.value)}
                                        className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white font-mono text-sm outline-none transition-all cursor-pointer"
                                    >
                                        <option value="BTC">BTC (Bitcoin)</option>
                                        <option value="ETH">ETH (Ethereum)</option>
                                        <option value="BNB">BNB (BNB)</option>
                                        <option value="SOL">SOL (Solana)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-muted font-bold uppercase tracking-widest block mb-2">You Get (Estimate)</label>
                                    <div className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-brand-gold font-mono text-sm font-bold flex items-center justify-between">
                                        <span>{ getCalculatedCrypto() }</span>
                                        <span>{ calcCrypto }</span>
                                    </div>
                                </div>
                            </div>

                            <Link 
                                to={`/trade/${calcCrypto}USDT`}
                                className="w-full mt-2 py-3.5 bg-gradient-to-r from-brand-gold to-brand-gold-lt text-black text-xs font-bold tracking-[0.1em] rounded-xl hover:shadow-gold-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                            >
                                BUY {calcCrypto} INSTANTLY
                            </Link>
                        </div>
                    </div>

                    {/* Binance Premium Features Ticker widget */}
                    <div className="bg-brand-panel/40 border border-brand-border rounded-2xl p-5 flex items-center gap-4 hover:shadow-gold-sm transition-all duration-300">
                        <div className="w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Full Financial Security</h4>
                            <p className="text-[11px] text-muted mt-1 leading-relaxed">Secure storage via hardware security modules and fully audited cold storage reserves.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Interactive Mini Market Rates Bar */}
            <div className="border-t border-b border-brand-border bg-brand-panel/50 py-4 overflow-x-auto no-scrollbar transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8 min-w-[800px]">
                    {coins.slice(0, 4).map(coin => {
                        const flash = flashes[coin.symbol];
                        let flashClass = '';
                        if (flash) {
                            flashClass = flash.direction === 'up' ? 'text-flash-up' : 'text-flash-down';
                        }
                        return (
                            <Link 
                                to={`/trade/${coin.symbol}USDT`}
                                key={coin.symbol}
                                className="flex items-center gap-4 hover:bg-brand-surface/40 p-2 rounded-xl transition-colors cursor-pointer"
                            >
                                <span className="font-bold text-xs text-white">{coin.symbol}/USDT</span>
                                <span className={`font-mono text-xs font-semibold ${flashClass}`}>
                                    ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                                <span className={`text-[10px] font-bold ${coin.change24h >= 0 ? 'text-[#15B06D]' : 'text-brand-red'}`}>
                                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Interactive Market Tables Section */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Market Overview</h2>
                        <p className="text-muted text-xs mt-2 leading-relaxed">Real-time live prices of major global cryptocurrencies. Click trade to open terminal.</p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-brand-panel p-1 rounded-xl border border-brand-border max-w-max self-start md:self-auto">
                        <button 
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-brand-surface text-brand-gold shadow-sm' : 'text-muted hover:text-white'}`}
                        >
                            All Cryptos
                        </button>
                        <button 
                            onClick={() => setActiveTab('hot')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'hot' ? 'bg-brand-surface text-brand-gold shadow-sm' : 'text-muted hover:text-white'}`}
                        >
                            Hot Coins
                        </button>
                        <button 
                            onClick={() => setActiveTab('gainers')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'gainers' ? 'bg-brand-surface text-brand-gold shadow-sm' : 'text-muted hover:text-white'}`}
                        >
                            Top Gainers
                        </button>
                        <button 
                            onClick={() => setActiveTab('new')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'new' ? 'bg-brand-surface text-brand-gold shadow-sm' : 'text-muted hover:text-white'}`}
                        >
                            New Listings
                        </button>
                    </div>
                </div>

                {/* Crypto Rates Table */}
                <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-brand-border text-muted text-[10px] font-bold uppercase tracking-widest bg-brand-panel/30">
                                    <th className="px-6 py-4.5">Asset</th>
                                    <th className="px-6 py-4.5">Price</th>
                                    <th className="px-6 py-4.5">24h Change</th>
                                    <th className="px-6 py-4.5">24h Volume</th>
                                    <th className="px-6 py-4.5">Trends (24h)</th>
                                    <th className="px-6 py-4.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/40 font-mono text-sm">
                                {filteredCoins.map(coin => {
                                    const flash = flashes[coin.symbol];
                                    let flashBg = '';
                                    let flashText = '';
                                    if (flash) {
                                        flashBg = flash.direction === 'up' ? 'bg-[#15B06D]/5 animate-flash-up' : 'bg-brand-red/5 animate-flash-down';
                                        flashText = flash.direction === 'up' ? 'text-[#15B06D]' : 'text-brand-red';
                                    }

                                    return (
                                        <tr 
                                            key={coin.id} 
                                            className={`hover:bg-brand-panel/20 transition-colors duration-200 ${flashBg}`}
                                        >
                                            {/* Coin Info */}
                                            <td className="px-6 py-4.5 font-display">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-brand-panel border border-brand-border flex items-center justify-center font-bold text-xs text-brand-gold">
                                                        {coin.symbol[0]}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-white text-xs block">{coin.symbol}/USDT</span>
                                                        <span className="text-[10px] text-muted">{coin.name}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Live Price */}
                                            <td className={`px-6 py-4.5 font-bold text-xs text-white ${flashText}`}>
                                                ${coin.price.toLocaleString(undefined, { minimumFractionDigits: coin.price < 1 ? 4 : 2 })}
                                            </td>

                                            {/* 24h Change */}
                                            <td className="px-6 py-4.5 font-bold text-xs">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] ${coin.change24h >= 0 ? 'bg-[#15B06D]/10 text-[#15B06D]' : 'bg-brand-red/10 text-brand-red'}`}>
                                                    {coin.change24h >= 0 ? '▲' : '▼'} {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                                                </span>
                                            </td>

                                            {/* 24h Volume */}
                                            <td className="px-6 py-4.5 text-xs text-muted font-medium">
                                                ${coin.volume24h}
                                            </td>

                                            {/* Mini Sparkline Chart */}
                                            <td className="px-6 py-4.5">
                                                <div className="w-24 h-9">
                                                    <svg width="100%" height="100%" className="overflow-visible">
                                                        <path 
                                                            d={getSparklinePath(coin.sparkline)}
                                                            fill="none" 
                                                            stroke={coin.change24h >= 0 ? '#15B06D' : 'var(--color-red)'}
                                                            strokeWidth="1.8"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4.5 text-right font-display">
                                                <Link 
                                                    to={`/trade/${coin.symbol}USDT`}
                                                    className="inline-flex items-center gap-1 px-4 py-1.5 bg-brand-gold text-black text-[11px] font-bold rounded-lg hover:shadow-gold-sm hover:bg-brand-gold-lt transition-all"
                                                >
                                                    Trade
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Premium Staking Promotion Card */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24 relative z-10">
                <div className="bg-gradient-to-r from-brand-panel/80 via-brand-surface to-brand-panel/80 border border-brand-border rounded-3xl p-8 md:p-12 shadow-panel relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-gold/5 blur-[100px] pointer-events-none" />
                    
                    <div className="space-y-4 max-w-xl text-center lg:text-left">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-lg text-brand-gold text-[10px] font-bold uppercase tracking-wider">
                            Crytinox Earn Program 💰
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                            Stake Your Assets & Earn up to 18.5% APR
                        </h2>
                        <p className="text-muted text-xs leading-relaxed">
                            Put your idle cryptocurrencies to work. Choose flexible or locked staking options for BTC, ETH, BNB, and USDT. Accrue hourly compounding yields with instant redemptions.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 shrink-0">
                        <div className="bg-brand-panel border border-brand-border rounded-2xl p-5 w-40 text-center">
                            <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">USDT yield</span>
                            <span className="text-2xl font-bold text-[#15B06D] font-mono mt-1 block">12.50%</span>
                            <span className="text-[10px] text-brand-gold font-bold mt-1.5 block">Flexible</span>
                        </div>
                        <div className="bg-brand-panel border border-brand-border rounded-2xl p-5 w-40 text-center">
                            <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">ETH Yield</span>
                            <span className="text-2xl font-bold text-[#15B06D] font-mono mt-1 block">8.25%</span>
                            <span className="text-[10px] text-brand-gold font-bold mt-1.5 block">Locked 30D</span>
                        </div>
                        <div className="bg-brand-panel border border-brand-border rounded-2xl p-5 w-40 text-center">
                            <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">BNB Yield</span>
                            <span className="text-2xl font-bold text-[#15B06D] font-mono mt-1 block">18.50%</span>
                            <span className="text-[10px] text-brand-gold font-bold mt-1.5 block">Locked 90D</span>
                        </div>
                    </div>

                    <div className="shrink-0">
                        <Link 
                            to="/staking"
                            className="px-8 py-4 bg-brand-gold text-black font-bold text-sm rounded-xl hover:shadow-gold-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                            Earn Yield Now
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Why Choose Us & Pro Toolkits Info Grid */}
            <div className="border-t border-brand-border bg-brand-panel/20 py-24 relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-brand-gold">Security First Architecture</h3>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">The Elite Trading Platform</h2>
                        <p className="text-muted text-xs leading-relaxed">
                            Crytinox provides high-frequency proprietary analytics, dynamic indicator overlays, and visual depth trackers that give retailers institutional execution edges.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Box 1 */}
                        <div className="bg-brand-surface border border-brand-border rounded-2xl p-8 hover:border-brand-gold/40 hover:shadow-gold-sm hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h4 className="text-base font-bold text-white mb-3">Ultra-Low Latency</h4>
                            <p className="text-muted text-xs leading-relaxed">
                                Our match engines deploy within 10 milliseconds, processing up to 100,000 requests per second under peak volatile stress.
                            </p>
                        </div>

                        {/* Box 2 */}
                        <div className="bg-brand-surface border border-brand-border rounded-2xl p-8 hover:border-brand-gold/40 hover:shadow-gold-sm hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                            </div>
                            <h4 className="text-base font-bold text-white mb-3">Institutional Tools</h4>
                            <p className="text-muted text-xs leading-relaxed">
                                Align and filter order books against divergence curves. Visualize smart contract volumes without leaving the panel.
                            </p>
                        </div>

                        {/* Box 3 */}
                        <div className="bg-brand-surface border border-brand-border rounded-2xl p-8 hover:border-brand-gold/40 hover:shadow-gold-sm hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            <h4 className="text-base font-bold text-white mb-3">Reserves Ledger</h4>
                            <p className="text-muted text-xs leading-relaxed">
                                We operate on full reserve ledger models with transparent addresses so your deposits are verifiable on-chain 24/7.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-brand-border bg-brand-surface py-16 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-black/40 border border-brand-border flex items-center justify-center p-1 font-bold text-brand-gold">
                                <img src="/crytinox-logo.png" alt="Crytinox Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-lg font-bold text-white tracking-[0.1em]">CRYTINOX</span>
                        </div>
                        <p className="text-muted text-[11px] leading-relaxed">
                            Crytinox is a leading high-efficiency institutional cryptocurrency liquidity portal offering premium derivative access.
                        </p>
                        <div className="flex items-center gap-4 text-muted pt-2">
                            <a href="#" className="hover:text-brand-gold transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>
                            <a href="#" className="hover:text-brand-gold transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
                            <a href="#" className="hover:text-brand-gold transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Products</h4>
                        <ul className="space-y-2 text-[11px] text-muted font-medium">
                            <li><Link to="/market" className="hover:text-brand-gold transition-colors">Exchange Terminal</Link></li>
                            <li><Link to="/staking" className="hover:text-brand-gold transition-colors">Staking Yields</Link></li>
                            <li><Link to="/ecard" className="hover:text-brand-gold transition-colors">Crytinox Visa Card</Link></li>
                            <li><Link to="/leaderboard" className="hover:text-brand-gold transition-colors">Institutional Leaderboard</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Service Support</h4>
                        <ul className="space-y-2 text-[11px] text-muted font-medium">
                            <li><a href="mailto:support@crytinox.com" className="hover:text-brand-gold transition-colors">Help Center</a></li>
                            <li><Link to="/kyc" className="hover:text-brand-gold transition-colors">KYC Verification</Link></li>
                            <li><a href="#" className="hover:text-brand-gold transition-colors">API Documentation</a></li>
                            <li><a href="#" className="hover:text-brand-gold transition-colors">Security Disclosures</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">Theme Preference</h4>
                        <p className="text-[10px] text-muted leading-relaxed">Toggle between visual layouts optimized for bright work spaces or dark trading setups.</p>
                        <button 
                            onClick={toggleTheme}
                            className="w-full py-2.5 rounded-xl border border-brand-border bg-brand-panel text-brand-gold hover:bg-brand-surface/80 hover:border-brand-gold/40 text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300"
                        >
                            {theme === 'dark' ? 'SWITCH TO LIGHT MODE ☀️' : 'SWITCH TO DARK MODE 🌙'}
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 pt-8 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-muted font-medium">
                    <span>© 2026 Crytinox Global Ltd. All rights reserved.</span>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-brand-gold transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-brand-gold transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-brand-gold transition-colors">Cookie Preferences</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
