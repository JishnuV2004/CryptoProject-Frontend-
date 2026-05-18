import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'

export default function VirtualCard({ card }) {
    const [isFlipped, setIsFlipped] = useState(false)
    const user = useAuthStore(s => s.user)
    const cardHolder = card?.cardholder_name || user?.full_name || "VALUED TRADER";
    const last4 = card?.card_number?.slice(-4) ?? '4207';
    const status = card?.status || 'active';
    const expiry = card?.expiry || '05/31';

    return (
        <div 
            className="relative w-full max-w-[420px] aspect-[1.58/1] cursor-pointer group select-none"
            style={{ perspective: '1200px' }}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div 
                className="relative w-full h-full transition-transform duration-700 ease-out"
                style={{ 
                    transformStyle: 'preserve-3d', 
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
                }}
            >
                {/* --- FRONT OF CARD --- */}
                <div 
                    className="absolute inset-0 rounded-[24px] overflow-hidden bg-gradient-to-tr from-gray-950 via-gray-900 to-gray-800 border border-gray-700/50 flex flex-col p-6"
                    style={{ backfaceVisibility: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}
                >
                    {/* Metal Texture Overlay */}
                    <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #444 0%, transparent 60%), linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.05) 100%)' }} />
                    
                    {/* Diagonal light reflection */}
                    <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/5 via-white/10 to-transparent rotate-[30deg] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000 mix-blend-overlay" />

                    {/* Top row */}
                    <div className="flex justify-between items-start mb-auto relative z-10">
                        <div className="flex items-center gap-3">
                            {/* Logo */}
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-bg flex items-center justify-center p-[2px] shadow-lg border border-gray-700">
                                <img src="/crytinox-logo.png" alt="Crytinox Logo" className="w-full h-full object-cover rounded-lg" />
                            </div>
                            <div>
                                <p className="font-display text-white text-lg md:text-xl tracking-[0.25em] leading-none mb-1">CRYTINOX</p>
                                <p className="text-[7px] text-gray-400 font-bold tracking-[0.4em] uppercase">Global Reserve</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="w-10 h-10 rounded-xl bg-gray-800/50 border border-gray-600/30 flex items-center justify-center text-gray-400 backdrop-blur-md shadow-inner">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeOpacity="0.5"/>
                                    <path d="M7 12a5 5 0 0 1 10 0M8 8.5a8 8 0 0 1 8 0M9 15.5a3 3 0 0 1 6 0" strokeOpacity="0.8" strokeLinecap="round"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Chip & Status */}
                    <div className="flex justify-between items-end mb-6 relative z-10 mt-6">
                        <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 border border-yellow-700/50 shadow-inner overflow-hidden relative">
                            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.2) 50%)', backgroundSize: '8px 100%' }} />
                            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(0,0,0,0.2) 50%)', backgroundSize: '100% 6px' }} />
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/20" />
                            <div className="absolute top-0 left-1/2 w-[1px] h-full bg-black/20" />
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full border text-[9px] font-bold tracking-widest uppercase shadow-sm backdrop-blur-md ${status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {status}
                        </div>
                    </div>

                    {/* 14-Digit Card Number (Masked) */}
                    <div className="mb-6 relative z-10 mt-2">
                        <p className="font-mono text-gray-200 text-lg md:text-xl tracking-[0.25em] drop-shadow-md group-hover:text-white group-hover:tracking-[0.28em] transition-all duration-700">
                            **** **** **** {last4}
                        </p>
                    </div>

                    {/* Bottom row */}
                    <div className="flex justify-between items-end relative z-10">
                        <div className="space-y-1 flex-1">
                            <p className="text-gray-500 text-[8px] md:text-[9px] uppercase font-bold tracking-[0.2em]">Cardholder Name</p>
                            <p className="text-gray-100 text-xs md:text-sm font-bold uppercase tracking-widest truncate max-w-[160px]">{cardHolder}</p>
                        </div>
                        <div className="space-y-1 pr-4 flex-shrink-0">
                            <p className="text-gray-500 text-[8px] md:text-[9px] uppercase font-bold tracking-[0.2em]">Expiry</p>
                            <p className="text-gray-100 text-xs md:text-sm font-mono font-bold tracking-wider">{expiry}</p>
                        </div>
                        <div className="h-full flex flex-col items-end justify-end flex-shrink-0">
                            <div className="font-display text-white text-2xl md:text-3xl italic tracking-tighter opacity-90">VISA</div>
                        </div>
                    </div>
                </div>

                {/* --- BACK OF CARD --- */}
                <div 
                    className="absolute inset-0 rounded-[24px] overflow-hidden bg-gradient-to-bl from-gray-900 to-black border border-gray-800 shadow-2xl flex flex-col"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    {/* Magnetic Stripe */}
                    <div className="w-full h-14 bg-black mt-8 opacity-90 shadow-inner border-y border-gray-800"></div>
                    
                    {/* CVV Area */}
                    <div className="px-8 mt-8 flex flex-col justify-center">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 bg-gray-200 h-10 rounded px-4 flex items-center shadow-inner overflow-hidden relative">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 10px)' }} />
                            </div>
                            <div className="bg-white h-10 w-16 rounded px-2 flex items-center justify-center shadow-inner">
                                <span className="font-mono text-black text-lg tracking-widest font-bold italic">{card?.cvv ?? '123'}</span>
                            </div>
                        </div>
                        <p className="text-right text-[9px] text-gray-500 mt-2 uppercase font-bold tracking-[0.2em] pr-2">CVV / CVC</p>
                    </div>

                    {/* Disclaimer & Footer */}
                    <div className="px-8 pb-6 mt-auto flex justify-between items-end">
                        <div className="text-[8px] text-gray-500 max-w-[240px] leading-relaxed uppercase tracking-wider">
                            This card is issued by Crytinox Global pursuant to a license from Visa U.S.A. Inc. 
                            Use of this card is subject to the cardholder agreement. 
                            <br/><br/>
                            <span className="text-gray-600">If found, please return to Crytinox HQ, Crypto Valley.</span>
                        </div>
                        <div className="font-display text-gray-700 text-2xl italic tracking-tighter">VISA</div>
                    </div>
                </div>

            </div>
        </div>
    )
}
