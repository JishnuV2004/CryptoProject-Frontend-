import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-display selection:bg-brand-gold/30 scroll-smooth relative overflow-x-hidden">
            
            {/* Ambient Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-brand-gold/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute top-[600px] left-[-200px] w-[500px] h-[500px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none z-0" />

            {/* Navigation Header */}
            <div className="flex items-center justify-between px-6 md:px-16 py-8 border-b border-white/5 relative z-10 backdrop-blur-sm sticky top-0 bg-[#0A0A0A]/80">
                <div className="text-2xl tracking-[0.2em] font-light text-brand-gold">
                    ALGORYZE
                </div>
                <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-400">
                    <a href="#" className="hover:text-white transition-colors">Features</a>
                    <a href="#" className="hover:text-white transition-colors">Resources</a>
                    <a href="#" className="hover:text-white transition-colors">Pricing</a>
                    <a href="#" className="hover:text-white transition-colors">Log In</a>
                    <a href="#" className="px-6 py-2 bg-gradient-to-r from-[#F5D061] to-[#E5B842] text-black font-semibold rounded-full hover:shadow-[0_0_15px_rgba(229,184,66,0.3)] transition-all">
                        Sign Up
                    </a>
                </div>
            </div>

            {/* Hero Section */}
            <div className="flex flex-col items-center text-center px-6 py-24 max-w-5xl mx-auto relative z-10">
                <h1 className="text-5xl md:text-7xl font-semibold leading-tight mb-8 tracking-tight">
                    Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5D061] to-[#E5B842]">Trading</span> with<br />
                    Advanced Institutional Indicators
                </h1>
                
                <p className="text-gray-400 text-lg leading-relaxed mb-12 max-w-3xl px-4">
                    Trade in Forex, Cryptocurrencies, Index, and Stocks effortlessly. Our indicators identify 'bottoms' and 'tops' thanks to advanced Artificial Intelligence, adapting and updating according to market trends, enhancing your profits.
                </p>
                
                <div className="flex items-center justify-center gap-6">
                    <button className="px-10 py-4 bg-gradient-to-r from-[#F5D061] to-[#E5B842] text-[#111111] font-bold text-lg rounded-full hover:shadow-[0_0_20px_rgba(229,184,66,0.4)] transition-all">
                        Early Access
                    </button>
                    <button className="px-10 py-4 bg-[#1A1A1A] text-white font-semibold text-lg rounded-full hover:bg-[#222222] transition-all">
                        Join Now
                    </button>
                </div>
            </div>

            {/* Main Chart Mockup */}
            <div className="w-full flex justify-center px-4 md:px-12 pb-20 relative z-10">
                <div className="relative w-full max-w-6xl aspect-[21/9] bg-[#0A0A0A] rounded-2xl border border-[#222] shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden">
                    {/* Gold Top Borders */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E5B842]/80 to-transparent shadow-[0_0_15px_#E5B842]" />
                    <div className="absolute -top-[1px] left-8 right-8 h-[1px] bg-[#E5B842]/40" />
                    
                    {/* Chart Header */}
                    <div className="flex justify-between items-center p-5 border-b border-white/5 text-[11px] text-gray-400">
                        <div className="flex gap-4">
                            <span>CFDS on Gold (US$ / Oz) . TVC</span>
                            <span className="text-[#15B06D]">O <span className="text-gray-500">63243.56</span> H <span className="text-gray-500">67769.00</span> L <span className="text-gray-500">67769.00</span> L <span className="text-gray-500">1+6.72%</span> ± <span className="text-red-500">20.05</span> ± <span className="text-red-500">0.86%</span></span>
                        </div>
                        <div className="px-4 py-1.5 bg-[#1A1A1A] rounded text-white cursor-pointer hover:bg-[#222]">USD</div>
                    </div>
                    
                    {/* Mock Grid Lines & Axes */}
                    <div className="absolute right-0 top-14 bottom-0 w-20 border-l border-[#222] text-[10px] text-gray-500 flex flex-col justify-between py-8 items-end pr-3 bg-[#0A0A0A] z-10 font-mono">
                        <span>2400.00</span>
                        <span>2300.00</span>
                        <span className="bg-[#15B06D]/20 text-[#15B06D] px-1.5 py-0.5 rounded">2200.00</span>
                        <span>2100.00</span>
                        <span>2000.00</span>
                        <span className="bg-[#FF4159]/20 text-[#FF4159] px-1.5 py-0.5 rounded">1900.00</span>
                        <span>1800.00</span>
                        <span>1700.00</span>
                        <span>1600.00</span>
                    </div>

                    {/* Center Candle Chart Area Simulation */}
                    <div className="absolute inset-y-14 left-0 right-20 flex items-end justify-center px-12 pb-10">
                        {/* SVG Candlesticks Mockup */}
                        <svg width="100%" height="80%" viewBox="0 0 800 300" preserveAspectRatio="none">
                            {/* Grid Lines horizontal */}
                            <path d="M0 30 L800 30 M0 70 L800 70 M0 110 L800 110 M0 150 L800 150 M0 190 L800 190 M0 230 L800 230" stroke="#ffffff" strokeOpacity="0.02" strokeWidth="1" fill="none" />
                            {/* Grid Lines vertical */}
                            <path d="M100 0 L100 300 M200 0 L200 300 M300 0 L300 300 M400 0 L400 300 M500 0 L500 300 M600 0 L600 300 M700 0 L700 300" stroke="#ffffff" strokeOpacity="0.02" strokeWidth="1" fill="none" />
                            
                            {/* Trend Lines */}
                            <path d="M50 250 L750 150" stroke="#E5B842" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                            <path d="M200 120 L750 200" stroke="#E5B842" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />

                            {/* Support / Resistance Blocks */}
                            <rect x="420" y="140" width="120" height="40" fill="#E5B842" fillOpacity="0.1" stroke="#E5B842" strokeOpacity="0.2" strokeWidth="1" />
                            <rect x="520" y="240" width="80" height="15" fill="#15B06D" fillOpacity="0.2" />
                            <rect x="600" y="240" width="80" height="15" fill="#FF4159" fillOpacity="0.2" />
                            
                            <text x="540" y="250" fill="#15B06D" fontSize="10" fontFamily="sans-serif">support</text>
                            
                            {/* Mock Candles (Green & Red) */}
                            <g strokeWidth="2">
                                <g stroke="#15B06D" fill="#15B06D">
                                    <rect x="180" y="220" width="8" height="20" /> <line x1="184" y1="210" x2="184" y2="250" />
                                    <rect x="200" y="200" width="8" height="25" /> <line x1="204" y1="190" x2="204" y2="230" />
                                    <rect x="220" y="180" width="8" height="25" /> <line x1="224" y1="170" x2="224" y2="210" />
                                    <rect x="240" y="150" width="8" height="35" /> <line x1="244" y1="140" x2="244" y2="190" />
                                </g>
                                <g stroke="#FF4159" fill="#FF4159">
                                    <rect x="260" y="140" width="8" height="20" /> <line x1="264" y1="130" x2="264" y2="170" />
                                    <rect x="280" y="150" width="8" height="50" /> <line x1="284" y1="140" x2="284" y2="210" />
                                    <rect x="300" y="190" width="8" height="30" /> <line x1="304" y1="180" x2="304" y2="230" />
                                </g>
                                <g stroke="#15B06D" fill="#15B06D">
                                    <rect x="320" y="170" width="8" height="30" /> <line x1="324" y1="160" x2="324" y2="210" />
                                    <rect x="340" y="140" width="8" height="35" /> <line x1="344" y1="130" x2="344" y2="180" />
                                    <rect x="360" y="110" width="8" height="40" /> <line x1="364" y1="100" x2="364" y2="160" />
                                </g>
                                <g stroke="#FF4159" fill="#FF4159">
                                    <rect x="380" y="120" width="8" height="30" /> <line x1="384" y1="110" x2="384" y2="160" />
                                    <rect x="400" y="140" width="8" height="40" /> <line x1="404" y1="130" x2="404" y2="190" />
                                </g>
                                <g stroke="#15B06D" fill="#15B06D">
                                    <rect x="420" y="120" width="8" height="25" /> <line x1="424" y1="110" x2="424" y2="150" />
                                    <rect x="440" y="100" width="8" height="30" /> <line x1="444" y1="90" x2="444" y2="140" />
                                    <rect x="460" y="80" width="8" height="30" /> <line x1="464" y1="70" x2="464" y2="120" />
                                </g>
                                <g stroke="#FF4159" fill="#FF4159">
                                    <rect x="480" y="90" width="8" height="50" /> <line x1="484" y1="80" x2="484" y2="150" />
                                    <rect x="500" y="120" width="8" height="40" /> <line x1="504" y1="110" x2="504" y2="170" />
                                    <rect x="520" y="150" width="8" height="30" /> <line x1="524" y1="140" x2="524" y2="190" />
                                    <rect x="540" y="170" width="8" height="40" /> <line x1="544" y1="160" x2="544" y2="220" />
                                </g>
                                <g stroke="#15B06D" fill="#15B06D">
                                    <rect x="560" y="180" width="8" height="20" /> <line x1="564" y1="170" x2="564" y2="210" />
                                    <rect x="580" y="160" width="8" height="30" /> <line x1="584" y1="150" x2="584" y2="200" />
                                    <rect x="600" y="160" width="8" height="20" /> <line x1="604" y1="150" x2="604" y2="190" />
                                </g>
                                <g stroke="#FF4159" fill="#FF4159">
                                    <rect x="620" y="150" width="8" height="30" /> <line x1="624" y1="140" x2="624" y2="190" />
                                </g>
                                <g stroke="#15B06D" fill="#15B06D">
                                    <rect x="640" y="120" width="8" height="40" /> <line x1="644" y1="110" x2="644" y2="170" />
                                </g>
                            </g>
                        </svg>
                        
                        {/* Tooltip Mockup */}
                        <div className="absolute left-8 bottom-24 max-w-[280px] bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#111] text-xs font-bold p-4 rounded-lg shadow-xl z-20 flex items-start gap-4">
                            <div className="mt-0.5 shrink-0">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                            </div>
                            <p className="leading-tight">
                                This indicator is based on identifying the divergence with the DXY without the need for 2 charts!
                            </p>
                            {/* Pointer triangle */}
                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F5D061] rotate-45" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-3 pb-20">
                <div className="w-3 h-3 rounded-full bg-white"></div>
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
            </div>

            {/* Partner Logos */}
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 pb-32 px-8 text-gray-300">
                <div className="text-2xl md:text-3xl font-display font-medium tracking-widest uppercase hover:text-white transition-colors cursor-pointer">BYBIT</div>
                <div className="text-2xl md:text-3xl font-display font-medium flex items-center gap-3 uppercase tracking-widest hover:text-white transition-colors cursor-pointer">
                     <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M11.996 0L0 12.004l11.996 11.996L24 12.004 11.996 0zm-2.004 5.992l2.004 2.004 2.004-2.004L16.004 8l-4.008 4.008L7.988 8l2.004-2.008zM4.988 9.004l2.004 2.004-2.004 2.004-2.004-2.004L4.988 9.004zm14.024 0l-2.004 2.004 2.004 2.004 2.004-2.004-2.004-2.004zM11.996 14.996l-2.004-2.004 2.004-2.004 2.004 2.004-2.004 2.004zm-2.004 3.016l2.004-2.004 2.004 2.004L11.996 20 7.988 16l2.004-2.004z"/></svg> BINANCE
                </div>
                <div className="text-2xl md:text-3xl font-bold tracking-tight lowercase italic flex items-center gap-1 font-serif hover:text-white transition-colors cursor-pointer">
                    <span className="text-5xl not-italic">₿</span>itcoin
                </div>
                <div className="text-2xl md:text-3xl font-medium tracking-tight flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M22.95 12c0-5.96-5.01-10.82-11.08-11.2V-1c6.54.4 11.75 5.75 12.13 12.4h-1zM11.87 23.2C5.33 22.8 0 17.5 0 10.95h1c0 5.96 4.88 10.87 10.87 11.25v1zM6.5 12a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0z"/></svg> Meta
                </div>
                <div className="text-2xl md:text-3xl font-bold flex items-center gap-2 tracking-tight hover:text-white transition-colors cursor-pointer">
                     BingX
                </div>
            </div>

            {/* Pro Toolkits Section Container */}
            <div className="border-t border-white/5 mx-6 md:mx-16 pt-24 pb-24 relative">
                {/* Another subtle glow inside this section */}
                <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-brand-gold/10 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
                    
                    {/* Text Sidebar */}
                    <div className="max-w-xl relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#1A1A1A] border border-white/5 rounded text-[#8A8A8A] text-xs font-bold uppercase mb-8 shadow-sm">
                            Pro Toolkits <span className="text-[#E5B842] text-sm">★</span>
                        </div>
                        <h3 className="text-5xl md:text-6xl font-semibold leading-tight mb-8 tracking-tight">
                            The Most Powerful<br />tools, all in one place
                        </h3>
                        <p className="text-[#8A8A8A] text-lg leading-relaxed">
                            Trade automated price action, advanced signals, and spot reversals with money flow. Our world renowned toolkits bring discretionary analysis to the next level...
                        </p>
                    </div>

                    {/* Small Card Mockup "Statistic" */}
                    <div className="relative z-10 w-full md:pl-16">
                        <div className="bg-[#111111] border rounded-t-2xl border-[#222] border-b-0 p-8 shadow-2xl relative overflow-hidden h-[350px] flex flex-col">
                            <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-brand-gold/5 blur-[60px] pointer-events-none" />
                            
                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <h4 className="text-xl font-medium text-white">Statistic</h4>
                                <div className="flex gap-4 text-xs font-medium text-[#8A8A8A]">
                                    <span className="hover:text-white cursor-pointer px-2 py-1">1m</span>
                                    <span className="bg-[#222] text-[#E5B842] px-3 py-1 rounded cursor-pointer ring-1 ring-[#E5B842]/20">5m</span>
                                    <span className="hover:text-white cursor-pointer px-2 py-1">30m</span>
                                    <span className="hover:text-white cursor-pointer px-2 py-1">1h</span>
                                    <span className="hover:text-white cursor-pointer px-2 py-1">1d</span>
                                </div>
                            </div>
                            
                            <div className="text-[11px] text-gray-500 mb-8 flex gap-5 font-mono relative z-10">
                                <span className="text-white flex items-center gap-1.5 bg-[#222] px-3 py-1 rounded-sm">BTCUSD <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg></span>
                                <span className="text-[#15B06D] flex items-center gap-2"><span className="text-gray-500">O 63243.56</span> <span className="text-gray-500">H 67769.00</span> <span className="text-gray-500">L 67769.00</span> <span className="text-gray-500">C 67769.00</span></span>
                            </div>
                            
                            {/* Mini Chart Mockup Container */}
                            <div className="w-full flex-1 relative flex items-end -mx-2">
                                 <svg width="100%" height="180" viewBox="0 0 400 180" preserveAspectRatio="none" className="translate-y-4">
                                    {/* Grid */}
                                    <path d="M0 30 L400 30 M0 60 L400 60 M0 90 L400 90 M0 120 L400 120 M0 150 L400 150" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="1" fill="none" />
                                    {/* Candlesticks */}
                                    <g strokeWidth="2.5">
                                        {/* Simulated pattern */}
                                        <g stroke="#15B06D" fill="#15B06D">
                                            <rect x="20" y="140" width="6" height="20" /> <line x1="23" y1="130" x2="23" y2="170" />
                                            <rect x="40" y="120" width="6" height="30" /> <line x1="43" y1="110" x2="43" y2="160" />
                                            <rect x="60" y="90" width="6" height="35" /> <line x1="63" y1="80" x2="63" y2="130" />
                                        </g>
                                        <g stroke="#FF4159" fill="#FF4159">
                                            <rect x="80" y="100" width="6" height="25" /> <line x1="83" y1="90" x2="83" y2="130" />
                                            <rect x="100" y="120" width="6" height="30" /> <line x1="103" y1="110" x2="103" y2="160" />
                                        </g>
                                        <g stroke="#15B06D" fill="#15B06D">
                                            <rect x="120" y="100" width="6" height="20" /> <line x1="123" y1="90" x2="123" y2="130" />
                                            <rect x="140" y="70" width="6" height="35" /> <line x1="143" y1="60" x2="143" y2="110" />
                                            <rect x="160" y="40" width="6" height="35" /> <line x1="163" y1="30" x2="163" y2="80" />
                                        </g>
                                        <g stroke="#FF4159" fill="#FF4159">
                                            <rect x="180" y="50" width="6" height="40" /> <line x1="183" y1="40" x2="183" y2="100" />
                                            <rect x="200" y="80" width="6" height="30" /> <line x1="203" y1="70" x2="203" y2="120" />
                                            <rect x="220" y="100" width="6" height="40" /> <line x1="223" y1="90" x2="223" y2="150" />
                                        </g>
                                        <g stroke="#15B06D" fill="#15B06D">
                                           <rect x="240" y="120" width="6" height="20" /> <line x1="243" y1="110" x2="243" y2="150" />
                                           <rect x="260" y="100" width="6" height="30" /> <line x1="263" y1="90" x2="263" y2="140" />
                                           <rect x="280" y="70" width="6" height="40" /> <line x1="283" y1="60" x2="283" y2="120" />
                                           <rect x="300" y="40" width="6" height="35" /> <line x1="303" y1="30" x2="303" y2="80" />
                                        </g>
                                        <g stroke="#FF4159" fill="#FF4159">
                                            <rect x="320" y="60" width="6" height="20" /> <line x1="323" y1="50" x2="323" y2="90" />
                                            <rect x="340" y="80" width="6" height="30" /> <line x1="343" y1="70" x2="343" y2="120" />
                                        </g>
                                        <g stroke="#15B06D" fill="#15B06D">
                                            <rect x="360" y="60" width="6" height="30" /> <line x1="363" y1="50" x2="363" y2="100" />
                                            <rect x="380" y="30" width="6" height="35" /> <line x1="383" y1="20" x2="383" y2="70" />
                                        </g>
                                    </g>
                                    
                                    {/* Indicators Overlay */}
                                    <path d="M0 140 Q100 60 200 110 T400 20" stroke="#3b82f6" strokeWidth="2.5" fill="none" opacity="0.6"/>
                                    <path d="M0 120 Q150 130 250 60 T400 10" stroke="#f59e0b" strokeWidth="2.5" fill="none" opacity="0.6"/>
                                 </svg>
                            </div>
                            
                            {/* Mouse pointer indicator mockup on chart */}
                            <div className="absolute right-32 bottom-20 flex items-center gap-1.5 z-20">
                                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6]"></div>
                                <div className="text-[10px] font-medium text-white bg-blue-500/80 px-1.5 py-0.5 rounded shadow-sm">68.5k</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
