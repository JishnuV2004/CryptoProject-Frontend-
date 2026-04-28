import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'
import { formatDate } from '../../utils/format'
import { toast } from 'react-hot-toast'

export default function AdminKyc() {
    const [kycQueue, setKycQueue] = useState([])
    const [rejectingId, setRejectingId] = useState(null)
    const [rejectReason, setRejectReason] = useState('')

    useEffect(() => {
        // Dummy fallback for now
        adminAPI.getKycQueue().then(res => setKycQueue(res.data || [])).catch(() => {
            setKycQueue([
                { id: '101', full_name: 'Charlie Brown', email: 'charlie@example.com', id_doc_url: '#', selfie_url: '#', submitted_at: new Date().toISOString() },
                { id: '102', full_name: 'Diana Prince', email: 'diana@example.com', id_doc_url: '#', selfie_url: '#', submitted_at: new Date().toISOString() }
            ])
        })
    }, [])

    const handleApprove = async (id) => {
        try {
            // await adminAPI.reviewKyc(id, { status: 'verified' })
            setKycQueue(q => q.filter(x => x.id !== id))
            toast.success(`KYC Approved (dummy action)`)
        } catch (err) {
            toast.error(err || 'Failed to approve')
        }
    }

    const handleRejectSubmit = async (e) => {
        e.preventDefault()
        if (!rejectReason.trim()) return toast.error('Please provide a reason')
        try {
            // await adminAPI.reviewKyc(rejectingId, { status: 'rejected', reason: rejectReason })
            setKycQueue(q => q.filter(x => x.id !== rejectingId))
            toast.success(`KYC Rejected (dummy action). Reason: ${rejectReason}`)
            setRejectingId(null)
            setRejectReason('')
        } catch (err) {
            toast.error(err || 'Failed to reject')
        }
    }

    return (
        <div className="space-y-8 animate-fade-up">
            <div>
                <h2 className="font-display text-4xl text-white tracking-[0.2em] mb-1">KYC VERIFICATION</h2>
                <p className="text-muted text-[10px] uppercase font-bold tracking-[0.3em]">Identity & Compliance Queue</p>
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel">
                <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/30">
                    <h3 className="font-display text-lg text-white tracking-widest uppercase">Pending Applications</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="h-10 bg-brand-panel/10 text-muted text-[9px] uppercase tracking-[0.2em] font-bold">
                                <th className="px-6 py-2 text-left">User</th>
                                <th className="px-6 py-2 text-left">Documents</th>
                                <th className="px-6 py-2 text-left">Submitted</th>
                                <th className="px-6 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/40 font-bold uppercase tracking-tighter text-[10px]">
                            {kycQueue.length === 0 && (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-muted tracking-widest italic uppercase">Review queue empty</td></tr>
                            )}
                            {kycQueue.map(k => (
                                <tr key={k.id} className="hover:bg-brand-panel/40 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-white">{k.full_name}</p>
                                        <p className="text-muted text-[9px] font-mono lowercase tracking-normal">{k.email}</p>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <a href={k.id_doc_url} target="_blank" rel="noreferrer" className="text-brand-gold hover:underline">ID DOC</a>
                                        <span className="text-brand-border">|</span>
                                        <a href={k.selfie_url} target="_blank" rel="noreferrer" className="text-brand-gold hover:underline">SELFIE</a>
                                    </td>
                                    <td className="px-6 py-4 text-muted font-mono">{formatDate(k.submitted_at)}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleApprove(k.id)} className="px-3 py-1.5 bg-up/10 text-up border border-up/30 rounded-lg hover:bg-up hover:text-white transition-all">Approve</button>
                                        <button onClick={() => setRejectingId(k.id)} className="px-3 py-1.5 bg-down/10 text-down border border-down/30 rounded-lg hover:bg-down hover:text-white transition-all">Reject</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reject Reason Modal */}
            {rejectingId && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm animate-fade-up">
                    <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-panel">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-display text-xl text-down tracking-widest">REJECT KYC</h3>
                            <button onClick={() => setRejectingId(null)} className="text-muted hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleRejectSubmit} className="space-y-4">
                            <div>
                                <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Reason for Rejection</label>
                                <textarea 
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="e.g. Blurry ID document, mismatching faces..." 
                                    className="w-full bg-brand-panel border border-brand-border rounded-lg px-4 py-3 text-white text-sm h-32 resize-none"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full py-3 bg-down/20 text-down border border-down/50 hover:bg-down hover:text-white font-bold rounded-lg tracking-widest mt-4 transition-all">CONFIRM REJECTION</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
