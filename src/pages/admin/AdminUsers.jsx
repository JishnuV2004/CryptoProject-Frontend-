import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'
import { formatINR, formatDate } from '../../utils/format'
import { toast } from 'react-hot-toast'

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [editingUser, setEditingUser] = useState(null)

    useEffect(() => {
        // Fetch real users, but for dummy we just log errors if API is not ready
        adminAPI.getUsers().then(res => setUsers(res.data || [])).catch(() => {
            // Dummy fallback
            setUsers([
                { id: '1', full_name: 'Alice Smith', email: 'alice@example.com', kyc_status: 'verified', created_at: new Date().toISOString() },
                { id: '2', full_name: 'Bob Jones', email: 'bob@example.com', kyc_status: 'pending', created_at: new Date().toISOString() }
            ])
        })
    }, [])

    const handleFreeze = (id) => {
        toast.success(`User ${id} frozen (dummy action)`)
    }

    const handleEditSave = (e) => {
        e.preventDefault()
        toast.success(`User profile updated (dummy action)`)
        setEditingUser(null)
    }

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="font-display text-4xl text-white tracking-[0.2em] mb-1">USER MANAGEMENT</h2>
                    <p className="text-muted text-[10px] uppercase font-bold tracking-[0.3em]">Client Accounts & Access</p>
                </div>
                <button className="px-6 py-3 bg-brand-gold text-brand-bg font-bold text-[10px] uppercase tracking-widest rounded-xl hover:shadow-gold-md transition-all active:scale-[0.98]">
                    + Add New User
                </button>
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel">
                <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/30">
                    <h3 className="font-display text-lg text-white tracking-widest uppercase">All Users</h3>
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
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => setEditingUser(u)} className="text-brand-gold hover:underline">Edit</button>
                                        <span className="text-brand-border">|</span>
                                        <button onClick={() => handleFreeze(u.id)} className="text-down hover:underline">Freeze</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm animate-fade-up">
                    <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-panel">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-display text-xl text-white tracking-widest">EDIT PROFILE</h3>
                            <button onClick={() => setEditingUser(null)} className="text-muted hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleEditSave} className="space-y-4">
                            <div>
                                <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Full Name</label>
                                <input type="text" defaultValue={editingUser.full_name} className="w-full bg-brand-panel border border-brand-border rounded-lg px-4 py-3 text-white text-sm" />
                            </div>
                            <div>
                                <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Email</label>
                                <input type="email" defaultValue={editingUser.email} className="w-full bg-brand-panel border border-brand-border rounded-lg px-4 py-3 text-white text-sm" />
                            </div>
                            <button type="submit" className="w-full py-3 bg-brand-gold text-brand-bg font-bold rounded-lg tracking-widest mt-4">SAVE CHANGES</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
