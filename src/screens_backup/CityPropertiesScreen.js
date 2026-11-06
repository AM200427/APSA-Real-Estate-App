// src/screens/CityPropertiesScreen.js
import React, { useState, useEffect } from 'react';
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
import { useTheme } from '../context/ThemeContext'; // ✅ Theme hook
import Text from '../components/AccessibleText';

export default function CityPropertiesScreen({ navigation, route }) {
  const { colors, isDark } = useTheme(); // ✅ Get theme
  const { city } = route.params || {};
  const { properties, isLoading, wishlist, toggleWishlist } = useAppStore();
  const [cityProperties, setCityProperties] = useState([]);

  const styles = getStyles(colors, isDark); // ✅ Generate themed styles

  useEffect(() => {
    if (city) {
      const filtered = properties.filter((prop) => {
        const propCity = prop.location ? prop.location.split(',')[0].trim() : '';
        return propCity.toLowerCase() === city.toLowerCase();
      });
      setCityProperties(filtered);
    }
  }, [city, properties]);

  const handleWishlistPress = async (item) => {
    try {
      await toggleWishlist(item);
    } catch (error) {
      console.log('Wishlist error:', error);
    }
  };

  const renderPropertyCard = ({ item }) => {
    const isInWishlist = wishlist.some((w) => w.id === item.id);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PropertyDetail', { property: item })}
        activeOpacity={0.9}
      >
        <Image
          source={{
            uri:
              item.images?.[0] ||
              item.image ||
              'https://via.placeholder.com/400x250?text=No+Image',
          }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardLocation}>📍 {item.location}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.cardPrice}>K{item.price}</Text>
            <Text style={styles.priceSub}>/month</Text>
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating || 0}</Text>
              <Text style={styles.reviewCount}>({item.reviews?.length || 0})</Text>
            </View>
            <TouchableOpacity onPress={() => handleWishlistPress(item)}>
              <Ionicons
                name={isInWishlist ? 'heart' : 'heart-outline'}
                size={22}
                color={isInWishlist ? '#FF3B30' : colors.secondaryText}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading properties...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{city}</Text>
        <Text style={styles.headerCount}>{cityProperties.length} properties</Text>
      </View>

      {/* Property List */}
      {cityProperties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="home-outline" size={60} color={colors.secondaryText} />
          <Text style={styles.emptyTitle}>No properties in {city}</Text>
        </View>
      ) : (
        <FlatList
          data={cityProperties}
          keyExtractor={(item) => item.id}
          renderItem={renderPropertyCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 12,
      backgroundColor: colors.headerBackground,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    backButton: { padding: 4 },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
      marginLeft: 8,
    },
    headerCount: {
      fontSize: 14,
      color: colors.secondaryText,
    },
    list: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    cardImage: {
      width: '100%',
      height: 200,
      backgroundColor: colors.inputBackground,
    },
    cardContent: { padding: 14 },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    cardLocation: {
      fontSize: 14,
      color: colors.secondaryText,
      marginTop: 2,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginTop: 6,
    },
    cardPrice: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
    },
    priceSub: {
      fontSize: 12,
      color: colors.secondaryText,
      marginLeft: 2,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    ratingContainer: { flexDirection: 'row', alignItems: 'center' },
    ratingText: {
      fontSize: 13,
      color: colors.text,
      marginLeft: 4,
    },
    reviewCount: {
      fontSize: 13,
      color: colors.secondaryText,
      marginLeft: 4,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 12,
      color: colors.secondaryText,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 12,
    },
  });