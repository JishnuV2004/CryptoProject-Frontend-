import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { adminAPI } from '../../services/api'
import { formatDate } from '../../utils/format'

export default function AdminRBAC() {
    const [roles, setRoles] = useState([])
    const [permissions, setPermissions] = useState([])
    const [loading, setLoading] = useState(true)
    
    // Modals
    const [roleModalOpen, setRoleModalOpen] = useState(false)
    const [permModalOpen, setPermModalOpen] = useState(false)
    const [manageModalOpen, setManageModalOpen] = useState(false)
    
    // Form States
    const [roleForm, setRoleForm] = useState({ name: '' })
    const [permForm, setPermForm] = useState({ name: '', slug: '' })
    
    // Manage State
    const [activeRole, setActiveRole] = useState(null)
    const [activeRolePerms, setActiveRolePerms] = useState([])
    const [manageLoading, setManageLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [rolesRes, permsRes] = await Promise.all([
                adminAPI.getRoles().catch(() => ({ data: [] })),
                adminAPI.getPermissions().catch(() => ({ data: [] }))
            ])
            setRoles(rolesRes.data || [])
            setPermissions(permsRes.data || [])
        } catch (err) {
            toast.error('Failed to load RBAC data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleCreateRole = async (e) => {
        e.preventDefault()
        if (!roleForm.name) return toast.error('Role name is required')
        setSubmitting(true)
        try {
            await adminAPI.createRole({ name: roleForm.name })
            toast.success('Role created successfully')
            setRoleModalOpen(false)
            setRoleForm({ name: '' })
            fetchData()
        } catch (err) {
            toast.error(err.message || err || 'Role creation failed')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCreatePermission = async (e) => {
        e.preventDefault()
        if (!permForm.name || !permForm.slug) return toast.error('Name and Slug are required')
        setSubmitting(true)
        try {
            await adminAPI.createPermission(permForm)
            toast.success('Permission created successfully')
            setPermModalOpen(false)
            setPermForm({ name: '', slug: '' })
            fetchData()
        } catch (err) {
            toast.error(err.message || err || 'Permission creation failed')
        } finally {
            setSubmitting(false)
        }
    }

    const openManageModal = async (role) => {
        setActiveRole(role)
        setManageModalOpen(true)
        setManageLoading(true)
        try {
            const res = await adminAPI.getRolePermissions(role.Name)
            if (res.success && res.data) {
                setActiveRolePerms(res.data.Permissions || [])
            }
        } catch (err) {
            toast.error('Failed to load role permissions')
            setManageModalOpen(false)
        } finally {
            setManageLoading(false)
        }
    }

    const handleTogglePermission = async (permId, currentlyEnabled) => {
        try {
            const res = await adminAPI.toggleRolePermission({
                role_id: activeRole.ID,
                permission_id: permId,
                enabled: !currentlyEnabled
            })
            if (res.success !== false) {
                toast.success(currentlyEnabled ? 'Permission disabled' : 'Permission enabled')
                if (currentlyEnabled) {
                    setActiveRolePerms(prev => prev.filter(p => p.ID !== permId))
                } else {
                    const addedPerm = permissions.find(p => p.ID === permId)
                    if (addedPerm) setActiveRolePerms(prev => [...prev, addedPerm])
                }
            } else {
                throw new Error(res.message || 'Toggle failed')
            }
        } catch (err) {
            toast.error(err.message || err || 'Toggle failed')
        }
    }

    return (
        <div className="space-y-6 animate-fade-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="font-display text-2xl text-white tracking-widest">ACCESS CONTROL</h2>
                    <p className="text-muted text-[10px] uppercase font-bold tracking-[0.2em] mt-1">Manage Roles & Permissions</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setPermModalOpen(true)}
                        className="px-4 py-2.5 bg-brand-panel text-white border border-brand-border rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-brand-panel/80 transition-colors"
                    >
                        + PERMISSION
                    </button>
                    <button 
                        onClick={() => setRoleModalOpen(true)}
                        className="px-6 py-2.5 bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-brand-bg transition-colors shadow-gold-sm"
                    >
                        + NEW ROLE
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Roles Table */}
                <div className="lg:col-span-2 bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel">
                    <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/30">
                        <h3 className="font-display text-lg text-brand-gold tracking-widest">CONFIGURED ROLES</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="h-12 bg-brand-panel/10 text-muted text-[10px] uppercase tracking-[0.2em] border-b border-brand-border/50">
                                    <th className="px-6 text-left font-medium">Role Name</th>
                                    <th className="px-6 text-left font-medium">Created Date</th>
                                    <th className="px-6 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/40 font-mono">
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-muted tracking-widest animate-pulse">LOADING ROLES...</td>
                                    </tr>
                                ) : roles.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-muted tracking-widest italic">No roles configured</td>
                                    </tr>
                                ) : (
                                    roles.map((role) => (
                                        <tr key={role.ID} className="hover:bg-brand-panel/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white uppercase tracking-wider text-sm">
                                                    {role.Name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted font-sans text-xs">
                                                {formatDate(role.CreatedAt || new Date())}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => openManageModal(role)}
                                                    className="px-4 py-2 bg-brand-panel text-brand-gold rounded border border-brand-gold/20 hover:border-brand-gold hover:bg-brand-gold/10 transition-colors uppercase text-[9px] font-bold tracking-widest"
                                                >
                                                    Manage Permissions
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Available Permissions List (Read Only Overview) */}
                <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel h-fit">
                    <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/30">
                        <h3 className="font-display text-lg text-white tracking-widest">PERMISSIONS</h3>
                    </div>
                    <div className="p-4 flex flex-col gap-2 max-h-[400px] overflow-y-auto">
                        {permissions.length === 0 ? (
                            <p className="text-center text-muted text-xs italic py-4">No permissions mapped</p>
                        ) : (
                            permissions.map(p => (
                                <div key={p.ID} className="p-3 bg-brand-panel/30 border border-brand-border rounded-xl">
                                    <p className="text-white text-xs font-bold uppercase tracking-wider mb-1">{p.Name}</p>
                                    <p className="text-muted text-[10px] font-mono">slug: {p.Slug}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Create Role Modal */}
            {roleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between items-center p-6 border-b border-brand-border bg-brand-panel/30">
                            <h3 className="font-display text-xl text-white tracking-widest">CREATE NEW ROLE</h3>
                            <button onClick={() => setRoleModalOpen(false)} className="text-muted hover:text-white text-xl">✕</button>
                        </div>
                        <form onSubmit={handleCreateRole} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Role Name</label>
                                <input 
                                    type="text"
                                    value={roleForm.name}
                                    onChange={e => setRoleForm({name: e.target.value})}
                                    className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-gold/50 focus:outline-none transition-colors"
                                    placeholder="e.g. manager"
                                    required
                                />
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setRoleModalOpen(false)} className="flex-1 py-3 bg-brand-panel text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-brand-panel/80 transition-colors border border-brand-border">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-gold-gradient text-brand-bg text-xs font-bold uppercase tracking-widest rounded-xl shadow-gold-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                                    {submitting ? 'CREATING...' : 'CREATE ROLE'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Permission Modal */}
            {permModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between items-center p-6 border-b border-brand-border bg-brand-panel/30">
                            <h3 className="font-display text-xl text-white tracking-widest">CREATE PERMISSION</h3>
                            <button onClick={() => setPermModalOpen(false)} className="text-muted hover:text-white text-xl">✕</button>
                        </div>
                        <form onSubmit={handleCreatePermission} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Permission Name</label>
                                <input 
                                    type="text"
                                    value={permForm.name}
                                    onChange={e => setPermForm({...permForm, name: e.target.value})}
                                    className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-gold/50 focus:outline-none transition-colors"
                                    placeholder="e.g. Create User"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Permission Slug</label>
                                <input 
                                    type="text"
                                    value={permForm.slug}
                                    onChange={e => setPermForm({...permForm, slug: e.target.value})}
                                    className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-gold/50 focus:outline-none transition-colors"
                                    placeholder="e.g. user_create"
                                    required
                                />
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setPermModalOpen(false)} className="flex-1 py-3 bg-brand-panel text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-brand-panel/80 transition-colors border border-brand-border">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                                    {submitting ? 'CREATING...' : 'ADD PERMISSION'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Permissions Modal */}
            {manageModalOpen && activeRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-brand-border bg-brand-panel/30 shrink-0">
                            <div>
                                <h3 className="font-display text-xl text-brand-gold tracking-widest uppercase">MANAGE ROLE: {activeRole.Name}</h3>
                                <p className="text-[10px] text-muted font-mono mt-1">Toggle capabilities for users mapped to this role</p>
                            </div>
                            <button onClick={() => setManageModalOpen(false)} className="text-muted hover:text-white text-xl">✕</button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            {manageLoading ? (
                                <div className="text-center py-12 text-muted animate-pulse font-mono text-xs uppercase tracking-widest">Loading Current State...</div>
                            ) : (
                                <div className="space-y-4">
                                    {permissions.length === 0 && <p className="text-muted text-xs italic">No permissions exist in the system yet.</p>}
                                    {permissions.map(perm => {
                                        const isEnabled = activeRolePerms.some(p => p.ID === perm.ID)
                                        return (
                                            <div key={perm.ID} className="flex items-center justify-between p-4 bg-brand-panel/40 border border-brand-border rounded-xl">
                                                <div>
                                                    <p className="text-white text-sm font-bold uppercase tracking-wider">{perm.Name}</p>
                                                    <p className="text-muted text-[10px] font-mono mt-1">{perm.Slug}</p>
                                                </div>
                                                <button 
                                                    onClick={() => handleTogglePermission(perm.ID, isEnabled)}
                                                    className={`
                                                        relative w-12 h-6 rounded-full transition-colors duration-300
                                                        ${isEnabled ? 'bg-up' : 'bg-brand-border/50'}
                                                    `}
                                                >
                                                    <div className={`
                                                        absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm
                                                        ${isEnabled ? 'transform translate-x-6' : ''}
                                                    `} />
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 border-t border-brand-border bg-brand-panel/30 shrink-0">
                            <button 
                                onClick={() => setManageModalOpen(false)}
                                className="w-full py-3 bg-brand-panel text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-brand-panel/80 transition-colors border border-brand-border"
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
