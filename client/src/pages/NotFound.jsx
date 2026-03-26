import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Fingerprint } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md"
            >
                <div className="relative mb-8 flex justify-center">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="text-brand-500/10"
                    >
                        <Fingerprint size={120} />
                    </motion.div>
                </div>

                <h1 className="text-8xl font-display font-bold text-gradient mb-4">404</h1>
                <h2 className="text-xl font-display font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Page Not Found
                </h2>
                <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                    The credential you're looking for doesn't exist on this chain.
                </p>

                <div className="flex justify-center gap-3">
                    <Link to="/" className="glass-button !px-6 !py-3 text-sm gap-2">
                        <Home size={16} /> Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all border"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
                    >
                        <ArrowLeft size={16} /> Go Back
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;
