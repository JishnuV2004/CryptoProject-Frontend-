import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'
import { formatDate } from '../../utils/format'
import { toast } from 'react-hot-toast'

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingUser, setEditingUser] = useState(null)

    // Form states for edit
    const [editForm, setEditForm] = useState({ name: '', email: '', role: '' })
    const [editLoading, setEditLoading] = useState(false)

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            const res = await adminAPI.getUsers()
            if (res.success && res.data) {
                const clientsOnly = res.data.filter(u => (u.Role || u.role) !== 'admin')
                setUsers(clientsOnly)
            }
        } catch (err) {
            toast.error('Failed to load users')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleBlockUnblock = async (id, isBlocked) => {
        try {
            const res = await adminAPI.blockUnblockUser(id)
            if (res.success) {
                toast.success(`User ${isBlocked ? 'unblocked' : 'blocked'} successfully`)
                loadUsers() // Refresh the list
            }
        } catch (err) {
            toast.error(err.message || err || 'Failed to toggle block status')
        }
    }

    const handleEditClick = (u) => {
        setEditingUser(u)
        setEditForm({ name: u.Name, email: u.Email, role: u.Role })
    }

    const handleEditSave = async (e) => {
        e.preventDefault()
        setEditLoading(true)
        try {
            const res = await adminAPI.editUserProfile(editingUser.ID, editForm)
            if (res.success) {
                toast.success('User profile updated successfully')
                setEditingUser(null)
                loadUsers() // Refresh the list
            }
        } catch (err) {
            toast.error(err.message || err || 'Failed to update user profile')
        } finally {
            setEditLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[500px]">
                <div className="w-8 h-8 rounded-full border-2 border-brand-gold border-t-transparent animate-spin"></div>
            </div>
        )
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
                    <h3 className="font-display text-lg text-white tracking-widest uppercase">All Users ({users.length})</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="h-10 bg-brand-panel/10 text-muted text-[9px] uppercase tracking-[0.2em] font-bold">
                                <th className="px-6 py-2 text-left">User Profile</th>
                                <th className="px-6 py-2 text-left">Role</th>
                                <th className="px-6 py-2 text-left">KYC Status</th>
                                <th className="px-6 py-2 text-right">Created</th>
                                <th className="px-6 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/40 font-bold uppercase tracking-tighter text-[10px]">
                            {users.map(u => (
                                <tr key={u.ID} className={`transition-colors ${u.IsBlocked ? 'bg-brand-red/5 hover:bg-brand-red/10' : 'hover:bg-brand-panel/40'}`}>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-brand-panel border border-brand-border flex items-center justify-center overflow-hidden">
                                            {u.profile_pic_url ? (
                                                <img src={u.profile_pic_url} alt={u.Name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white text-xs">{u.Name?.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm ${u.IsBlocked ? 'text-brand-red line-through opacity-70' : 'text-white'}`}>
                                                {u.Name} {u.IsVerified && <span className="text-up ml-1" title="Verified">✓</span>}
                                            </p>
                                            <p className="text-muted text-[9px] font-mono lowercase tracking-normal">{u.Email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full border ${u.Role === 'admin' ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/30' : 'bg-brand-panel text-muted border-brand-border'}`}>
                                            {u.Role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full border ${u.KYCStatus ? 'bg-up/10 text-up border-up/30' : 'bg-brand-panel/50 text-muted border-brand-border'}`}>
                                            {u.KYCStatus ? 'VERIFIED' : 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-muted font-mono">{formatDate(u.created_at)}</td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => handleEditClick(u)} className="text-brand-gold hover:underline">Edit</button>
                                        <span className="text-brand-border">|</span>
                                        <button 
                                            onClick={() => handleBlockUnblock(u.ID, u.IsBlocked)} 
                                            className={u.IsBlocked ? 'text-up hover:underline' : 'text-brand-red hover:underline'}
                                        >
                                            {u.IsBlocked ? 'Unblock' : 'Block'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-muted">No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm animate-fade-up">
                    <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-panel">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-display text-xl text-white tracking-widest">EDIT USER</h3>
                            <button onClick={() => setEditingUser(null)} className="text-muted hover:text-white transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleEditSave} className="space-y-4">
                            <div>
                                <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Full Name</label>
                                <input 
                                    type="text" 
                                    value={editForm.name} 
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                                    className="w-full bg-brand-panel border border-brand-border rounded-lg px-4 py-3 text-white text-sm focus:border-brand-gold transition-colors" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Email Address</label>
                                <input 
                                    type="email" 
                                    value={editForm.email} 
                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
                                    className="w-full bg-brand-panel border border-brand-border rounded-lg px-4 py-3 text-white text-sm focus:border-brand-gold transition-colors" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Role</label>
                                <select 
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                    className="w-full bg-brand-panel border border-brand-border rounded-lg px-4 py-3 text-white text-sm focus:border-brand-gold transition-colors"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button 
                                type="submit" 
                                disabled={editLoading}
                                className="w-full py-3 bg-brand-gold text-brand-bg font-bold rounded-lg tracking-widest mt-6 hover:shadow-gold-md hover:bg-brand-gold-lt transition-all disabled:opacity-50"
                            >
                                {editLoading ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
