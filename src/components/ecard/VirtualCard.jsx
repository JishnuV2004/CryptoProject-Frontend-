export default function VirtualCard({ card }) {
    // Use user's full name from props or a default
    const cardHolder = card?.cardholder_name || "VALUED TRADER";

    return (
        <div className="
      relative w-full max-w-[400px] aspect-[1.58/1] rounded-[24px] overflow-hidden
      bg-gradient-to-br from-[#181A0E] via-[#2A2D1A] to-[#111208]
      border border-brand-gold/20 shadow-gold-md
      hover:shadow-gold-md transition-all duration-500 cursor-pointer select-none
      flex flex-col p-8 group
    ">
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
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-9 rounded-md bg-gradient-to-br from-brand-gold to-brand-gold-dk border border-brand-gold/50 shadow-inner overflow-hidden relative">
                    <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.1) 50%)', backgroundSize: '6px 100%' }} />
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(0,0,0,0.1) 50%)', backgroundSize: '100% 4px' }} />
                </div>
                <div className="flex flex-col gap-0.5 opacity-50">
                    {[1, 2, 3, 4].map(i => <div key={i} className="w-4 h-[1.5px] bg-brand-gold rounded-full" />)}
                </div>
            </div>

            {/* Card Number */}
            <div className="mb-6 relative z-10">
                <p className="font-mono text-white text-xl md:text-2xl tracking-[0.25em] drop-shadow-lg group-hover:tracking-[0.3em] transition-all duration-700">
                    **** **** **** {card?.card_number?.slice(-4) ?? '4242'}
                </p>
            </div>

            {/* Bottom row */}
            <div className="flex justify-between items-end relative z-10">
                <div className="space-y-0.5">
                    <p className="text-muted text-[8px] uppercase font-bold tracking-widest opacity-70">Asset Controller</p>
                    <p className="text-white text-sm font-bold uppercase tracking-widest">{cardHolder}</p>
                </div>
                <div className="text-right space-y-0.5 border-l border-brand-gold/20 pl-4">
                    <p className="text-muted text-[8px] uppercase font-bold tracking-widest opacity-70">Validity</p>
                    <p className="text-white text-sm font-mono font-bold">{card?.expiry ?? '12/28'}</p>
                </div>
                <div className="ml-4 h-full flex flex-col items-center justify-end">
                    <div className="font-display text-brand-gold text-2xl italic tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">VISA</div>
                    <p className="text-[7px] text-brand-gold font-bold tracking-widest mt-[-4px]">DEBIT</p>
                </div>
            </div>
        </div>
    )
}
