import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { useBlockchain } from '../context/BlockchainContext';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-hot-toast';
import {
    LayoutDashboard,
    Users,
    Award,
    ShieldCheck,
    Settings,
    LogOut,
    LogIn,
    UserPlus,
    Menu,
    X,
    Search,
    Bell,
    Sun,
    Moon,
    ChevronRight,
    Home,
    Building2,
    GraduationCap,
    Sparkles,
    Fingerprint,
    Blocks,
    Activity,
    CheckCheck
} from 'lucide-react';

const Layout = () => {
    const { user, loginWithGoogle, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { notifications, markAllRead, unreadCount, activePops, removePop } = useNotifications();
    const { account, connectWallet, disconnectWallet } = useBlockchain();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handler = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            await loginWithGoogle(credentialResponse.credential);
            toast.success("Welcome back!");
            navigate('/student');
        } catch (err) {
            toast.error("Google Login failed");
        }
    };

    const getNavItems = () => {
        const common = [
            { path: '/', label: 'Home', icon: <Home size={20} /> },
            { path: '/verify', label: 'Verification', icon: <ShieldCheck size={20} /> },
        ];

        if (!user) {
            return [
                ...common,
                { path: '/login', label: 'Sign In', icon: <LogIn size={20} /> },
                { path: '/register', label: 'Register', icon: <UserPlus size={20} /> },
            ];
        }

        if (user.role === 'admin') {
            return [
                ...common,
                { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
                { path: '/explorer', label: 'Explorer', icon: <Blocks size={20} /> },
                { path: '/logs', label: 'Logs', icon: <Activity size={20} /> },
                { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
            ];
        }

        if (user.role === 'institution') {
            return [
                ...common,
                { path: '/institution', label: 'Institution', icon: <Building2 size={20} /> },
                { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
            ];
        }

        return [
            ...common,
            { path: '/student', label: 'Portfolio', icon: <GraduationCap size={20} /> },
            { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
        ];
    };

    const navItems = getNavItems();

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/verify?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setSearchFocused(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            <div className="bg-mesh" />
            <div className="bg-dots fixed inset-0 z-[-1] opacity-30" />
            <div className="bg-grid fixed inset-0 z-[-1] opacity-20" />

            {/* ═══════ DESKTOP SIDEBAR ═══════ */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 260 : 72 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 border-r"
                style={{
                    background: 'var(--bg-sidebar)',
                    borderColor: 'var(--border-color)',
                    backdropFilter: 'blur(24px)',
                }}
            >
                {/* Logo */}
                <div className="p-6 flex items-center gap-4 border-b relative group" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20 relative overflow-hidden shimmer-effect">
                        <Fingerprint size={24} className="text-white relative z-10" />
                    </div>
                    <AnimatePresence>
                        {sidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="overflow-hidden whitespace-nowrap"
                            >
                                <h1 className="text-xl font-display font-black tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
                                    AcadChain
                                </h1>
                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--text-muted)' }}>
                                    Identity System
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto relative">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) => `nav-item group ${isActive ? 'active' : ''}`}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="nav-indicator"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="shrink-0 transition-transform group-hover:scale-110">{item.icon}</span>
                                    <AnimatePresence>
                                        {sidebarOpen && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="overflow-hidden whitespace-nowrap"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom: User / Collapse */}
                <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border-color)' }}>
                    {user && (
                        <div className="nav-item cursor-pointer" onClick={handleLogout}>
                            <LogOut size={20} className="shrink-0 text-rose-400" />
                            <AnimatePresence>
                                {sidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-rose-400 whitespace-nowrap overflow-hidden"
                                    >
                                        Sign Out
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center justify-center p-2 rounded-lg transition-all"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <ChevronRight
                            size={18}
                            className="transition-transform duration-300"
                            style={{ transform: sidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        />
                    </button>
                </div>
            </motion.aside>

            {/* ═══════ MOBILE SIDEBAR ═══════ */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed left-0 top-0 h-full w-[260px] z-50 lg:hidden flex flex-col border-r"
                            style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border-color)', backdropFilter: 'blur(24px)' }}
                        >
                            <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand-glow">
                                        <Fingerprint size={22} className="text-white" />
                                    </div>
                                    <span className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>AcadChain</span>
                                </div>
                                <button onClick={() => setMobileOpen(false)}>
                                    <X size={20} style={{ color: 'var(--text-muted)' }} />
                                </button>
                            </div>
                            <nav className="flex-1 p-3 space-y-1">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path === '/'}
                                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))}
                            </nav>
                            {user && (
                                <div className="p-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                    <button onClick={handleLogout} className="nav-item w-full text-rose-400">
                                        <LogOut size={20} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ═══════ MAIN AREA ═══════ */}
            <div
                className="flex-1 flex flex-col min-h-screen transition-all duration-300"
                style={{ marginLeft: isDesktop ? (sidebarOpen ? 260 : 72) : 0 }}
            >
                {/* ═══════ TOP NAVBAR ═══════ */}
                <header
                    className="sticky top-0 z-30 border-b px-4 md:px-6"
                    style={{
                        background: 'var(--bg-sidebar)',
                        borderColor: 'var(--border-color)',
                        backdropFilter: 'blur(24px)',
                    }}
                >
                    <div className="flex items-center justify-between h-16">
                        {/* Left: Mobile menu + Search */}
                        <div className="flex items-center gap-3 flex-1">
                            <button
                                onClick={() => setMobileOpen(true)}
                                className="lg:hidden p-2 rounded-lg"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                <Menu size={22} />
                            </button>

                            <div className={`relative hidden md:block transition-all ${searchFocused ? 'w-96' : 'w-64'}`}>
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                    placeholder="Search certificates, students..."
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                    className="input-field pl-9 pr-4 py-2 text-sm rounded-lg"
                                    style={{ background: 'var(--bg-input)' }}
                                />
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            {/* Wallet Connection */}
                            <button
                                onClick={account ? disconnectWallet : connectWallet}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 hover:scale-105 ${
                                    account
                                        ? 'bg-brand-500/10 border-brand-500/50 text-brand-500 shadow-sm shadow-brand-500/10 glow-text'
                                        : 'hover:opacity-80'
                                }`}
                                style={!account ? { color: 'var(--text-primary)', background: 'var(--bg-input)', borderColor: 'var(--border-color)' } : {}}
                                title={account ? 'Disconnect Wallet' : 'Connect MetaMask'}
                            >
                                <Blocks size={14} className={account ? 'text-brand-500' : ''} style={!account ? { color: 'var(--text-muted)' } : {}} />
                                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
                            </button>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2.5 rounded-xl transition-all hover:scale-105"
                                style={{ color: 'var(--text-secondary)', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}
                                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                <AnimatePresence mode="wait">
                                    {theme === 'dark' ? (
                                        <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                                            <Sun size={18} />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                                            <Moon size={18} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => setNotifOpen(!notifOpen)}
                                    className="p-2.5 rounded-xl transition-all relative"
                                    style={{ color: 'var(--text-secondary)', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}
                                >
                                    <Bell size={18} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">{unreadCount}</span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {notifOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-2 w-80 glass-card overflow-hidden z-50"
                                        >
                                            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                                                <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Notifications {unreadCount > 0 && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500 text-white">{unreadCount}</span>}</h4>
                                                <button onClick={() => { markAllRead(); }} className="text-[10px] font-bold text-brand-400 flex items-center gap-1 hover:text-brand-300"><CheckCheck size={12} /> Mark all read</button>
                                            </div>
                                            <div className="max-h-72 overflow-y-auto">
                                                {notifications.slice(0, 6).map((n) => (
                                                    <div key={n.id} className="p-3 border-b transition-all cursor-pointer flex gap-3" style={{ borderColor: 'var(--border-color)', background: !n.read ? 'var(--glow-brand)' : 'transparent' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = !n.read ? 'var(--glow-brand)' : 'transparent'}
                                                    >
                                                        <span className="text-lg">{n.icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start gap-1">
                                                                <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                                                                {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 mt-1" />}
                                                            </div>
                                                            <p className="text-[10px] mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{n.message}</p>
                                                            <p className="text-[9px] mt-1 font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{n.time}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* User Avatar */}
                            {user ? (
                                <div className="flex items-center gap-3 ml-2 pl-3 border-l" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="hidden md:block text-right">
                                        <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{user.role}</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-brand-500/30 shrink-0"
                                        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                                        <span className="text-sm font-display font-bold text-white select-none">
                                            {(user.name || 'U')[0].toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:block">
                                        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                                            <GoogleLogin
                                                onSuccess={handleGoogleSuccess}
                                                onError={() => toast.error('Login Failed')}
                                                type="icon"
                                                theme="outline"
                                                shape="circle"
                                            />
                                        )}
                                    </div>
                                    <NavLink
                                        to="/login"
                                        className="glass-button !px-5 !py-2 text-sm"
                                    >
                                        <LogIn size={16} /> <span className="hidden xs:inline">Sign In</span>
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* ═══════ PAGE CONTENT ═══════ */}
                <main className="flex-1 p-4 md:p-8 lg:p-10">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </main>

                {/* ═══════ FOOTER ═══════ */}
                <footer className="px-6 py-4 border-t text-center" style={{ borderColor: 'var(--border-color)' }}>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        © 2024 AcadChain — Blockchain-Based Academic Identity System
                    </p>
                </footer>
            </div>

            {/* ── NOTIFICATION TOASTS — "ORIGINAL" ── */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {activePops.map((pop) => (
                        <motion.div
                            key={pop.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            className="pointer-events-auto"
                        >
                            <div className="glass-card spotlight-card !p-0 overflow-hidden w-[320px] shadow-2xl border-brand-500/20">
                                <div className="p-4 flex gap-3 items-start relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-1">
                                        <button onClick={() => removePop(pop.id)} className="p-1 rounded-md hover:bg-white/10 transition-colors">
                                            <X size={12} style={{ color: 'var(--text-muted)' }} />
                                        </button>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-brand-glow">
                                        <span className="text-xl">{pop.icon || '🔔'}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="text-xs font-bold truncate pr-3" style={{ color: 'var(--text-primary)' }}>{pop.title}</h5>
                                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{pop.message}</p>
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <div className="w-1 h-1 rounded-full bg-brand-500 animate-ping" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-400">Live Alert</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-1 bg-brand-500/10 w-full relative">
                                    <motion.div
                                        initial={{ width: '100%' }}
                                        animate={{ width: '0%' }}
                                        transition={{ duration: 8, ease: 'linear' }}
                                        className="absolute inset-0 bg-brand-500"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Layout;
