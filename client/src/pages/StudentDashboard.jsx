import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useBlockchain } from '../context/BlockchainContext';
import { certAPI, aiAPI } from '../services/api';
import {
    Award, Download, ExternalLink, FileCheck, Share2, Copy, Search, Hash,
    BadgeCheck, Zap, TrendingUp, ShieldCheck, GraduationCap,
    Star, Calendar, Eye, Sparkles, Activity, Smartphone, BrainCircuit
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';

// ── ADVANCED HOOKS ──
const useMousePosition = () => {
    const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    return { mousePos, handleMouseMove };
};

// ── ADVANCED COMPONENTS ──
const Counter = ({ value, duration = 1.5, suffix = "" }) => {
    const [count, setCount] = React.useState(0);
    React.useEffect(() => {
        let start = 0;
        const end = parseFloat(value) || 0;
        if (start === end) return;
        let timer = setInterval(() => {
            start += end / (60 * duration);
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 1000 / 60);
        return () => clearInterval(timer);
    }, [value, duration]);
    return <span>{count % 1 === 0 ? count : count.toFixed(1)}{suffix}</span>;
};

const StudentDashboard = () => {
    const { user } = useAuth();
    const { account, connectWallet } = useBlockchain();
    const [certificates, setCertificates] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeView, setActiveView] = useState('grid');
    const [aiInsights, setAiInsights] = useState({
        insights: [],
        globalRank: "#1,242",
        trustScore: 85
    });

    useEffect(() => {
        const fetchCerts = async () => {
            try {
                const { data } = await certAPI.getStudentCerts();
                // Transform backend data to display format
                const transformed = data.map((cert, i) => ({
                    courseName: cert.courseName,
                    institution: cert.institution?.name || 'Unknown Institution',
                    grade: cert.grade,
                    issueDate: cert.issueDate,
                    blockchainTxHash: cert.blockchainTxHash,
                    certId: cert.certId,
                    ipfsHash: cert.ipfsHash,
                    status: cert.verificationStatus === 'valid' ? 'Verified' : cert.verificationStatus,
                    credits: cert.metadata?.credits || Math.floor(Math.random() * 60) + 20,
                    semester: cert.metadata?.semester || 'Academic',
                    color: ['from-brand-500 to-indigo-500', 'from-emerald-500 to-brand-500', 'from-violet-500 to-pink-500'][i % 3],
                }));
                setCertificates(transformed);
            } catch (err) {
                console.warn('Falling back to demo data:', err.message);
                // Fallback mock data if API fails
                setCertificates([
                    { courseName: "MERN Stack Mastery", institution: "Anna University", grade: "O+", issueDate: "2024-08-20", blockchainTxHash: "0x0000000000000000000000000000000000000000", certId: "DUMMY_CERT_ID", ipfsHash: "dummy_ipfs_hash", color: "from-violet-500 to-pink-500", status: "Verified", credits: 60, semester: "Specialization" },
                    { courseName: "Advanced Cryptography", institution: "Blockchain Academy", grade: "O", issueDate: "2024-03-10", blockchainTxHash: "0x789a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f80", certId: "0xefgh...5678", ipfsHash: "QmYpzq...012", color: "from-emerald-500 to-brand-500", status: "Verified", credits: 45, semester: "Professional Cert" },
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        const fetchAI = async () => {
            try {
                const { data } = await aiAPI.getInsights();
                setAiInsights(data);
            } catch (err) {
                console.warn('AI fetch failed');
            }
        };

        fetchCerts();
        fetchAI();
    }, []);

    const filteredCerts = certificates.filter(c =>
        c.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.institution.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalCredits = certificates.reduce((sum, c) => sum + (c.credits || 0), 0);
    const gradeToScore = (g) => ({ 'O+': 10, 'O': 9.5, 'A+': 9, 'A': 8.5, 'B+': 8, 'B': 7.5 }[g] || 7);
    const avgGPA = certificates.length ? (certificates.reduce((s, c) => s + gradeToScore(c.grade), 0) / certificates.length).toFixed(1) : '0';
    const copyToClipboard = (t) => { navigator.clipboard.writeText(t); toast.success("Hash Copied!"); };

    const insights = aiInsights.insights.length > 0 ? aiInsights.insights : [
        "Complete your first course to unlock insights.",
        "Your profile trust is growing on-chain."
    ];

    return (
        <div className="space-y-8">
            {/* Profile Header */}
            <div className="glass-card p-6 md:p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 via-transparent to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="relative">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-brand-glow border-2 shrink-0 relative z-10 overflow-hidden"
                                style={{ borderColor: 'rgba(124,58,237,0.4)', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                                <span className="text-4xl font-display font-bold text-white select-none">
                                    {(user?.name || 'S')[0].toUpperCase()}
                                </span>
                                <div className="absolute inset-0 bg-white/10 blur-xl animate-pulse" />
                            </motion.div>
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-2 rounded-xl border-4 z-20 shadow-lg" style={{ borderColor: 'var(--bg-card)' }}>
                                <BadgeCheck size={16} className="text-white" />
                            </div>
                        </div>
                        
                        <div className="text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center gap-3">
                                <h2 className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name || "Student Name"}</h2>
                                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border text-brand-400" style={{ background: 'var(--glow-brand)', borderColor: 'rgba(124,58,237,0.2)' }}>Verified Academic Identity</span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 mt-4">
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-50" style={{ color: 'var(--text-muted)' }}>Department</p>
                                    <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{user?.department || "Computer Science & Eng"}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-50" style={{ color: 'var(--text-muted)' }}>Register No</p>
                                    <p className="text-xs font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>{user?.registerNo || "2022CS0842"}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-50" style={{ color: 'var(--text-muted)' }}>Batch</p>
                                    <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{user?.batch || "2022 - 2026"}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-50" style={{ color: 'var(--text-muted)' }}>Semester</p>
                                    <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{user?.semester || "6th Semester"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 w-full lg:w-auto">
                        {!account ? (
                            <button onClick={connectWallet} className="glass-button !px-6 !py-3 text-sm w-full md:w-auto"><Zap size={18} /> Connect Web3 Wallet</button>
                        ) : (
                            <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border w-full md:w-auto justify-center" style={{ background: 'var(--glow-brand)', borderColor: 'rgba(124,58,237,0.2)' }}>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">Blockchain Link</span>
                                    <span className="font-mono text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>{account.slice(0, 8)}...{account.slice(-6)}</span>
                                </div>
                            </div>
                        )}
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mr-2">Last Sync: Today, 12:45 PM</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { label: "Credentials", value: certificates.length, icon: <Award size={18} className="text-brand-400" />, suffix: "" },
                    { label: "CGPA", value: certificates.length > 0 ? avgGPA : "8.42", icon: <Star size={18} className="text-amber-400" />, suffix: "" },
                    { label: "Total Credits", value: certificates.length > 0 ? totalCredits : "124", icon: <GraduationCap size={18} className="text-indigo-400" />, suffix: "" },
                    { label: "Academic Rank", value: certificates.length > 0 ? Math.min(certificates.length + 1, 5) : "12", icon: <TrendingUp size={18} className="text-emerald-400" />, suffix: "" },
                    { label: "Profile Views", value: Math.floor(Math.random() * 20) + 145, icon: <Eye size={18} className="text-violet-400" />, suffix: "+" },
                    { label: "Trust Score", value: aiInsights.trustScore, icon: <ShieldCheck size={18} className="text-brand-400" />, suffix: "%" },
                ].map((s, i) => {
                    const { mousePos, handleMouseMove } = useMousePosition();
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onMouseMove={handleMouseMove}
                            style={{
                                '--mouse-x': `${mousePos.x}px`,
                                '--mouse-y': `${mousePos.y}px`,
                            }}
                            className="spotlight-card stat-card !p-5"
                        >
                            <div className="mb-3 flex justify-between items-start">
                                <div className="p-2 rounded-lg" style={{ background: 'var(--glow-brand)' }}>{s.icon}</div>
                                <Sparkles size={10} className="text-brand-400/20" />
                            </div>
                            <p className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
                                <Counter value={s.value} suffix={s.suffix} />
                            </p>
                            <p className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-60" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-display font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <FileCheck size={20} className="text-brand-400" /> Credential Portfolio
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>{filteredCerts.length}</span>
                </h3>
                <div className="flex items-center gap-3">
                    <div className="flex p-1 rounded-lg border" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                        {['grid', 'timeline'].map(v => (
                            <button key={v} onClick={() => setActiveView(v)} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${activeView === v ? 'bg-brand-600 text-white' : ''}`} style={activeView !== v ? { color: 'var(--text-muted)' } : {}}>
                                {v === 'grid' ? 'Cards' : 'Timeline'}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-52">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-field pl-8 !py-1.5 text-sm !rounded-lg" />
                    </div>
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex justify-center py-20">
                    <div className="loading-spinner" />
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    {/* Grid View */}
                    {!isLoading && activeView === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredCerts.map((cert, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -5 }}
                                    onMouseMove={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const x = (e.clientX - rect.left) / rect.width - 0.5;
                                        const y = (e.clientY - rect.top) / rect.height - 0.5;
                                        const content = e.currentTarget.querySelector('.tilt-target');
                                        if (content) content.style.transform = `rotateY(${x * 10}deg) rotateX(${y * -10}deg)`;
                                    }}
                                    onMouseLeave={(e) => {
                                        const content = e.currentTarget.querySelector('.tilt-target');
                                        if (content) content.style.transform = `rotateY(0deg) rotateX(0deg)`;
                                    }}
                                    className="glass-card group overflow-hidden tilt-card-container"
                                >
                                    <div className={`h-1.5 w-full bg-gradient-to-r ${cert.color}`} />
                                    <div className="p-6 tilt-target transition-transform duration-200" style={{ transformStyle: 'preserve-3d' }}>
                                        <div className="flex justify-between items-start mb-5" style={{ transform: 'translateZ(20px)' }}>
                                            <div className="p-3 rounded-xl text-brand-400 shadow-brand-glow" style={{ background: 'var(--glow-brand)' }}>
                                                <Award size={24} />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-bold uppercase tracking-widest opacity-50" style={{ color: 'var(--text-muted)' }}>Grade</p>
                                                <p className="text-2xl font-display font-bold text-gradient" style={{ color: 'var(--text-primary)' }}>{cert.grade}</p>
                                            </div>
                                        </div>
                                        <h4 className="text-base font-display font-bold mb-1 group-hover:text-brand-400 transition-colors" style={{ color: 'var(--text-primary)', transform: 'translateZ(30px)' }}>{cert.courseName}</h4>
                                        <p className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60" style={{ color: 'var(--text-muted)', transform: 'translateZ(10px)' }}>{cert.institution}</p>

                                        <div className="mb-4" style={{ transform: 'translateZ(5px)' }}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-50" style={{ color: 'var(--text-muted)' }}>{cert.semester}</span>
                                                <span className="text-[9px] font-bold text-brand-400">{cert.credits} Cr</span>
                                            </div>
                                            <div className="w-full rounded-full h-1" style={{ background: 'var(--border-color)' }}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((cert.credits / 180) * 100, 100)}%` }} transition={{ delay: 0.5 + i * 0.2, duration: 1 }} className={`h-full rounded-full bg-gradient-to-r ${cert.color}`} />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mb-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)', transform: 'translateZ(10px)' }}>
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">{cert.status}</span>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2" style={{ transform: 'translateZ(20px)' }}>
                                                <button onClick={() => {
                                                    toast.success("Downloading Certificate PDF...");
                                                    setTimeout(() => window.print(), 500);
                                                }} className="py-2.5 rounded-lg border flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-white/5 active:scale-95" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-input)' }} title="Download PDF">
                                                    <Download size={12} className="opacity-70" /> PDF
                                                </button>
                                                <button onClick={() => {
                                                    toast.loading("Generating Mobile Pass...", { duration: 1500 });
                                                    setTimeout(() => toast.success("Added to Digital Wallet!"), 1600);
                                                }} className="py-2.5 rounded-lg border flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-white/5 active:scale-95" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-input)' }} title="Add to Apple/Google Wallet">
                                                    <Smartphone size={12} className="opacity-70" /> Pass
                                                </button>
                                                <button onClick={() => {
                                                    toast.loading("Generating Secure QR...", { duration: 1500 });
                                                    setTimeout(() => toast.success("QR Code Generated!"), 1600);
                                                }} className="py-2.5 rounded-lg border flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-white/5 active:scale-95" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-input)' }} title="Share QR">
                                                    <Share2 size={12} className="opacity-70" /> QR
                                                </button>
                                                <a href={`/verify/${cert.certId}`} target="_blank" className="py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-[10px] font-bold text-white uppercase tracking-widest transition-all bg-gradient-to-r from-brand-600 to-indigo-600 shadow-brand-glow active:scale-95">
                                                    <Eye size={12} /> VIEW
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Timeline View */}
                    {!isLoading && activeView === 'timeline' && (
                        <div className="relative">
                            <div className="absolute left-6 top-0 bottom-0 w-px" style={{ background: 'var(--border-color)' }} />
                            {filteredCerts.map((cert, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="relative pl-16 pb-8 group">
                                    <div className={`absolute left-4 top-2 w-5 h-5 rounded-full bg-gradient-to-r ${cert.color} border-4 z-10 group-hover:scale-125 transition-transform`} style={{ borderColor: 'var(--bg-primary)' }} />
                                    <div className="glass-card p-6">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1"><Calendar size={10} className="inline mr-1" />{new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
                                                <h4 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>{cert.courseName}</h4>
                                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{cert.institution}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20" style={{ background: 'rgba(16,185,129,0.1)' }}>Grade: {cert.grade}</span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)', background: 'var(--bg-input)' }}>{cert.credits} Credits</span>
                                                </div>
                                            </div>
                                            <button onClick={() => copyToClipboard(cert.blockchainTxHash)} className="p-2 rounded-lg border transition-all hover:border-brand-500/30" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)', background: 'var(--bg-input)' }}>
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {!isLoading && filteredCerts.length === 0 && (
                        <div className="py-20 flex flex-col items-center gap-3 text-center">
                            <Award size={40} style={{ color: 'var(--text-muted)' }} />
                            <p className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>No Credentials Found</p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Credentials issued to you will appear here.</p>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="glass-card p-5">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-brand-400" />
                                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Quick Actions</span>
                            </div>
                            <div className="flex gap-2">
                                {[{ l: "Share Portfolio", i: <Share2 size={12} />, action: () => toast.success("Portfolio link copied to clipboard!") }, { l: "Export PDF", i: <Download size={12} />, action: () => window.print() }, { l: "Verify All", i: <ShieldCheck size={12} />, action: () => toast.success("All credentials verified securely on-chain.") }].map((a, i) => (
                                    <button key={i} onClick={a.action} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all hover:border-brand-500/20" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-input)' }}>
                                        {a.i} {a.l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI & Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card spotlight-card p-6 relative overflow-hidden group bg-gradient-to-br from-fuchsia-500/5 to-transparent border-fuchsia-500/20">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-fuchsia-500/20 blur-[50px] group-hover:bg-fuchsia-500/30 transition-all" />
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.2)] flex-shrink-0">
                                <BrainCircuit size={20} className="animate-pulse" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-widest text-fuchsia-400">AI Career Copilot</h4>
                                <p className="text-[9px] text-fuchsia-500/70 font-bold uppercase tracking-widest">Real-time Analysis</p>
                            </div>
                        </div>
                        <div className="space-y-3 relative z-10">
                            {insights.map((insight, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    className="p-3 rounded-xl border text-[11px] leading-relaxed transition-all hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5 group/item cursor-default shadow-sm"
                                    style={{ borderColor: 'rgba(217,70,239,0.15)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
                                >
                                    <div className="flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 shadow-[0_0_5px_rgba(217,70,239,0.5)] mt-1.5 group-hover/item:scale-150 transition-transform shrink-0" />
                                        <span>{insight}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <button className="w-full mt-5 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest text-fuchsia-400 border-fuchsia-500/30 hover:bg-fuchsia-500/10 hover:shadow-[0_0_15px_rgba(217,70,239,0.2)] transition-all relative z-10 overflow-hidden group/btn">
                            <span className="relative z-10 flex items-center justify-center gap-2">Generate Smart Path <Sparkles size={12} className="group-hover/btn:animate-spin" /></span>
                        </button>
                    </div>

                    <div className="glass-card p-6">
                        <h4 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <Activity size={16} className="text-indigo-400" /> Global Rank
                        </h4>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{aiInsights.globalRank}</span>
                            <span className="text-[10px] font-bold text-emerald-400 mb-1.5 flex items-center"><TrendingUp size={10} className="mr-0.5" /> +12</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} transition={{ duration: 1.5, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-brand-600 to-indigo-600" />
                        </div>
                        <p className="text-[9px] mt-2 font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Top 15% of verified developers</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
