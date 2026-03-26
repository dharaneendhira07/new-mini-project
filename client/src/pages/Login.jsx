import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Eye, EyeOff, GraduationCap, Building2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const useMousePosition = () => {
    const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    return { mousePos, handleMouseMove };
};

const Login = () => {
    const { login, loginWithGoogle, user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('student'); // 'student', 'institution', 'admin'
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { mousePos, handleMouseMove } = useMousePosition();

    if (user) {
        return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'institution' ? '/institution' : '/student'} />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await login(form.email, form.password);
            if (activeTab !== 'admin' && data.role !== activeTab) {
                 toast.success(`Logged in as ${data.role} instead.`);
            } else {
                 toast.success(`Welcome back, ${data.name}!`);
            }
            navigate(data.role === 'admin' ? '/admin' : data.role === 'institution' ? '/institution' : '/student');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        try {
            const data = await loginWithGoogle(credentialResponse.credential, activeTab);
            toast.success("Welcome back!");
            // Redirect based on the actual user role returned by the response
            navigate(data.role === 'admin' ? '/admin' : data.role === 'institution' ? '/institution' : '/student');
        } catch (err) {
            toast.error("Google Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'student', label: 'Student', icon: <GraduationCap size={18} /> },
        { id: 'institution', label: 'Institution', icon: <Building2 size={18} /> },
        { id: 'admin', label: 'Admin', icon: <ShieldCheck size={18} /> }
    ];

    const getTabContent = () => {
        switch(activeTab) {
            case 'institution':
                return {
                    title: 'Institution Portal',
                    desc: 'Manage credentials and student records',
                    placeholder: 'admin@university.edu',
                    demoEmail: 'admin@annauniv.edu',
                    gradient: 'from-emerald-500 to-teal-700'
                };
            case 'admin':
                return {
                    title: 'Admin Access',
                    desc: 'System administration and oversight',
                    placeholder: 'admin@system.com',
                    demoEmail: 'admin@admin.com',
                    gradient: 'from-amber-500 to-orange-700'
                };
            default:
                return {
                    title: 'Student Portal',
                    desc: 'Access your verifiable credentials',
                    placeholder: 'student@example.com',
                    demoEmail: 'student@example.com',
                    gradient: 'from-brand-500 to-indigo-700'
                };
        }
    };

    const content = getTabContent();

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        key={activeTab}
                        initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${content.gradient} flex items-center justify-center mx-auto mb-6 shadow-brand-glow-lg transition-colors duration-500`}
                    >
                        {activeTab === 'student' && <GraduationCap size={32} className="text-white" />}
                        {activeTab === 'institution' && <Building2 size={32} className="text-white" />}
                        {activeTab === 'admin' && <ShieldCheck size={32} className="text-white" />}
                    </motion.div>
                    <h1 className="text-3xl font-display font-bold transition-all duration-300" style={{ color: 'var(--text-primary)' }}>
                        {content.title}
                    </h1>
                    <p className="mt-2 text-sm transition-all duration-300" style={{ color: 'var(--text-secondary)' }}>
                        {content.desc}
                    </p>
                </div>

                {/* Form Card */}
                <div
                    onMouseMove={handleMouseMove}
                    style={{
                        '--mouse-x': `${mousePos.x}px`,
                        '--mouse-y': `${mousePos.y}px`,
                    }}
                    className="glass-card spotlight-card p-2 group"
                >
                    {/* Role Selection Tabs */}
                    <div className="flex p-1 mb-6 bg-black/10 dark:bg-white/5 rounded-xl border border-white/5">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setForm({ ...form, email: '' }); // clear email on switch
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 relative z-10 ${
                                    activeTab === tab.id 
                                    ? 'text-white shadow-lg' 
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabBadge"
                                        className={`absolute inset-0 bg-gradient-to-r ${content.gradient} rounded-lg -z-10`}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                {tab.icon}
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-6 pt-0">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                                <div className="relative group">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--text-muted)' }} />
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        placeholder={content.placeholder}
                                        className="input-field pl-11 h-12 text-sm transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Password</label>
                                <div className="relative group">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--text-muted)' }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="input-field pl-11 pr-11 h-12 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`relative overflow-hidden text-white w-full py-3.5 rounded-xl transition-all duration-300 font-bold gap-2 flex items-center justify-center shadow-lg active:scale-95 bg-gradient-to-r ${content.gradient}`}
                            >
                                {isLoading ? (
                                    <div className="loading-spinner !w-5 !h-5 !border-2" />
                                ) : (
                                    <>
                                        <LogIn size={18} /> Sign In
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Google Login Button */}
                        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                            <>
                                {/* Divider */}
                                <div className="flex items-center gap-4 my-6">
                                    <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
                                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>or</span>
                                    <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
                                </div>
                                <div className="flex justify-center mb-6">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => toast.error('Login Failed')}
                                        theme="filled_blue"
                                        shape="pill"
                                        text="continue_with"
                                        width="340"
                                    />
                                </div>
                            </>
                        )}

                        {/* Quick Login Hint based on active tab */}
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="glass-card !rounded-xl p-4 space-y-2 border" 
                                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                            >
                                <p className="text-xs font-bold flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                    <Sparkles size={14} className="text-brand-400" /> Demo Credentials
                                </p>
                                <div className="space-y-1 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                                    <p>Email: <span className="text-[var(--text-primary)]">{content.demoEmail}</span></p>
                                    <p>Password: <span className="text-brand-400">password123</span></p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Bottom Link */}
                <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" className="text-brand-400 font-bold hover:text-brand-300 transition-colors">
                        Create Account
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
