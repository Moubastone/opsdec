import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const getActivity = () => api.get('/activity');
export const getHistory = (params = {}) => api.get('/history', { params });
export const deleteHistoryItem = (id) => api.delete(`/history/${id}`);
export const getUsers = () => api.get('/users');
export const getUserStats = (userId) => api.get(`/users/${userId}/stats`);
export const getDashboardStats = () => api.get('/stats/dashboard');
export const getRecentMedia = (limit = 20) => api.get('/media/recent', { params: { limit } });
export const testEmbyConnection = () => api.get('/emby/test');
export const getEmbyLibraries = () => api.get('/emby/libraries');
export const getServerHealth = () => api.get('/servers/health');
export const getSettings = () => api.get('/settings');
export const updateSetting = (key, value) => api.put(`/settings/${key}`, { value });
export const getUsersByServer = () => api.get('/settings/users-by-server');
export const getUserMappings = () => api.get('/settings/user-mappings');
export const createUserMapping = (mapping) => api.post('/settings/user-mappings', mapping);
export const deleteUserMapping = (primaryUsername) => api.delete(`/settings/user-mappings/${primaryUsername}`);
export const purgeDatabase = () => api.post('/database/purge');
export const createBackup = () => api.post('/database/backup');
export const getBackups = () => api.get('/database/backups');
export const restoreBackup = (filename) => api.post('/database/restore', { filename });
export const deleteBackup = (filename) => api.delete(`/database/backups/${filename}`);
export const uploadBackup = (file) => {
  const formData = new FormData();
  formData.append('backup', file);
  return api.post('/database/backups/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export default api;
