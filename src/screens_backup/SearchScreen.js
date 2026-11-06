// src/screens/SearchScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext';
import Text from '../components/AccessibleText';

export default function SearchScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const {
    searchQuery,
    setSearchQuery,
    searchProperties,
    searchResults,
    searchLoading,
    hasSearched,
    searchFilters,
    setSearchFilter,
    resetSearchFilters,
    loadMoreSearchResults,
    pagination,
  } = useAppStore();

  const [showFilters, setShowFilters] = useState(false);

  // Generate styles with current theme colors
  const styles = getStyles(colors);

  const handleSearch = () => {
    if (searchQuery.trim() || Object.values(searchFilters).some(v => v)) {
      searchProperties();
    }
  };

  const handleClear = () => {
    resetSearchFilters();
  };

  const renderPropertyCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PropertyDetail', { id: item.id })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.images?.[0] }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardLocation}>{item.location}</Text>
        <Text style={styles.cardPrice}>ZMW {item.price?.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={colors.secondaryText} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search properties..."
          placeholderTextColor={colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="options-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>Property Type</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results */}
      {searchLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : hasSearched && searchResults.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={60} color={colors.secondaryText} />
          <Text style={styles.noResults}>No properties found</Text>
          <Text style={styles.noResultsSub}>Try adjusting your filters</Text>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderPropertyCard}
          contentContainerStyle={styles.list}
          onEndReached={loadMoreSearchResults}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            pagination.hasMore && searchLoading ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.loadMore} />
            ) : null
          }
        />
      ) : (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={60} color={colors.secondaryText} />
          <Text style={styles.noResults}>Search for properties</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ✅ Styles are a function that takes colors
const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    filtersContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      paddingTop: 12,
      gap: 8,
    },
    filterChip: {
      backgroundColor: colors.inputBackground,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
    },
    filterChipText: {
      color: colors.text,
    },
    list: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    cardImage: {
      width: '100%',
      height: 180,
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
    cardPrice: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
      marginTop: 6,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noResults: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
    },
    noResultsSub: {
      fontSize: 14,
      color: colors.secondaryText,
      marginTop: 4,
    },
    loadingText: {
      marginTop: 12,
      color: colors.secondaryText,
    },
    loadMore: { paddingVertical: 16 },
  });