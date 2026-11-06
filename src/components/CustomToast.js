// src/components/CustomToast.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Per-type config
const TOAST_TYPES = {
  success: {
    icon: 'checkmark',
    iconBg: '#E8F8EE',
    iconColor: '#34C759',
    accent: '#34C759',
  },
  error: {
    icon: 'close',
    iconBg: '#FFEBEB',
    iconColor: '#FF3B30',
    accent: '#FF3B30',
  },
  info: {
    icon: 'information',
    iconBg: '#E8F0FE',
    iconColor: '#0A84FF',
    accent: '#0A84FF',
  },
  warning: {
    icon: 'alert',
    iconBg: '#FFF4E5',
    iconColor: '#FF9500',
    accent: '#FF9500',
  },
};

// ---------- Custom Toast Component ----------
const CustomToast = ({ type = 'info', text1, text2, onHide, duration = 3000 }) => {
  const config = TOAST_TYPES[type] || TOAST_TYPES.info;
  const translateY = useRef(new Animated.Value(-140)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Slide in + fade in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar shrinks over the duration
    Animated.timing(progress, {
      toValue: 0,
      duration,
      useNativeDriver: false,
    }).start();

    // Auto-dismiss
    const timeout = setTimeout(() => {
      dismiss();
    }, duration);

    return () => clearTimeout(timeout);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -140,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={dismiss}
          style={styles.card}
        >
          {/* Colored left accent */}
          <View style={[styles.accentBar, { backgroundColor: config.accent }]} />

          {/* Icon circle */}
          <View style={[styles.iconCircle, { backgroundColor: config.iconBg }]}>
            <Ionicons name={config.icon} size={18} color={config.iconColor} />
          </View>

          {/* Text */}
          <View style={styles.textCol}>
            {text1 ? (
              <Text style={styles.title} numberOfLines={1}>
                {text1}
              </Text>
            ) : null}
            {text2 ? (
              <Text style={styles.message} numberOfLines={2}>
                {text2}
              </Text>
            ) : null}
          </View>

          {/* Close X */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={dismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={16} color="#8E8E93" />
          </TouchableOpacity>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressWidth, backgroundColor: config.accent },
              ]}
            />
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    </Animated.View>
  );
};

// ---------- Toast Config for react-native-toast-message ----------
export const toastConfig = {
  success: ({ text1, text2, onHide, visibilityTime }) => (
    <CustomToast
      type="success"
      text1={text1}
      text2={text2}
      onHide={onHide}
      duration={visibilityTime || 3000}
    />
  ),
  error: ({ text1, text2, onHide, visibilityTime }) => (
    <CustomToast
      type="error"
      text1={text1}
      text2={text2}
      onHide={onHide}
      duration={visibilityTime || 3000}
    />
  ),
  info: ({ text1, text2, onHide, visibilityTime }) => (
    <CustomToast
      type="info"
      text1={text1}
      text2={text2}
      onHide={onHide}
      duration={visibilityTime || 3000}
    />
  ),
  warning: ({ text1, text2, onHide, visibilityTime }) => (
    <CustomToast
      type="warning"
      text1={text1}
      text2={text2}
      onHide={onHide}
      duration={visibilityTime || 3000}
    />
  ),
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
    zIndex: 9999,
  },
  safeArea: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    width: SCREEN_WIDTH - 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 12,
    marginTop: 8,
    overflow: 'hidden',
    // Softer, more layered shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textCol: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: 0.1,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#6B6B70',
    fontWeight: '400',
    lineHeight: 17,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2.5,
    backgroundColor: '#F1F3F5',
  },
  progressFill: {
    height: '100%',
  },
});