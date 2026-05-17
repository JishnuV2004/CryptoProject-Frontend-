import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { profileAPI, kycAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function ProfilePage() {
    const { user, updateUser, logout } = useAuthStore()
    const [profile, setProfile] = useState(null)
    const [kycDetails, setKycDetails] = useState(null)
    const [loading, setLoading] = useState(true)

    // Form states
    const [editName, setEditName] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    
    const [pwdForm, setPwdForm] = useState({ oldpassword: '', newpassword: '' })
    const [pwdLoading, setPwdLoading] = useState(false)

    const [deleteLoading, setDeleteLoading] = useState(false)

    // KYC Edit States
    const [isEditingKyc, setIsEditingKyc] = useState(false)
    const [kycForm, setKycForm] = useState({
        full_name: '',
        dob: '',
        aadhaar: '',
        pan: '',
        account_number: '',
        ifsc: ''
    })
    const [kycFiles, setKycFiles] = useState({
        aadhaar_front: null,
        aadhaar_back: null,
        pan_file: null,
        selfie: null
    })
    const [kycSubmitLoading, setKycSubmitLoading] = useState(false)

    const handleUpdateKyc = async (e) => {
        e.preventDefault()
        setKycSubmitLoading(true)
        const form = new FormData()
        form.append('full_name', kycForm.full_name)
        form.append('dob', kycForm.dob)
        form.append('aadhaar', kycForm.aadhaar)
        form.append('pan', kycForm.pan)
        form.append('account_number', kycForm.account_number)
        form.append('ifsc', kycForm.ifsc)

        if (kycFiles.aadhaar_front) form.append('aadhaar_front', kycFiles.aadhaar_front)
        if (kycFiles.aadhaar_back) form.append('aadhaar_back', kycFiles.aadhaar_back)
        if (kycFiles.pan_file) form.append('pan_file', kycFiles.pan_file)
        if (kycFiles.selfie) form.append('selfie', kycFiles.selfie)

        try {
            const res = await kycAPI.update(form)
            if (res.success || res.success === undefined) {
                toast.success('KYC Compliance record updated successfully!')
                setIsEditingKyc(false)
                setKycFiles({
                    aadhaar_front: null,
                    aadhaar_back: null,
                    pan_file: null,
                    selfie: null
                })
                await loadProfile()
            } else {
                toast.error(res.message || 'Update failed')
            }
        } catch (err) {
            toast.error(err.message || err || 'Update failed')
        } finally {
            setKycSubmitLoading(false)
        }
    }

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            const res = await profileAPI.getProfile()
            if (res.success && res.data) {
                setProfile(res.data)
                setEditName(res.data.Name)
            }
        } catch (err) {
            toast.error('Failed to load profile')
        }

        try {
            const resKyc = await kycAPI.getMe()
            if (resKyc.success && resKyc.data) {
                setKycDetails(resKyc.data)
            }
        } catch (err) {
            console.error('Failed to load KYC details:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleEditProfile = async (e) => {
        e.preventDefault()
        if (!editName) return toast.error('Name cannot be empty')
        
        try {
            const res = await profileAPI.editProfile({ newname: editName })
            if (res.success && res.data) {
                setProfile(res.data)
                updateUser({ ...user, full_name: res.data.Name })
                setIsEditing(false)
                toast.success('Profile updated successfully')
            }
        } catch (err) {
            toast.error(err.message || err || 'Failed to update profile')
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (!pwdForm.oldpassword || !pwdForm.newpassword) return toast.error('Fill all password fields')
        if (pwdForm.oldpassword === pwdForm.newpassword) return toast.error('New password must be different')

        setPwdLoading(true)
        try {
            const res = await profileAPI.changePassword(pwdForm)
            if (res.success) {
                toast.success('Password changed successfully')
                setPwdForm({ oldpassword: '', newpassword: '' })
            } else {
                toast.error(res.message || 'Failed to change password')
            }
        } catch (err) {
            toast.error(err.message || err || 'Failed to change password')
        } finally {
            setPwdLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')
        if (!confirmDelete) return

        setDeleteLoading(true)
        try {
            const res = await profileAPI.deleteAccount()
            if (res.success) {
                toast.success('Account deleted successfully')
                logout() // Clear session and redirect to login
            }
        } catch (err) {
            toast.error(err.message || err || 'Failed to delete account')
            setDeleteLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[500px]">
                <div className="w-8 h-8 rounded-full border-2 border-brand-gold border-t-transparent animate-spin"></div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="p-6 text-center text-muted">Failed to load profile data.</div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-up pb-10">
            
            {/* Header */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-panel">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-red via-brand-gold to-[#FFEAA7] flex items-center justify-center shadow-gold-md">
                        <span className="font-display text-4xl text-white tracking-widest uppercase drop-shadow-md">
                            {profile.Name?.charAt(0) || user?.full_name?.charAt(0) || 'U'}
                        </span>
                    </div>
                    <div>
                        <h1 className="font-display text-3xl text-white tracking-widest">{profile.Name}</h1>
                        <p className="text-brand-gold text-sm mt-1 tracking-widest uppercase font-bold">{profile.Role} Account</p>
                        <p className="text-muted text-xs mt-1">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="ml-auto flex gap-3">
                        {profile.IsVerified && (
                            <span className="px-3 py-1 bg-up/10 text-up border border-up/20 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                ✓ Verified
                            </span>
                        )}
                        {profile.KYCStatus && (
                            <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                KYC Approved
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Profile Overview & Edit */}
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-panel">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-display text-xl text-white tracking-widest">PERSONAL DETAILS</h2>
                        <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-[10px] text-brand-gold hover:text-white uppercase font-bold tracking-widest transition-colors"
                        >
                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </button>
                    </div>

                    <form onSubmit={handleEditProfile} className="space-y-5">
                        <div>
                            <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">Full Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold transition-all shadow-inner"
                                    required
                                />
                            ) : (
                                <div className="w-full bg-brand-bg/50 border border-brand-border/50 rounded-xl px-4 py-3 text-white text-sm opacity-80 cursor-not-allowed">
                                    {profile.Name}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">Email Address</label>
                            <div className="w-full bg-brand-bg/50 border border-brand-border/50 rounded-xl px-4 py-3 text-muted text-sm opacity-60 cursor-not-allowed">
                                {profile.Email}
                            </div>
                        </div>

                        {isEditing && (
                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-red via-brand-gold to-brand-red bg-[length:200%_auto] text-white font-bold text-xs tracking-widest hover:shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:bg-right transition-all duration-300"
                            >
                                SAVE CHANGES
                            </button>
                        )}
                    </form>
                </div>

                {/* Security Settings */}
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-panel">
                    <h2 className="font-display text-xl text-white tracking-widest mb-6">SECURITY SETTINGS</h2>

                    <form onSubmit={handleChangePassword} className="space-y-5">
                        <div>
                            <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">Current Password</label>
                            <input
                                type="password"
                                value={pwdForm.oldpassword}
                                onChange={(e) => setPwdForm({ ...pwdForm, oldpassword: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold transition-all shadow-inner"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">New Password</label>
                            <input
                                type="password"
                                value={pwdForm.newpassword}
                                onChange={(e) => setPwdForm({ ...pwdForm, newpassword: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold transition-all shadow-inner"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={pwdLoading}
                            className="w-full py-3 rounded-xl bg-brand-panel border border-brand-gold/30 text-brand-gold font-bold text-xs tracking-widest hover:bg-brand-gold/10 hover:border-brand-gold transition-all duration-300 disabled:opacity-50"
                        >
                            {pwdLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-brand-surface border border-brand-red/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(229,9,20,0.02)]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="font-display text-xl text-brand-red tracking-widest">DANGER ZONE</h2>
                        <p className="text-muted text-xs mt-1">Permanently delete your account and all associated data. This action cannot be reversed.</p>
                    </div>
                    
                    <button
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading}
                        className="px-6 py-3 bg-brand-red/10 text-brand-red border border-brand-red/30 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-brand-red hover:text-white transition-all shadow-inner whitespace-nowrap"
                    >
                        {deleteLoading ? 'DELETING...' : 'DELETE ACCOUNT'}
                    </button>
                </div>
            </div>

            {/* KYC Compliance Details Card */}
            {kycDetails && (
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-panel">
                    {isEditingKyc ? (
                        <form onSubmit={handleUpdateKyc} className="space-y-6">
                            <div className="flex justify-between items-center border-b border-brand-border/50 pb-4">
                                <h2 className="font-display text-lg text-brand-gold tracking-widest uppercase font-bold">EDIT COMPLIANCE DETAILS</h2>
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditingKyc(false)} 
                                    className="text-muted hover:text-white text-xs font-mono font-bold uppercase tracking-widest"
                                >
                                    ✕ Cancel
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">Full Legal Name</label>
                                    <input 
                                        type="text" 
                                        value={kycForm.full_name} 
                                        onChange={(e) => setKycForm({ ...kycForm, full_name: e.target.value })} 
                                        className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold transition-all" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">Date of Birth</label>
                                    <input 
                                        type="date" 
                                        value={kycForm.dob} 
                                        onChange={(e) => setKycForm({ ...kycForm, dob: e.target.value })} 
                                        className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:border-brand-gold transition-all [color-scheme:dark]" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">Aadhaar Card Number</label>
                                    <input 
                                        type="text" 
                                        value={kycForm.aadhaar} 
                                        onChange={(e) => setKycForm({ ...kycForm, aadhaar: e.target.value })} 
                                        className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-brand-gold transition-all" 
                                        required 
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">PAN Card Number</label>
                                    <input 
                                        type="text" 
                                        value={kycForm.pan} 
                                        onChange={(e) => setKycForm({ ...kycForm, pan: e.target.value })} 
                                        className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white text-sm font-mono uppercase focus:border-brand-gold transition-all" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">Settlement Account</label>
                                    <input 
                                        type="text" 
                                        value={kycForm.account_number} 
                                        onChange={(e) => setKycForm({ ...kycForm, account_number: e.target.value })} 
                                        className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-brand-gold transition-all" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest">IFSC Code</label>
                                    <input 
                                        type="text" 
                                        value={kycForm.ifsc} 
                                        onChange={(e) => setKycForm({ ...kycForm, ifsc: e.target.value })} 
                                        className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white text-sm font-mono uppercase focus:border-brand-gold transition-all" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="border-t border-brand-border/40 pt-6">
                                <h3 className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4">Upload New Files (Optional)</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest font-mono">Aadhaar Front</label>
                                        <input 
                                            type="file" 
                                            onChange={(e) => setKycFiles({ ...kycFiles, aadhaar_front: e.target.files[0] })}
                                            className="w-full text-xs text-muted file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-bold file:uppercase file:tracking-wider file:bg-brand-gold/10 file:text-brand-gold hover:file:bg-brand-gold/20 file:cursor-pointer bg-brand-panel border border-brand-border rounded-xl px-3 py-2" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest font-mono">Aadhaar Back</label>
                                        <input 
                                            type="file" 
                                            onChange={(e) => setKycFiles({ ...kycFiles, aadhaar_back: e.target.files[0] })}
                                            className="w-full text-xs text-muted file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-bold file:uppercase file:tracking-wider file:bg-brand-gold/10 file:text-brand-gold hover:file:bg-brand-gold/20 file:cursor-pointer bg-brand-panel border border-brand-border rounded-xl px-3 py-2" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest font-mono">PAN Card File</label>
                                        <input 
                                            type="file" 
                                            onChange={(e) => setKycFiles({ ...kycFiles, pan_file: e.target.files[0] })}
                                            className="w-full text-xs text-muted file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-bold file:uppercase file:tracking-wider file:bg-brand-gold/10 file:text-brand-gold hover:file:bg-brand-gold/20 file:cursor-pointer bg-brand-panel border border-brand-border rounded-xl px-3 py-2" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-widest font-mono">Selfie Verification</label>
                                        <input 
                                            type="file" 
                                            onChange={(e) => setKycFiles({ ...kycFiles, selfie: e.target.files[0] })}
                                            className="w-full text-xs text-muted file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-bold file:uppercase file:tracking-wider file:bg-brand-gold/10 file:text-brand-gold hover:file:bg-brand-gold/20 file:cursor-pointer bg-brand-panel border border-brand-border rounded-xl px-3 py-2" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={kycSubmitLoading}
                                className="w-full py-4 bg-gold-gradient text-brand-bg font-bold rounded-xl text-xs uppercase tracking-widest hover:opacity-95 disabled:opacity-40 transition-all shadow-gold-sm"
                            >
                                {kycSubmitLoading ? 'SAVING COMPLIANCE UPDATES...' : 'SAVE & RESUBMIT FOR REVIEW'}
                            </button>
                        </form>
                    ) : (
                        <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <h2 className="font-display text-xl text-brand-gold tracking-widest">KYC COMPLIANCE RECORD</h2>
                                <div className="flex gap-2">
                                    {(String(kycDetails.status || kycDetails.kyc_status || '').toLowerCase() === 'rejected') && (
                                        <button 
                                            onClick={() => {
                                                setKycForm({
                                                    full_name: kycDetails.FullName || kycDetails.full_name || '',
                                                    dob: kycDetails.DOB || kycDetails.dob || '',
                                                    aadhaar: kycDetails.AadhaarNumber || kycDetails.aadhaar || '',
                                                    pan: kycDetails.PANNumber || kycDetails.pan || '',
                                                    account_number: kycDetails.AccountNumber || kycDetails.account_number || '',
                                                    ifsc: kycDetails.IFSCCode || kycDetails.ifsc || ''
                                                })
                                                setIsEditingKyc(true)
                                            }}
                                            className="px-3.5 py-1.5 border border-brand-gold/30 text-brand-gold hover:bg-brand-gold/10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all font-mono"
                                        >
                                            Edit Details
                                        </button>
                                    )}
                                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest self-start sm:self-auto font-mono ${String(kycDetails.status || kycDetails.kyc_status || '').toLowerCase() === 'verified' ? 'bg-up/10 text-up border border-up/20' : (String(kycDetails.status || kycDetails.kyc_status || '').toLowerCase() === 'rejected' ? 'bg-down/10 text-down border border-down/20' : 'bg-yellow-900/20 text-yellow-500 border border-yellow-700/30')}`}>
                                        Status: {kycDetails.status || kycDetails.kyc_status || 'Pending'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-sm border-t border-brand-border/40 pt-6">
                                <div className="space-y-4">
                                    <h3 className="text-white text-xs font-bold uppercase tracking-widest border-b border-brand-border pb-2 opacity-85">Identity Info</h3>
                                    <div>
                                        <p className="text-muted text-[10px] uppercase tracking-widest">Legal Name</p>
                                        <p className="text-white text-xs font-bold mt-1">{kycDetails.FullName || kycDetails.full_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted text-[10px] uppercase tracking-widest">Date of Birth</p>
                                        <p className="text-white text-xs font-bold mt-1">{kycDetails.DOB || kycDetails.dob || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-white text-xs font-bold uppercase tracking-widest border-b border-brand-border pb-2 opacity-85">Government IDs</h3>
                                    <div>
                                        <p className="text-muted text-[10px] uppercase tracking-widest">Aadhaar Card Number</p>
                                        <p className="text-white text-xs font-bold mt-1">•••• •••• {kycDetails.AadhaarNumber?.slice(-4) || kycDetails.aadhaar?.slice(-4) || '••••'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted text-[10px] uppercase tracking-widest">Permanent Account Number (PAN)</p>
                                        <p className="text-white text-xs font-bold mt-1">•••••{kycDetails.PANNumber?.slice(-5) || kycDetails.pan?.slice(-5) || '••••'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-white text-xs font-bold uppercase tracking-widest border-b border-brand-border pb-2 opacity-85">Cleared Bank Account</h3>
                                    <div>
                                        <p className="text-muted text-[10px] uppercase tracking-widest">Account Number</p>
                                        <p className="text-white text-xs font-bold mt-1">•••• {kycDetails.AccountNumber?.slice(-4) || kycDetails.account_number?.slice(-4) || '••••'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted text-[10px] uppercase tracking-widest">IFSC Code</p>
                                        <p className="text-white text-xs font-bold mt-1">{kycDetails.IFSCCode || kycDetails.ifsc || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Documents Previews for the User */}
                            <div className="border-t border-brand-border/40 mt-8 pt-6 space-y-4">
                                <h3 className="text-white text-xs font-bold uppercase tracking-widest border-b border-brand-border pb-2 opacity-85">Verified Compliance Documents</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
                                    {/* Aadhaar Front */}
                                    <div className="border border-brand-border/60 bg-brand-panel/20 rounded-xl p-2.5 text-center flex flex-col justify-between">
                                        <p className="text-[8px] uppercase tracking-widest text-muted font-bold mb-2">Aadhaar Front</p>
                                        {(kycDetails.AadhaarFrontUrl || kycDetails.aadhaar_front_url || kycDetails.AadharFrontUrl || kycDetails.aadhar_front_url || kycDetails.AadhaarFront || kycDetails.aadhaar_front) ? (
                                            <a href={kycDetails.AadhaarFrontUrl || kycDetails.aadhaar_front_url || kycDetails.AadharFrontUrl || kycDetails.aadhar_front_url || kycDetails.AadhaarFront || kycDetails.aadhaar_front} target="_blank" rel="noreferrer" className="block group">
                                                <img src={kycDetails.AadhaarFrontUrl || kycDetails.aadhaar_front_url || kycDetails.AadharFrontUrl || kycDetails.aadhar_front_url || kycDetails.AadhaarFront || kycDetails.aadhaar_front} alt="Aadhaar Front" className="w-full h-16 object-cover rounded-lg border border-brand-border hover:border-brand-gold transition-all" />
                                                <span className="text-[8px] text-brand-gold mt-1 inline-block font-bold hover:underline">Full Size ↗</span>
                                            </a>
                                        ) : (
                                            <div className="h-16 flex items-center justify-center bg-brand-panel/40 rounded-lg text-muted text-[8px]">Not Uploaded</div>
                                        )}
                                    </div>

                                    {/* Aadhaar Back */}
                                    <div className="border border-brand-border/60 bg-brand-panel/20 rounded-xl p-2.5 text-center flex flex-col justify-between">
                                        <p className="text-[8px] uppercase tracking-widest text-muted font-bold mb-2">Aadhaar Back</p>
                                        {(kycDetails.AadhaarBackUrl || kycDetails.aadhaar_back_url || kycDetails.AadharBackUrl || kycDetails.aadhar_back_url || kycDetails.AadhaarBack || kycDetails.aadhaar_back) ? (
                                            <a href={kycDetails.AadhaarBackUrl || kycDetails.aadhaar_back_url || kycDetails.AadharBackUrl || kycDetails.aadhar_back_url || kycDetails.AadhaarBack || kycDetails.aadhaar_back} target="_blank" rel="noreferrer" className="block group">
                                                <img src={kycDetails.AadhaarBackUrl || kycDetails.aadhaar_back_url || kycDetails.AadharBackUrl || kycDetails.aadhar_back_url || kycDetails.AadhaarBack || kycDetails.aadhaar_back} alt="Aadhaar Back" className="w-full h-16 object-cover rounded-lg border border-brand-border hover:border-brand-gold transition-all" />
                                                <span className="text-[8px] text-brand-gold mt-1 inline-block font-bold hover:underline">Full Size ↗</span>
                                            </a>
                                        ) : (
                                            <div className="h-16 flex items-center justify-center bg-brand-panel/40 rounded-lg text-muted text-[8px]">Not Uploaded</div>
                                        )}
                                    </div>

                                    {/* PAN File */}
                                    <div className="border border-brand-border/60 bg-brand-panel/20 rounded-xl p-2.5 text-center flex flex-col justify-between">
                                        <p className="text-[8px] uppercase tracking-widest text-muted font-bold mb-2">PAN Card</p>
                                        {(kycDetails.PANFileUrl || kycDetails.pan_file_url || kycDetails.PANUrl || kycDetails.pan_url || kycDetails.PanFileUrl || kycDetails.panFileUrl || kycDetails.PanUrl || kycDetails.panUrl || kycDetails.pan_file || kycDetails.PANFile || kycDetails.pan || kycDetails.PAN) ? (
                                            <a href={kycDetails.PANFileUrl || kycDetails.pan_file_url || kycDetails.PANUrl || kycDetails.pan_url || kycDetails.PanFileUrl || kycDetails.panFileUrl || kycDetails.PanUrl || kycDetails.panUrl || kycDetails.pan_file || kycDetails.PANFile || kycDetails.pan || kycDetails.PAN} target="_blank" rel="noreferrer" className="block group">
                                                <img src={kycDetails.PANFileUrl || kycDetails.pan_file_url || kycDetails.PANUrl || kycDetails.pan_url || kycDetails.PanFileUrl || kycDetails.panFileUrl || kycDetails.PanUrl || kycDetails.panUrl || kycDetails.pan_file || kycDetails.PANFile || kycDetails.pan || kycDetails.PAN} alt="PAN Card" className="w-full h-16 object-cover rounded-lg border border-brand-border hover:border-brand-gold transition-all" />
                                                <span className="text-[8px] text-brand-gold mt-1 inline-block font-bold hover:underline">Full Size ↗</span>
                                            </a>
                                        ) : (
                                            <div className="h-16 flex items-center justify-center bg-brand-panel/40 rounded-lg text-muted text-[8px]">Not Uploaded</div>
                                        )}
                                    </div>

                                    {/* Selfie File */}
                                    <div className="border border-brand-border/60 bg-brand-panel/20 rounded-xl p-2.5 text-center flex flex-col justify-between">
                                        <p className="text-[8px] uppercase tracking-widest text-muted font-bold mb-2">Selfie Photo</p>
                                        {(kycDetails.SelfieUrl || kycDetails.selfie_url || kycDetails.Selfie || kycDetails.selfie) ? (
                                            <a href={kycDetails.SelfieUrl || kycDetails.selfie_url || kycDetails.Selfie || kycDetails.selfie} target="_blank" rel="noreferrer" className="block group">
                                                <img src={kycDetails.SelfieUrl || kycDetails.selfie_url || kycDetails.Selfie || kycDetails.selfie} alt="Selfie" className="w-full h-16 object-cover rounded-lg border border-brand-border hover:border-brand-gold transition-all" />
                                                <span className="text-[8px] text-brand-gold mt-1 inline-block font-bold hover:underline">Full Size ↗</span>
                                            </a>
                                        ) : (
                                            <div className="h-16 flex items-center justify-center bg-brand-panel/40 rounded-lg text-muted text-[8px]">Not Uploaded</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* If KYC is pending or rejected and we don't have detail records yet */}
            {!kycDetails && user?.kyc_status && user?.kyc_status !== 'not_submitted' && (
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-panel">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="font-display text-lg text-white tracking-widest uppercase">KYC Compliance status</h2>
                            <p className="text-muted text-xs mt-1">
                                Your institutional trading compliance profile is currently in state: {' '}
                                <span className={`font-mono font-bold uppercase ${user.kyc_status === 'rejected' ? 'text-down' : 'text-brand-gold'}`}>
                                    {user.kyc_status}
                                </span>
                            </p>
                        </div>
                        <a 
                            href="/kyc" 
                            className="px-5 py-2.5 bg-brand-panel border border-brand-gold/30 text-brand-gold font-bold text-[10px] tracking-widest uppercase rounded-xl hover:bg-brand-gold/10 hover:border-brand-gold transition-all"
                        >
                            View Compliance Wizard →
                        </a>
                    </div>
                </div>
            )}

        </div>
    )
}
