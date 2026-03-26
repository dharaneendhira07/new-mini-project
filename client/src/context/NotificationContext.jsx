import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    const [notifications, setNotifications] = useState([
        { id: 1, type: 'success', title: 'Certificate Issued', message: 'MERN Stack Mastery credential minted on blockchain.', time: '2 min ago', read: false, icon: '🎓' },
        { id: 2, type: 'info', title: 'Verification Request', message: 'Someone verified your Blockchain Fundamentals certificate.', time: '15 min ago', read: false, icon: '🔍' },
        { id: 3, type: 'warning', title: 'Suspicious Activity', message: 'Multiple verification attempts from IP 203.64.x.x detected.', time: '1 hr ago', read: true, icon: '⚠️' },
        { id: 4, type: 'success', title: 'Blockchain Confirmed', message: 'TX 0x3f9a...b12c confirmed on Sepolia testnet.', time: '3 hr ago', read: true, icon: '⛓️' },
        { id: 5, type: 'info', title: 'System Update', message: 'AcadChain v2.0 is now deployed with AI insights.', time: '1 day ago', read: true, icon: '🚀' },
    ]);

    const [activePops, setActivePops] = useState([]);

    const addNotification = useCallback((notif) => {
        const id = Date.now();
        const newNotif = {
            id,
            read: false,
            time: 'Just now',
            ...notif
        };
        setNotifications(prev => [newNotif, ...prev]);

        // Add to pops
        setActivePops(prev => [...prev, newNotif]);

        // Remove from pops after 8 seconds (slightly longer for premium feel)
        setTimeout(() => {
            setActivePops(prev => prev.filter(p => p.id !== id));
        }, 8000);
    }, []);

    // Socket Connection Management
    useEffect(() => {
        if (user && user._id) {
            const socketUrl = import.meta.env.VITE_API_URL.replace('/api', '') || 'http://localhost:5000';
            console.log('🔌 Connecting to WebSocket at:', socketUrl);
            
            const newSocket = io(socketUrl, {
                query: { userId: user._id }
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('✅ Real-time notifications connected!');
            });

            newSocket.on('notification', (notif) => {
                console.log('🔔 New real-time notification:', notif);
                addNotification(notif);
            });

            newSocket.on('disconnect', () => {
                console.log('❌ Notifications disconnected');
            });

            return () => {
                newSocket.off('notification');
                newSocket.close();
            };
        }
    }, [user, addNotification]);

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const markRead = useCallback((id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const clearAll = useCallback(() => setNotifications([]), []);

    const removePop = useCallback((id) => {
        setActivePops(prev => prev.filter(p => p.id !== id));
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            activePops,
            addNotification,
            markAllRead,
            markRead,
            clearAll,
            removePop,
            unreadCount
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
