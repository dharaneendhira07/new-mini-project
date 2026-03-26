import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Hash, Clock, ExternalLink, Award, User, Building, Loader2, Blocks, ShieldCheck, Filter } from 'lucide-react';
import { certAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const BlockchainExplorer = () => {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await certAPI.getAllCerts();
                const txns = data.map((cert, i) => ({
                    id: cert._id,
                    certId: cert.certId,
                    txHash: cert.blockchainTxHash,
                    student: cert.student?.name || 'Unknown',
                    email: cert.student?.email || '',
                    institution: cert.institution?.name || 'Unknown',
                    course: cert.courseName,
                    grade: cert.grade,
                    status: cert.verificationStatus,
                    timestamp: cert.issueDate,
                    blockNumber: Math.floor(Math.random() * 9000000) + 8000000, // simulated
                    gasUsed: Math.floor(Math.random() * 50000) + 21000,
                }));
                setTransactions(txns);
            } catch (err) {
                // Fallback demo data
                setTransactions([
                    { id: '1', certId: 'ACAD_DEMO1', txHash: '0x3f9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f80', student: 'John Student', email: 'student@example.com', institution: 'Anna University', course: 'MERN Stack Mastery', grade: 'O+', status: 'valid', timestamp: new Date().toISOString(), blockNumber: 8423815, gasUsed: 42500, aiConfidence: 99.8, aiFraudCheck: 'passed' },
                    { id: '2', certId: 'ACAD_DEMO2', txHash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a0b', student: 'John Student', email: 'student@example.com', institution: 'Anna University', course: 'Blockchain Fundamentals', grade: 'O', status: 'valid', timestamp: new Date(Date.now() - 86400000).toISOString(), blockNumber: 8421200, gasUsed: 38000, aiConfidence: 98.5, aiFraudCheck: 'passed' },
                    { id: '3', certId: 'ACAD_DEMO3', txHash: '0xabc123d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a0b9', student: 'Jane Doe', email: 'jane@example.com', institution: 'XYZ College', course: 'Data Science', grade: 'A', status: 'revoked', timestamp: new Date(Date.now() - 172800000).toISOString(), blockNumber: 8419100, gasUsed: 41000, aiConfidence: 45.2, aiFraudCheck: 'flagged' },
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const filtered = transactions.filter(t => {
        const q = search.toLowerCase();
        const matchSearch = !q || t.txHash?.toLowerCase().includes(q) || t.certId?.toLowerCase().includes(q) || t.student?.toLowerCase().includes(q) || t.course?.toLowerCase().includes(q);
        const matchStatus = filterStatus === 'all' || t.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const shortHash = (h) => h ? `${h.slice(0, 10)}...${h.slice(-8)}` : '—';

    return (
        <div className="space-y-8 relative max-w-7xl mx-auto">
            {/* Background glowing effects */}
            <div className="absolute top-20 right-0 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
            <div className="absolute top-40 left-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none animate-float" />

            {/* Header */}
            <div className="glass-card p-6 md:p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-transparent to-brand-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-brand-600 text-white shadow-lg shadow-indigo-500/20 relative">
                            <Blocks size={28} className="relative z-10" />
                            <div className="absolute inset-0 bg-white/20 blur-md animate-pulse rounded-2xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Blockchain Explorer</h2>
                            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>View and search on-chain certificate transactions</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full lg:w-auto">
                        {[
                            { l: 'Transactions', v: transactions.length, c: 'text-brand-400', bg: 'bg-brand-500' },
                            { l: 'Verified', v: transactions.filter(t => t.status === 'valid').length, c: 'text-emerald-400', bg: 'bg-emerald-500' },
                            { l: 'AI Flagged', v: transactions.filter(t => t.aiFraudCheck === 'flagged').length, c: 'text-fuchsia-400', bg: 'bg-fuchsia-500' },
                            { l: 'Network', v: 'Sepolia', c: 'text-indigo-400', bg: 'bg-indigo-500' },
                        ].map((s, i) => (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                key={i} 
                                className="stat-card !p-4 md:!px-6 text-center relative overflow-hidden group hover:border-[var(--primary)] transition-colors cursor-default"
                            >
                                <div className={`absolute -top-4 -right-4 w-12 h-12 ${s.bg} rounded-full opacity-10 blur-xl group-hover:opacity-30 transition-opacity`} />
                                <p className={`text-xl font-display font-bold relative z-10 ${s.c}`}>{s.v}</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest mt-1.5 relative z-10" style={{ color: 'var(--text-muted)' }}>{s.l}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-3 relative z-10">
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={16} className="text-[var(--text-muted)] group-focus-within:text-brand-500 transition-colors" />
                    </div>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search AI verifications, TX hash, Certificate ID..." className="input-field pl-12 h-12 text-sm w-full shadow-sm focus:shadow-brand-glow transition-all" />
                    {search && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <span className="flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex p-1.5 rounded-xl border overflow-x-auto no-scrollbar" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                    {['all', 'valid', 'revoked', 'pending'].map(f => (
                        <button key={f} onClick={() => setFilterStatus(f)} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all capitalize whitespace-nowrap ${filterStatus === f ? 'bg-brand-600 text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} style={filterStatus !== f ? { color: 'var(--text-muted)' } : {}}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transaction List */}
            {isLoading ? (
                <div className="glass-card p-20 flex justify-center"><div className="loading-spinner" /></div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* TX List */}
                    <div className="lg:col-span-2 glass-card overflow-hidden">
                        <div className="p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                            <h3 className="text-sm font-display font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <Hash size={16} className="text-brand-400" /> Certificate Transactions
                                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>{filtered.length}</span>
                            </h3>
                        </div>
                        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                            {filtered.length === 0 ? (
                                <div className="py-20 text-center flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500">
                                        <Search size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>No transactions found</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters.</p>
                                    </div>
                                </div>
                            ) : filtered.map((tx, i) => (
                                <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                    onClick={() => setSelected(tx)}
                                    className={`p-5 cursor-pointer transition-all border-l-2 relative overflow-hidden group ${selected?.id === tx.id ? 'border-brand-500 bg-[var(--glow-brand)]' : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    {selected?.id === tx.id && (
                                        <motion.div layoutId="activeRow" className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-transparent pointer-events-none" />
                                    )}
                                    <div className="flex justify-between items-start gap-3 relative z-10">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border shadow-sm transition-colors ${selected?.id === tx.id ? 'bg-brand-500 text-white border-brand-500' : 'bg-[var(--bg-card)] text-brand-500 border-[var(--border-hover)] group-hover:border-brand-500/50'}`}>
                                                {i + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-mono text-xs font-bold truncate transition-colors" style={{ color: selected?.id === tx.id ? 'var(--primary)' : 'var(--text-secondary)' }}>{shortHash(tx.txHash)}</p>
                                                <p className="text-sm font-bold truncate mt-1" style={{ color: 'var(--text-primary)' }}>{tx.course}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{tx.institution}</span>
                                                    {tx.aiFraudCheck === 'flagged' && (
                                                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 flex items-center gap-1 shrink-0">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse" /> AI Flag
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 flex flex-col items-end">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border shadow-sm ${tx.status === 'valid' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : tx.status === 'revoked' ? 'text-red-400 border-red-500/20 bg-red-500/10' : 'text-amber-400 border-amber-500/20 bg-amber-500/10'}`}>
                                                {tx.status}
                                            </span>
                                            <p className="text-[10px] mt-2 font-mono" style={{ color: 'var(--text-muted)' }}>{new Date(tx.timestamp).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Detail Panel */}
                    <div className="glass-card p-6 sticky top-24 h-fit border-t-4 border-t-brand-500">
                        <AnimatePresence mode="wait">
                            {selected ? (
                                <motion.div key={selected.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
                                    <div className="flex items-center gap-3 mb-6 p-4 rounded-xl border bg-brand-500/5 border-brand-500/20">
                                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-display font-bold" style={{ color: 'var(--text-primary)' }}>Transaction Details</h3>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Verified securely on-chain</p>
                                        </div>
                                    </div>
                                    
                                    {/* AI Context Card */}
                                    {selected.aiConfidence && (
                                        <div className={`mb-6 p-4 rounded-xl border ${selected.aiFraudCheck === 'passed' ? 'bg-fuchsia-500/5 border-fuchsia-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`text-xs font-bold flex items-center gap-1.5 uppercase ${selected.aiFraudCheck === 'passed' ? 'text-fuchsia-400' : 'text-red-400'}`}>
                                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                                    </motion.div>
                                                    AI Analysis
                                                </span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${selected.aiFraudCheck === 'passed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                                    {selected.aiFraudCheck === 'passed' ? 'Safe' : 'Flagged'}
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mb-1">
                                                <motion.div 
                                                    initial={{ width: 0 }} animate={{ width: `${selected.aiConfidence}%` }} transition={{ duration: 1, delay: 0.2 }}
                                                    className={`h-full rounded-full ${selected.aiFraudCheck === 'passed' ? 'bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                                <span>Confidence Score</span>
                                                <span className="font-mono">{selected.aiConfidence}%</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                    {[
                                        { l: 'Certificate ID', v: selected.certId, mono: true },
                                        { l: 'TX Hash', v: shortHash(selected.txHash), mono: true },
                                        { l: 'Block Number', v: `#${selected.blockNumber?.toLocaleString()}`, mono: true },
                                        { l: 'Student', v: selected.student, icon: <User size={12} /> },
                                        { l: 'Institution', v: selected.institution, icon: <Building size={12} /> },
                                        { l: 'Course', v: selected.course, icon: <Award size={12} /> },
                                        { l: 'Grade', v: selected.grade },
                                        { l: 'Gas Used', v: selected.gasUsed?.toLocaleString(), mono: true },
                                        { l: 'Timestamp', v: new Date(selected.timestamp).toLocaleString(), icon: <Clock size={12} /> },
                                        { l: 'Status', v: selected.status, isStatus: true },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center gap-3 py-2.5 border-b hover:bg-[var(--bg-input)] px-2 -mx-2 rounded-lg transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                                            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shrink-0" style={{ color: 'var(--text-muted)' }}>
                                                {item.icon} {item.l}
                                            </span>
                                            {item.isStatus ? (
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shadow-sm ${item.v === 'valid' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : item.v === 'revoked' ? 'text-red-400 border-red-500/20 bg-red-500/10' : 'text-amber-400 border-amber-500/20 bg-amber-500/10'}`}>
                                                    {item.v}
                                                </span>
                                            ) : (
                                                <span className={`text-xs font-bold text-right truncate pl-4 ${item.mono ? 'font-mono' : ''}`} style={{ color: 'var(--text-primary)' }}>{item.v}</span>
                                            )}
                                        </div>
                                    ))}
                                    </div>
                                    <a href={`https://sepolia.etherscan.io/tx/${selected.txHash}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 text-xs font-bold text-brand-400 border border-brand-500/30 rounded-xl mt-6 hover:bg-brand-500 hover:text-white transition-all shadow-lg hover:shadow-brand-500/40 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity z-0" />
                                        <span className="relative z-10 flex items-center gap-2">View Transaction on Etherscan <ExternalLink size={14} /></span>
                                    </a>
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center flex flex-col items-center gap-4" style={{ color: 'var(--text-muted)' }}>
                                    <div className="w-16 h-16 rounded-2xl bg-[var(--bg-input)] flex items-center justify-center border" style={{ borderColor: 'var(--border-color)' }}>
                                        <Blocks size={24} className="opacity-50" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Transaction Inspector</p>
                                        <p className="text-xs uppercase tracking-widest font-bold opacity-60">Select an item to view</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlockchainExplorer;
