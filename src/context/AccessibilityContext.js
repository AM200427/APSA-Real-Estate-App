// src/context/AccessibilityContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

const AccessibilityContext = createContext({
  fontScale: 1,
  isBold: false,
  isHighContrast: false,
  reduceMotion: false,
  isScreenReader: false,
  showCaptions: false,
  scaleFont: (size) => size,
  getFontWeight: (base) => base,
});

export const AccessibilityProvider = ({ children }) => {
  const preferences = useAppStore((state) => state.preferences);
  const loadPreferences = useAppStore((state) => state.loadPreferences);

  // ✅ No delay on rendering – preferences are already available
  // from default values even before AsyncStorage loads

  const fontScaleMap = {
    small: 0.85,
    medium: 1.0,
    large: 1.15,
    xlarge: 1.3,
  };

  const fontScale = fontScaleMap[preferences?.textSize || 'medium'];
  const isBold = preferences?.boldText || false;
  const isHighContrast = preferences?.highContrast || false;
  const reduceMotion = preferences?.reduceMotion || false;
  const isScreenReader = preferences?.screenReader || false;
  const showCaptions = preferences?.captions || false;

  const scaleFont = (size) => Math.round(size * fontScale);

  const getFontWeight = (base) => {
    if (!isBold) return base;
    const weights = {
      '300': '400',
      '400': '600',
      '500': '700',
      '600': '800',
      '700': '900',
      '800': '900',
      '900': '900',
      normal: '600',
      bold: '900',
    };
    return weights[base] || base;
  };

  const value = {
    fontScale,
    isBold,
    isHighContrast,
    reduceMotion,
    isScreenReader,
    showCaptions,
    scaleFont,
    getFontWeight,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  return ctx || {
    fontScale: 1,
    isBold: false,
    isHighContrast: false,
    reduceMotion: false,
    isScreenReader: false,
    showCaptions: false,
    scaleFont: (s) => s,
    getFontWeight: (w) => w,
  };
};