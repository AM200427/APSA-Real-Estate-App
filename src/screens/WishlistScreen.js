// src/screens/WishlistScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext';
import Text from '../components/AccessibleText';

export default function WishlistScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const {
    wishlist,
    isLoading,
    loadWishlist,
    isLoggedIn,
  } = useAppStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const styles = getStyles(colors, isDark);

  useEffect(() => {
    if (isLoggedIn) {
      loadWishlist();
    }
  }, [isLoggedIn]);

  const onRefresh = useCallback(async () => {
    if (!isLoggedIn) return;
    setIsRefreshing(true);
    try {
      await loadWishlist();
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isLoggedIn, loadWishlist]);

  const handleCardPress = (item) => {
    navigation.navigate('PropertyDetail', { property: item });
  };

  // 🔒 Not logged in → login prompt
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wishlist</Text>
        </View>
        <View style={styles.loginPrompt}>
          <Ionicons name="heart-outline" size={60} color={colors.secondaryText} />
          <Text style={styles.loginPromptText}>Log in to view your wishlist</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Loading your wishlist...</Text>
      </View>
    );
  }

  // ❤️ EMPTY STATE
  if (!wishlist || wishlist.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Wishlist</Text>
        </View>
        <FlatList
          data={[]}
          renderItem={null}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrapper}>
                <Ionicons name="heart-half-outline" size={64} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
              <Text style={styles.emptySubtitle}>
                Save your favorite properties here to revisit them later.
              </Text>
              
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={() => navigation.navigate('Home')}
                activeOpacity={0.8}
              >
                <Ionicons name="search" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Find Properties</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </SafeAreaView>
    );
  }

  // Render the actual list
  const renderWishlistItem = ({ item }) => {
    // 🛡️ Safe Image Extract
    let img = item?.images?.[0] || item?.image;
    while (Array.isArray(img)) img = img[0];
    
    // Fix local uploads
    const BASE_URL = 'http://192.168.1.195:5000';
    if (typeof img === 'string' && img.startsWith('/uploads')) {
      img = `${BASE_URL}${img}`;
    }
    if (!img || typeof img !== 'string') {
      img = 'https://via.placeholder.com/400x250?text=No+Image';
    }

    // 🔥 Status Logic
    const status = item?.status || 'Active';
    const isUnavailable = status !== 'Active';
    const badgeColor = status === 'Rented' ? '#FF3B30' : status === 'Sold' ? '#AF52DE' : status === 'Booked' ? '#FF9500' : status === 'Deactivated' ? '#8E8E93' : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: img }} style={styles.cardImage} resizeMode="cover" />
          
          {/* 🔥 The Status Badge */}
          {isUnavailable && (
            <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
              <Text style={styles.statusBadgeText}>{status.toUpperCase()}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.propertyLocation} numberOfLines={1}>
            {item.location}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.propertyPrice}>
              ZMW {item.price?.toLocaleString()}
            </Text>
            <View style={styles.propertyDetails}>
              <Ionicons name="bed-outline" size={14} color={colors.secondaryText} />
              <Text style={styles.detailText}>{item.bedrooms} beds</Text>
            </View>
          </View>

          {/* 🔥 Show the Availability Date if booked/rented */}
          {isUnavailable && item.availableDate && (
            <View style={styles.availabilityRow}>
              <Ionicons name="calendar-outline" size={14} color={badgeColor} />
              <Text style={[styles.availabilityText, { color: badgeColor }]}>
                Available from: {item.availableDate}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.removeButton} pointerEvents="none">
          <Ionicons name="heart" size={28} color="#FF3B30" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
      </View>
      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.id}
        renderItem={renderWishlistItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: 12, color: colors.secondaryText, fontWeight: '500' },
    header: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20 },
    headerTitle: { fontSize: 26, fontWeight: '700', color: colors.text },
    listContent: { paddingHorizontal: 24, paddingBottom: 40 },
    
    // Card Styles
    card: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 12,
      marginBottom: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 12,
      elevation: 3,
      position: 'relative',
    },
    imageContainer: {
      position: 'relative',
    },
    cardImage: { width: 80, height: 80, borderRadius: 16, backgroundColor: colors.inputBackground },
    statusBadge: {
      position: 'absolute',
      top: 4,
      left: 4,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 6,
    },
    statusBadgeText: {
      color: '#FFFFFF',
      fontSize: 8,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    cardContent: { flex: 1, marginLeft: 14, justifyContent: 'center' },
    propertyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 2 },
    propertyLocation: { fontSize: 14, color: colors.secondaryText, marginBottom: 8 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    propertyPrice: { fontSize: 16, fontWeight: '800', color: colors.primary },
    propertyDetails: { flexDirection: 'row', alignItems: 'center' },
    detailText: { fontSize: 13, color: colors.secondaryText, marginLeft: 4, fontWeight: '500' },
    availabilityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
    availabilityText: { fontSize: 12, fontWeight: '600' },
    removeButton: {
      position: 'absolute', top: -6, right: -6, backgroundColor: colors.card,
      borderRadius: 20, padding: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
    },
    
    // Empty & Login States
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyIconWrapper: {
      backgroundColor: isDark ? '#0A2A50' : '#F0F5FF',
      width: 120, height: 120, borderRadius: 60,
      justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    },
    emptyTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 8 },
    emptySubtitle: { fontSize: 16, color: colors.secondaryText, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
    
    loginPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: -40 },
    loginPromptText: { fontSize: 18, color: colors.secondaryText, marginTop: 16, marginBottom: 24, textAlign: 'center' },
    
    // Reusable Primary Button
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 16,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  });