// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext'; 

// Color palettes
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

// Default context (prevents undefined errors)
const defaultContext = {
  theme: 'light',
  toggleTheme: () => {},
  colors: lightColors,
  isDark: false,
};

const ThemeContext = createContext(defaultContext);

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState(deviceTheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme) {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      }
    };
    loadTheme();
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

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  return context || defaultContext;
};