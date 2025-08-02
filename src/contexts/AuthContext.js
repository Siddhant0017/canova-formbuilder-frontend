
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';      

const AuthContext = createContext({});

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const data  = localStorage.getItem('user');
    if (token && data) setUser(JSON.parse(data));
    setLoading(false);
  }, []);

 
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

  

  const forgotPassword = async (email) => {
    try {
      const { data } = await api.post('/password/forgot-password', { email });
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to send OTP' };
    }
  };


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
