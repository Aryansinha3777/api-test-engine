import axios from 'axios';

const api = axios.create({ baseURL: '/api' });


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