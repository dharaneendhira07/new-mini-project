import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Lazy loaded pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const InstitutionDashboard = lazy(() => import('./pages/InstitutionDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const VerifierPage = lazy(() => import('./pages/VerifierPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const BlockchainExplorer = lazy(() => import('./pages/BlockchainExplorer'));
const CertificateView = lazy(() => import('./pages/CertificateView'));
const ActivityLogs = lazy(() => import('./pages/ActivityLogs'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Full-screen loading skeleton
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
            <div className="loading-spinner !w-10 !h-10 !border-[3px]" />
            <p className="text-xs font-bold uppercase tracking-widest animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
    </div>
);

// Role-based Protected Route
const ProtectedRoute = ({ roles }) => {
    const { user, loading } = useAuth();
    if (loading) return <PageLoader />;
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
    return <Outlet />;
};

const App = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify/:certId" element={<CertificateView />} />

                {/* Main layout */}
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/verify" element={<VerifierPage />} />
                    <Route path="/explorer" element={<BlockchainExplorer />} />

                    {/* Student routes */}
                    <Route element={<ProtectedRoute roles={['student']} />}>
                        <Route path="/student" element={<StudentDashboard />} />
                    </Route>

                    {/* Institution routes */}
                    <Route element={<ProtectedRoute roles={['institution']} />}>
                        <Route path="/institution" element={<InstitutionDashboard />} />
                    </Route>

                    {/* Admin routes */}
                    <Route element={<ProtectedRoute roles={['admin']} />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/logs" element={<ActivityLogs />} />
                    </Route>

                    {/* Authenticated routes (any role) */}
                    <Route element={<ProtectedRoute roles={['admin', 'institution', 'student', 'verifier']} />}>
                        <Route path="/settings" element={<SettingsPage />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </Suspense>
    );
};

export default App;
