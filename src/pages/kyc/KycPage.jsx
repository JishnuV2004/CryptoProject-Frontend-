import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import { kycAPI } from '../../services/api'

const STATUS_UI = {
    pending: {
        bg: 'bg-yellow-900/10 border-yellow-700/30',
        text: 'text-yellow-400',
        icon: '◈',
        msg: 'Your verification is currently in the review queue. Professional clearing takes 24-48 hours.',
    },
    verified: {
        bg: 'bg-up/5 border-up/20',
        text: 'text-up',
        icon: '✓',
        msg: 'Verification successful. Your account is now fully cleared for institutional-grade trading.',
    },
    rejected: {
        bg: 'bg-down/5 border-down/20',
        text: 'text-down',
        icon: '✕',
        msg: 'Identification documents were rejected. Please ensure high clarity and resubmit.',
    },
}

function DropZone({ label, file, onDrop }) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (files) => onDrop(files[0]),
        accept: { 'image/*': [], 'application/pdf': [] },
        maxSize: 5 * 1024 * 1024,
        multiple: false,
    })

    const [preview, setPreview] = useState(null)

    useEffect(() => {
        if (!file) {
            setPreview(null)
            return
        }
        if (file.type.startsWith('image/')) {
            const objectUrl = URL.createObjectURL(file)
            setPreview(objectUrl)
            return () => URL.revokeObjectURL(objectUrl)
        }
    }, [file])

    return (
        <div
            {...getRootProps()}
            className={`
        border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col justify-center min-h-[140px]
        ${isDragActive
                    ? 'border-brand-gold bg-brand-gold/5 shadow-gold-sm'
                    : 'border-brand-border bg-brand-panel/30 hover:border-brand-gold/40 hover:bg-brand-panel/50'
                }
      `}
        >
            <input {...getInputProps()} />
            {file ? (
                <div className="flex flex-col items-center gap-2">
                    {preview ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-brand-gold/30 shadow-inner">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-brand-panel rounded-xl flex items-center justify-center border border-brand-border">
                            <span className="text-muted text-xs">📄</span>
                        </div>
                    )}
                    <div className="space-y-0.5 w-full">
                        <p className="text-up text-[10px] font-bold tracking-widest uppercase">✓ Uploaded</p>
                        <p className="text-white text-[9px] font-mono truncate px-2">{file.name}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="w-8 h-8 bg-brand-gold/5 border border-brand-gold/10 rounded-xl mx-auto flex items-center justify-center text-brand-gold text-sm group-hover:scale-110 transition-transform">
                        ⬆
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-white text-[11px] font-bold uppercase tracking-widest">{label}</p>
                        <p className="text-muted text-[8px] font-medium tracking-tight opacity-70">
                            JPG, PNG, PDF
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function KycPage() {
    const [status, setStatus] = useState(null)
    const [step, setStep] = useState(1)  // 1 = Personal, 2 = Banking, 3 = Files, 4 = Review
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        full_name: '',
        dob: '',
        aadhar_number: '',
        pan_number: '',
        bank_account_number: '',
        ifsc: ''
    })

    const [files, setFiles] = useState({
        aadhar_front: null,
        aadhar_back: null,
        pan_file: null,
        selfie: null
    })

    useEffect(() => {
        kycAPI.getStatus().then((res) => setStatus(res.data?.kyc_status)).catch(() => { })
    }, [])

    const handleTextChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
    const handleFileChange = (key, file) => setFiles({ ...files, [key]: file })

    const handleSubmit = async () => {
        setLoading(true)
        const form = new FormData()
        Object.entries(formData).forEach(([key, val]) => form.append(key, val))
        Object.entries(files).forEach(([key, file]) => {
            if (file) form.append(key, file)
        })

        try {
            await kycAPI.upload(form)
            setStatus('pending')
            toast.success('KYC application submitted successfully!')
        } catch (err) {
            toast.error(err || 'Upload failed')
        } finally {
            setLoading(false)
        }
    }

    if (status && status !== 'not_submitted') {
        const s = STATUS_UI[status] || STATUS_UI.pending
        return (
            <div className="max-w-lg mx-auto mt-12 animate-fade-up">
                <div className={`rounded-3xl border p-10 text-center shadow-panel ${s.bg}`}>
                    <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl mb-6 shadow-lg border border-current ${s.text}`}>
                        {s.icon}
                    </div>
                    <p className={`font-display text-3xl mb-2 tracking-[0.1em] ${s.text}`}>
                        KYC {status.toUpperCase()}
                    </p>
                    <p className="text-muted text-sm font-medium leading-relaxed px-4">{s.msg}</p>
                    {status === 'rejected' && (
                        <button
                            onClick={() => setStatus('not_submitted')}
                            className="mt-8 px-8 py-3 bg-gold-gradient text-brand-bg text-xs rounded-xl font-bold uppercase tracking-widest shadow-gold-sm hover:scale-105 active:scale-95 transition-all"
                        >
                            Restart Resubmission
                        </button>
                    )}
                </div>
            </div>
        )
    }

    const steps = ['Identity', 'Banking', 'Documents', 'Review']

    return (
        <div className="max-w-3xl mx-auto py-8 animate-fade-up">
            <div className="text-center mb-10">
                <h2 className="font-display text-4xl text-white tracking-[0.2em] mb-2">ONBOARDING</h2>
                <p className="text-muted text-[10px] uppercase font-bold tracking-[0.3em]">Institutional Verification Protocol</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-12 px-2 sm:px-10">
                {steps.map((label, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 relative">
                        <div className={`
              w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold z-10 transition-all duration-500
              ${step > i + 1 ? 'bg-brand-gold text-brand-bg shadow-gold-sm'
                                : step === i + 1 ? 'bg-brand-gold/20 border-2 border-brand-gold text-brand-gold shadow-gold-sm'
                                    : 'bg-brand-panel border border-brand-border text-muted'}
            `}>{step > i + 1 ? '✓' : i + 1}</div>
                        <p className={`absolute top-12 whitespace-nowrap text-[8px] sm:text-[9px] font-bold uppercase tracking-widest transition-colors duration-500 ${step === i + 1 ? 'text-brand-gold' : 'text-muted'}`}>
                            {label}
                        </p>
                        {i < 3 && <div className={`absolute left-[calc(50%+24px)] right-[calc(-50%+24px)] top-5 h-[1px] transition-all duration-700 ${step > i + 1 ? 'bg-brand-gold' : 'bg-brand-border'}`} />}
                    </div>
                ))}
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-10 shadow-panel mt-16 max-w-2xl mx-auto">
                {step === 1 && (
                    <div className="space-y-6 animate-slide-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Full Name (As per ID)</label>
                                <input type="text" name="full_name" value={formData.full_name} onChange={handleTextChange} placeholder="John Doe" className="w-full bg-brand-panel border border-brand-border rounded-lg px-4 py-3 text-white text-sm focus:border-brand-gold transition-all" />
                            </div>
                            <div>
                                <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Date of Birth</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleTextChange} className="w-full bg-brand-panel border border-brand-border rounded-lg px-4 py-3 text-white text-sm focus:border-brand-gold transition-all [color-scheme:dark]" />
                            </div>
                            <div>
                                <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Aadhar Number</label>
                                <input type="text" name="aadhar_number" value={formData.aadhar_number} onChange={handleTextChange} placeholder="0000 0000 0000" className="w-full bg-brand-panel border border-brand-border rounded-lg px-4 py-3 text-white text-sm font-mono focus:border-brand-gold transition-all" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">PAN Number</label>
                                <input type="text" name="pan_number" value={formData.pan_number} onChange={handleTextChange} placeholder="ABCDE1234F" className="w-full bg-brand-panel border border-brand-border rounded-lg px-4 py-3 text-white text-sm font-mono uppercase focus:border-brand-gold transition-all" />
                            </div>
                        </div>
                        <button
                            onClick={() => setStep(2)}
                            disabled={!formData.full_name || !formData.dob || !formData.aadhar_number || !formData.pan_number}
                            className="w-full py-4 bg-gold-gradient text-brand-bg rounded-xl font-bold text-xs uppercase tracking-[0.2em] disabled:opacity-40 hover:opacity-95 active:scale-[0.98] transition-all shadow-gold-sm mt-4"
                        >
                            Next: Banking Details →
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-slide-in">
                        <div>
                            <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Bank Account Number</label>
                            <input type="text" name="bank_account_number" value={formData.bank_account_number} onChange={handleTextChange} placeholder="Account Number" className="w-full bg-brand-panel border border-brand-border rounded-lg px-4 py-3 text-white text-sm font-mono focus:border-brand-gold transition-all" />
                        </div>
                        <div>
                            <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">IFSC Code</label>
                            <input type="text" name="ifsc" value={formData.ifsc} onChange={handleTextChange} placeholder="SBIN0001234" className="w-full bg-brand-panel border border-brand-border rounded-lg px-4 py-3 text-white text-sm font-mono uppercase focus:border-brand-gold transition-all" />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setStep(1)} className="flex-1 py-4 border border-brand-border text-muted rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-white hover:bg-brand-panel transition-all">
                                ← Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!formData.bank_account_number || !formData.ifsc}
                                className="flex-[2] py-4 bg-gold-gradient text-brand-bg rounded-xl font-bold text-xs uppercase tracking-[0.2em] disabled:opacity-40 hover:opacity-95 active:scale-[0.98] transition-all shadow-gold-sm"
                            >
                                Next: Document Uploads →
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-slide-in">
                        <div className="grid grid-cols-2 gap-4">
                            <DropZone label="Aadhar Front" file={files.aadhar_front} onDrop={(f) => handleFileChange('aadhar_front', f)} />
                            <DropZone label="Aadhar Back" file={files.aadhar_back} onDrop={(f) => handleFileChange('aadhar_back', f)} />
                            <DropZone label="PAN Card" file={files.pan_file} onDrop={(f) => handleFileChange('pan_file', f)} />
                            <DropZone label="Selfie Image" file={files.selfie} onDrop={(f) => handleFileChange('selfie', f)} />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setStep(2)} className="flex-1 py-4 border border-brand-border text-muted rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-white hover:bg-brand-panel transition-all">
                                ← Back
                            </button>
                            <button
                                onClick={() => setStep(4)}
                                disabled={!files.aadhar_front || !files.aadhar_back || !files.pan_file || !files.selfie}
                                className="flex-[2] py-4 bg-gold-gradient text-brand-bg rounded-xl font-bold text-xs uppercase tracking-[0.2em] disabled:opacity-40 hover:opacity-95 active:scale-[0.98] transition-all shadow-gold-sm"
                            >
                                Review Application →
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6 animate-slide-in">
                        <div className="bg-brand-panel/40 rounded-xl p-6 border border-brand-border/30 space-y-4">
                            <h4 className="text-brand-gold text-[10px] uppercase font-bold tracking-widest border-b border-brand-border/50 pb-2">Identity Details</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-muted text-[9px] uppercase tracking-widest">Name</p><p className="text-white text-xs font-bold">{formData.full_name}</p></div>
                                <div><p className="text-muted text-[9px] uppercase tracking-widest">DOB</p><p className="text-white text-xs font-bold">{formData.dob}</p></div>
                                <div><p className="text-muted text-[9px] uppercase tracking-widest">Aadhar</p><p className="text-white text-xs font-mono">{formData.aadhar_number}</p></div>
                                <div><p className="text-muted text-[9px] uppercase tracking-widest">PAN</p><p className="text-white text-xs font-mono">{formData.pan_number.toUpperCase()}</p></div>
                            </div>
                            
                            <h4 className="text-brand-gold text-[10px] uppercase font-bold tracking-widest border-b border-brand-border/50 pb-2 mt-6">Banking Details</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-muted text-[9px] uppercase tracking-widest">Account</p><p className="text-white text-xs font-mono">{formData.bank_account_number}</p></div>
                                <div><p className="text-muted text-[9px] uppercase tracking-widest">IFSC</p><p className="text-white text-xs font-mono">{formData.ifsc.toUpperCase()}</p></div>
                            </div>

                            <h4 className="text-brand-gold text-[10px] uppercase font-bold tracking-widest border-b border-brand-border/50 pb-2 mt-6">Uploaded Files</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-white">
                                <p>✓ Aadhar Front</p>
                                <p>✓ Aadhar Back</p>
                                <p>✓ PAN Card</p>
                                <p>✓ Selfie</p>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button onClick={() => setStep(3)} className="flex-1 py-4 border border-brand-border text-muted rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-white hover:bg-brand-panel transition-all">
                                ← Edit
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-[2] py-4 bg-gold-gradient text-brand-bg rounded-xl font-bold text-xs uppercase tracking-[0.2em] disabled:opacity-50 hover:opacity-95 active:scale-[0.98] transition-all shadow-gold-sm"
                            >
                                {loading ? 'SUBMITTING...' : 'CONFIRM & SUBMIT'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
