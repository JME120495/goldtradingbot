import axios from 'axios';

// Instance Axios configurée pour envoyer les cookies HttpOnly automatiquement
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  withCredentials: true,
});

// Stockage de l'Access Token uniquement en mémoire
let memoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  memoryAccessToken = token;
};

// Injection du token dans chaque requête
api.interceptors.request.use((config) => {
  if (memoryAccessToken && config.headers) {
    config.headers.Authorization = `Bearer ${memoryAccessToken}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interception des réponses et gestion du 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si c'est une 401, que ce n'est pas déjà une tentative de retry, et que ce n'est pas la route refresh elle-même
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        
        memoryAccessToken = data.access_token;
        originalRequest.headers.Authorization = 'Bearer ' + memoryAccessToken;
        
        processQueue(null, memoryAccessToken);
        
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        memoryAccessToken = null;
        
        if (typeof window !== 'undefined') {
           window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
