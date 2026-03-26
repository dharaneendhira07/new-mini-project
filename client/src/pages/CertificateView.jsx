import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { certAPI } from '../services/api';
import { ShieldCheck, Download, Share2, ExternalLink, Award, Hash, Calendar, Building, User, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Lazy import for QRCode
let QRCodeSVG;
try { QRCodeSVG = require('qrcode.react').QRCodeSVG; } catch { QRCodeSVG = null; }

const CertificateView = () => {
    const { certId } = useParams();
    const [cert, setCert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const certRef = useRef(null);

    const verifyUrl = `${window.location.origin}/verify/${certId}`;

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await certAPI.verifyCert(certId);
                setCert(data);
            } catch {
                setError('Certificate not found or invalid ID.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [certId]);

    const handleDownloadPDF = async () => {
        if (!certRef.current) return;
        toast.loading('Generating PDF...', { id: 'pdf' });
        try {
            const { default: html2canvas } = await import('html2canvas');
            const { default: jsPDF } = await import('jspdf');
            const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: '#0a0618', useCORS: true });
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [297, 210] });
            const ratio = canvas.width / canvas.height;
            const w = pdf.internal.pageSize.getWidth();
            const h = w / ratio;
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, (210 - h) / 2, w, h);
            pdf.save(`AcadChain_${cert?.courseName?.replace(/\s+/g, '_')}.pdf`);
            toast.dismiss('pdf');
            toast.success('PDF Downloaded!');
        } catch (err) {
            toast.dismiss('pdf');
            toast.error('PDF generation failed');
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: 'My Academic Credential', url: verifyUrl });
        } else {
            navigator.clipboard.writeText(verifyUrl);
            toast.success('Link copied!');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
            <div className="flex flex-col items-center gap-4">
                <div className="loading-spinner !w-12 !h-12 !border-[3px]" />
                <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Loading Certificate...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
            <div className="glass-card p-12 text-center max-w-md">
                <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
                <h2 className="text-xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Invalid Certificate</h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{error}</p>
                <Link to="/" className="glass-button !px-6 !py-2.5 text-sm">Go Home</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Actions Bar */}
                <div className="flex justify-between items-center">
                    <Link to="/" className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>← Back to AcadChain</Link>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={handleShare} className="px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 transition-all hover:border-brand-500/30" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
                            <Share2 size={14} /> Share
                        </button>
                        <a
                            href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(cert?.courseName || '')}&organizationName=${encodeURIComponent(cert?.institution?.name || '')}&issueYear=${new Date(cert?.issueDate || Date.now()).getFullYear()}&issueMonth=${new Date(cert?.issueDate || Date.now()).getMonth() + 1}&certId=${encodeURIComponent(cert?.certId || '')}&certUrl=${encodeURIComponent(verifyUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all text-white shadow-lg hover:scale-105"
                            style={{ background: '#0a66c2', boxShadow: '0 4px 14px rgba(10, 102, 194, 0.4)' }}
                        >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                            Add to Profile
                        </a>
                        <button onClick={handleDownloadPDF} className="glass-button !px-5 !py-2 text-sm gap-2">
                            <Download size={14} /> Download PDF
                        </button>
                    </div>
                </div>

                {/* Certificate */}
                <motion.div ref={certRef} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-3xl border"
                    style={{ background: 'linear-gradient(135deg, #0a0618 0%, #0d0a2e 50%, #0a0618 100%)', borderColor: 'rgba(124,58,237,0.3)', minHeight: '500px', boxShadow: '0 0 80px rgba(124,58,237,0.15)' }}
                >
                    {/* Background decoration */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
                        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #6d28d9, transparent)' }} />
                        {/* Top border glow */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-60" />
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-60" />
                    </div>

                    <div className="relative z-10 p-12 md:p-16 grid md:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="md:col-span-2 flex flex-col justify-between">
                            {/* Header */}
                            <div>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2.5 rounded-xl" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
                                        <Award size={24} className="text-brand-400" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-brand-400">AcadChain Verified</p>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Digital Academic Credential</p>
                                    </div>
                                </div>

                                <p className="text-slate-500 text-sm mb-2">This is to certify that</p>
                                <h1 className="text-4xl md:text-5xl font-display font-bold mb-1" style={{ color: '#e2e8f0' }}>
                                    {cert?.student?.name || 'Student Name'}
                                </h1>
                                <p className="text-slate-400 text-sm mb-8">{cert?.student?.email}</p>

                                <p className="text-slate-500 text-sm mb-2">has successfully completed</p>
                                <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-400 mb-6">
                                    {cert?.courseName}
                                </h2>

                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700/50" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <Building size={14} className="text-brand-400" />
                                        <span className="text-sm font-bold text-slate-300">{cert?.institution?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700/50" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <Award size={14} className="text-emerald-400" />
                                        <span className="text-sm font-bold text-slate-300">Grade: {cert?.grade}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700/50" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <Calendar size={14} className="text-indigo-400" />
                                        <span className="text-sm font-bold text-slate-300">{new Date(cert?.issueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Blockchain Badge */}
                            <div className="mt-10 flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-500/20 w-fit" style={{ background: 'rgba(16,185,129,0.05)' }}>
                                <ShieldCheck size={18} className="text-emerald-400" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Blockchain Verified</p>
                                    <p className="font-mono text-[10px] text-slate-500 mt-0.5 truncate max-w-[220px]">{cert?.blockchainTxHash}</p>
                                </div>
                            </div>
                        </div>

                        {/* QR Code Side */}
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="p-4 rounded-2xl border border-brand-500/20" style={{ background: 'rgba(124,58,237,0.08)' }}>
                                {QRCodeSVG ? (
                                    <QRCodeSVG value={verifyUrl} size={140} fgColor="#7c3aed" bgColor="transparent"
                                        level="H"
                                        imageSettings={{ src: '/favicon.ico', height: 24, width: 24, excavate: true }}
                                    />
                                ) : (
                                    <div className="w-36 h-36 border-2 border-brand-500/30 rounded-lg flex items-center justify-center">
                                        <Hash size={32} className="text-brand-500/40" />
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Scan to verify</p>
                                <p className="text-[9px] font-mono text-slate-600 mt-0.5 max-w-[150px] break-all">{cert?.certId}</p>
                            </div>
                            <a href={`https://sepolia.etherscan.io/tx/${cert?.blockchainTxHash}`} target="_blank"
                                className="flex items-center gap-1.5 text-[10px] font-bold text-brand-400 hover:text-brand-300 transition-colors mt-2">
                                View on Etherscan <ExternalLink size={10} />
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* Verification Note */}
                <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                    This credential is cryptographically secured on the Ethereum blockchain. Certificate ID: <span className="font-mono text-brand-400">{certId}</span>
                </p>
            </div>
        </div>
    );
};

export default CertificateView;
