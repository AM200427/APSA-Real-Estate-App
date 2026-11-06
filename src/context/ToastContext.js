// src/context/ToastContext.js
import React, { createContext, useContext, useCallback } from 'react';
import Toast from 'react-native-toast-message';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const showToast = useCallback((type, text1, text2, duration = 3000, onPress = null) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
      onPress,
      props: {
        onClose: () => Toast.hide(),
      },
    });
  }, []);

  const showSuccess = useCallback((text1, text2, duration = 3000, onPress) => {
    showToast('success', text1, text2, duration, onPress);
  }, [showToast]);

  const showError = useCallback((text1, text2, duration = 4000, onPress) => {
    showToast('error', text1, text2, duration, onPress);
  }, [showToast]);

  const showInfo = useCallback((text1, text2, duration = 3000, onPress) => {
    showToast('info', text1, text2, duration, onPress);
  }, [showToast]);

  const showWarning = useCallback((text1, text2, duration = 4000, onPress) => {
    showToast('warning', text1, text2, duration, onPress);
  }, [showToast]);

  const hideToast = useCallback(() => {
    Toast.hide();
  }, []);

  const value = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    hideToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => {},
      showSuccess: () => {},
      showError: () => {},
      showInfo: () => {},
      showWarning: () => {},
      hideToast: () => {},
    };
  }
  return context;
};