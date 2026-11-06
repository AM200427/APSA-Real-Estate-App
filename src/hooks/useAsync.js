// src/hooks/useAsync.js
import { useState, useCallback } from 'react';
import { useLoading } from '../context/LoadingContext';
import { useToast } from '../context/ToastContext';

export const useAsync = (asyncFunction, showToastOnError = true) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const { showLoading, hideLoading } = useLoading();
  const { showError } = useToast();

  const execute = useCallback(
    async (...params) => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction(...params);
        setData(result);
        return result;
      } catch (error) {
        setError(error);
        if (showToastOnError) {
          const errorMessage = error.message || 'Something went wrong';
          showError(errorMessage);
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, showToastOnError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { execute, loading, error, data, reset };
};

export default useAsync;