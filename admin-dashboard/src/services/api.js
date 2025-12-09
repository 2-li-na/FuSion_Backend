import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================

export const login = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/admin/login`, {
    username,
    password,
  });
  return response.data;
};

export const verifyToken = async () => {
  const response = await api.get('/admin/verify');
  return response.data;
};

// ==================== ADMIN PASSWORD CHANGE ====================

export const changeAdminPassword = async (currentPassword, newPassword) => {
  const response = await api.put('/admin/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

// ==================== USERS ====================

export const getUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const searchUsers = async (query) => {
  const response = await api.get(`/admin/users/search/${query}`);
  return response.data;
};

export const getUser = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/admin/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

// ==================== POINTS ====================

export const getUserPoints = async (userId) => {
  const response = await api.get(`/admin/users/${userId}/points`);
  return response.data;
};

export const addPoints = async (userId, points, reason) => {
  const response = await api.post(`/admin/users/${userId}/points/add`, {
    points,
    reason,
  });
  return response.data;
};

export const removePoints = async (userId, points, reason) => {
  const response = await api.post(`/admin/users/${userId}/points/remove`, {
    points,
    reason,
  });
  return response.data;
};

export const getUserSteps = async (userId, params = {}) => {
  const response = await api.get(`/admin/users/${userId}/steps`, { params });
  return response.data;
};

// ==================== STATS ====================

export const getOverviewStats = async () => {
  const response = await api.get('/admin/stats/overview');
  return response.data;
};

export const getDepartmentStats = async () => {
  const response = await api.get('/admin/stats/departments');
  return response.data;
};

// ==================== REWARDS ====================

export const getRewards = async () => {
  const response = await api.get('/admin/rewards');
  return response.data;
};

export const getReward = async (rewardId) => {
  const response = await api.get(`/admin/rewards/${rewardId}`);
  return response.data;
};

export const createReward = async (rewardData) => {
  const response = await api.post('/admin/rewards', rewardData);
  return response.data;
};

export const updateReward = async (rewardId, rewardData) => {
  const response = await api.put(`/admin/rewards/${rewardId}`, rewardData);
  return response.data;
};

export const deleteReward = async (rewardId) => {
  const response = await api.delete(`/admin/rewards/${rewardId}`);
  return response.data;
};

export const toggleReward = async (rewardId) => {
  const response = await api.patch(`/admin/rewards/${rewardId}/toggle`);
  return response.data;
};

// ==================== CONTENT ====================

export const getContent = async (category = null) => {
  const params = category ? { category } : {};
  const response = await api.get('/admin/content', { params });
  return response.data;
};

export const getContentByKey = async (key) => {
  const response = await api.get(`/admin/content/${key}`);
  return response.data;
};

export const createContent = async (contentData) => {
  const response = await api.post('/admin/content', contentData);
  return response.data;
};

export const updateContent = async (key, contentData) => {
  const response = await api.put(`/admin/content/${key}`, contentData);
  return response.data;
};

export const deleteContent = async (key) => {
  const response = await api.delete(`/admin/content/${key}`);
  return response.data;
};

export const getContentCategories = async () => {
  const response = await api.get('/admin/content/categories/list');
  return response.data;
};

// ==================== ACCOUNT ====================

export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.put('/admin/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const redeemBonus = async (userId, itemName, cost, notes) => {
  const response = await api.post('/admin/bonus/redeem', {
    userId,
    itemName,
    cost,
    notes,
  });
  return response.data;
};

// ==================== Purchase History ====================

export const getUserPurchases = async (userId) => {
  const response = await api.get(`/admin/users/${userId}/purchases`);
  return response.data;
};

export const updatePurchase = async (purchaseId, purchaseData) => {
  const response = await api.put(`/admin/purchases/${purchaseId}`, purchaseData);
  return response.data;
};

export const deletePurchase = async (purchaseId) => {
  const response = await api.delete(`/admin/purchases/${purchaseId}`);
  return response.data;
};

export const getUserTotalSteps = async (userId) => {
  const response = await api.get(`/admin/users/${userId}/totalsteps`);
  return response.data;
};

export default api;