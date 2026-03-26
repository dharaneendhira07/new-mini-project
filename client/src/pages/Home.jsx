import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-hot-toast';
import {
    ShieldCheck,
    Award,
    Globe,
    Zap,
    ArrowRight,
    Fingerprint,
    Lock,
    CheckCircle,
    Building2,
    GraduationCap,
    Sparkles,
    ChevronRight,
} from 'lucide-react';

const useMousePosition = () => {
    const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    return { mousePos, handleMouseMove };
};

// --- Advanced Animation Variants ---
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        }
    }
};

const fadeUp = {
    hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
    visible: { 
        opacity: 1, 
        y: 0, 
        filter: 'blur(0px)',
        transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] } 
    }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.85, filter: 'blur(10px)' },
    visible: { 
        opacity: 1, 
        scale: 1, 
        filter: 'blur(0px)',
        transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] } 
    }
};

const floatAnimation = {
    y: ["-10%", "10%"],
    transition: {
        y: {
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
        }
    }
};

const Home = () => {
    const { user, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const { mousePos, handleMouseMove: handleGlobalMouseMove } = useMousePosition();
    const { scrollYProgress } = useScroll();
    
    // Parallax effect for the hero section
    const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            await loginWithGoogle(credentialResponse.credential);
            toast.success("Welcome back!");
            navigate('/student');
        } catch (err) {
            toast.error("Google Login failed");
        }
    };

    const stats = [
        { value: '10K+', label: 'Credentials Issued', icon: <Award size={20} /> },
        { value: '500+', label: 'Institutions', icon: <Building2 size={20} /> },
        { value: '50K+', label: 'Students', icon: <GraduationCap size={20} /> },
        { value: '99.9%', label: 'Uptime', icon: <Zap size={20} /> },
    ];

    const features = [
        {
            icon: <Fingerprint size={28} />,
            title: 'Decentralized Identity',
            desc: 'Self-sovereign academic identity powered by Ethereum blockchain with tamper-proof credential storage.',
            gradient: 'from-brand-500 to-indigo-500'
        },
        {
            icon: <ShieldCheck size={28} />,
            title: 'Instant Verification',
            desc: 'Verify any academic credential in seconds with cryptographic proof — no intermediaries needed.',
            gradient: 'from-emerald-500 to-brand-500'
        },
        {
            icon: <Lock size={28} />,
            title: 'Privacy First',
            desc: 'Students control who sees their credentials. Zero-knowledge proofs ensure data privacy.',
            gradient: 'from-brand-500 to-violet-500'
        },
        {
            icon: <Globe size={28} />,
            title: 'Global Standards',
            desc: 'W3C Verifiable Credentials compliant. Recognized across borders and institutions worldwide.',
            gradient: 'from-amber-500 to-brand-500'
        },
    ];

    return (
        <div className="space-y-32 py-12 relative overflow-hidden" onMouseMove={handleGlobalMouseMove}>
            {/* ── BACKGROUND LIGHTS ── */}
            <motion.div
                className="pointer-events-none fixed inset-0 z-0 opacity-30"
                style={{
                    background: `radial-gradient(1200px circle at ${mousePos.x}px ${mousePos.y}px, var(--primary-glow), transparent 40%)`,
                    transition: 'background 0.2s ease-out'
                }}
            />

            {/* ═══════ HERO SECTION ═══════ */}
            <motion.section 
                style={{ y: yHero, opacity: opacityHero }} 
                className="text-center max-w-5xl mx-auto space-y-12 relative pt-10"
            >
                {/* Floating Elements */}
                <motion.div 
                    animate={floatAnimation}
                    className="absolute -top-20 -left-20 w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full" 
                />
                <motion.div 
                    animate={{ ...floatAnimation, y: ["10%", "-10%"] }}
                    transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    className="absolute top-40 -right-20 w-80 h-80 bg-indigo-500/10 blur-[120px] rounded-full" 
                />

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center justify-center space-y-8"
                >
                    <motion.div
                        variants={fadeUp}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border relative z-10 hover:scale-105 transition-transform cursor-default"
                        style={{ background: 'var(--glow-brand)', borderColor: 'rgba(124,58,237,0.3)', color: 'var(--primary)' }}
                    >
                        <Sparkles size={14} className="animate-pulse text-fuchsia-400" />
                        AI-Powered Academic Credentials
                    </motion.div>

                    <motion.h1
                        variants={fadeUp}
                        className="text-6xl md:text-8xl font-display font-extrabold tracking-tight leading-[0.95] relative z-10"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Provable Trust <br />
                        <span className="text-gradient">on Blockchain</span>
                    </motion.h1>

                    <motion.p
                        variants={fadeUp}
                        className="text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed opacity-70 font-medium relative z-10"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Eradicate credential fraud with the world's most secure <br className="hidden md:block" />
                        academic identity system. Powered by AI & Ethereum.
                    </motion.p>

                    <motion.div
                        variants={scaleIn}
                        className="flex flex-wrap justify-center gap-6 relative z-10 pt-4"
                    >
                        {user ? (
                            <Link
                                to={`/${user.role === 'admin' ? 'admin' : user.role === 'institution' ? 'institution' : 'student'}`}
                                className="glass-button magnetic-button !px-10 !py-5 text-sm gap-3 group shadow-2xl"
                            >
                                Enter Dashboard
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/register"
                                    className="glass-button magnetic-button !px-10 !py-5 text-sm gap-3 group shadow-2xl hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] transition-all"
                                >
                                    Get Started Free
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/verify"
                                    className="px-8 py-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all border spotlight-card hover:border-brand-500/50 hover:bg-brand-500/5"
                                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
                                >
                                    <ShieldCheck size={18} /> Verify Credential
                                </Link>
                                {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                                    <div className="hidden sm:block">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => toast.error('Login Failed')}
                                            theme="filled_blue"
                                            shape="pill"
                                            text="signin_with"
                                            width="180"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* ═══════ STATS BAR ═══════ */}
            <motion.section
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="glass-card p-2 relative z-10 backdrop-blur-3xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/5 to-transparent shimmer-wrapper pointer-events-none" />
                <div className="grid grid-cols-2 md:grid-cols-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            variants={fadeUp}
                            className="flex flex-col items-center py-8 relative group cursor-default"
                        >
                            {i > 0 && <div className="absolute left-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-[var(--border-color)] to-transparent" />}
                            <motion.div 
                                whileHover={{ scale: 1.2, rotate: 5 }}
                                className="text-brand-400 mb-3 drop-shadow-[0_0_15px_rgba(124,58,237,0.5)] transition-all"
                            >
                                {stat.icon}
                            </motion.div>
                            <p className="text-3xl font-display font-bold group-hover:text-brand-400 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                            <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ═══════ FEATURES GRID ═══════ */}
            <section className="space-y-12 relative z-10">
                <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-center max-w-2xl mx-auto"
                >
                    <motion.h2
                        variants={fadeUp}
                        className="text-3xl md:text-4xl font-display font-bold"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Why <span className="text-gradient">AcadChain</span>?
                    </motion.h2>
                    <motion.p
                        variants={fadeUp}
                        className="mt-4 text-lg"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Built for the future of academic verification
                    </motion.p>
                </motion.div>

                <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid md:grid-cols-2 gap-6"
                >
                    {features.map((feat, i) => {
                        const { mousePos, handleMouseMove } = useMousePosition();
                        return (
                            <motion.div
                                key={i}
                                variants={scaleIn}
                                whileHover={{ y: -5, scale: 1.02 }}
                                onMouseMove={handleMouseMove}
                                style={{
                                    '--mouse-x': `${mousePos.x}px`,
                                    '--mouse-y': `${mousePos.y}px`,
                                }}
                                className="glass-card spotlight-card p-8 group cursor-default"
                            >
                                <motion.div 
                                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                    transition={{ duration: 0.5 }}
                                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center text-white mb-6 shadow-brand-glow relative z-10`}
                                >
                                    {feat.icon}
                                </motion.div>
                                <h3 className="text-xl font-display font-bold mb-3 relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-400 group-hover:to-indigo-400 transition-all duration-300" style={{ color: 'var(--text-primary)' }}>{feat.title}</h3>
                                <p className="leading-relaxed relative z-10" style={{ color: 'var(--text-secondary)' }}>{feat.desc}</p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </section>

            {/* ═══════ HOW IT WORKS ═══════ */}
            <section className="space-y-12 relative z-10">
                <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <motion.h2
                        variants={fadeUp}
                        className="text-3xl md:text-4xl font-display font-bold"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        How It Works
                    </motion.h2>
                </motion.div>

                <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-3 gap-8"
                >
                    {[
                        { step: '01', title: 'Institution Issues', desc: 'Universities issue credentials as NFTs on Ethereum blockchain with IPFS storage.', icon: <Building2 size={24} /> },
                        { step: '02', title: 'Student Receives', desc: 'Students receive verifiable credentials in their decentralized academic portfolio.', icon: <GraduationCap size={24} /> },
                        { step: '03', title: 'Anyone Verifies', desc: 'Employers and institutions verify credentials instantly using the public verification gateway.', icon: <CheckCircle size={24} /> },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            variants={fadeUp}
                            whileHover={{ y: -10 }}
                            className="glass-card p-8 text-center relative group"
                        >
                            <motion.div 
                                initial={{ opacity: 0.1, scale: 0.5 }}
                                whileInView={{ opacity: 0.1, scale: 1 }}
                                transition={{ duration: 0.5, delay: i * 0.2 }}
                                className="absolute -top-4 -right-4 text-8xl font-display font-bold text-brand-500/20 group-hover:text-brand-500/40 group-hover:rotate-12 transition-all duration-500"
                            >
                                {item.step}
                            </motion.div>
                            <motion.div 
                                whileHover={{ scale: 1.2, rotate: 360 }}
                                transition={{ duration: 0.6 }}
                                className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-brand-400 border border-brand-500/20 relative z-10"
                                style={{ background: 'var(--bg-card)' }}
                            >
                                {item.icon}
                            </motion.div>
                            <h3 className="text-xl font-display font-bold mb-3 relative z-10" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                            <p className="text-sm leading-relaxed relative z-10" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ═══════ CTA SECTION ═══════ */}
            <motion.section
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="glass-card p-12 md:p-16 text-center relative overflow-hidden group"
            >
                <motion.div 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-indigo-600/20 opacity-50 group-hover:opacity-100 transition-opacity duration-700" 
                />
                
                <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                    <motion.h2 
                        variants={scaleIn}
                        className="text-4xl md:text-5xl font-display font-bold" 
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Ready to Transform <br/>
                        <span className="text-gradient-gold">Academic Verification?</span>
                    </motion.h2>
                    <motion.p 
                        variants={fadeUp}
                        className="text-lg" 
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Join thousands of institutions and students building a trustworthy academic ecosystem.
                    </motion.p>
                    <motion.div 
                        variants={fadeUp}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        {user ? (
                            <Link to={`/${user.role === 'admin' ? 'admin' : user.role === 'institution' ? 'institution' : 'student'}`} className="glass-button !px-10 !py-4 text-sm gap-2 group">
                                Go to Dashboard <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <Link to="/register" className="glass-button !px-10 !py-4 text-sm gap-2 group shadow-brand-glow hover:shadow-brand-glow-lg transition-shadow">
                                Start Now <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
};

export default Home;
