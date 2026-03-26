import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { BlockchainProvider } from './context/BlockchainContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                    <AuthProvider>
                        <BlockchainProvider>
                            <NotificationProvider>
                                <App />
                                <Toaster
                                    position="bottom-right"
                                    toastOptions={{
                                        style: {
                                            background: 'rgba(15,10,30,0.95)',
                                            color: '#e2e8f0',
                                            border: '1px solid rgba(124,58,237,0.2)',
                                            backdropFilter: 'blur(24px)',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                        },
                                        success: { iconTheme: { primary: '#7c3aed', secondary: '#fff' } },
                                        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                                    }}
                                />
                            </NotificationProvider>
                        </BlockchainProvider>
                    </AuthProvider>
                </GoogleOAuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>
);
