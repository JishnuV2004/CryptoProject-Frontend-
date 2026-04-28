import { useState } from 'react'
import { formatINR, formatDate } from '../../utils/format'

const DUMMY_USERS = [
    { id: '1', name: 'Alice Smith', email: 'alice@example.com', balance: 450000 },
    { id: '2', name: 'Bob Jones', email: 'bob@example.com', balance: 120000 },
]

const DUMMY_TXS = [
    { id: 'TX-101', type: 'DEPOSIT', amount: 500000, date: new Date().toISOString(), status: 'COMPLETED' },
    { id: 'TX-102', type: 'WITHDRAWAL', amount: -50000, date: new Date(Date.now() - 86400000).toISOString(), status: 'COMPLETED' },
]

export default function AdminWallets() {
    const [selectedUser, setSelectedUser] = useState(null)

    return (
        <div className="space-y-8 animate-fade-up">
            <div>
                <h2 className="font-display text-4xl text-white tracking-[0.2em] mb-1">USER WALLETS</h2>
                <p className="text-muted text-[10px] uppercase font-bold tracking-[0.3em]">Financial Oversight & Transactions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User List */}
                <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel lg:col-span-1">
                    <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/30">
                        <h3 className="font-display text-lg text-white tracking-widest uppercase">Client Balances</h3>
                    </div>
                    <div className="divide-y divide-brand-border/40">
                        {DUMMY_USERS.map(u => (
                            <button 
                                key={u.id}
                                onClick={() => setSelectedUser(u)}
                                className={`w-full text-left px-6 py-4 transition-colors hover:bg-brand-panel/40 ${selectedUser?.id === u.id ? 'bg-brand-panel/60 border-l-2 border-brand-gold' : ''}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-white font-bold text-xs uppercase tracking-wider">{u.name}</p>
                                        <p className="text-muted text-[10px] font-mono lowercase tracking-normal">{u.email}</p>
                                    </div>
                                    <p className="text-brand-gold font-mono font-bold text-sm">{formatINR(u.balance)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transactions */}
                <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-panel lg:col-span-2 flex flex-col min-h-[400px]">
                    <div className="px-6 py-4 border-b border-brand-border bg-brand-panel/30">
                        <h3 className="font-display text-lg text-white tracking-widest uppercase">
                            {selectedUser ? `Transactions: ${selectedUser.name}` : 'Select a user'}
                        </h3>
                    </div>
                    {selectedUser ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="h-10 bg-brand-panel/10 text-muted text-[9px] uppercase tracking-[0.2em] font-bold">
                                        <th className="px-6 py-2 text-left">TXID</th>
                                        <th className="px-6 py-2 text-left">Type</th>
                                        <th className="px-6 py-2 text-right">Amount</th>
                                        <th className="px-6 py-2 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border/40 font-bold uppercase tracking-tighter text-[10px]">
                                    {DUMMY_TXS.map(tx => (
                                        <tr key={tx.id} className="hover:bg-brand-panel/40 transition-colors">
                                            <td className="px-6 py-4 text-muted font-mono">{tx.id}</td>
                                            <td className="px-6 py-4">
                                                <span className={tx.type === 'DEPOSIT' ? 'text-up' : 'text-down'}>{tx.type}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-white">{formatINR(tx.amount)}</td>
                                            <td className="px-6 py-4 text-right text-muted font-mono">{formatDate(tx.date)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted font-bold tracking-widest uppercase text-xs italic">
                            Select a user from the list to view their transactions.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
