import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
    const stored = localStorage.getItem('user');
    if (stored) {
        const { token } = JSON.parse(stored);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Auto-logout on 401
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            // Don't redirect here — let the component handle it
        }
        return Promise.reject(error);
    }
);

// ═══════ AUTH ═══════
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    googleLogin: (tokenId, role) => api.post('/auth/google', { tokenId, role }),
};

// ═══════ CERTIFICATES ═══════
export const certAPI = {
    getStudentCerts: () => api.get('/certificates/student'),
    getInstitutionCerts: () => api.get('/certificates/institution'),
    getAllCerts: () => api.get('/certificates/all'),
    issueCert: (data) => api.post('/certificates/issue', data),
    verifyCert: (certId) => api.get(`/certificates/verify/${certId}`),
};

// ═══════ INSTITUTIONS ═══════
export const instAPI = {
    getPending: () => api.get('/institutions/pending'),
    approve: (id) => api.put(`/institutions/approve/${id}`),
    apply: (data) => api.post('/institutions/apply', data),
};

// ═══════ USERS ═══════
export const userAPI = {
    getAll: () => api.get('/users'),
    updateProfile: (data) => api.put('/users/profile', data),
    getAuditLogs: () => api.get('/users/audit-logs'),
};

// ═══════ AI ═══════
export const aiAPI = {
    getInsights: () => api.get('/ai/insights'),
};

export default api;
