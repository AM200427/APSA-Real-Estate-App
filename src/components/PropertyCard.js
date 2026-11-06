// src/components/PropertyCard.js
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PropertyCard({ property = {}, onPress, horizontal = true }) {
  // 🛡️ Safely extract every single field with fallbacks
  const {
    title = 'Untitled Property',
    type = 'Property',
    price = 0,
    location = 'Location not specified',
    bedrooms = 0,
    bathrooms = 0,
    images = [],
    rating = 0,
    reviews = [],
    listingType = 'For Rent',
  } = property;

  // 🛡️ Safely unwrap the image URL (prevents the nested array crash)
    // 🛡️ CRASH-PROOF IMAGE HANDLER
  let safeImageUri = images?.[0] || property?.image;
  
  // Flatten nested arrays
  while (Array.isArray(safeImageUri)) {
    safeImageUri = safeImageUri[0];
  }

  // 🔥 THE FIX: Attach backend URL if it's a local upload
  const BASE_URL = 'http://192.168.1.195:5000';
  if (typeof safeImageUri === 'string' && safeImageUri.length > 2) {
    if (safeImageUri.startsWith('/uploads')) {
      safeImageUri = `${BASE_URL}${safeImageUri}`;
    } else if (!safeImageUri.startsWith('http') && !safeImageUri.startsWith('file://')) {
      safeImageUri = `${BASE_URL}/uploads/${safeImageUri.replace(/^\/+/, '')}`;
    }
  } else {
    safeImageUri = 'https://via.placeholder.com/400x250?text=No+Image';
  }

  // 🛡️ Safely handle the reviews count
  const reviewCount = Array.isArray(reviews) ? reviews.length : 0;

  return (
    <TouchableOpacity
      style={[styles.card, horizontal ? styles.horizontalCard : styles.verticalCard]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: safeImageUri }}
          style={horizontal ? styles.horizontalImage : styles.verticalImage}
        />
        {listingType ? (
          <View style={styles.listingTypeBadge}>
            <Text style={styles.listingTypeBadgeText}>
              {typeof listingType === 'string' ? listingType.toUpperCase() : 'RENT'}
            </Text>
          </View>
        ) : null}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.type}>{type}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FF385C" />
            <Text style={styles.rating}>{rating || 0}</Text>
            <Text style={styles.reviews}>({reviewCount})</Text>
          </View>
        </View>
        
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {location}
        </Text>
        
        <View style={styles.details}>
          <Text style={styles.detailText}>{bedrooms} beds</Text>
          <Text style={styles.detailDot}>•</Text>
          <Text style={styles.detailText}>{bathrooms} baths</Text>
        </View>
        
        <Text style={styles.price}>
          K{price}
          <Text style={styles.priceSuffix}>/month</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  horizontalCard: { width: width * 0.7, marginRight: 15 },
  verticalCard: { width: '100%' },
  imageWrapper: { position: 'relative' },
  horizontalImage: { width: '100%', height: 150 },
  verticalImage: { width: '100%', height: 200 },
  listingTypeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  listingTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: { padding: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  type: {
    fontSize: 12,
    color: '#FF385C',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  rating: { fontSize: 12, fontWeight: '600', marginLeft: 3, color: '#222' },
  reviews: { fontSize: 12, color: '#717171', marginLeft: 2 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 3 },
  location: { fontSize: 14, color: '#717171', marginBottom: 5 },
  details: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  detailText: { fontSize: 13, color: '#717171' },
  detailDot: { fontSize: 13, color: '#717171', marginHorizontal: 5 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#FF385C' },
  priceSuffix: { fontSize: 13, fontWeight: '500', color: '#717171' },
});