// src/screens/MapViewScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext'; // ✅ Theme hook
import Text from '../components/AccessibleText';

export default function MapViewScreen({ navigation }) {
  const { colors, isDark } = useTheme(); // ✅ Get theme
  const { properties, isLoading } = useAppStore();
  const [mapReady, setMapReady] = useState(false);

  const styles = getStyles(colors, isDark); // ✅ Generate themed styles

  useEffect(() => {
    // Simulate map loading
    setTimeout(() => setMapReady(true), 500);
  }, []);

  if (!mapReady) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Map View</Text>
      </View>

      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={80} color={colors.secondaryText} />
        <Text style={styles.mapText}>Map View Coming Soon</Text>
        <Text style={styles.mapSubtext}>
          {properties?.length || 0} properties available
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ✅ Styles generated from theme colors
const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loaderText: {
      marginTop: 12,
      color: colors.secondaryText,
      fontWeight: '500',
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 10,
      paddingBottom: 20,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
    },
    mapPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: 16,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 12,
      elevation: 2,
      marginBottom: 20,
    },
    mapText: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
    },
    mapSubtext: {
      fontSize: 16,
      color: colors.secondaryText,
      marginTop: 8,
    },
  });