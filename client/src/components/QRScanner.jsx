import React, { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

const QRScanner = ({ onScan, onClose }) => {
    useEffect(() => {
        let html5QrCode;

        const startScanning = async () => {
            try {
                html5QrCode = new Html5Qrcode("qr-reader");
                await html5QrCode.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        if (html5QrCode.isScanning) {
                            html5QrCode.stop().then(() => {
                                onScan(decodedText);
                            });
                        }
                    },
                    (errorMessage) => {
                        // Background scan errors, safely ignored
                    }
                );
            } catch (err) {
                console.error("Camera init error:", err);
            }
        };

        // Small timeout to ensure DOM element is ready
        setTimeout(() => startScanning(), 100);

        return () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().catch(e => console.error("Error stopping scanner:", e));
            }
        };
    }, [onScan]);

    return (
        <div className="relative w-full overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--border-color)', background: '#000' }}>
            <div id="qr-reader" className="w-full h-[220px]"></div>

            <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 text-white backdrop-blur-md hover:bg-red-500/80 transition-colors z-10"
            >
                <X size={16} />
            </button>
            <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md">
                    Align QR within frame
                </span>
            </div>
        </div>
    );
};

export default QRScanner;
