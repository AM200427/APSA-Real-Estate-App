// src/components/AccessibleText.js
import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

export default function Text({ style, allowFontScaling = true, children, ...props }) {
  const { fontScale, isBold, getFontWeight } = useAccessibility();

  // Flatten the incoming style so we can modify it
  const flatStyle = StyleSheet.flatten(style) || {};

  // Scale fontSize
  const scaledFontSize =
    flatStyle.fontSize != null ? Math.round(flatStyle.fontSize * fontScale) : undefined;

  // Apply bold when bold mode is on
  const fontWeight = flatStyle.fontWeight
    ? getFontWeight(flatStyle.fontWeight)
    : isBold
    ? '600'
    : undefined;

  const mergedStyle = [
    style,
    scaledFontSize ? { fontSize: scaledFontSize } : null,
    fontWeight ? { fontWeight } : null,
  ];

  return (
    <RNText
      style={mergedStyle}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={1.4}
      {...props}
    >
      {children}
    </RNText>
  );
}