// src/screens/WishlistScreen.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
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
    toggleWishlist,
    isLoggedIn,
  } = useAppStore();

  useEffect(() => {
    if (isLoggedIn) {
      loadWishlist();
    }
  }, [isLoggedIn]);

  const handleRemove = (id) => {
    toggleWishlist(id);
  };

  const styles = getStyles(colors, isDark);

  // 🔒 Not logged in → show login prompt
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
            style={styles.loginButton} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
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

  // Empty state
  if (!wishlist || wishlist.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Wishlist</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="heart-outline" size={64} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite properties here to revisit them later.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ✅ Clickable wishlist item
  const renderWishlistItem = ({ item }) => {
    const imageSource = item.images && item.images.length > 0
      ? { uri: item.images[0] }
      : { uri: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500' };

    return (
      <View style={styles.card}>
        {/* ✅ Tappable body → opens PropertyDetail */}
        <TouchableOpacity
          style={styles.cardBody}
          onPress={() => navigation.navigate('PropertyDetail', { property: item })}
          activeOpacity={0.85}
        >
          <Image source={imageSource} style={styles.cardImage} resizeMode="cover" />
          <View style={styles.cardContent}>
            <Text style={styles.propertyTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.propertyLocation} numberOfLines={1}>{item.location}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.propertyPrice}>ZMW {item.price?.toLocaleString()}</Text>
              <View style={styles.propertyDetails}>
                <Ionicons name="bed-outline" size={14} color={colors.secondaryText} />
                <Text style={styles.detailText}>{item.bedrooms} beds</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* ✅ Separate remove button (does not open detail) */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemove(item.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="heart" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
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
      />
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
      flexDirection: 'row',
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
    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    card: {
      // Row layout: tappable body + remove button
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 12,
      elevation: 3,
      position: 'relative',
    },
    // ✅ Body is the tappable area
    cardBody: {
      flex: 1,
      flexDirection: 'row',
      padding: 12,
      alignItems: 'center',
      borderRadius: 20,
      overflow: 'hidden',
    },
    cardImage: {
      width: 80,
      height: 80,
      borderRadius: 16,
      backgroundColor: colors.inputBackground,
    },
    cardContent: {
      flex: 1,
      marginLeft: 14,
      justifyContent: 'center',
    },
    propertyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    propertyLocation: {
      fontSize: 14,
      color: colors.secondaryText,
      marginBottom: 8,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    propertyPrice: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.primary,
    },
    propertyDetails: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    detailText: {
      fontSize: 13,
      color: colors.secondaryText,
      marginLeft: 4,
      fontWeight: '500',
    },
    removeButton: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
      zIndex: 10,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -40,
      paddingHorizontal: 40,
    },
    emptyIconWrapper: {
      backgroundColor: colors.inputBackground,
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.secondaryText,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
    },
    loginPrompt: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      marginTop: -40,
    },
    loginPromptText: {
      fontSize: 18,
      color: colors.secondaryText,
      marginTop: 16,
      marginBottom: 24,
      textAlign: 'center',
    },
    loginButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 40,
      paddingVertical: 14,
      borderRadius: 12,
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });