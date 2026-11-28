import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'matchwork_token';
export const USER_STORAGE_KEY = 'matchwork_user';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT Token from localStorage to every API request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle global 401 responses cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthRoute =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/switch');

    if (status === 401 && !isAuthRoute) {
      window.dispatchEvent(new CustomEvent('matchwork:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
  register: (payload) => api.post('/auth/register', payload).then((res) => res.data),
  switchAccount: (payload) => api.post('/auth/switch', payload).then((res) => res.data),
  logout: () => api.post('/auth/logout').then((res) => res.data),
  getMe: () => api.get('/auth/me').then((res) => res.data),
  getPersonas: () => api.get('/personas').then((res) => res.data),
};

export const matchingApi = {
  getFeed: (role, id, filters = {}) => {
    const cleanParams = { role, id };
    Object.entries(filters || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        cleanParams[k] = v;
      }
    });
    return api.get('/feed', { params: cleanParams }).then((res) => res.data);
  },
  resetFeed: (role, id) =>
    api.post('/feed/reset', { role, id }).then((res) => res.data),
  createInteraction: (payload) =>
    api.post('/interactions', payload).then((res) => res.data),
  undoLastInteraction: (role, id) =>
    api.post('/interactions/undo', { role, id }).then((res) => res.data),
  getInteractions: (params) =>
    api.get('/interactions', { params }).then((res) => res.data),
  deleteInteraction: (params) =>
    api.delete('/interactions', { data: params, params }).then((res) => res.data),
  getMatches: (role, id) =>
    api.get('/matches', { params: { role, id } }).then((res) => res.data),
  connectMatch: (id, payload) =>
    api.post(`/matches/${id}/connect`, payload).then((res) => res.data),
  getBreakdown: (id, params) =>
    api.get(`/matches/${id}/breakdown`, { params }).then((res) => res.data),
  simulateMatch: (payload) =>
    api.post('/simulate-match', payload).then((res) => res.data),
};

export const profileApi = {
  getSeekerProfile: () => api.get('/seekers/profile').then((res) => res.data),
  saveSeekerProfile: (payload) => api.post('/seekers/profile', payload).then((res) => res.data),
  getCandidateTags: (id) => api.get(`/candidates/${id}/tags`).then((res) => res.data),
  updateCandidateTags: (id, tags) =>
    api.put(`/candidates/${id}/tags`, { tags }).then((res) => res.data),
  createJob: (payload) => api.post('/jobs', payload).then((res) => res.data),
  getAllTags: () => api.get('/tags').then((res) => res.data),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats').then((res) => res.data),
  getJobs: () => api.get('/admin/jobs').then((res) => res.data),
  updateJobStatus: (jobId, status) =>
    api.patch(`/admin/jobs/${jobId}/status`, { status }).then((res) => res.data),
  getTags: () => api.get('/admin/tags').then((res) => res.data),
  createTag: (payload) => api.post('/admin/tags', payload).then((res) => res.data),
  getLogs: () => api.get('/admin/logs').then((res) => res.data),
};

export const messageApi = {
  getMessages: (connectionId) =>
    api.get(`/messages/${encodeURIComponent(connectionId)}`).then((res) => res.data),
};

export const settingsApi = {
  getAccountSettings: () => api.get('/settings/account').then((res) => res.data),
  updateNotifications: (payload) =>
    api.put('/settings/notifications', payload).then((res) => res.data),
  updateAppearance: (payload) =>
    api.put('/settings/appearance', payload).then((res) => res.data),
  changePassword: (payload) =>
    api.post('/settings/security/password', payload).then((res) => res.data),
  updateTwoFactor: (payload) =>
    api.put('/settings/security/2fa', payload).then((res) => res.data),
  getDevices: () => api.get('/settings/security/devices').then((res) => res.data),
  revokeDevice: (deviceId) =>
    api.delete(`/settings/security/devices/${encodeURIComponent(deviceId)}`).then((res) => res.data),
  revokeOtherDevices: () =>
    api.delete('/settings/security/devices').then((res) => res.data),
};

export default api;
