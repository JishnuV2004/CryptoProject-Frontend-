import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { assetAPI } from '../../services/api'
import { formatDate } from '../../utils/format'

export default function AdminAssets() {
    const [assets, setAssets] = useState([])
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editingAsset, setEditingAsset] = useState(null)

    const [form, setForm] = useState({
        symbol: '',
        name: '',
        precision: 8
    })

    useEffect(() => {
        loadAssets()
    }, [])

    const loadAssets = async () => {
        try {
            setLoading(true)
            const res = await assetAPI.getAssets()
            setAssets(res.data || res || [])
        } catch (err) {
            toast.error(err || 'Failed to load assets')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.symbol || !form.name) return toast.error('Symbol and Name are required')

        try {
            setLoading(true)
            if (editingAsset) {
                await assetAPI.updateAsset(editingAsset.ID || editingAsset.id, {
                    symbol: form.symbol.toUpperCase(),
                    name: form.name,
                    precision: parseInt(form.precision || 8, 10)
                })
                toast.success('Asset updated successfully')
            } else {
                await assetAPI.createAsset({
                    symbol: form.symbol.toUpperCase(),
                    name: form.name,
                    precision: parseInt(form.precision || 8, 10)
                })
                toast.success('Asset created successfully')
            }
            setShowModal(false)
            setEditingAsset(null)
            setForm({ symbol: '', name: '', precision: 8 })
            loadAssets()
        } catch (err) {
            toast.error(err || 'Failed to save asset')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async (asset) => {
        const newStatus = (asset.Status || asset.status) === 'active' ? 'inactive' : 'active'
        try {
            setLoading(true)
            await assetAPI.updateStatus(asset.ID || asset.id, { status: newStatus })
            toast.success(`Asset marked as ${newStatus}`)
            loadAssets()
        } catch (err) {
            toast.error(err || 'Failed to update status')
        } finally {
            setLoading(false)
        }
    }

    const openCreate = () => {
        setEditingAsset(null)
        setForm({ symbol: '', name: '', precision: 8 })
        setShowModal(true)
    }

    const openEdit = (asset) => {
        setEditingAsset(asset)
        setForm({
            symbol: asset.Symbol || asset.symbol || '',
            name: asset.Name || asset.name || '',
            precision: asset.Precision !== undefined ? asset.Precision : (asset.precision || 8)
        })
        setShowModal(true)
    }

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                    <h2 className="font-display text-4xl text-white tracking-[0.2em] mb-1">ASSET MANAGEMENT</h2>
                    <p className="text-muted text-[10px] uppercase font-bold tracking-[0.3em]">Supported Cryptocurrencies & Precisions</p>
                </div>
                <button
                    onClick={openCreate}
                    className="px-6 py-2.5 bg-gold-gradient text-brand-bg font-bold text-[10px] uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-gold-sm"
                >
                    + Add New Asset
                </button>
            </div>

            {/* Asset List Table */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel">
                <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/30 flex justify-between items-center">
                    <h3 className="font-display text-lg text-white tracking-widest uppercase">System Assets</h3>
                    <span className="text-muted text-xs font-mono">{assets.length} Assets Registered</span>
                </div>

                <div className="overflow-x-auto">
                    {assets.length > 0 ? (
                        <table className="w-full text-xs font-bold uppercase tracking-wider text-left">
                            <thead>
                                <tr className="h-10 bg-brand-panel/10 text-muted text-[9px] tracking-[0.2em]">
                                    <th className="px-6 py-2">Asset Symbol</th>
                                    <th className="px-6 py-2">Asset Name</th>
                                    <th className="px-6 py-2 text-center">Precision</th>
                                    <th className="px-6 py-2 text-center">Status</th>
                                    <th className="px-6 py-2 text-right">Created</th>
                                    <th className="px-6 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/40 font-mono text-[11px]">
                                {assets.map(a => (
                                    <tr key={a.ID || a.id} className="hover:bg-brand-panel/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold text-sm font-bold">
                                                    {(a.Symbol || a.symbol)?.[0]}
                                                </div>
                                                <span className="text-white font-bold text-sm tracking-tight">{a.Symbol || a.symbol}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted font-body">
                                            {a.Name || a.name}
                                        </td>
                                        <td className="px-6 py-4 text-center text-brand-gold font-bold">
                                            {a.Precision !== undefined ? a.Precision : a.precision}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleStatus(a)}
                                                className={`px-2.5 py-1 rounded-full text-[9px] border uppercase tracking-widest transition-all ${
                                                    (a.Status || a.status) === 'active' 
                                                    ? 'bg-up/10 text-up border-up/30 hover:bg-up/20' 
                                                    : 'bg-down/10 text-down border-down/30 hover:bg-down/20'
                                                }`}
                                            >
                                                {a.Status || a.status || 'inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right text-muted font-body">
                                            {formatDate(a.CreatedAt || a.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openEdit(a)}
                                                className="px-3 py-1.5 bg-brand-panel border border-brand-border text-white font-bold text-[10px] rounded-lg hover:border-brand-gold hover:text-brand-gold transition-all"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-muted font-body text-xs tracking-widest uppercase italic">
                            {loading ? 'Loading assets...' : 'No assets registered in the system'}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-brand-surface border border-brand-border rounded-3xl w-full max-w-md overflow-hidden shadow-gold-md">
                        <div className="p-6 border-b border-brand-border flex justify-between items-center">
                            <h3 className="font-display text-xl text-white tracking-widest uppercase">
                                {editingAsset ? 'Edit Asset' : 'Register New Asset'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-muted hover:text-white transition-colors text-lg">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest block">Asset Symbol</label>
                                    <input
                                        type="text"
                                        value={form.symbol}
                                        onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                                        disabled={Boolean(editingAsset)}
                                        placeholder="e.g. BTC, ETH, SOL"
                                        className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white placeholder-dim font-mono uppercase focus:border-brand-gold transition-colors disabled:opacity-50"
                                        required
                                    />
                                    {editingAsset && <p className="text-[9px] text-muted tracking-wide">Symbol cannot be changed after registration.</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest block">Asset Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Bitcoin, Ethereum, Solana"
                                        className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white placeholder-dim focus:border-brand-gold transition-colors"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest block">Precision (Decimal Places)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="18"
                                        value={form.precision}
                                        onChange={(e) => setForm({ ...form, precision: e.target.value })}
                                        placeholder="8"
                                        className="w-full bg-brand-panel border border-brand-border rounded-xl px-4 py-3 text-white placeholder-dim font-mono focus:border-brand-gold transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-gold-gradient text-brand-bg rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 shadow-gold-sm"
                            >
                                {loading ? 'Saving...' : (editingAsset ? 'Save Changes' : 'Register Asset')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
