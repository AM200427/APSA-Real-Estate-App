// src/context/LoadingContext.js
import React, { createContext, useContext, useState, useRef } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const loadingCount = useRef(0);

  const showLoading = (message = 'Loading...') => {
    loadingCount.current += 1;
    setLoadingMessage(message);
    setLoading(true);
  };

  const hideLoading = () => {
    loadingCount.current -= 1;
    if (loadingCount.current <= 0) {
      loadingCount.current = 0;
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const withLoading = async (promise, message = 'Loading...') => {
    try {
      showLoading(message);
      const result = await promise;
      return result;
    } finally {
      hideLoading();
    }
  };

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, withLoading }}>
      {children}
      <LoadingSpinner visible={loading} message={loadingMessage} />
    </LoadingContext.Provider>
  );
};

export default LoadingProvider;