// src/components/ProtectedRoute.js
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to Login screen
      navigation.navigate('Login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null; // or a loading spinner while redirecting
  }

  return children;
};