import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useBlockchain } from '../context/BlockchainContext';
import { userAPI } from '../services/api';
import {
    Settings, User, Palette, Shield, Bell, Wallet, Sun, Moon, Save,
    ExternalLink, CheckCircle, Mail, Lock, Globe, Fingerprint, Activity,
    Smartphone, Monitor, Brain, Bot, Cpu, Zap, Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SettingsPage = () => {
    const { user, updateUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { account, connectWallet } = useBlockchain();
    const [activeSection, setActiveSection] = useState('profile');
    const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
    const [passwords, setPasswords] = useState({ current: '', newPwd: '', confirm: '' });

    // Ensure settings form has latest user data when user object updates (e.g. from fresh API load)
    React.useEffect(() => {
        if (user) {
            setProfile({ name: user.name || '', email: user.email || '' });
        }
    }, [user]);

    
    // Extended notifications state for UI demo
    const [notifications, setNotifications] = useState({ 
        email: true, 
        push: true, 
        updates: false, 
        marketing: false,
        security: true,
        blockchain: true
    });
    
    // AI Preferences State
    const [aiSettings, setAiSettings] = useState({
        smartIssuance: true,
        fraudDetection: true,
        autoVerification: false,
        aiAssistant: true
    });
    
    const [isSaving, setIsSaving] = useState(false);

    const sections = [
        { id: 'profile', label: 'Profile Details', icon: <User size={18} />, color: 'from-brand-500 to-indigo-600' },
        { id: 'appearance', label: 'Appearance', icon: <Palette size={18} />, color: 'from-fuchsia-500 to-pink-600' },
        { id: 'wallet', label: 'Blockchain Wallet', icon: <Wallet size={18} />, color: 'from-emerald-500 to-teal-600' },
        { id: 'ai', label: 'AI Intelligence', icon: <Brain size={18} />, color: 'from-violet-500 to-fuchsia-600' },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} />, color: 'from-amber-500 to-orange-600' },
        { id: 'security', label: 'Security', icon: <Shield size={18} />, color: 'from-rose-500 to-red-600' },
    ];

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const { data } = await userAPI.updateProfile({ name: profile.name, email: profile.email });
            updateUser(data);
            toast.success("Profile updated successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwords.newPwd !== passwords.confirm) {
            return toast.error("Passwords don't match");
        }
        if (passwords.newPwd.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }
        setIsSaving(true);
        try {
            await userAPI.updateProfile({ password: passwords.newPwd });
            toast.success("Password updated!");
            setPasswords({ current: '', newPwd: '', confirm: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update password");
        } finally {
            setIsSaving(false);
        }
    };

    const activeColor = sections.find(s => s.id === activeSection)?.color || 'from-brand-500 to-indigo-600';

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Header Section */}
            <div className="relative overflow-hidden glass-card p-8 group">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-indigo-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <motion.div 
                            whileHover={{ rotate: 10, scale: 1.05 }}
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${activeColor}`}
                        >
                            <Settings size={32} />
                        </motion.div>
                        <div>
                            <h2 className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h2>
                            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your personal workspace and preferences.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Left Navigation Sidebar */}
                <div className="lg:col-span-3">
                    <div className="glass-card p-3 space-y-1 sticky top-6">
                        {sections.map(s => (
                            <button 
                                key={s.id} 
                                onClick={() => setActiveSection(s.id)} 
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden font-medium text-sm group ${activeSection === s.id ? 'text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]'}`}
                            >
                                {activeSection === s.id && (
                                    <motion.div
                                        layoutId="activeSettingsTab"
                                        className={`absolute inset-0 bg-gradient-to-r ${s.color} rounded-xl`}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    />
                                )}
                                <span className={`relative z-10 transition-transform duration-300 ${activeSection === s.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {s.icon}
                                </span>
                                <span className="relative z-10">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeSection} 
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="glass-card p-6 md:p-8 min-h-[500px]"
                        >
                            {/* ── PROFILE SECTION ── */}
                            {activeSection === 'profile' && (
                                <div className="space-y-8">
                                    <h3 className="text-xl font-display font-bold flex items-center gap-3 border-b pb-4" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                                        <div className="p-2 rounded-lg bg-brand-500/10 text-brand-500">
                                            <User size={20} /> 
                                        </div>
                                        Profile Information
                                    </h3>
                                    
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 rounded-2xl border" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                        <div className="relative group cursor-pointer">
                                            <div className="w-24 h-24 rounded-2xl flex items-center justify-center border-4 border-[var(--bg-card)] shadow-xl transition-transform group-hover:scale-105"
                                                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                                                <span className="text-4xl font-display font-bold text-white select-none">
                                                    {(user?.name || 'U')[0].toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-sm">
                                                <span className="text-xs font-bold uppercase">Change</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User Profile'}</p>
                                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email || 'email@example.com'}</p>
                                            <div className="pt-2">
                                                <span className="text-xs font-bold uppercase tracking-widest text-brand-400 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-brand-500/30" style={{ background: 'var(--glow-brand)' }}>
                                                    <CheckCircle size={12} /> {user?.role} Account
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                                            <div className="relative group">
                                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-brand-500" style={{ color: 'var(--text-muted)' }} />
                                                <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="input-field pl-12 h-12" placeholder="Your name" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                                            <div className="relative group">
                                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-brand-500" style={{ color: 'var(--text-muted)' }} />
                                                <input value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} type="email" className="input-field pl-12 h-12" placeholder="your@email.com" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4">
                                        <button onClick={handleSaveProfile} disabled={isSaving} className="glass-button !px-8 h-12 gap-2 shadow-brand-glow hover:shadow-brand-glow-lg transition-all">
                                            {isSaving ? <div className="loading-spinner !w-5 !h-5 !border-2" /> : <><Save size={18} /> Save Profile</>}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── APPEARANCE SECTION ── */}
                            {activeSection === 'appearance' && (
                                <div className="space-y-8">
                                    <h3 className="text-xl font-display font-bold flex items-center gap-3 border-b pb-4" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                                        <div className="p-2 rounded-lg bg-fuchsia-500/10 text-fuchsia-500">
                                            <Palette size={20} /> 
                                        </div>
                                        Display & Theme
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Color Mode</p>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {[
                                                { id: 'dark', label: 'Dark Mode', icon: <Moon size={24} />, desc: 'Deep cosmic theme with neon highlights', colors: ['#020617', '#1e1b4b', '#7c3aed'] },
                                                { id: 'light', label: 'Light Mode', icon: <Sun size={24} />, desc: 'Clean, bright Apple-style interface', colors: ['#f8fafc', '#e2e8f0', '#4f46e5'] },
                                            ].map(t => (
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    key={t.id}
                                                    onClick={() => { if (theme !== t.id) toggleTheme(); }}
                                                    className="relative p-6 rounded-2xl border text-left transition-all duration-300 overflow-hidden group"
                                                    style={{
                                                        borderColor: theme === t.id ? 'var(--primary)' : 'var(--border-color)',
                                                        background: theme === t.id ? 'var(--glow-brand)' : 'var(--bg-card)',
                                                    }}
                                                >
                                                    {theme === t.id && (
                                                        <div className="absolute top-0 right-0 w-16 h-16 bg-brand-500/20 rounded-bl-full -z-10" />
                                                    )}
                                                    
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className={`p-3 rounded-xl transition-colors duration-300 ${theme === t.id ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-[var(--bg-input)] text-[var(--text-muted)]'}`}>
                                                            {t.icon}
                                                        </div>
                                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${theme === t.id ? 'border-brand-500' : 'border-[var(--border-color)]'}`}>
                                                            {theme === t.id && <motion.div layoutId="themeCheck" className="w-3 h-3 rounded-full bg-brand-500" />}
                                                        </div>
                                                    </div>
                                                    
                                                    <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{t.label}</p>
                                                    <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
                                                    
                                                    <div className="flex gap-2">
                                                        {t.colors.map((c, i) => (
                                                            <div key={i} className="w-6 h-6 rounded-full border border-white/10 shadow-inner" style={{ background: c }} />
                                                        ))}
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── BLOCKCHAIN WALLET ── */}
                            {activeSection === 'wallet' && (
                                <div className="space-y-8">
                                    <h3 className="text-xl font-display font-bold flex items-center gap-3 border-b pb-4" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                            <Wallet size={20} /> 
                                        </div>
                                        Wallet Connection
                                    </h3>
                                    
                                    <div className="relative overflow-hidden p-8 rounded-2xl border transition-all duration-500" style={{ background: account ? 'rgba(16,185,129,0.05)' : 'var(--bg-input)', borderColor: account ? 'rgba(16,185,129,0.3)' : 'var(--border-color)' }}>
                                        {/* Background decoration */}
                                        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                                            <Wallet size={160} />
                                        </div>

                                        <div className="relative z-10 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>MetaMask Integration</p>
                                                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Connect your Web3 wallet for transactions</p>
                                                </div>
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${account ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                                                    <span className="relative flex h-3 w-3">
                                                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${account ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                                                      <span className={`relative inline-flex rounded-full h-3 w-3 ${account ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                    </span>
                                                    <span className={`text-xs font-bold uppercase ${account ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        {account ? 'Connected' : 'Disconnected'}
                                                    </span>
                                                </div>
                                            </div>

                                            {account ? (
                                                <div className="space-y-2">
                                                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70">Wallet Address</p>
                                                    <div className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-[#0b1120] font-mono text-sm shadow-inner" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                                                        <span className="truncate pr-4">{account}</span>
                                                        <button 
                                                            onClick={() => { navigator.clipboard.writeText(account); toast.success("Address copied!"); }}
                                                            className="text-brand-500 hover:text-brand-400 font-bold text-xs uppercase transition-colors shrink-0"
                                                        >
                                                            Copy
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={connectWallet} className="w-full relative overflow-hidden text-white px-8 h-14 rounded-xl transition-all duration-300 font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-emerald-500/25">
                                                    <Wallet size={20} /> Initialize Connection
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="p-6 rounded-xl border hover:border-brand-500/50 transition-colors" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <Globe size={18} className="text-brand-400" />
                                                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Current Network</p>
                                            </div>
                                            <p className="text-2xl font-display font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Ethereum Sepolia <span className="text-xs align-top text-brand-400 font-bold tracking-widest uppercase">Testnet</span></p>
                                            <a href="https://sepolia.etherscan.io" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-brand-500 font-bold hover:text-brand-400 text-sm transition-colors">
                                                Open Block Explorer <ExternalLink size={14} />
                                            </a>
                                        </div>
                                        <div className="p-6 rounded-xl border hover:border-brand-500/50 transition-colors" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <Fingerprint size={18} className="text-purple-400" />
                                                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Smart Contracts</p>
                                            </div>
                                            <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                                Your actions interact with our verified AcadChain smart contracts ensuring cryptographic security.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── AI INTELLIGENCE ── */}
                            {activeSection === 'ai' && (
                                <div className="space-y-8 relative">
                                    {/* AI Background Effects */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none animate-float" />

                                    <h3 className="text-xl font-display font-bold flex items-center gap-3 border-b pb-4 relative z-10" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                                        <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500 relative overflow-hidden">
                                            <Brain size={20} className="relative z-10" /> 
                                            <div className="absolute inset-0 bg-violet-400/20 blur-sm animate-pulse" />
                                        </div>
                                        Artificial Intelligence
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-full bg-violet-500/10 ml-2">Beta</span>
                                    </h3>
                                    
                                    <div className="relative z-10 p-6 rounded-2xl border bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5" style={{ borderColor: 'var(--border-color)' }}>
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="p-3 rounded-xl bg-violet-500/20 text-violet-400 shrink-0">
                                                <Bot size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>AcadChain AI Engine</p>
                                                <p className="text-sm mt-1 mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                                    Power up your workflow with our advanced machine learning models. Automate verification, detect anomalies, and issue credentials faster.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            {[
                                                { key: 'smartIssuance', label: 'Smart Extraction', desc: 'AI auto-fills data from uploaded PDFs', icon: <Zap size={18}/> },
                                                { key: 'fraudDetection', label: 'Fraud Detection Engine', desc: 'ML models scan for tampered certificates', icon: <Shield size={18}/> },
                                                { key: 'autoVerification', label: 'Auto Verification', desc: 'Background AI checks against blockchain', icon: <Cpu size={18}/> },
                                                { key: 'aiAssistant', label: 'Dashboard Copilot', desc: 'AI assistant for platform analytics', icon: <Sparkles size={18}/> },
                                            ].map((feature, i) => (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    key={feature.key} 
                                                    className="relative overflow-hidden flex flex-col p-5 rounded-xl border transition-all hover:border-violet-500/50 group" 
                                                    style={{ background: 'var(--bg-card)', borderColor: aiSettings[feature.key] ? 'rgba(139, 92, 246, 0.4)' : 'var(--border-color)' }}
                                                >
                                                    {aiSettings[feature.key] && (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
                                                    )}
                                                    
                                                    <div className="flex items-center justify-between mb-3 relative z-10">
                                                        <div className={`p-2 rounded-lg transition-colors ${aiSettings[feature.key] ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30' : 'bg-[var(--bg-input)] text-[var(--text-muted)]'}`}>
                                                            {feature.icon}
                                                        </div>
                                                        <button 
                                                            onClick={() => {
                                                                const newValue = !aiSettings[feature.key];
                                                                setAiSettings({ ...aiSettings, [feature.key]: newValue });
                                                                toast.success(`${feature.label} UI feature updated!`, {
                                                                    icon: '🤖',
                                                                    style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }
                                                                });
                                                            }} 
                                                            className={`w-12 h-6 rounded-full flex items-center transition-all px-1 cursor-pointer shadow-inner ${aiSettings[feature.key] ? 'bg-violet-500 justify-end' : 'justify-start'}`} 
                                                            style={{ background: aiSettings[feature.key] ? undefined : 'var(--border-color)' }}
                                                        >
                                                            <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-sm" />
                                                        </button>
                                                    </div>
                                                    <p className="font-bold text-sm relative z-10" style={{ color: 'var(--text-primary)' }}>{feature.label}</p>
                                                    <p className="text-xs mt-1 relative z-10" style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── NOTIFICATIONS ── */}
                            {activeSection === 'notifications' && (
                                <div className="space-y-8">
                                    <h3 className="text-xl font-display font-bold flex items-center gap-3 border-b pb-4" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                            <Bell size={20} /> 
                                        </div>
                                        Communication Preferences
                                    </h3>
                                    
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[
                                            { key: 'email', label: 'Email Alerts', desc: 'Direct to your inbox', icon: <Mail size={16}/> },
                                            { key: 'push', label: 'Push Notifications', desc: 'Browser notifications', icon: <Monitor size={16}/> },
                                            { key: 'blockchain', label: 'Tx Updates', desc: 'When your contracts mine', icon: <Activity size={16}/> },
                                            { key: 'security', label: 'Security Alerts', desc: 'Unrecognized logins', icon: <Shield size={16}/> },
                                            { key: 'updates', label: 'Platform Updates', desc: 'New features', icon: <Sparkles size={16}/> },
                                            { key: 'marketing', label: 'Marketing', desc: 'Promotions & news', icon: <Smartphone size={16}/> },
                                        ].map((n, i) => (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                key={n.key} 
                                                className="flex flex-col p-5 rounded-2xl border transition-colors group" 
                                                style={{ background: 'var(--bg-input)', borderColor: notifications[n.key] ? 'var(--primary)' : 'var(--border-color)' }}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className={`p-2 rounded-lg ${notifications[n.key] ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                                        {n.icon}
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            const newValue = !notifications[n.key];
                                                            setNotifications({ ...notifications, [n.key]: newValue });
                                                            toast.success(`${n.label} turned ${newValue ? 'on' : 'off'}!`, {
                                                                icon: newValue ? '🔔' : '🔕',
                                                                style: {
                                                                    borderRadius: '10px',
                                                                    background: 'var(--bg-card)',
                                                                    color: 'var(--text-primary)',
                                                                    border: '1px solid var(--border-color)'
                                                                }
                                                            });
                                                        }} 
                                                        className={`w-12 h-6 rounded-full flex items-center transition-all px-1 cursor-pointer shadow-inner ${notifications[n.key] ? 'bg-brand-500 justify-end' : 'justify-start'}`} 
                                                        style={{ background: notifications[n.key] ? undefined : 'var(--border-color)' }}
                                                    >
                                                        <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-sm" />
                                                    </button>
                                                </div>
                                                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{n.label}</p>
                                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{n.desc}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── SECURITY ── */}
                            {activeSection === 'security' && (
                                <div className="space-y-8">
                                    <h3 className="text-xl font-display font-bold flex items-center gap-3 border-b pb-4" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                                        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                                            <Shield size={20} /> 
                                        </div>
                                        Security & Access
                                    </h3>
                                    
                                    <div className="space-y-6 max-w-2xl">
                                        <div className="p-6 rounded-2xl border space-y-6" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                            <div>
                                                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Change Password</p>
                                                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Update your password to keep your account secure.</p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Current Password</label>
                                                <div className="relative group">
                                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-brand-500" style={{ color: 'var(--text-muted)' }} />
                                                    <input type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} placeholder="••••••••" className="input-field pl-12 h-12" />
                                                </div>
                                            </div>
                                            
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>New Password</label>
                                                    <div className="relative group">
                                                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-brand-500" style={{ color: 'var(--text-muted)' }} />
                                                        <input type="password" value={passwords.newPwd} onChange={e => setPasswords({ ...passwords, newPwd: e.target.value })} placeholder="Min. 6 characters" className="input-field pl-12 h-12" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Confirm Password</label>
                                                    <div className="relative group">
                                                        <CheckCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-brand-500" style={{ color: 'var(--text-muted)' }} />
                                                        <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Repeat new password" className="input-field pl-12 h-12" />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="pt-2">
                                                <button onClick={handleChangePassword} disabled={isSaving} className="glass-button !px-8 h-12 gap-2 shadow-rose-500/20 bg-gradient-to-r from-rose-500 to-red-600 hover:shadow-rose-500/40">
                                                    {isSaving ? <div className="loading-spinner !w-5 !h-5 !border-2" /> : <><Shield size={18} /> Update Security</>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
