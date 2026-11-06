// src/screens/HomeScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  Modal,
  Dimensions,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../context/ToastContext';
import { useLoading } from '../context/LoadingContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import Text from '../components/AccessibleText';
import { useReduceMotion } from '../hooks/useReduceMotion';
import SkeletonCard from '../components/SkeletonCard'; // 🔥 Import the Skeleton
import { useFocusEffect } from '@react-navigation/native';
import { SafeImage } from '../components/SafeImage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;
const CARD_HEIGHT = CARD_WIDTH * 1.15;

export default function HomeScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const reduceMotion = useReduceMotion();

  const {
    properties,
    isLoading,
    loadProperties,
    loadFeaturedProperties,
    wishlist,
    toggleWishlist,
  } = useAppStore();

  const { showError, showSuccess, showWarning, showInfo } = useToast();
  const { withLoading } = useLoading();
  const { isConnected } = useNetworkStatus();

  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filters, setFilters] = useState({
    propertyType: 'All',
    listingType: 'All',
    bedrooms: 'Any',
    priceRange: 'Any',
  });

  const propertyTypes = ['All', 'House', 'Apartment', 'Boarding House', 'Commercial', 'Land'];
  const listingTypes = ['All', 'For Sale', 'For Rent', 'Bookings'];
  const bedroomOptions = ['Any', '1', '2', '3', '4', '5+'];
  const priceRanges = [
    'Any',
    'Below k5,000',
    'k5,000 - k20,000',
    'k20,000 - k50,000',
    'k50,000 - k100,000',
    'k100,000 - k500,000',
    'k500,000+',
  ];

  const parsePriceRange = (range) => {
    if (range === 'Any') return { min: 0, max: Infinity };
    if (range === 'Below k5,000') return { min: 0, max: 5000 };
    if (range === 'k5,000 - k20,000') return { min: 5000, max: 20000 };
    if (range === 'k20,000 - k50,000') return { min: 20000, max: 50000 };
    if (range === 'k50,000 - k100,000') return { min: 50000, max: 100000 };
    if (range === 'k100,000 - k500,000') return { min: 100000, max: 500000 };
    if (range === 'k500,000+') return { min: 500000, max: Infinity };
    return { min: 0, max: Infinity };
  };

  const performSearch = () => {
    const searchLower = searchText.toLowerCase().trim();
    const { propertyType, listingType, bedrooms, priceRange } = filters;
    const priceLimits = parsePriceRange(priceRange);

    let results = properties;

    if (searchLower) {
      results = results.filter(p =>
        (p.title && p.title.toLowerCase().includes(searchLower)) ||
        (p.location && p.location.toLowerCase().includes(searchLower)) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }
    if (propertyType !== 'All') {
      results = results.filter(p => p.type === propertyType);
    }
    if (listingType !== 'All') {
      results = results.filter(p => p.listingType === listingType);
    }
    if (bedrooms !== 'Any') {
      const bedCount = parseInt(bedrooms);
      results = results.filter(p => {
        const pBeds = parseInt(p.bedrooms) || 0;
        return bedCount === 5 ? pBeds >= 5 : pBeds === bedCount;
      });
    }
    results = results.filter(p => {
      const price = parseInt(p.price) || 0;
      return price >= priceLimits.min && price <= priceLimits.max;
    });

    setFilteredProperties(results);
    setIsSearching(true);
  };

  const clearSearch = () => {
    setSearchText('');
    setFilters({
      propertyType: 'All',
      listingType: 'All',
      bedrooms: 'Any',
      priceRange: 'Any',
    });
    setIsSearching(false);
    setFilteredProperties([]);
  };

  const applyFilters = () => {
    setShowFilters(false);
    performSearch();
  };

  const clearFilters = () => {
    setFilters({
      propertyType: 'All',
      listingType: 'All',
      bedrooms: 'Any',
      priceRange: 'Any',
    });
    setShowFilters(false);
    if (searchText.trim()) {
      performSearch();
    } else {
      clearSearch();
    }
  };

  useEffect(() => {
    if (searchText.trim() || Object.values(filters).some(v => v !== 'All' && v !== 'Any')) {
      performSearch();
    } else {
      setIsSearching(false);
    }
  }, [searchText]);

  const loadData = async () => {
    if (!isConnected) {
      showWarning('You are offline. Please check your connection.');
      return;
    }
    try {
      await withLoading(
        (async () => {
          await Promise.all([loadProperties(), loadFeaturedProperties()]);
        })(),
        'Loading properties...'
      );
    } catch (error) {
      showError(error.message || 'Failed to load properties');
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (!isConnected) {
        showWarning('You are offline. Please check your connection.');
        return;
      }
      await Promise.all([loadProperties(), loadFeaturedProperties()]);
      if (isSearching) {
        performSearch();
      }
    } catch (error) {
      showError(error.message || 'Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  }, [isConnected, isSearching, loadProperties, loadFeaturedProperties]);

    useFocusEffect(
    useCallback(() => {
      loadData();
    }, [isConnected])
  );

      const groupedProperties = useMemo(() => {
    const now = new Date().getTime();
    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

    // Filter out properties that are NOT active AND were updated more than 3 days ago
    const activeData = properties.filter(prop => {
      if (prop.status === 'Active' || !prop.status) return true; // Keep active properties
      
      // If it's Rented/Sold/Booked, check how long ago it was updated
      const lastUpdated = prop.updatedAt ? new Date(prop.updatedAt).getTime() : now;
      const timeSinceUpdate = now - lastUpdated;
      
      // Keep it if it was updated less than 3 days ago (Grace Period)
      return timeSinceUpdate < THREE_DAYS;
    });

    // 🔥 FIX: Use activeData instead of properties
    const dataToGroup = isSearching ? filteredProperties : activeData;
    
    // 🔥 SORT: Newest properties first
    const sortedData = [...dataToGroup].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Newest first
    });

    const groups = {};
    sortedData.forEach((prop) => {
      // If a property has no location, put it in 'Recently Added'
      const city = prop.location ? prop.location.split(',')[0].trim() : 'Recently Added';
      if (!groups[city]) groups[city] = [];
      groups[city].push(prop);
    });

    // Keep the cities in alphabetical order
    const sortedKeys = Object.keys(groups).sort();
    const sorted = {};
    sortedKeys.forEach((key) => { sorted[key] = groups[key]; });
    
    return sorted;
  }, [properties, filteredProperties, isSearching]);

  const cityKeys = Object.keys(groupedProperties);

  const handleCityPress = (city) => {
    const root = navigation.getParent('Root');
    if (root) {
      root.navigate('CityProperties', { city });
    } else {
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate('CityProperties', { city });
      } else {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'CityProperties',
            params: { city },
          })
        );
      }
    }
  };

  const handleWishlistPress = async (item) => {
    try {
      await toggleWishlist(item);
      const freshWishlist = useAppStore.getState().wishlist;
      const isNowInWishlist = freshWishlist.some((w) => w.id === item.id);

      if (isNowInWishlist) {
        showSuccess('Added to Wishlist ❤️', 'You can find it in your wishlist tab');
      } else {
        showInfo('Removed from Wishlist', 'Item removed from your wishlist');
      }
    } catch (error) {
      showError('Wishlist Error', 'Could not update wishlist. Please try again.');
    }
  };

  const styles = getStyles(colors);

             const renderPropertyCard = (item) => {
    const isInWishlist = wishlist.some(w => w.id === item.id);
    
    // 🔥 The Store fixes the URL, we just grab it
    let safeUri = item?.images?.[0] || item?.image;
    while (Array.isArray(safeUri)) safeUri = safeUri[0];
    
    if (typeof safeUri !== 'string' || safeUri.length < 5) {
      safeUri = 'https://via.placeholder.com/400x250?text=No+Image';
    }

    return (
      <TouchableOpacity
        style={[styles.propertyCard, !isSearching && { marginRight: 12 }]}
        onPress={() => navigation.navigate('PropertyDetail', { property: item })}
        activeOpacity={0.9}
      >
                <View style={styles.imageContainer}>
          <Image
            source={{ uri: safeUri }}
            style={styles.propertyImage}
            resizeMode="cover"
          />

          {/* 🔥 NEW: Status Badge (Rented, Sold, Booked) */}
          {item.status && item.status !== 'Active' && (
            <View style={{ 
              position: 'absolute', 
              top: 10, 
              left: 10, 
              backgroundColor: 
                item.status === 'Rented' ? '#FF3B30' : 
                item.status === 'Sold' ? '#AF52DE' : 
                '#FF9500', // Booked is Orange
              paddingHorizontal: 10, 
              paddingVertical: 5, 
              borderRadius: 8,
              zIndex: 10, // Ensures it sits on top of the image
            }}>
              <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>
                {item.status}
              </Text>
            </View>
          )}
          
          {/* Your existing Type Badge */}
          <View style={styles.propertyTypeBadge}>
            <Text style={styles.propertyTypeText}>{item.type || 'Property'}</Text>
          </View>

          {/* Your existing Wishlist Button */}
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => handleWishlistPress(item)}
          >
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={22}
              color={isInWishlist ? '#FF3B30' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.propertyLocation}>📍 {item.location}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.propertyPrice}>K{item.price}</Text>
            <Text style={styles.priceSub}>/month</Text>
          </View>
          <View style={styles.propertyRating}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating || 0}</Text>
            <Text style={styles.reviewCount}>({item.reviews?.length || 0})</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCitySection = ({ item: city }) => {
    const cityProperties = groupedProperties[city];
    if (!cityProperties || cityProperties.length === 0) return null;

    return (
      <View style={styles.citySection}>
        <TouchableOpacity style={styles.cityHeader} onPress={() => handleCityPress(city)}>
          <Text style={styles.cityName}>{city}</Text>
          <View style={styles.cityHeaderRight}>
            <View style={styles.cityCountBadge}>
              <Text style={styles.cityCountText}>{cityProperties.length}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </View>
        </TouchableOpacity>

        <FlatList
          data={cityProperties}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => renderPropertyCard(item)}
        />
      </View>
    );
  };

  const renderSearchResults = () => {
    if (filteredProperties.length === 0 && isSearching) {
      return (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color={colors.secondaryText} />
            <Text style={styles.emptyTitle}>No properties found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
            <TouchableOpacity style={styles.clearSearchButton} onPress={clearSearch}>
              <Text style={styles.clearSearchButtonText}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    return (
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderPropertyCard(item)}
        contentContainerStyle={styles.searchList}
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
    );
  };

  // 🔥 REPLACED SPINNER WITH SKELETONS
      if (isLoading && properties.length === 0) {
    return (
      <View style={[styles.screenContainer, { paddingHorizontal: 16, paddingTop: 80 }]}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Search Bar */}
      <View style={styles.searchHeader}>
        
        {/* Search Row with Map Button */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={22} color={colors.secondaryText} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search properties..."
              placeholderTextColor={colors.secondaryText}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={performSearch}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
              <Ionicons name="options-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.mapButton} 
            onPress={() => navigation.jumpTo('Map')}
          >
            <Ionicons name="map-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {isSearching && (
          <View style={styles.searchSummary}>
            <Text style={styles.searchSummaryText}>
              Found {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
              {searchText.trim() && ` for "${searchText}"`}
            </Text>
            <TouchableOpacity onPress={clearSearch}>
              <Text style={styles.clearSummaryText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Results or City Sections */}
      {isSearching ? (
        renderSearchResults()
      ) : cityKeys.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={60} color={colors.secondaryText} />
            <Text style={styles.emptyTitle}>No Properties Found</Text>
            <Text style={styles.emptySubtitle}>
              There are no properties listed right now. Check back later!
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={cityKeys}
          renderItem={renderCitySection}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.verticalList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListFooterComponent={<View style={{ height: 0 }} />}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType={reduceMotion ? 'none' : 'slide'}
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Property Type</Text>
                <View style={styles.filterOptions}>
                  {propertyTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.filterChip, filters.propertyType === type && styles.filterChipActive]}
                      onPress={() => setFilters({ ...filters, propertyType: type })}
                    >
                      <Text style={[styles.filterChipText, filters.propertyType === type && styles.filterChipTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Listing Type</Text>
                <View style={styles.filterOptions}>
                  {listingTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.filterChip, filters.listingType === type && styles.filterChipActive]}
                      onPress={() => setFilters({ ...filters, listingType: type })}
                    >
                      <Text style={[styles.filterChipText, filters.listingType === type && styles.filterChipTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Bedrooms</Text>
                <View style={styles.filterOptions}>
                  {bedroomOptions.map((bed) => (
                    <TouchableOpacity
                      key={bed}
                      style={[styles.filterChip, filters.bedrooms === bed && styles.filterChipActive]}
                      onPress={() => setFilters({ ...filters, bedrooms: bed })}
                    >
                      <Text style={[styles.filterChipText, filters.bedrooms === bed && styles.filterChipTextActive]}>
                        {bed}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Price Range</Text>
                <View style={styles.filterOptions}>
                  {priceRanges.map((price) => (
                    <TouchableOpacity
                      key={price}
                      style={[styles.filterChip, filters.priceRange === price && styles.filterChipActive]}
                      onPress={() => setFilters({ ...filters, priceRange: price })}
                    >
                      <Text style={[styles.filterChipText, filters.priceRange === price && styles.filterChipTextActive]}>
                        {price}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalClearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ✅ Styles generated from theme colors
const getStyles = (colors) =>
  StyleSheet.create({
    screenContainer: { flex: 1, backgroundColor: colors.background },
    text: { color: colors.text },
    searchHeader: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      backgroundColor: colors.card,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 44,
    },
    mapButton: {
      width: 44,
      height: 44,
      backgroundColor: colors.primary,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.text,
    },
    clearButton: { padding: 4 },
    filterButton: { padding: 4 },
    searchSummary: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 8,
      paddingHorizontal: 4,
    },
    searchSummaryText: { fontSize: 13, color: colors.secondaryText },
    clearSummaryText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '500',
    },
    verticalList: { paddingHorizontal: 16, paddingTop: 8 },
    citySection: { marginBottom: 24 },
    cityHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    cityName: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    cityHeaderRight: { flexDirection: 'row', alignItems: 'center' },
    horizontalList: { paddingRight: 16 },
    propertyCard: {
      width: CARD_WIDTH,
      backgroundColor: colors.card,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 3,
      overflow: 'hidden',
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: CARD_HEIGHT * 0.65,
    },
    propertyImage: { width: '100%', height: '100%' },
    propertyTypeBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    propertyTypeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    wishlistButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: 'rgba(0,0,0,0.4)',
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    propertyInfo: { padding: 12 },
    propertyTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    propertyLocation: {
      fontSize: 13,
      color: colors.secondaryText,
      marginBottom: 4,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 4,
    },
    propertyPrice: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
    priceSub: {
      fontSize: 12,
      color: colors.secondaryText,
      marginLeft: 2,
    },
    propertyRating: { flexDirection: 'row', alignItems: 'center' },
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
    searchList: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 80,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingTop: 80,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 12,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.secondaryText,
      textAlign: 'center',
      marginTop: 8,
    },
    clearSearchButton: {
      marginTop: 20,
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: colors.primary,
      borderRadius: 12,
    },
    clearSearchButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    loadMore: { paddingVertical: 16 },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    filterSection: { marginBottom: 16 },
    filterLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    filterOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 14,
      color: colors.text,
    },
    filterChipTextActive: { color: '#FFFFFF' },
    modalFooter: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    modalClearButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    clearButtonText: {
      color: colors.secondaryText,
      fontSize: 16,
      fontWeight: '500',
    },
    applyButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    applyButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    cityCountBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 12,
      marginRight: 8,
    },
    cityCountText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
    },
  });