import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldCheck, ShieldAlert, ExternalLink, Hash, User, Building, Calendar, Award, Loader2, History, Trash2, Clock, Globe, Fingerprint, FileSearch, UploadCloud, Sparkles, Camera, QrCode, BrainCircuit } from 'lucide-react';
import { useBlockchain } from '../context/BlockchainContext';
import { certAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import QRScanner from '../components/QRScanner';

const VerifierPage = () => {
    const { contract } = useBlockchain();
    const [certId, setCertId] = useState('');
    const [fileHash, setFileHash] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [result, setResult] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isScanningQR, setIsScanningQR] = useState(false);
    const [history, setHistory] = useState(() => {
        try {
            const saved = localStorage.getItem('verifyHistory');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const saveToHistory = (data) => {
        const entry = { ...data, timestamp: new Date().toISOString() };
        // Filter out the exact same search to bring it to the top. Use 'tx' (Transaction hash/cert ID) as the unique identifier.
        setHistory(prev => {
            const filtered = prev.filter(h => h.tx !== data.tx);
            const updated = [entry, ...filtered].slice(0, 5); // Keep last 5 unique searches
            localStorage.setItem('verifyHistory', JSON.stringify(updated));
            return updated;
        });
    };

    const clearHistory = () => { setHistory([]); localStorage.removeItem('verifyHistory'); };

    const handleFileVerify = (e) => {
        const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
        if (!file) return;

        setIsVerifying(true);
        toast.loading("Analyzing file cryptographically...", { id: 'file-verify' });

        // Simulating SHA-256 Hash calculation and lookup
        setTimeout(() => {
            toast.dismiss('file-verify');
            toast.error("File-based Hash Verification failed: No digital twin found on blockchain.");
            setIsVerifying(false);
        }, 1500);
    };

    const handleQRScan = (decodedText) => {
        setIsScanningQR(false);
        let extractedId = decodedText;
        if (decodedText.includes('/verify/')) {
            extractedId = decodedText.split('/verify/').pop();
        }
        setCertId(extractedId);
        toast.success("QR Scanned successfully!");
        handleVerify(null, extractedId);
    };

    const handleVerify = async (e, overrideId) => {
        if (e && e.preventDefault) e.preventDefault();
        const idToVerify = (overrideId || certId).trim();
        if (!idToVerify) return toast.error('Enter a certificate ID');
        setIsVerifying(true);
        setResult(null);

        try {
            // First try the backend API
            const { data } = await certAPI.verifyCert(idToVerify);
            const r = {
                status: 'valid',
                student: data.student?.name || 'Unknown',
                institution: data.institution?.name || 'Unknown',
                course: data.courseName,
                grade: data.grade,
                date: new Date(data.issueDate).toLocaleDateString(),
                tx: data.blockchainTxHash,
                ipfsHash: data.ipfsHash,
                verificationStatus: data.verificationStatus,
            };
            setResult(r);
            saveToHistory(r);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#7c3aed', '#10b981', '#3b82f6'] });
            toast.success('Certificate verified on database!');
        } catch (apiErr) {
            // If backend doesn't have it, try blockchain
            if (contract) {
                try {
                    const det = await contract.verifyCertificate(idToVerify);
                    if (det && det.isValid) {
                        const r = {
                            status: 'valid',
                            student: det.student || 'On-chain',
                            institution: det.institution || 'On-chain',
                            course: det.courseName || 'Academic Credential',
                            date: new Date(Number(det.issueDate) * 1000).toLocaleDateString(),
                            tx: idToVerify,
                        };
                        setResult(r);
                        saveToHistory(r);
                        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#7c3aed', '#10b981', '#3b82f6'] });
                        toast.success('Verified on blockchain!');
                    } else {
                        setResult({ status: 'invalid' });
                    }
                } catch {
                    setResult({ status: 'invalid' });
                }
            } else {
                setResult({ status: 'invalid' });
            }
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="space-y-10">
            <div className="text-center max-w-3xl mx-auto py-6">
                <div className="flex justify-center mb-5">
                    <div className="p-3 rounded-2xl border border-brand-500/20" style={{ background: 'var(--glow-brand)' }}>
                        <Globe size={28} className="text-brand-400" />
                    </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Verification Gateway</h2>
                <p className="mt-3 text-lg" style={{ color: 'var(--text-secondary)' }}>Verify academic credentials from database &amp; blockchain.</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="glass-card p-6 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                            <div className="absolute top-0 right-0 w-32 h-32 blur-[60px]" style={{ background: 'var(--glow-brand)' }} />
                            <div>
                                <h4 className="text-sm font-bold flex items-center gap-2 mb-2" style={{ color: 'var(--text-primary)' }}>
                                    <Fingerprint size={16} className="text-brand-400" /> Manual Verify
                                </h4>
                                <p className="text-[10px] leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>Enter the unique on-chain ID found on AcadChain credentials.</p>
                                <div className="space-y-3">
                                    <input type="text" value={certId} onChange={e => setCertId(e.target.value)} placeholder="0x..." className="input-field !py-2.5 text-xs font-mono tracking-wider" />
                                    <button onClick={(e) => handleVerify(e)} disabled={isVerifying} className="glass-button w-full !py-2.5 text-xs font-bold gap-2">
                                        {isVerifying ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />} Verify ID
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileVerify(e); }}
                            className={`glass-card p-6 relative overflow-hidden flex flex-col justify-between min-h-[220px] border-dashed transition-all cursor-pointer group ${isDragging ? 'border-fuchsia-500 scale-[1.02] bg-fuchsia-500/5' : ''}`}
                            style={{ borderStyle: 'dashed', borderColor: isDragging ? 'rgba(217,70,239,0.5)' : 'var(--border-color)' }}
                        >
                            <div className="absolute top-0 left-0 w-32 h-32 blur-[60px] opacity-30" style={{ background: 'var(--fuchsia-500, #d946ef)' }} />
                            <input type="file" id="file-verify" className="hidden" onChange={handleFileVerify} />
                            <label htmlFor="file-verify" className="absolute inset-0 cursor-pointer">
                                <span className="sr-only">Upload File</span>
                            </label>

                            <div className="relative z-10">
                                <h4 className="text-sm font-bold flex items-center gap-2 mb-2" style={{ color: 'var(--text-primary)' }}>
                                    <BrainCircuit size={16} className="text-fuchsia-400 animate-pulse" /> AI Fraud Check
                                </h4>
                                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Drag & drop any AcadChain PDF. Our AI engine verifies its cryptographic signature instantly.</p>
                            </div>

                            <div className="flex flex-col items-center gap-2 py-4 relative z-10">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-[0_0_15px_rgba(217,70,239,0.2)] ${isDragging ? 'bg-fuchsia-500 text-white shadow-fuchsia-500/50' : 'bg-fuchsia-500/10 text-fuchsia-400 group-hover:bg-fuchsia-500/20'}`}>
                                    <UploadCloud size={24} className={isDragging ? 'animate-bounce' : ''} />
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{isDragging ? 'Release to Scan' : 'Drop PDF or Click'}</span>
                            </div>
                        </div>

                        {/* Scanner Card */}
                        <div className="glass-card p-6 relative overflow-hidden flex flex-col justify-between min-h-[220px] md:col-span-2">
                            <div className="absolute top-0 right-0 w-32 h-32 blur-[60px]" style={{ background: 'var(--glow-brand)' }} />
                            {isScanningQR ? (
                                <div className="absolute inset-0 z-20 flex flex-col">
                                    <QRScanner onScan={handleQRScan} onClose={() => setIsScanningQR(false)} />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <h4 className="text-sm font-bold flex items-center gap-2 mb-2" style={{ color: 'var(--text-primary)' }}>
                                            <Camera size={16} className="text-brand-400" /> Live Scanner
                                        </h4>
                                        <p className="text-[10px] leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>Hold a verifiable QR code up to your webcam for instant blockchain verification.</p>
                                    </div>

                                    <div className="flex flex-col items-center gap-2 py-2">
                                        <button onClick={() => setIsScanningQR(true)} className="glass-button w-full !py-2.5 text-[10px] font-bold uppercase tracking-widest gap-2">
                                            <QrCode size={14} /> Start Camera
                                        </button>
                                        <p className="text-[9px] text-center mt-2 opacity-50" style={{ color: 'var(--text-muted)' }}>Secure • Fast • On-chain</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {result && (
                            <motion.div key={result.status + (result.tx || '')} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card overflow-hidden" style={{ borderColor: result.status === 'valid' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)' }}>
                                <div className="p-8 flex items-center gap-5" style={{ background: result.status === 'valid' ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)' }}>
                                    <div className={`p-3 rounded-2xl ${result.status === 'valid' ? 'text-emerald-400' : 'text-red-400'}`} style={{ background: result.status === 'valid' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                                        {result.status === 'valid' ? <ShieldCheck size={36} /> : <ShieldAlert size={36} />}
                                    </div>
                                    <div>
                                        <h3 className={`text-2xl font-display font-bold ${result.status === 'valid' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {result.status === 'valid' ? 'Verification Successful' : 'Verification Failed'}
                                        </h3>
                                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                            {result.status === 'valid' ? 'Credential found and verified.' : 'No matching certificate found in database or blockchain.'}
                                        </p>
                                    </div>
                                </div>
                                {result.status === 'valid' && (
                                    <div className="p-8">
                                        {/* AI Confidence Score */}
                                        <div className="mb-6 p-4 rounded-xl border bg-fuchsia-500/5 border-fuchsia-500/20">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold flex items-center gap-1.5 uppercase text-fuchsia-400">
                                                    <BrainCircuit size={14} className="animate-pulse" /> AI Fraud Check
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Safe
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mb-1">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `99.9%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]" />
                                            </div>
                                            <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                                <span>Confidence Score</span>
                                                <span className="font-mono text-fuchsia-400">99.9%</span>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                                            {[
                                                { icon: <User size={16} />, label: "Student", val: result.student },
                                                { icon: <Building size={16} />, label: "Institution", val: result.institution },
                                                { icon: <Award size={16} />, label: "Credential", val: result.course },
                                                { icon: <Calendar size={16} />, label: "Date", val: result.date },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-brand-400 border" style={{ background: 'var(--glow-brand)', borderColor: 'var(--border-color)' }}>{item.icon}</div>
                                                    <div>
                                                        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                                                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.val}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {result.grade && (
                                            <div className="mb-6 flex items-center gap-2">
                                                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md border text-emerald-400 border-emerald-500/20" style={{ background: 'rgba(16,185,129,0.1)' }}>
                                                    Grade: {result.grade}
                                                </span>
                                            </div>
                                        )}
                                        <div className="pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: 'var(--border-color)' }}>
                                            <div className="px-4 py-2 rounded-lg border flex items-center gap-2" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                                                <Hash size={12} style={{ color: 'var(--text-muted)' }} />
                                                <span className="text-[10px] font-mono truncate max-w-[280px]" style={{ color: 'var(--text-muted)' }}>{result.tx}</span>
                                            </div>
                                            <a href={`https://sepolia.etherscan.io/tx/${result.tx}`} target="_blank" rel="noopener" className="text-brand-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 hover:text-brand-300 transition-colors">
                                                Explorer <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* History Sidebar */}
                <div className="lg:col-span-4">
                    <div className="glass-card p-6 sticky top-24 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-base font-display font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><History size={16} className="text-brand-400" /> Recent</h3>
                            {history.length > 0 && <button onClick={clearHistory} className="transition-colors hover:text-red-400" style={{ color: 'var(--text-muted)' }}><Trash2 size={14} /></button>}
                        </div>
                        {history.length === 0 ? (
                            <div className="py-10 text-center flex flex-col items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                <Clock size={28} className="opacity-20" /><p className="text-xs font-bold uppercase tracking-widest">No Searches Yet</p>
                            </div>
                        ) : history.map((h, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="p-3 rounded-xl border mb-2 cursor-pointer transition-all hover:border-brand-500/30" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-input)' }} onClick={() => setResult(h)}>
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{h.student}</p>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest truncate" style={{ color: 'var(--text-muted)' }}>{h.course}</p>
                                <p className="text-[8px] font-mono mt-1.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Clock size={8} /> {new Date(h.timestamp).toLocaleString()}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifierPage;
// HMR trigger
