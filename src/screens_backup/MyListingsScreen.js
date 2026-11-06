// src/screens/MyListingsScreen.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext'; // ✅ Theme hook
import Text from '../components/AccessibleText';

export default function MyListingsScreen({ navigation }) {
  const { colors, isDark } = useTheme(); // ✅ Get theme
  const { myProperties, isLoading, loadMyProperties } = useAppStore();

  const styles = getStyles(colors, isDark); // ✅ Generate themed styles

  useEffect(() => {
    loadMyProperties();
  }, []);

  const handleAddProperty = () => {
    navigation.navigate('AddProperty');
  };

  const handleEditProperty = (propertyId) => {
    navigation.navigate('PropertyDetail', { id: propertyId });
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Loading your listings...</Text>
      </View>
    );
  }

  // 2. Empty State
  if (!myProperties || myProperties.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="home-outline" size={64} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No listings yet</Text>
          <Text style={styles.emptySubtitle}>
            It looks like you haven't listed any properties. Start by adding your first property to begin earning.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleAddProperty}>
            <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.emptyButtonText}>Add Your First Property</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 3. Property Card Render
  const renderPropertyCard = ({ item }) => {
    const imageSource = item.images && item.images.length > 0
      ? { uri: item.images[0] }
      : { uri: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500' };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleEditProperty(item.id)}
        activeOpacity={0.95}
      >
        {/* Card Top Image */}
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.propertyImage} resizeMode="cover" />

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.propertyTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.propertyPrice}>ZMW {item.price.toLocaleString()}</Text>
          </View>

          <View style={styles.propertyLocation}>
            <Ionicons name="location-outline" size={14} color={colors.secondaryText} />
            <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
          </View>

          <View style={styles.propertyDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="bed-outline" size={16} color={colors.secondaryText} />
              <Text style={styles.detailText}>{item.bedrooms} Beds</Text>
            </View>
            <View style={[styles.detailItem, { marginLeft: 16 }]}>
              <Ionicons name="water-outline" size={16} color={colors.secondaryText} />
              <Text style={styles.detailText}>{item.bathrooms} Baths</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Listings</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProperty}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={myProperties}
        keyExtractor={(item) => item.id}
        renderItem={renderPropertyCard}
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
    // Header
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 16,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    // List & Cards
    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      marginBottom: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 12,
      elevation: 3,
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: 180,
    },
    propertyImage: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.inputBackground,
    },
    statusBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: '#28A745',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    cardContent: {
      padding: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 6,
    },
    propertyTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginRight: 12,
    },
    propertyPrice: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.primary,
    },
    propertyLocation: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    locationText: {
      fontSize: 14,
      color: colors.secondaryText,
      marginLeft: 6,
    },
    propertyDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    detailText: {
      marginLeft: 6,
      fontSize: 14,
      color: colors.secondaryText,
      fontWeight: '500',
    },
    // Empty State
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyIconWrapper: {
      backgroundColor: isDark ? '#0A2A50' : '#F0F5FF',
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
    emptyButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 28,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
    emptyButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
  });