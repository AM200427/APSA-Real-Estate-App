// src/screens/MapViewScreen.js
import React, { useState, useRef, useMemo } from 'react';
import {
  View, StyleSheet, SafeAreaView, TouchableOpacity, Image, Dimensions, ScrollView, TextInput, Keyboard,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext';
import Text from '../components/AccessibleText';

// 🔥 Securely loading the token from the .env file
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN);

const { width, height } = Dimensions.get('window');
const CATEGORIES = ['All', 'House', 'Apartment', 'Boarding House'];

export default function MapViewScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { properties = [] } = useAppStore();
  
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(11.5); 
  
  const cameraRef = useRef(null);
  const styles = getStyles(colors, isDark);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const hasCoords = p.latitude && p.longitude;
      const matchesCategory = activeCategory === 'All' || p.type === activeCategory;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        searchQuery === '' || 
        (p.title && p.title.toLowerCase().includes(searchLower)) ||
        (p.location && p.location.toLowerCase().includes(searchLower));
      return hasCoords && matchesCategory && matchesSearch;
    });
  }, [properties, activeCategory, searchQuery]);

  const featureCollection = {
    type: 'FeatureCollection',
    features: filteredProperties.map(prop => ({
      type: 'Feature',
      id: String(prop.id),
      properties: { ...prop },
      geometry: { type: 'Point', coordinates: [prop.longitude, prop.latitude] }
    }))
  };

  const handleSelectProperty = (property) => {
    Keyboard.dismiss();
    setIsSearching(false);
    setSelectedProperty(property);
    cameraRef.current?.setCamera({
      centerCoordinate: [property.longitude, property.latitude],
      zoomLevel: 14,
      animationDuration: 1000,
    });
  };

  const handleDeselect = () => {
    Keyboard.dismiss();
    setIsSearching(false);
    setSelectedProperty(null);
    cameraRef.current?.setCamera({
      centerCoordinate: [28.2833, -15.4167],
      zoomLevel: 11.5,
      animationDuration: 1000,
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    handleDeselect();
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.headerContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.secondaryText} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Lusaka, Ndola..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={(text) => { setSearchQuery(text); setIsSearching(true); }}
            onFocus={() => setIsSearching(true)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>

        {!isSearching && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, activeCategory === cat && styles.categoryPillActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <Mapbox.MapView 
        style={styles.map} 
        styleURL={isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Street}
        onPress={handleDeselect}
        onCameraChanged={(state) => setZoomLevel(state.properties.zoom)}
      >
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={11.5}
          centerCoordinate={[28.2833, -15.4167]}
          animationMode="flyTo"
        />

        {/* 🔥 1. THE BLUE CLUSTERS */}
        <Mapbox.ShapeSource
          id="propertiesSource"
          shape={featureCollection}
          cluster={true}
          clusterMaxZoomLevel={13.5} 
          clusterRadius={50}
        >
          <Mapbox.CircleLayer
            id="clusteredPoints"
            belowLayerID="pointCount"
            filter={['has', 'point_count']}
            style={{
              circleColor: isDark ? '#1C1C1E' : '#FFFFFF',
              circleRadius: 24,
              circleStrokeWidth: 4,
              circleStrokeColor: colors.primary,
            }}
          />
          <Mapbox.SymbolLayer
            id="pointCount"
            filter={['has', 'point_count']}
            style={{
              textField: ['get', 'point_count'],
              textSize: 15,
              textColor: colors.primary,
              textFont: ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            }}
          />
        </Mapbox.ShapeSource>

        {/* 🔥 2. THE BEAUTIFUL WHITE BUBBLES */}
        {zoomLevel >= 10.5 && filteredProperties.map((property) => {
          const isSelected = selectedProperty?.id === property.id;
          
          return (
            <Mapbox.MarkerView
              key={property.id}
              coordinate={[property.longitude, property.latitude]}
              anchor={{ x: 0.5, y: 1 }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleSelectProperty(property)}
                style={[
                  styles.pricePin,
                  isSelected && styles.pricePinSelected
                ]}
              >
                <Text style={[
                  styles.priceText, 
                  isSelected && styles.priceTextSelected
                ]}>
                  K{property.price}
                </Text>
              </TouchableOpacity>
            </Mapbox.MarkerView>
          );
        })}
      </Mapbox.MapView>

      {isSearching && (
        <View style={styles.searchResultsContainer}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((prop) => (
                <TouchableOpacity 
                  key={prop.id}
                  style={styles.searchResultItem}
                  onPress={() => handleSelectProperty(prop)}
                >
                  <Ionicons name="location-outline" size={24} color={colors.primary} />
                  <View style={styles.searchResultText}>
                    <Text style={styles.searchResultTitle} numberOfLines={1}>{prop.title}</Text>
                    <Text style={styles.searchResultSubtitle}>{prop.location}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No properties found for "{searchQuery}"</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {selectedProperty && !isSearching && (
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          
          <View style={styles.card}>
            <Image 
              source={{ uri: selectedProperty.images?.[0] || 'https://via.placeholder.com/400' }} 
              style={styles.cardImage} 
            />
            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={2}>{selectedProperty.title}</Text>
                <TouchableOpacity onPress={handleDeselect} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={24} color={colors.secondaryText} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {selectedProperty.bedrooms} beds • {selectedProperty.bathrooms} baths • {selectedProperty.type}
              </Text>
              
              <View style={styles.cardPriceRow}>
                <Text style={styles.cardPrice}>K{selectedProperty.price}</Text>
                <Text style={styles.cardPriceSuffix}>/month</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={() => navigation.navigate('PropertyDetail', { property: selectedProperty })}
              >
                <Text style={styles.ctaButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  map: { flex: 1 },
  
  headerContainer: { position: 'absolute', top: 50, width: '100%', zIndex: 10 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 30, width: width * 0.9,
    alignSelf: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 5, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text, paddingVertical: 4 },
  
  categoryContainer: { paddingHorizontal: 20, paddingTop: 15, gap: 10 },
  categoryPill: {
    backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  categoryPillActive: { backgroundColor: colors.text },
  categoryText: { fontSize: 14, fontWeight: '600', color: colors.text },
  categoryTextActive: { color: colors.card },

  pricePin: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  pricePinSelected: {
    backgroundColor: '#222222',
    borderColor: '#222222',
    transform: [{ scale: 1.15 }],
  },
  priceText: { 
    fontSize: 15, 
    fontWeight: '900',
    color: '#222222',
    letterSpacing: -0.3,
  },
  priceTextSelected: { 
    color: '#FFFFFF' 
  },

  searchResultsContainer: {
    position: 'absolute', top: 110, width: width * 0.9, alignSelf: 'center',
    backgroundColor: colors.card, borderRadius: 16, maxHeight: height * 0.4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 8,
    zIndex: 20, overflow: 'hidden',
  },
  searchResultItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, gap: 12 },
  searchResultText: { flex: 1 },
  searchResultTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  searchResultSubtitle: { fontSize: 14, color: colors.secondaryText, marginTop: 2 },
  noResults: { padding: 20, alignItems: 'center' },
  noResultsText: { fontSize: 15, color: colors.secondaryText },

  bottomSheet: {
    position: 'absolute', bottom: 0, width: '100%', backgroundColor: colors.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 10, paddingBottom: 30,
  },
  sheetHandle: { width: 40, height: 5, backgroundColor: colors.border, borderRadius: 3, alignSelf: 'center', marginTop: 10, marginBottom: 15 },
  card: { flexDirection: 'row', paddingHorizontal: 20 },
  cardImage: { width: 110, height: 110, borderRadius: 12, backgroundColor: '#E0E0E0' },
  cardInfo: { flex: 1, marginLeft: 16, justifyContent: 'space-between' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text, flex: 1, marginRight: 8 },
  cardSubtitle: { fontSize: 14, color: colors.secondaryText, marginTop: 4 },
  cardPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  cardPrice: { fontSize: 20, fontWeight: '800', color: colors.text },
  cardPriceSuffix: { fontSize: 15, color: colors.secondaryText, marginLeft: 2 },
  ctaButton: { backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  ctaButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});