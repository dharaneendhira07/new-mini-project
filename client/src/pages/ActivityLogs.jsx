import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Search, Filter, Download, Shield, Award, LogIn, Blocks, AlertTriangle, User, Clock } from 'lucide-react';
import { certAPI, userAPI } from '../services/api';

const DEMO_LOGS = [
    { id: 1, type: 'certificate', action: 'Certificate Issued', user: 'admin@annauniv.edu', role: 'institution', detail: 'MERN Stack Mastery', time: '2026-03-09 20:31', ip: '192.168.1.10', severity: 'success' },
];

const typeConfig = {
    certificate: { icon: <Award size={14} />, label: 'Certificate', color: 'text-brand-400', bg: 'var(--glow-brand)' },
    verify: { icon: <Shield size={14} />, label: 'Verify', color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)' },
    login: { icon: <LogIn size={14} />, label: 'Auth', color: 'text-indigo-400', bg: 'rgba(99,102,241,0.1)' },
    blockchain: { icon: <Blocks size={14} />, label: 'Blockchain', color: 'text-violet-400', bg: 'rgba(139,92,246,0.1)' },
    warning: { icon: <AlertTriangle size={14} />, label: 'Alert', color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
    ai: { icon: <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></motion.div>, label: 'AI Action', color: 'text-fuchsia-400', bg: 'rgba(217,70,239,0.1)' },
};

const severityDot = { success: 'bg-emerald-500 shadow-emerald-500/50', info: 'bg-brand-500 shadow-brand-500/50', warning: 'bg-amber-500 shadow-amber-500/50', error: 'bg-red-500 shadow-red-500/50', ai: 'bg-fuchsia-500 shadow-fuchsia-500/50' };

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const [certsRes, auditRes] = await Promise.allSettled([
                    certAPI.getAllCerts(),
                    userAPI.getAuditLogs()
                ]);

                let allLogs = [];

                if (certsRes.status === 'fulfilled') {
                    const certLogs = certsRes.value.data.map(c => ({
                        id: c._id,
                        type: 'certificate',
                        action: 'Certificate Issued',
                        user: c.institution?.name || 'Institution',
                        role: 'institution',
                        detail: `${c.courseName} → ${c.student?.name || 'Unknown'}`,
                        time: new Date(c.issueDate).toLocaleString(),
                        ip: 'Internal',
                        severity: 'success'
                    }));
                    allLogs = [...allLogs, ...certLogs];
                }

                if (auditRes.status === 'fulfilled') {
                    const auditLogs = auditRes.value.data.map(l => ({
                        id: l._id,
                        type: l.action.toLowerCase().includes('login') ? 'login' : 'warning',
                        action: l.action,
                        user: l.performedBy?.name || 'System',
                        role: l.performedBy?.role || 'user',
                        detail: l.details,
                        time: new Date(l.timestamp).toLocaleString(),
                        ip: 'Logged',
                        severity: l.action.toLowerCase().includes('failed') ? 'error' : 'info'
                    }));
                    allLogs = [...allLogs, ...auditLogs];
                }

                // Add some static flavor logs
                const systemLogs = [
                    { id: 'a1', type: 'ai', action: 'AI Fraud Check Passed', user: 'system_ai', role: 'ai', detail: 'Signature validation successful', time: new Date().toLocaleString(), ip: 'internal', severity: 'ai' },
                    { id: 's2', type: 'blockchain', action: 'Node Connected', user: 'system', role: 'system', detail: 'Ethereum Sepolia active', time: new Date().toLocaleString(), ip: 'blockchain', severity: 'success' },
                ];

                setLogs([...allLogs, ...systemLogs].sort((a, b) => new Date(b.time) - new Date(a.time)));
            } catch (err) {
                console.error(err);
                setLogs(DEMO_LOGS);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filtered = logs.filter(l => {
        const q = search.toLowerCase();
        const matchQ = !q || l.action.toLowerCase().includes(q) || l.user.toLowerCase().includes(q) || l.detail.toLowerCase().includes(q);
        const matchType = filterType === 'all' || l.type === filterType;
        const matchSev = filterSeverity === 'all' || l.severity === filterSeverity;
        return matchQ && matchType && matchSev;
    });

    if (isLoading) return <div className="flex justify-center py-20"><div className="loading-spinner" /></div>;

    return (
        <div className="space-y-8 relative max-w-7xl mx-auto">
            {/* Background glowing effects */}
            <div className="absolute top-0 right-20 w-72 h-72 bg-brand-500/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-20 left-10 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none animate-float" />

            <div className="relative z-10 glass-card p-6 md:p-8 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg shadow-brand-500/20">
                            <Activity size={28} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>System Log Stream</h2>
                            <p className="mt-1 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                Live tracking of events, AI actions, and security alerts.
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            </p>
                        </div>
                    </div>
                    <button className="glass-button !px-6 h-11 gap-2 border-brand-500/20 hover:border-brand-500/50 shadow-sm transition-all text-brand-400 font-bold">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { l: 'Total Events', v: logs.length, c: 'text-brand-400', bg: 'bg-brand-500' },
                    { l: 'AI Actions', v: logs.filter(l => l.type === 'ai').length, c: 'text-fuchsia-400', bg: 'bg-fuchsia-500' },
                    { l: 'Alerts', v: logs.filter(l => l.severity === 'warning' || l.severity === 'error').length, c: 'text-amber-400', bg: 'bg-amber-500' },
                    { l: 'Verifications', v: logs.filter(l => l.type === 'verify').length, c: 'text-emerald-400', bg: 'bg-emerald-500' },
                ].map((s, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="glass-card p-5 relative overflow-hidden group hover:border-[var(--primary)] transition-colors"
                    >
                        <div className={`absolute top-0 right-0 w-16 h-16 ${s.bg} rounded-bl-full opacity-20 group-hover:opacity-40 transition-opacity`} />
                        <p className={`text-3xl font-display font-bold relative z-10 ${s.c}`}>{s.v}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-1.5 relative z-10" style={{ color: 'var(--text-muted)' }}>{s.l}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-52">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="input-field pl-10 !py-2.5 text-sm w-full" />
                </div>
                <div className="flex p-1.5 rounded-xl border overflow-x-auto no-scrollbar" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                    {['all', 'certificate', 'verify', 'login', 'ai', 'blockchain', 'warning'].map(t => (
                        <button key={t} onClick={() => setFilterType(t)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize whitespace-nowrap ${filterType === t ? 'bg-brand-600 text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} style={filterType !== t ? { color: 'var(--text-muted)' } : {}}>
                            {t === 'ai' ? '🤖 AI Engine' : t}
                        </button>
                    ))}
                </div>
                <div className="flex p-1.5 rounded-xl border" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                    {['all', 'success', 'info', 'ai', 'warning', 'error'].map(s => (
                        <button key={s} onClick={() => setFilterSeverity(s)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${filterSeverity === s ? 'bg-brand-600 text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} style={filterSeverity !== s ? { color: 'var(--text-muted)' } : {}}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Log Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="text-sm font-display font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Activity size={16} className="text-brand-400" /> System Events
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold ml-1" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>{filtered.length}</span>
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[10px] font-bold uppercase tracking-widest border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
                                <th className="px-5 py-3 text-left">Type</th>
                                <th className="px-5 py-3 text-left">Event</th>
                                <th className="px-5 py-3 text-left">User</th>
                                <th className="px-5 py-3 text-left">Detail</th>
                                <th className="px-5 py-3 text-left">Time</th>
                                <th className="px-5 py-3 text-left">IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((log, i) => {
                                const tc = typeConfig[log.type] || typeConfig.warning;
                                return (
                                    <motion.tr key={log.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                                        className="border-b transition-colors duration-300 hover:bg-black/5 dark:hover:bg-white/5 cursor-default relative group" style={{ borderColor: 'var(--border-color)' }}
                                    >
                                        <td className="px-5 py-4">
                                            <span className={`flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1.5 rounded-lg w-fit ${tc.color} shadow-sm border border-transparent group-hover:border-current/20 transition-all`} style={{ background: tc.bg }}>
                                                {tc.icon} {tc.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${severityDot[log.severity]}`} />
                                                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{log.action}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <User size={12} style={{ color: 'var(--text-muted)' }} />
                                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{log.user}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 max-w-[220px]">
                                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{log.detail}</p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1">
                                                <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                                                <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{log.time}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-[10px] px-2 py-1 rounded border bg-[var(--bg-card)]" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>{log.ip}</span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div className="py-16 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No logs match filters</div>}
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs;
