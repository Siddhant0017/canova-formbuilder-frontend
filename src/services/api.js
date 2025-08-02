
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});


const pendingRequests = new Map();


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }


    const requestId = `${config.method}:${config.url}`;


    if (['post', 'put', 'delete'].includes(config.method)) {
      if (pendingRequests.has(requestId)) {

        return {
          ...config,
          cancelToken: new axios.CancelToken(cancel => cancel('Duplicate request canceled'))
        };
      }


      pendingRequests.set(requestId, true);


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


api.interceptors.response.use(
  (response) => {

    const requestId = `${response.config.method}:${response.config.url}`;
    pendingRequests.delete(requestId);
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
      return Promise.reject(error);
    }


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
