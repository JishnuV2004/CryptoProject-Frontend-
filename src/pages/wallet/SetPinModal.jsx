import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { walletAPI } from '../../services/api'

export default function SetPinModal({ onClose, onSuccess }) {
    const [pin, setPin] = useState('')
    const [confirmPin, setConfirmPin] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (pin.length !== 4) return toast.error('PIN must be 4 digits')
        if (pin !== confirmPin) return toast.error('PINs do not match')

        try {
            setLoading(true)
            await walletAPI.setPin({ pin })
            toast.success('Wallet PIN set successfully')
            if (onSuccess) onSuccess()
            onClose()
        } catch (error) {
            toast.error(error || 'Failed to set PIN')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-bg/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md overflow-hidden shadow-panel">
                <div className="p-6 border-b border-brand-border">
                    <h3 className="font-display text-2xl text-white tracking-widest uppercase">Set Wallet PIN</h3>
                    <p className="text-muted text-[10px] uppercase tracking-widest mt-1">Secure your transactions</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Enter 4-Digit PIN</label>
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors font-mono tracking-[0.5em] text-center text-xl"
                            placeholder="****"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Confirm PIN</label>
                        <input
                            type="password"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors font-mono tracking-[0.5em] text-center text-xl"
                            placeholder="****"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-brand-panel border border-brand-border text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !pin || !confirmPin}
                            className="flex-1 py-3 bg-gold-gradient text-brand-bg rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-gold-sm disabled:opacity-50"
                        >
                            {loading ? 'Setting...' : 'Set PIN'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
