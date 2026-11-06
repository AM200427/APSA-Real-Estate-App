// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../../store/useAppStore';

// ---------- COLOR PALETTES ----------
export const lightColors = {
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#1C1C1E',
  secondaryText: '#8E8E93',
  border: '#E5E5EA',
  primary: '#007AFF',
  inputBackground: '#F2F2F7',
  headerBackground: '#FFFFFF',
  headerText: '#1C1C1E',
  tabBar: '#FFFFFF',
  tabBarActive: '#007AFF',
  tabBarInactive: '#999',
};

export const darkColors = {
  background: '#0F0F12',
  card: '#1C1C1E',
  text: '#FFFFFF',
  secondaryText: '#8E8E93',
  border: '#2C2C2E',
  primary: '#0A84FF',
  inputBackground: '#2C2C2E',
  headerBackground: '#1C1C1E',
  headerText: '#FFFFFF',
  tabBar: '#1C1C1E',
  tabBarActive: '#0A84FF',
  tabBarInactive: '#666',
};

export const lightHighContrastColors = {
  ...lightColors,
  background: '#FFFFFF',
  text: '#000000',
  secondaryText: '#333333',
  border: '#000000',
  primary: '#0033CC',
  card: '#FFFFFF',
  inputBackground: '#F0F0F0',
  headerBackground: '#FFFFFF',
  headerText: '#000000',
  tabBar: '#FFFFFF',
  tabBarActive: '#0033CC',
  tabBarInactive: '#333333',
};

export const darkHighContrastColors = {
  ...darkColors,
  background: '#000000',
  text: '#FFFFFF',
  secondaryText: '#CCCCCC',
  border: '#FFFFFF',
  primary: '#3399FF',
  card: '#1A1A1A',
  inputBackground: '#2A2A2A',
  headerBackground: '#000000',
  headerText: '#FFFFFF',
  tabBar: '#000000',
  tabBarActive: '#3399FF',
  tabBarInactive: '#CCCCCC',
};

// ---------- TEXT SIZE SCALES ----------
export const TEXT_SCALES = {
  small: 0.85,
  medium: 1.0,
  large: 1.15,
  extraLarge: 1.3,
};

// ---------- THEME CONTEXT ----------
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState(deviceTheme === 'dark' ? 'dark' : 'light');
  const [textSizeLabel, setTextSizeLabel] = useState('medium'); // ✅ new
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to high contrast preference from the store
  const highContrast = useAppStore((state) => state.preferences?.highContrast || false);

  // Load saved preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme) setTheme(savedTheme);

        const savedTextSize = await AsyncStorage.getItem('appTextSize'); // ✅ new
        if (savedTextSize) setTextSizeLabel(savedTextSize);
      } catch (error) {
        console.log('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPreferences();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('appTheme', newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  // ✅ Save text size
  const setTextScale = async (sizeLabel) => {
    setTextSizeLabel(sizeLabel);
    try {
      await AsyncStorage.setItem('appTextSize', sizeLabel);
    } catch (error) {
      console.log('Error saving text size:', error);
    }
  };

  // Choose palette
  let colors;
  if (theme === 'dark') {
    colors = highContrast ? darkHighContrastColors : darkColors;
  } else {
    colors = highContrast ? lightHighContrastColors : lightColors;
  }

  const textScale = TEXT_SCALES[textSizeLabel] || 1.0; // ✅ new

  const value = {
    theme,
    toggleTheme,
    colors,
    isDark: theme === 'dark',
    isHighContrast: highContrast,
    textScale,           // ✅ new
    setTextScale,        // ✅ new
    textSizeLabel,       // ✅ new
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light',
      toggleTheme: () => {},
      colors: lightColors,
      isDark: false,
      isHighContrast: false,
      textScale: 1.0,          // ✅ new
      setTextScale: () => {},  // ✅ new
      textSizeLabel: 'medium', // ✅ new
    };
  }
  return context;
};