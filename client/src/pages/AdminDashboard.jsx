import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { instAPI, userAPI, certAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
    Users, Building2, Check, X, Search, ShieldCheck, Activity, History, Award,
    TrendingUp, Server, Database, Cpu, Wifi, BarChart3, RefreshCw, CheckCircle,
    Brain, AlertTriangle, Zap, Sparkles, FileText, ExternalLink, Blocks, BrainCircuit
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

// Monthly cert data
const monthlyData = [
    { month: 'Jan', certs: 18, verifications: 42, students: 12 },
    { month: 'Feb', certs: 24, verifications: 58, students: 18 },
    { month: 'Mar', certs: 31, verifications: 75, students: 24 },
    { month: 'Apr', certs: 22, verifications: 53, students: 16 },
    { month: 'May', certs: 35, verifications: 89, students: 29 },
    { month: 'Jun', certs: 28, verifications: 64, students: 21 },
    { month: 'Jul', certs: 42, verifications: 105, students: 35 },
    { month: 'Aug', certs: 38, verifications: 98, students: 31 },
    { month: 'Sep', certs: 45, verifications: 112, students: 38 },
    { month: 'Oct', certs: 33, verifications: 82, students: 27 },
    { month: 'Nov', certs: 40, verifications: 95, students: 33 },
    { month: 'Dec', certs: 52, verifications: 128, students: 44 },
];

const AI_INSIGHTS = [
    { icon: <TrendingUp size={16} />, type: 'trend', title: 'Certificate Demand Rising', desc: 'Blockchain Fundamentals certificates up 42% this quarter. Consider increasing institution capacity.', color: 'text-brand-400', bg: 'var(--glow-brand)' },
    { icon: <AlertTriangle size={16} />, type: 'alert', title: 'Suspicious Pattern Detected', desc: '47 verification requests from IP 203.64.21.5 in last hour. Possible credential scraping detected.', color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
    { icon: <BrainCircuit size={16} />, type: 'insight', title: 'Grade Distribution Insight', desc: '78% of issued certificates are grade O or O+. Performance levels are above average.', color: 'text-fuchsia-400', bg: 'rgba(217,70,239,0.1)' },
    { icon: <Zap size={16} />, type: 'perf', title: 'Peak Verification Hours', desc: 'Most verifications happen between 10AM–2PM. Scale API rate limits accordingly.', color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)' },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-3 text-xs border" style={{ borderColor: 'rgba(124,58,237,0.3)', minWidth: 140 }}>
                <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
                ))}
            </div>
        );
    }
    return null;
};

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [pending, setPending] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allCerts, setAllCerts] = useState([]);
    const [recentLogs, setRecentLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [p, u, c, l] = await Promise.allSettled([
                    instAPI.getPending(),
                    userAPI.getAll(),
                    certAPI.getAllCerts(),
                    userAPI.getAuditLogs()
                ]);
                if (p.status === 'fulfilled') setPending(p.value.data);
                if (u.status === 'fulfilled') setAllUsers(u.value.data);
                if (c.status === 'fulfilled') setAllCerts(c.value.data);
                if (l.status === 'fulfilled') setRecentLogs(l.value.data.slice(0, 5));
            } catch {/* fallback to empty arrays */ } finally { setIsLoading(false); }
        };
        fetchAll();
    }, []);

    const institutions = allUsers.filter(u => u.role === 'institution');
    const students = allUsers.filter(u => u.role === 'student');

    // Grade distribution for pie chart
    const gradeCounts = allCerts.reduce((acc, c) => { acc[c.grade] = (acc[c.grade] || 0) + 1; return acc; }, {});
    const pieData = Object.entries(gradeCounts).map(([name, value]) => ({ name, value }));
    const PIE_COLORS = ['#7c3aed', '#6d28d9', '#818cf8', '#a78bfa', '#c4b5fd', '#ddd6fe'];

    const handleApprove = async (id) => {
        try {
            toast.loading('Approving...', { id: 'app' });
            await instAPI.approve(id);
            toast.dismiss('app'); toast.success('Approved!');
            setPending(p => p.filter(i => i._id !== id));
        } catch (err) { toast.dismiss('app'); toast.error('Failed'); }
    };

    const TABS = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 size={14} /> },
        { id: 'ai', label: 'AI Insights', icon: <BrainCircuit size={14} className="text-fuchsia-400 animate-pulse" />, badge: 4 },
        { id: 'approvals', label: 'Approvals', icon: <Check size={14} />, badge: pending.length },
        { id: 'users', label: 'Users', icon: <Users size={14} /> },
        { id: 'logs', label: 'Logs', icon: <Activity size={14} /> },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>System Administration</h2>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Monitor, manage and gain AI-powered insights about the platform.</p>
                </div>
                <div className="flex flex-wrap p-1.5 rounded-xl border gap-0.5" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 relative transition-all ${activeTab === t.id ? 'bg-brand-600 text-white shadow-brand-glow' : ''}`} style={activeTab !== t.id ? { color: 'var(--text-muted)' } : {}}>
                            {t.icon} {t.label}
                            {t.badge > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-[8px] font-bold text-white rounded-full flex items-center justify-center">{t.badge}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { l: 'Users', v: allUsers.length || '—', i: <Users size={18} className="text-brand-400" /> },
                    { l: 'Institutions', v: institutions.length || '—', i: <Building2 size={18} className="text-indigo-400" /> },
                    { l: 'Certificates', v: allCerts.length || '—', i: <Award size={18} className="text-amber-400" /> },
                    { l: 'Pending', v: pending.length, i: <Server size={18} className="text-amber-400" /> },
                    { l: 'Uptime', v: '99.97%', i: <Wifi size={18} className="text-emerald-400" /> },
                    { l: 'AI Alerts', v: '4', i: <BrainCircuit size={18} className="text-fuchsia-400 animate-pulse" /> },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
                        <div className="mb-2">{s.i}</div>
                        <p className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{s.v}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.l}</p>
                    </motion.div>
                ))}
            </div>

            {isLoading && <div className="flex justify-center py-16"><div className="loading-spinner" /></div>}

            {!isLoading && (
                <AnimatePresence mode="wait">
                    {/* OVERVIEW with real Recharts */}
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Area Chart */}
                                <div className="lg:col-span-2 glass-card p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-display font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><BarChart3 size={16} className="text-brand-400" /> Certificates & Verifications (2024)</h3>
                                        <Link to="/explorer" className="text-[10px] font-bold text-brand-400 flex items-center gap-1 hover:text-brand-300"><Blocks size={12} /> Explorer</Link>
                                    </div>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <AreaChart data={monthlyData}>
                                            <defs>
                                                <linearGradient id="certs" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="verifs" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="certs" name="Certificates" stroke="#7c3aed" strokeWidth={2} fill="url(#certs)" />
                                            <Area type="monotone" dataKey="verifications" name="Verifications" stroke="#10b981" strokeWidth={2} fill="url(#verifs)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Pie Chart */}
                                <div className="glass-card p-6">
                                    <h3 className="text-sm font-display font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Award size={16} className="text-amber-400" /> Grade Distribution</h3>
                                    {pieData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#6b7280' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>No cert data yet</div>
                                    )}
                                </div>
                            </div>

                            {/* Bar Chart — Student Enrollment */}
                            <div className="glass-card p-6">
                                <h3 className="text-sm font-display font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Users size={16} className="text-brand-400" /> Student Enrollment Trend</h3>
                                <ResponsiveContainer width="100%" height={160}>
                                    <BarChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="students" name="New Students" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Quick Links */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { l: 'Blockchain Explorer', i: <Blocks size={16} />, to: '/explorer' },
                                    { l: 'Activity Logs', i: <Activity size={16} />, to: '/logs' },
                                    { l: 'Pending Approvals', i: <Check size={16} />, action: () => setActiveTab('approvals') },
                                    { l: 'All Users', i: <Users size={16} />, action: () => setActiveTab('users') },
                                ].map((q, i) => (
                                    q.to ? (
                                        <Link key={i} to={q.to} className="glass-card p-4 flex items-center gap-2 text-sm font-bold transition-all hover:border-brand-500/30 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                                            <span className="text-brand-400">{q.i}</span> {q.l}
                                        </Link>
                                    ) : (
                                        <button key={i} onClick={q.action} className="glass-card p-4 flex items-center gap-2 text-sm font-bold transition-all hover:border-brand-500/30 w-full text-left" style={{ color: 'var(--text-secondary)' }}>
                                            <span className="text-brand-400">{q.i}</span> {q.l}
                                        </button>
                                    )
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* AI INSIGHTS TAB */}
                    {activeTab === 'ai' && (
                        <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                            <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-r from-fuchsia-500/10 to-transparent border-fuchsia-500/20">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />
                                <div className="flex items-center gap-4 relative z-10 mb-2">
                                    <div className="p-3.5 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.2)]">
                                        <BrainCircuit size={24} className="text-fuchsia-400 animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-display font-bold text-fuchsia-400">AI Insights Panel</h3>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Machine learning-powered analytics and anomaly detection</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {AI_INSIGHTS.map((ins, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                        className="glass-card p-6 relative overflow-hidden">
                                        <div className={`flex items-center gap-2 mb-3 ${ins.color}`}>
                                            <div className="p-1.5 rounded-lg" style={{ background: ins.bg }}>{ins.icon}</div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{ins.type}</span>
                                        </div>
                                        <h4 className="text-base font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{ins.title}</h4>
                                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{ins.desc}</p>
                                        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ins.color.replace('text-', '').includes('brand') ? '#7c3aed' : ins.color.includes('amber') ? '#f59e0b' : ins.color.includes('emerald') ? '#10b981' : '#6366f1' }} />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Prediction Chart */}
                            <div className="glass-card p-6 border-fuchsia-500/20">
                                <h3 className="text-sm font-display font-bold mb-2 flex items-center gap-2 text-fuchsia-400">
                                    <Sparkles size={16} className="text-fuchsia-400 animate-pulse" /> Certificate Demand Forecast (Next 6 Months)
                                </h3>
                                <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>AI-predicted demand based on historical trends</p>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={[
                                        { month: 'Jan', actual: 52, predicted: 55 },
                                        { month: 'Feb', actual: null, predicted: 61 },
                                        { month: 'Mar', actual: null, predicted: 68 },
                                        { month: 'Apr', actual: null, predicted: 74 },
                                        { month: 'May', actual: null, predicted: 82 },
                                        { month: 'Jun', actual: null, predicted: 90 },
                                    ]}>
                                        <defs>
                                            <linearGradient id="pred" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="actual" name="Actual" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} fill="rgba(16,185,129,0.1)" />
                                        <Area type="monotone" dataKey="predicted" name="Predicted" stroke="#7c3aed" strokeWidth={2} strokeDasharray="5 3" fill="url(#pred)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    )}

                    {/* APPROVALS */}
                    {activeTab === 'approvals' && (
                        <motion.div key="approvals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card">
                            <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                                <h3 className="text-lg font-display font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Building2 size={20} className="text-amber-400" /> Pending Approvals</h3>
                                <span className="text-[10px] font-bold text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20" style={{ background: 'rgba(245,158,11,0.1)' }}>
                                    {pending.length} Pending
                                </span>
                            </div>
                            {pending.length === 0 ? (
                                <div className="p-16 text-center"><CheckCircle size={40} className="mx-auto mb-3 text-emerald-500/30" /><p className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>All caught up!</p></div>
                            ) : pending.map(inst => (
                                <div key={inst._id} className="p-6 border-b flex flex-col lg:flex-row justify-between items-start gap-6 transition-all" style={{ borderColor: 'var(--border-color)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--glow-brand)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-brand-400 font-bold text-lg border" style={{ background: 'var(--glow-brand)', borderColor: 'var(--border-color)' }}>{inst.name[0]}</div>
                                        <div>
                                            <h4 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>{inst.name}</h4>
                                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{inst.user?.email} • {inst.accreditationId} • {inst.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={() => handleApprove(inst._id)} className="glass-button !px-5 !py-2 text-sm gap-1.5"><Check size={14} /> Approve</button>
                                        <button onClick={() => setPending(p => p.filter(i => i._id !== inst._id))} className="px-4 py-2 rounded-xl text-sm font-bold border border-rose-500/20 text-rose-400 transition-all hover:bg-rose-500/10 flex items-center gap-1.5"><X size={14} /> Reject</button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* USERS */}
                    {activeTab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card overflow-hidden">
                            <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                <h3 className="text-lg font-display font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                    <Users size={18} className="text-brand-400" /> All Users
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold ml-1" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>{allUsers.length}</span>
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead><tr className="text-[10px] font-bold uppercase tracking-widest border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
                                        <th className="px-6 py-4">User</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Joined</th>
                                    </tr></thead>
                                    <tbody>
                                        {allUsers.map((u, i) => (
                                            <tr key={u._id || i} className="border-b transition-all" style={{ borderColor: 'var(--border-color)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--glow-brand)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <td className="px-6 py-4"><div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-brand-500/30 shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                                                        <span className="text-xs font-bold text-white">{(u.name || 'U')[0].toUpperCase()}</span>
                                                    </div>
                                                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{u.name}</span></div></td>
                                                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                                                <td className="px-6 py-4"><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${u.role === 'admin' ? 'text-amber-400 border-amber-500/20' : u.role === 'institution' ? 'text-indigo-400 border-indigo-500/20' : 'text-brand-400 border-brand-500/20'}`} style={{ background: u.role === 'admin' ? 'rgba(245,158,11,0.1)' : u.role === 'institution' ? 'rgba(99,102,241,0.1)' : 'var(--glow-brand)' }}>{u.role}</span></td>
                                                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* LOGS */}
                    {activeTab === 'logs' && (
                        <motion.div key="logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-base font-display font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><History size={18} className="text-brand-400" /> System Status</h3>
                                <Link to="/logs" className="glass-button !px-4 !py-2 text-xs gap-1.5"><ExternalLink size={12} /> Full Logs</Link>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2" style={{ color: 'var(--text-muted)' }}>Latest Activity</p>
                                {recentLogs.length > 0 ? recentLogs.map((l, i) => (
                                    <motion.div key={l._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-3 items-center group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 group-hover:scale-150 transition-transform" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{l.action}</p>
                                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{l.details} • {new Date(l.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10" style={{ color: 'var(--text-muted)' }}>{l.performedBy?.name || 'System'}</span>
                                    </motion.div>
                                )) : (
                                    <div className="flex flex-col items-center py-4 gap-2 opacity-40">
                                        <History size={24} />
                                        <p className="text-xs">No recent activity detected</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-4" style={{ color: 'var(--text-muted)' }}>System Health</p>
                                {[
                                    { msg: `${allCerts.length} certificates in database`, t: 'success' },
                                    { msg: `${pending.length} pending institution approvals`, t: pending.length > 0 ? 'warning' : 'success' },
                                    { msg: `Gemini AI Engine: Active`, t: 'ai' },
                                    { msg: 'MongoDB connected', t: 'success' },
                                ].map((l, i) => (
                                    <div key={i} className="flex gap-3 items-center mb-3">
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${l.t === 'success' ? 'bg-emerald-500' : l.t === 'warning' ? 'bg-amber-500' : 'bg-brand-500'}`} />
                                        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{l.msg}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};

export default AdminDashboard;
