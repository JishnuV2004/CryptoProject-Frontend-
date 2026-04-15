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

    return (
        <div
            {...getRootProps()}
            className={`
        border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
        ${isDragActive
                    ? 'border-brand-gold bg-brand-gold/5 shadow-gold-sm'
                    : 'border-brand-border bg-brand-panel/30 hover:border-brand-gold/40 hover:bg-brand-panel/50'
                }
      `}
        >
            <input {...getInputProps()} />
            {file ? (
                <div className="space-y-2">
                    <p className="text-up text-sm font-bold tracking-widest uppercase">✓ File Selected</p>
                    <p className="text-white text-xs font-mono">{file.name}</p>
                    <p className="text-muted text-[10px]">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="w-16 h-16 bg-brand-gold/5 border border-brand-gold/10 rounded-2xl mx-auto flex items-center justify-center text-brand-gold text-2xl group-hover:scale-110 transition-transform">
                        ⬆
                    </div>
                    <div className="space-y-1">
                        <p className="text-white text-sm font-bold uppercase tracking-widest">{label}</p>
                        <p className="text-muted text-[10px] font-medium tracking-tight px-4 opacity-70">
                            DRAG & DROP OR CLICK TO BROWSE<br />JPG, PNG, PDF · MAX 5MB
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function KycPage() {
    const [status, setStatus] = useState(null)
    const [step, setStep] = useState(1)  // 1 = ID, 2 = Selfie, 3 = Review
    const [idFile, setIdFile] = useState(null)
    const [selfie, setSelfie] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        kycAPI.getStatus().then((res) => setStatus(res.data?.kyc_status)).catch(() => { })
    }, [])

    const handleSubmit = async () => {
        if (!idFile || !selfie) return toast.error('Please upload both documents')
        setLoading(true)
        const form = new FormData()
        form.append('id_doc', idFile)
        form.append('selfie', selfie)
        try {
            await kycAPI.upload(form)
            setStatus('pending')
            toast.success('KYC documents submitted!')
        } catch (err) {
            toast.error(err || 'Upload failed')
        } finally {
            setLoading(false)
        }
    }

    // Show status banner if already submitted
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

    const steps = ['Identity Document', 'Biometric Selfie', 'Final Clearance']

    return (
        <div className="max-w-2xl mx-auto py-8 animate-fade-up">
            <div className="text-center mb-10">
                <h2 className="font-display text-4xl text-white tracking-[0.2em] mb-2">IDENTIFICATION</h2>
                <p className="text-muted text-[10px] uppercase font-bold tracking-[0.3em]">Institutional Verification Protocol</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-12 px-10">
                {steps.map((label, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 relative">
                        <div className={`
              w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold z-10 transition-all duration-500
              ${step > i + 1 ? 'bg-brand-gold text-brand-bg shadow-gold-sm'
                                : step === i + 1 ? 'bg-brand-gold/20 border-2 border-brand-gold text-brand-gold shadow-gold-sm'
                                    : 'bg-brand-panel border border-brand-border text-muted'}
            `}>{step > i + 1 ? '✓' : i + 1}</div>
                        <p className={`absolute top-12 whitespace-nowrap text-[9px] font-bold uppercase tracking-widest transition-colors duration-500 ${step === i + 1 ? 'text-brand-gold' : 'text-muted'}`}>
                            {label}
                        </p>
                        {i < 2 && <div className={`absolute left-[calc(50%+24px)] right-[calc(-50%+24px)] top-5 h-[1px] transition-all duration-700 ${step > i + 1 ? 'bg-brand-gold' : 'bg-brand-border'}`} />}
                    </div>
                ))}
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 space-y-6 shadow-panel mt-16">
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="bg-brand-panel/50 rounded-2xl p-4 border border-brand-border/40">
                            <p className="text-muted text-[10px] uppercase font-bold tracking-widest mb-2 px-1">Accepted Documents</p>
                            <div className="flex gap-4 px-1">
                                {['Aadhaar', 'PAN', 'Passport', 'DL'].map(doc => (
                                    <span key={doc} className="text-white text-[11px] font-bold flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-brand-gold" /> {doc}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <DropZone label="Primary Identity Document" file={idFile} onDrop={setIdFile} />
                        <button
                            onClick={() => idFile && setStep(2)}
                            disabled={!idFile}
                            className="w-full py-4 bg-gold-gradient text-brand-bg rounded-xl font-bold text-xs uppercase tracking-[0.2em]
                         disabled:opacity-40 hover:opacity-95 active:scale-[0.98] transition-all shadow-gold-sm"
                        >
                            Continue to Biometrics →
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="bg-brand-panel/50 rounded-2xl p-4 border border-brand-border/40 text-center">
                            <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">Photo Requirements</p>
                            <p className="text-muted text-[10px] font-medium leading-relaxed">Ensure high lighting and hold your ID document clearly visible next to your face.</p>
                        </div>
                        <DropZone label="Biometric Hardware Selfie" file={selfie} onDrop={setSelfie} />
                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-4 border border-brand-border text-muted rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-white hover:bg-brand-panel transition-all"
                            >
                                ← Prev Step
                            </button>
                            <button
                                onClick={() => selfie && setStep(3)}
                                disabled={!selfie}
                                className="flex-[2] py-4 bg-gold-gradient text-brand-bg rounded-xl font-bold text-xs uppercase tracking-[0.2em]
                           disabled:opacity-40 hover:opacity-95 active:scale-[0.98] transition-all shadow-gold-sm"
                            >
                                Review Application →
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <p className="text-muted text-[10px] uppercase font-bold tracking-widest px-1">Final Submission Review</p>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center bg-brand-panel/40 rounded-xl p-4 border border-brand-border/30">
                                    <div>
                                        <p className="text-muted text-[9px] uppercase font-bold tracking-widest mb-0.5">Asset 01</p>
                                        <span className="text-white text-xs font-bold">{idFile?.name}</span>
                                    </div>
                                    <span className="text-up font-bold text-xs uppercase">Uploaded</span>
                                </div>
                                <div className="flex justify-between items-center bg-brand-panel/40 rounded-xl p-4 border border-brand-border/30">
                                    <div>
                                        <p className="text-muted text-[9px] uppercase font-bold tracking-widest mb-0.5">Asset 02</p>
                                        <span className="text-white text-xs font-bold">{selfie?.name}</span>
                                    </div>
                                    <span className="text-up font-bold text-xs uppercase">Uploaded</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 py-4 border border-brand-border text-muted rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-white hover:bg-brand-panel transition-all"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-[2] py-4 bg-gold-gradient text-brand-bg rounded-xl font-bold text-xs uppercase tracking-[0.2em]
                           disabled:opacity-50 hover:opacity-95 active:scale-[0.98] transition-all shadow-gold-sm"
                            >
                                {loading ? 'SUBMITTING PROTOCOL...' : 'EXECUTE CLEARANCE'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
