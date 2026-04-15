import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'
import { formatINR, formatDate } from '../../utils/format'
import { toast } from 'react-hot-toast'

export default function AdminPage() {
    const [kycQueue, setKycQueue] = useState([])
    const [users, setUsers] = useState([])
    const [tab, setTab] = useState('kyc') // 'kyc' | 'users' | 'withdrawals'

    useEffect(() => {
        if (tab === 'kyc') adminAPI.getKycQueue().then(res => setKycQueue(res.data || [])).catch(() => { })
        if (tab === 'users') adminAPI.getUsers().then(res => setUsers(res.data || [])).catch(() => { })
    }, [tab])

    const handleKyc = async (id, status) => {
        try {
            await adminAPI.reviewKyc(id, { status })
            setKycQueue(q => q.filter(x => x.id !== id))
            toast.success(`KYC ${status}`)
        } catch (err) {
            toast.error(err)
        }
    }

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="font-display text-4xl text-white tracking-[0.2em] mb-1">ADMIN CONTROL</h2>
                    <p className="text-muted text-[10px] uppercase font-bold tracking-[0.3em]">System Governance & Risk Management</p>
                </div>
                <div className="flex gap-2 bg-brand-panel/50 p-1 rounded-xl border border-brand-border">
                    {['kyc', 'users', 'withdrawals'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all
                 ${tab === t ? 'bg-brand-gold text-brand-bg shadow-sm' : 'text-muted hover:text-white'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {tab === 'kyc' && (
                <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel">
                    <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/30">
                        <h3 className="font-display text-lg text-white tracking-widest uppercase">Verification Queue</h3>
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
                                            <button onClick={() => handleKyc(k.id, 'verified')} className="px-3 py-1.5 bg-up/10 text-up border border-up/30 rounded-lg hover:bg-up hover:text-white transition-all">Approve</button>
                                            <button onClick={() => handleKyc(k.id, 'rejected')} className="px-3 py-1.5 bg-down/10 text-down border border-down/30 rounded-lg hover:bg-down hover:text-white transition-all">Reject</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'users' && (
                <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel">
                    <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/30">
                        <h3 className="font-display text-lg text-white tracking-widest uppercase">User Management</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="h-10 bg-brand-panel/10 text-muted text-[9px] uppercase tracking-[0.2em] font-bold">
                                    <th className="px-6 py-2 text-left">User Profile</th>
                                    <th className="px-6 py-2 text-left">KYC Status</th>
                                    <th className="px-6 py-2 text-right">Activity</th>
                                    <th className="px-6 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/40 font-bold uppercase tracking-tighter text-[10px]">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-brand-panel/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-white">{u.full_name}</p>
                                            <p className="text-muted text-[9px] font-mono lowercase tracking-normal">{u.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full border ${u.kyc_status === 'verified' ? 'bg-up/10 text-up border-up/30' : 'bg-brand-panel/50 text-muted border-brand-border'}`}>
                                                {u.kyc_status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-muted font-mono">{formatDate(u.created_at)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-brand-gold hover:underline">Edit Balance</button>
                                            <span className="mx-2 text-brand-border">|</span>
                                            <button className="text-down hover:underline">Freeze</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
