import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight, Fingerprint, GraduationCap, Building2, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
    const { register, loginWithGoogle, user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (user) {
        return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'institution' ? '/institution' : '/student'} />;
    }

    const roles = [
        { id: 'student', label: 'Student', icon: <GraduationCap size={20} />, desc: 'Receive & share credentials' },
        { id: 'institution', label: 'Institution', icon: <Building2 size={20} />, desc: 'Issue & manage credentials' },
    ];

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        try {
            const data = await loginWithGoogle(credentialResponse.credential, form.role);
            toast.success("Welcome to AcadChain!");
            navigate(data.role === 'institution' ? '/institution' : '/student');
        } catch (err) {
            toast.error("Google Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await register(form.name, form.email, form.password, form.role);
            toast.success(`Account created! Welcome, ${data.name}!`);
            navigate(data.role === 'institution' ? '/institution' : '/student');
        } catch (err) {
            console.error('REGISTRATION_SERVER_ERROR:', err); // Added this line as per instruction
            console.error('Registration Error Details:', err.response?.data || err.message);
            toast.error(err.response?.data?.message || 'Registration failed. Check console for details.');
        } finally {
            setIsLoading(false);
        }
    };

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
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-brand-glow-lg"
                    >
                        <UserPlus size={32} className="text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
                        Create Account
                    </h1>
                    <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                        Join the decentralized academic network
                    </p>
                </div>

                {/* Form Card */}
                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Selector */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>I am a</label>
                            <div className="grid grid-cols-2 gap-3">
                                {roles.map(role => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setForm({ ...form, role: role.id })}
                                        className={`p-4 rounded-xl border text-left transition-all ${form.role === role.id
                                            ? 'border-brand-500/50 shadow-brand-glow'
                                            : ''
                                            }`}
                                        style={{
                                            background: form.role === role.id ? 'var(--glow-brand)' : 'var(--bg-input)',
                                            borderColor: form.role === role.id ? 'rgba(124,58,237,0.5)' : 'var(--border-color)',
                                        }}
                                    >
                                        <div className={`mb-2 ${form.role === role.id ? 'text-brand-400' : ''}`} style={{ color: form.role !== role.id ? 'var(--text-muted)' : undefined }}>
                                            {role.icon}
                                        </div>
                                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{role.label}</p>
                                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{role.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="input-field pl-11 h-12 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="you@university.edu"
                                    className="input-field pl-11 h-12 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    placeholder="Min. 6 characters"
                                    className="input-field pl-11 pr-11 h-12 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="glass-button w-full !py-3.5 text-sm font-bold gap-2"
                        >
                            {isLoading ? (
                                <div className="loading-spinner !w-5 !h-5 !border-2" />
                            ) : (
                                <>
                                    <ShieldCheck size={18} /> Create Account
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
                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => toast.error('Registration Failed')}
                                    theme="filled_blue"
                                    shape="pill"
                                    text="signup_with"
                                    width="340"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Bottom Link */}
                <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-400 font-bold hover:text-brand-300 transition-colors">
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
