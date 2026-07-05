import { API_BASE_URL, BACKEND_URL } from '../config/api.js';
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure Axios defaults on initial load
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

  // Direct login with Phone/Email + Password
  const login = async (identifier, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        emailOrPhone: identifier,
        password,
      });

      const { token, ...userData } = res.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please check your credentials.';
    }
  };

  // Register user and trigger email OTP dispatch
  const register = async (name, email, phone, password, confirmPassword) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        phone,
        password,
        confirmPassword,
      });
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed.';
    }
  };

  // Verify registration OTP and auto-login
  const verifyOTP = async (email, otp) => {
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
      const { token, ...userData } = res.data;

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'OTP verification failed. Please check your code.';
    }
  };

  const logout = async () => {
    try {
      if (localStorage.getItem('token')) {
        await axios.post(`${API_URL}/auth/logout`);
      }
    } catch (e) {
      // ignore audit log error on logout
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put(`${API_URL}/users/profile`, profileData);
      setUser((prev) => ({ ...prev, ...res.data }));
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Profile update failed.';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verifyOTP,
        register,
        logout,
        updateProfile,
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
