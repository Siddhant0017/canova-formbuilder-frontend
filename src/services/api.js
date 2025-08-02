// Add request debouncing to prevent duplicate requests
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Track pending requests to prevent duplicates
const pendingRequests = new Map();

// Request interceptor to add auth token and prevent duplicates
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Create a request identifier based on method and URL
    const requestId = `${config.method}:${config.url}`;
    
    // For POST/PUT/DELETE requests (form submissions), check if a duplicate is pending
    if (['post', 'put', 'delete'].includes(config.method)) {
      if (pendingRequests.has(requestId)) {
        // Cancel this request as a duplicate
        return {
          ...config,
          cancelToken: new axios.CancelToken(cancel => cancel('Duplicate request canceled'))
        };
      }
      
      // Mark this request as pending
      pendingRequests.set(requestId, true);
      
      // Add a handler to remove from pending when done
      config.finally = () => {
        pendingRequests.delete(requestId);
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Clear pending status for this request
    const requestId = `${response.config.method}:${response.config.url}`;
    pendingRequests.delete(requestId);
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
      return Promise.reject(error);
    }
    
    // Clear pending status for this request
    if (error.config) {
      const requestId = `${error.config.method}:${error.config.url}`;
      pendingRequests.delete(requestId);
    }
    
    const message = error.response?.data?.message || 'An error occurred';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
