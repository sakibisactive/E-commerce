import { API_BASE_URL, BACKEND_URL } from '../config/api.js';
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpPending, setOtpPending] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');

  // Configure Axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/users/profile`);
      setUser(res.data.user);
    } catch (error) {
      console.error('Fetch Profile Error:', error.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      // If OTP is required, set intermediate state
      if (res.data.otpRequired) {
        setOtpPending(true);
        setOtpEmail(res.data.email);
        return { otpRequired: true, message: res.data.message };
      }
      return { success: false, message: 'Unexpected response format' };
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
      const { token, ...userData } = res.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setOtpPending(false);
      setOtpEmail('');
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'OTP verification failed';
    }
  };

  const register = async (name, email, phone, password, confirmPassword) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        phone,
        password,
        confirmPassword,
      });
      return res.data.message;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const logout = async () => {
    try {
      if (localStorage.getItem('token')) {
        await axios.post(`${API_URL}/auth/logout`);
      }
    } catch (e) {
      // ignore logout audit errors
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setOtpPending(false);
      setOtpEmail('');
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put(`${API_URL}/users/profile`, profileData);
      setUser(prev => ({ ...prev, ...res.data }));
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Profile update failed';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        otpPending,
        otpEmail,
        login,
        verifyOTP,
        register,
        logout,
        updateProfile,
        fetchUserProfile,
        setOtpPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
