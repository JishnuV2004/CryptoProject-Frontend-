import { useState } from 'react'

export default function VirtualCard({ card }) {
    const [isFlipped, setIsFlipped] = useState(false)
    const cardHolder = card?.cardholder_name || "VALUED TRADER";
    const last4 = card?.card_number?.slice(-4) ?? '1234';

    return (
        <div 
            className="relative w-full max-w-[400px] aspect-[1.58/1] cursor-pointer group select-none"
            style={{ perspective: '1000px' }}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div 
                className="relative w-full h-full transition-transform duration-700"
                style={{ 
                    transformStyle: 'preserve-3d', 
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
                }}
            >
                {/* --- FRONT OF CARD --- */}
                <div 
                    className="absolute inset-0 rounded-[24px] overflow-hidden bg-gradient-to-br from-[#181A0E] via-[#2A2D1A] to-[#111208] border border-brand-gold/20 shadow-gold-md flex flex-col p-8"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none"
                        style={{ backgroundImage: 'repeating-linear-gradient(0deg,#C9A84C 0,#C9A84C 1px,transparent 0,transparent 50%),repeating-linear-gradient(90deg,#C9A84C 0,#C9A84C 1px,transparent 0,transparent 50%)', backgroundSize: '15px 15px' }} />

                    {/* Glossy overlay effect */}
                    <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/10 to-transparent rotate-[30deg] pointer-events-none opacity-20" />

                    {/* Top row */}
                    <div className="flex justify-between items-start mb-auto relative z-10">
                        <div>
                            <p className="font-display text-brand-gold text-2xl tracking-[0.2em] leading-none mb-1">BINANCESIM</p>
                            <p className="text-[8px] text-muted font-bold tracking-[0.4em] uppercase">Digital Asset Card</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/40 flex items-center justify-center text-brand-gold text-xl font-mono shadow-inner group-hover:scale-110 transition-transform">
                            ◎
                        </div>
                    </div>

                    {/* Chip and Contactless */}
                    <div className="flex items-center gap-4 mb-5 relative z-10">
                        <div className="w-11 h-8 rounded-md bg-gradient-to-br from-brand-gold to-brand-gold-dk border border-brand-gold/50 shadow-inner overflow-hidden relative">
                            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.1) 50%)', backgroundSize: '6px 100%' }} />
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(0,0,0,0.1) 50%)', backgroundSize: '100% 4px' }} />
                        </div>
                        <div className="flex flex-col gap-0.5 opacity-50">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-4 h-[1.5px] bg-brand-gold rounded-full" />)}
                        </div>
                    </div>

                    {/* 14-Digit Card Number (Masked) */}
                    <div className="mb-5 relative z-10">
                        <p className="font-mono text-white text-xl md:text-2xl tracking-[0.25em] drop-shadow-lg group-hover:tracking-[0.3em] transition-all duration-700">
                            **** **** ** {last4}
                        </p>
                    </div>

                    {/* Bottom row */}
                    <div className="flex justify-between items-end relative z-10">
                        <div className="space-y-0.5">
                            <p className="text-muted text-[8px] uppercase font-bold tracking-widest opacity-70">Cardholder</p>
                            <p className="text-white text-sm font-bold uppercase tracking-widest">{cardHolder}</p>
                        </div>
                        <div className="text-right space-y-0.5 border-l border-brand-gold/20 pl-4">
                            <p className="text-muted text-[8px] uppercase font-bold tracking-widest opacity-70">Valid Thru</p>
                            <p className="text-white text-sm font-mono font-bold">{card?.expiry ?? '12/28'}</p>
                        </div>
                        <div className="ml-4 h-full flex flex-col items-center justify-end">
                            <div className="font-display text-brand-gold text-2xl italic tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">VISA</div>
                            <p className="text-[7px] text-brand-gold font-bold tracking-widest mt-[-4px]">DEBIT</p>
                        </div>
                    </div>
                </div>

                {/* --- BACK OF CARD --- */}
                <div 
                    className="absolute inset-0 rounded-[24px] overflow-hidden bg-gradient-to-br from-[#111208] via-[#1A1C0E] to-[#0A0B05] border border-brand-gold/20 shadow-gold-md flex flex-col"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    {/* Magnetic Stripe */}
                    <div className="w-full h-12 bg-black mt-8 opacity-80 shadow-inner"></div>
                    
                    {/* CVV Area */}
                    <div className="px-8 mt-6 flex flex-col justify-center">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 bg-[#D1D5DB] h-10 rounded px-4 flex items-center shadow-inner overflow-hidden relative">
                                {/* Signature pattern */}
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 10px)' }} />
                            </div>
                            <div className="bg-white h-10 w-16 rounded px-2 flex items-center justify-center shadow-inner">
                                <span className="font-mono text-black text-lg tracking-[0.1em] font-bold italic">{card?.cvv ?? '123'}</span>
                            </div>
                        </div>
                        <p className="text-right text-[8px] text-muted mt-1 uppercase font-bold tracking-widest pr-2">CVV</p>
                    </div>

                    {/* Disclaimer & Footer */}
                    <div className="px-8 pb-6 mt-auto flex justify-between items-end">
                        <div className="text-[7px] text-muted max-w-[220px] leading-relaxed uppercase tracking-wider">
                            This card is issued by BinanceSim Corp pursuant to a license from Visa U.S.A. Inc. Use of this card is subject to the cardholder agreement. 
                            <br/><br/>
                            If found, please return to P.O. Box 1234, Crypto Valley.
                        </div>
                        <div className="font-display text-brand-gold text-xl italic tracking-tighter opacity-50">VISA</div>
                    </div>
                </div>

            </div>
        </div>
    )
}
