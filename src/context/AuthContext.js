// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load token from storage on app start
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          // Optionally validate token with your backend
          setUser({ token });
        }
      } catch (error) {
        console.error('Failed to load auth token', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    // Call your API, get token, store it
    try {
      // Example: const response = await api.login(email, password);
      // const { token, user } = response.data;
      const token = 'fake-jwt-token'; // Replace with actual
      const userData = { id: 1, email, name: 'User' };
      await AsyncStorage.setItem('authToken', token);
      setUser({ token, ...userData });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);