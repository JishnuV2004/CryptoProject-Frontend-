import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function AdminConfig() {
    const [config, setConfig] = useState({
        maintenanceMode: false,
        tradingFeePercent: '0.1',
        withdrawalFeeInr: '50',
        minWithdrawal: '1000'
    })

    const handleSave = (e) => {
        e.preventDefault()
        toast.success('Web Configuration Updated (dummy action)')
    }

    return (
        <div className="space-y-8 animate-fade-up">
            <div>
                <h2 className="font-display text-4xl text-white tracking-[0.2em] mb-1">WEB CONFIGURATION</h2>
                <p className="text-muted text-[10px] uppercase font-bold tracking-[0.3em]">Platform Settings & Fees</p>
            </div>

            <div className="max-w-2xl bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-panel">
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Maintenance Mode Toggle */}
                    <div className="flex items-center justify-between p-4 bg-brand-panel/30 border border-brand-border/50 rounded-xl">
                        <div>
                            <p className="text-white font-bold text-sm tracking-widest uppercase">Maintenance Mode</p>
                            <p className="text-muted text-xs">Disable trading and deposits for all users.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={config.maintenanceMode}
                                onChange={(e) => setConfig({...config, maintenanceMode: e.target.checked})}
                            />
                            <div className="w-11 h-6 bg-brand-panel peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-muted after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-brand-bg border border-brand-border"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Trading Fee (%)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={config.tradingFeePercent}
                                onChange={(e) => setConfig({...config, tradingFeePercent: e.target.value})}
                                className="w-full bg-brand-panel border border-brand-border rounded-lg px-4 py-3 text-white text-sm" 
                            />
                        </div>
                        <div>
                            <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Withdrawal Fee (INR)</label>
                            <input 
                                type="number" 
                                value={config.withdrawalFeeInr}
                                onChange={(e) => setConfig({...config, withdrawalFeeInr: e.target.value})}
                                className="w-full bg-brand-panel border border-brand-border rounded-lg px-4 py-3 text-white text-sm" 
                            />
                        </div>
                        <div>
                            <label className="text-muted text-[10px] uppercase font-bold mb-1 block tracking-widest">Min Withdrawal (INR)</label>
                            <input 
                                type="number" 
                                value={config.minWithdrawal}
                                onChange={(e) => setConfig({...config, minWithdrawal: e.target.value})}
                                className="w-full bg-brand-panel border border-brand-border rounded-lg px-4 py-3 text-white text-sm" 
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-brand-border/50">
                        <button type="submit" className="px-8 py-3 bg-brand-gold text-brand-bg font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-gold-md transition-all active:scale-[0.98]">
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
