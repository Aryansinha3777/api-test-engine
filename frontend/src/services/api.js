import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({ baseURL: API_BASE_URL });

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ate_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

export const MOCK_SERVER_BASE = API_BASE_URL === '/api'
  ? '/mock'
  : API_BASE_URL.replace(/\/api\/?$/, '/mock');


export const sendRequest = (data) => api.post('/test', data);


export const getSavedRequests = ()       => api.get('/requests');
export const createSavedRequest = (data) => api.post('/requests', data);
export const updateSavedRequest = (id, data) => api.put(`/requests/${id}`, data);
export const deleteSavedRequest = (id)   => api.delete(`/requests/${id}`);


export const getMockAPIs   = ()          => api.get('/mock');
export const createMockAPI = (data)      => api.post('/mock', data);
export const updateMockAPI = (id, data)  => api.put(`/mock/${id}`, data);
export const deleteMockAPI = (id)        => api.delete(`/mock/${id}`);

// History
export const getHistory   = () => api.get('/history');
export const clearHistory = () => api.delete('/history');

// Environments
export const getEnvironments    = ()          => api.get('/environments');
export const createEnvironment  = (data)      => api.post('/environments', data);
export const updateEnvironment  = (id, data)  => api.put(`/environments/${id}`, data);
export const deleteEnvironment  = (id)        => api.delete(`/environments/${id}`);