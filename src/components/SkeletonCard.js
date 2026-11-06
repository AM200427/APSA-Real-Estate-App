// src/components/SkeletonCard.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function SkeletonCard() {
  const { colors, isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1, // Fades all the way to solid
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4, // Fades back down
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  // 🔥 Much more visible colors
  const baseColor = isDark ? '#2C2C2E' : '#E1E9F0'; // The main block color
  const highlightColor = isDark ? '#3A3A3C' : '#F4F7FB'; // The lighter text lines

  return (
    <Animated.View 
      style={[
        styles.card, 
        { 
          opacity,
          backgroundColor: colors.card, // Uses the real card color for the background
          shadowColor: '#000',
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: 8,
          elevation: 3,
        }
      ]}
    >
      {/* Image Placeholder */}
      <View style={[styles.imagePlaceholder, { backgroundColor: baseColor }]} />
      
      {/* Text Placeholders */}
      <View style={styles.textContainer}>
        {/* Title */}
        <View style={[styles.titleLine, { backgroundColor: highlightColor }]} />
        {/* Subtitle */}
        <View style={[styles.subtitleLine, { backgroundColor: highlightColor }]} />
        {/* Price & Rating Row */}
        <View style={styles.bottomRow}>
          <View style={[styles.priceLine, { backgroundColor: highlightColor }]} />
          <View style={[styles.ratingLine, { backgroundColor: highlightColor }]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  textContainer: {
    padding: 16,
    gap: 10,
  },
  titleLine: {
    width: '75%',
    height: 18,
    borderRadius: 6,
  },
  subtitleLine: {
    width: '45%',
    height: 14,
    borderRadius: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceLine: {
    width: '30%',
    height: 16,
    borderRadius: 6,
  },
  ratingLine: {
    width: '20%',
    height: 14,
    borderRadius: 6,
  },
});