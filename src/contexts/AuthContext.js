// contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';                 // axios instance with baseURL '/api'

const AuthContext = createContext({});

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  /* ───────────  LOAD USER FROM STORAGE  ─────────── */
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const data  = localStorage.getItem('user');
    if (token && data) setUser(JSON.parse(data));
    setLoading(false);
  }, []);

  /* ───────────  AUTH ENDPOINTS  ─────────── */
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user',      JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/signup', { name, email, password });
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user',      JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  /* ───────────  PASSWORD-RECOVERY FLOW  ─────────── */
  // 1. request OTP
  const forgotPassword = async (email) => {
    try {
      const { data } = await api.post('/password/forgot-password', { email });
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to send OTP' };
    }
  };

  // 2 + 3. verify OTP then reset password
  const resetPassword = async (email, otp, newPassword) => {
    try {
      // verify-OTP
      const { data: verify } = await api.post('/password/verify-otp', { email, otp });
      if (!verify.success) {
        return { success: false, message: verify.message || 'Invalid OTP' };
      }

      // reset-password
      const { data: reset } = await api.post('/password/reset-password', {
        resetToken      : verify.resetToken,
        newPassword,
        confirmPassword : newPassword
      });

      return { success: reset.success, message: reset.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to reset password' };
    }
  };

  /* ───────────  CONTEXT VALUE  ─────────── */
  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
