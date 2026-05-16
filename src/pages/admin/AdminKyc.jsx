import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'
import { formatDate } from '../../utils/format'
import { toast } from 'react-hot-toast'

export default function AdminKyc() {
    const [kycQueue, setKycQueue] = useState([])
    const [selectedKyc, setSelectedKyc] = useState(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [rejectingId, setRejectingId] = useState(null)
    const [rejectReason, setRejectReason] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchQueue = async () => {
        try {
            const res = await adminAPI.getKycQueue()
            setKycQueue(res.data || [])
        } catch (err) {
            console.error('Failed to load real KYC queue:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchQueue()
    }, [])

    const handleSelectKyc = async (id) => {
        setDetailLoading(true)
        try {
            const res = await adminAPI.getKycById(id)
            if (res.success && res.data) {
                setSelectedKyc(res.data)
            } else {
                const item = kycQueue.find(x => (x.ID || x.id || x.Id) === id)
                if (item) {
                    setSelectedKyc(item)
                } else {
                    toast.error('Could not load detailed record')
                }
            }
        } catch (err) {
            console.error('Failed to fetch KYC by ID:', err)
            const item = kycQueue.find(x => (x.ID || x.id || x.Id) === id)
            if (item) {
                setSelectedKyc(item)
            } else {
                toast.error('Failed to load application details')
            }
        } finally {
            setDetailLoading(false)
        }
    }

    const handleApprove = async (id) => {
        const confirmApprove = window.confirm('Are you sure you want to APPROVE this KYC application?')
        if (!confirmApprove) return

        try {
            await adminAPI.reviewKyc(id, { status: 'verified', comment: 'Approved by compliance audit' })
            setKycQueue(q => q.filter(x => (x.ID || x.id || x.Id) !== id))
            setSelectedKyc(null)
            toast.success(`KYC Approved successfully!`)
        } catch (err) {
            toast.error(err.message || err || 'Failed to approve')
        }
    }

    const handleRejectSubmit = async (e) => {
        e.preventDefault()
        if (!rejectReason.trim()) return toast.error('Please provide a reason')
        try {
            await adminAPI.reviewKyc(rejectingId, { status: 'rejected', comment: rejectReason })
            setKycQueue(q => q.filter(x => (x.ID || x.id || x.Id) !== rejectingId))
            setSelectedKyc(null)
            setRejectingId(null)
            setRejectReason('')
            toast.success(`KYC Rejected. Reason: ${rejectReason}`)
        } catch (err) {
            toast.error(err.message || err || 'Failed to reject')
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
                    <h3 className="font-display text-lg text-white tracking-widest uppercase font-bold text-brand-gold">Pending Applications ({kycQueue.length})</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="h-12 bg-brand-panel/10 text-muted text-[9px] uppercase tracking-[0.2em] font-bold border-b border-brand-border/40">
                                <th className="px-6 py-2 text-left">User Profile</th>
                                <th className="px-6 py-2 text-left">Submitted</th>
                                <th className="px-6 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/40 font-bold uppercase tracking-tighter text-[10px]">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-muted">
                                        <div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        Fetching Compliance Queue...
                                    </td>
                                </tr>
                            ) : kycQueue.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-muted tracking-widest italic uppercase">
                                        Compliance queue is clear
                                    </td>
                                </tr>
                            ) : (
                                kycQueue.map(k => {
                                    const id = k.ID || k.id || k.Id
                                    const name = k.FullName || k.full_name || k.Name || k.name || 'Anonymous User'
                                    const email = k.Email || k.email || 'N/A'
                                    const date = k.CreatedAt || k.created_at || k.submitted_at || new Date().toISOString()
                                    return (
                                        <tr key={id} className="hover:bg-brand-panel/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-white text-xs font-semibold tracking-wide capitalize">{name}</p>
                                                <p className="text-muted text-[9px] font-mono lowercase tracking-normal font-medium mt-0.5">{email}</p>
                                            </td>
                                            <td className="px-6 py-4 text-muted font-mono tracking-wide">{formatDate(date)}</td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleSelectKyc(id)}
                                                    className="px-3.5 py-2 bg-brand-panel text-brand-gold border border-brand-gold/30 hover:border-brand-gold hover:bg-brand-gold/10 rounded-lg transition-all"
                                                >
                                                    Audit Files
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(id)}
                                                    className="px-3.5 py-2 bg-up/10 text-up border border-up/30 hover:bg-up hover:text-white rounded-lg transition-all"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => setRejectingId(id)}
                                                    className="px-3.5 py-2 bg-down/10 text-down border border-down/30 hover:bg-down hover:text-white rounded-lg transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Application Detail Auditing Modal */}
            {selectedKyc && (
                <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[90] backdrop-blur-sm p-4 animate-fade-up">
                    <div className="w-full max-w-2xl bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/40 flex justify-between items-center">
                            <div>
                                <h3 className="font-display text-lg text-brand-gold tracking-widest uppercase font-bold">COMPLIANCE DOSSIER</h3>
                                <p className="text-muted text-[8px] font-mono uppercase tracking-widest mt-0.5">ID: {selectedKyc.ID || selectedKyc.id || selectedKyc.Id}</p>
                            </div>
                            <button onClick={() => setSelectedKyc(null)} className="text-muted hover:text-white font-bold text-sm">✕ CLOSE</button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-mono text-[11px] uppercase tracking-wide">
                            {/* Personal & Bank Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-brand-panel/20 border border-brand-border/40 rounded-xl p-4 space-y-3">
                                    <h4 className="text-brand-gold font-bold text-xs border-b border-brand-border pb-1.5 tracking-widest">Personal Details</h4>
                                    <div>
                                        <p className="text-muted text-[9px] uppercase tracking-widest font-bold">Full Legal Name</p>
                                        <p className="text-white text-xs font-bold font-sans mt-0.5 capitalize">{selectedKyc.FullName || selectedKyc.full_name || selectedKyc.Name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted text-[9px] uppercase tracking-widest font-bold">Date of Birth</p>
                                        <p className="text-white text-xs font-bold mt-0.5">{selectedKyc.DOB || selectedKyc.dob || 'N/A'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div>
                                            <p className="text-muted text-[9px] uppercase tracking-widest font-bold">Aadhaar</p>
                                            <p className="text-white text-xs font-bold font-sans mt-0.5">{selectedKyc.AadhaarNumber || selectedKyc.aadhaar || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted text-[9px] uppercase tracking-widest font-bold">PAN</p>
                                            <p className="text-white text-xs font-bold font-sans mt-0.5">{selectedKyc.PANNumber || selectedKyc.pan || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-brand-panel/20 border border-brand-border/40 rounded-xl p-4 space-y-3">
                                    <h4 className="text-brand-gold font-bold text-xs border-b border-brand-border pb-1.5 tracking-widest">Banking Details</h4>
                                    <div>
                                        <p className="text-muted text-[9px] uppercase tracking-widest font-bold">Settlement Account</p>
                                        <p className="text-white text-xs font-bold mt-0.5">{selectedKyc.AccountNumber || selectedKyc.account_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted text-[9px] uppercase tracking-widest font-bold">IFSC Code</p>
                                        <p className="text-white text-xs font-bold mt-0.5">{selectedKyc.IFSCCode || selectedKyc.ifsc || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Document Upload Previews */}
                            <div className="space-y-3">
                                <h4 className="text-brand-gold font-bold text-xs border-b border-brand-border pb-1.5 tracking-widest">Identification Files</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                                    {/* Aadhaar Front */}
                                    <div className="border border-brand-border/60 bg-brand-panel/20 rounded-xl p-2.5 text-center flex flex-col justify-between">
                                        <p className="text-[8px] uppercase tracking-widest text-muted font-bold mb-2">Aadhaar Front</p>
                                        {(selectedKyc.AadhaarFrontUrl || selectedKyc.aadhaar_front_url || selectedKyc.AadharFrontUrl || selectedKyc.aadhar_front_url || selectedKyc.AadhaarFront || selectedKyc.aadhaar_front) ? (
                                            <a href={selectedKyc.AadhaarFrontUrl || selectedKyc.aadhaar_front_url || selectedKyc.AadharFrontUrl || selectedKyc.aadhar_front_url || selectedKyc.AadhaarFront || selectedKyc.aadhaar_front} target="_blank" rel="noreferrer" className="block group">
                                                <img src={selectedKyc.AadhaarFrontUrl || selectedKyc.aadhaar_front_url || selectedKyc.AadharFrontUrl || selectedKyc.aadhar_front_url || selectedKyc.AadhaarFront || selectedKyc.aadhaar_front} alt="Aadhaar Front" className="w-full h-20 object-cover rounded-lg border border-brand-border hover:border-brand-gold transition-all" />
                                                <span className="text-[8px] text-brand-gold mt-1.5 inline-block font-bold hover:underline">Full Size ↗</span>
                                            </a>
                                        ) : (
                                            <div className="h-20 flex items-center justify-center bg-brand-panel/40 rounded-lg text-muted text-[9px]">Not Uploaded</div>
                                        )}
                                    </div>

                                    {/* Aadhaar Back */}
                                    <div className="border border-brand-border/60 bg-brand-panel/20 rounded-xl p-2.5 text-center flex flex-col justify-between">
                                        <p className="text-[8px] uppercase tracking-widest text-muted font-bold mb-2">Aadhaar Back</p>
                                        {(selectedKyc.AadhaarBackUrl || selectedKyc.aadhaar_back_url || selectedKyc.AadharBackUrl || selectedKyc.aadhar_back_url || selectedKyc.AadhaarBack || selectedKyc.aadhaar_back) ? (
                                            <a href={selectedKyc.AadhaarBackUrl || selectedKyc.aadhaar_back_url || selectedKyc.AadharBackUrl || selectedKyc.aadhar_back_url || selectedKyc.AadhaarBack || selectedKyc.aadhaar_back} target="_blank" rel="noreferrer" className="block group">
                                                <img src={selectedKyc.AadhaarBackUrl || selectedKyc.aadhaar_back_url || selectedKyc.AadharBackUrl || selectedKyc.aadhar_back_url || selectedKyc.AadhaarBack || selectedKyc.aadhaar_back} alt="Aadhaar Back" className="w-full h-20 object-cover rounded-lg border border-brand-border hover:border-brand-gold transition-all" />
                                                <span className="text-[8px] text-brand-gold mt-1.5 inline-block font-bold hover:underline">Full Size ↗</span>
                                            </a>
                                        ) : (
                                            <div className="h-20 flex items-center justify-center bg-brand-panel/40 rounded-lg text-muted text-[9px]">Not Uploaded</div>
                                        )}
                                    </div>

                                    {/* PAN File */}
                                    <div className="border border-brand-border/60 bg-brand-panel/20 rounded-xl p-2.5 text-center flex flex-col justify-between">
                                        <p className="text-[8px] uppercase tracking-widest text-muted font-bold mb-2">PAN Card</p>
                                        {(selectedKyc.PANFileUrl || selectedKyc.pan_file_url || selectedKyc.PANUrl || selectedKyc.pan_url || selectedKyc.PanFileUrl || selectedKyc.panFileUrl || selectedKyc.PanUrl || selectedKyc.panUrl || selectedKyc.pan_file || selectedKyc.PANFile || selectedKyc.pan || selectedKyc.PAN) ? (
                                            <a href={selectedKyc.PANFileUrl || selectedKyc.pan_file_url || selectedKyc.PANUrl || selectedKyc.pan_url || selectedKyc.PanFileUrl || selectedKyc.panFileUrl || selectedKyc.PanUrl || selectedKyc.panUrl || selectedKyc.pan_file || selectedKyc.PANFile || selectedKyc.pan || selectedKyc.PAN} target="_blank" rel="noreferrer" className="block group">
                                                <img src={selectedKyc.PANFileUrl || selectedKyc.pan_file_url || selectedKyc.PANUrl || selectedKyc.pan_url || selectedKyc.PanFileUrl || selectedKyc.panFileUrl || selectedKyc.PanUrl || selectedKyc.panUrl || selectedKyc.pan_file || selectedKyc.PANFile || selectedKyc.pan || selectedKyc.PAN} alt="PAN Card" className="w-full h-20 object-cover rounded-lg border border-brand-border hover:border-brand-gold transition-all" />
                                                <span className="text-[8px] text-brand-gold mt-1.5 inline-block font-bold hover:underline">Full Size ↗</span>
                                            </a>
                                        ) : (
                                            <div className="h-20 flex items-center justify-center bg-brand-panel/40 rounded-lg text-muted text-[9px]">Not Uploaded</div>
                                        )}
                                    </div>

                                    {/* Selfie File */}
                                    <div className="border border-brand-border/60 bg-brand-panel/20 rounded-xl p-2.5 text-center flex flex-col justify-between">
                                        <p className="text-[8px] uppercase tracking-widest text-muted font-bold mb-2">Verification Selfie</p>
                                        {(selectedKyc.SelfieUrl || selectedKyc.selfie_url || selectedKyc.Selfie || selectedKyc.selfie) ? (
                                            <a href={selectedKyc.SelfieUrl || selectedKyc.selfie_url || selectedKyc.Selfie || selectedKyc.selfie} target="_blank" rel="noreferrer" className="block group">
                                                <img src={selectedKyc.SelfieUrl || selectedKyc.selfie_url || selectedKyc.Selfie || selectedKyc.selfie} alt="Selfie" className="w-full h-20 object-cover rounded-lg border border-brand-border hover:border-brand-gold transition-all" />
                                                <span className="text-[8px] text-brand-gold mt-1.5 inline-block font-bold hover:underline">Full Size ↗</span>
                                            </a>
                                        ) : (
                                            <div className="h-20 flex items-center justify-center bg-brand-panel/40 rounded-lg text-muted text-[9px]">Not Uploaded</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Audit Actions */}
                        <div className="px-6 py-4 border-t border-brand-border bg-brand-panel/40 flex justify-end gap-3">
                            <button
                                onClick={() => setRejectingId(selectedKyc.ID || selectedKyc.id || selectedKyc.Id)}
                                className="px-6 py-3 bg-down/10 text-down border border-down/30 hover:bg-down hover:text-white rounded-xl text-xs font-bold tracking-widest"
                            >
                                REJECT DOSSIER
                            </button>
                            <button
                                onClick={() => handleApprove(selectedKyc.ID || selectedKyc.id || selectedKyc.Id)}
                                className="px-6 py-3 bg-up text-brand-bg font-bold rounded-xl text-xs tracking-widest hover:opacity-90 transition-opacity"
                            >
                                APPROVE APPLICATION
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Reason Modal */}
            {rejectingId && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] backdrop-blur-sm animate-fade-up">
                    <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-panel">
                        <div className="flex justify-between items-center mb-6 font-mono text-[11px] font-bold uppercase tracking-widest">
                            <h3 className="font-display text-lg text-down tracking-widest font-bold">REJECT KYC APPLICATION</h3>
                            <button onClick={() => setRejectingId(null)} className="text-muted hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleRejectSubmit} className="space-y-4">
                            <div>
                                <label className="text-muted text-[10px] uppercase font-bold mb-2.5 block tracking-widest">Compliance Defect / Reason</label>
                                <textarea 
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="e.g. Mismatched name spelling across files, blurred front Aadhaar, faces do not match..." 
                                    className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white text-sm h-32 resize-none"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full py-3 bg-down text-white font-bold rounded-xl text-xs tracking-widest uppercase hover:bg-down/95 active:scale-[0.98] transition-all shadow-lg mt-4">CONFIRM COMPLIANCE REJECTION</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
