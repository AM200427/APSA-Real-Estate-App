// screens/PropertyDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RatingModal from '../components/RatingModal';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext'; // ✅ Theme hook
import Text from '../components/AccessibleText';

const { width: screenWidth } = Dimensions.get('window');

const PropertyDetailScreen = ({ route, navigation }) => {
  const { colors, isDark } = useTheme(); // ✅ Get theme
  const { property } = route?.params || {};

  const { 
    user, 
    toggleWishlist, 
    wishlist,
    addReview,
    updateReview,  
    deleteReview,
    loadReviews,
    isLoadingReviews,
    reviews: storeReviews,
    reviewError,
    clearReviewError,
    properties,
  } = useAppStore();

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userType, setUserType] = useState('client');
  const [localReviews, setLocalReviews] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const styles = getStyles(colors, isDark); // ✅ Generate themed styles

  useEffect(() => {
    if (!property) {
      Alert.alert('Error', 'Property not found');
      navigation.goBack();
    }
  }, [property]);

  useEffect(() => {
    if (wishlist && property?.id) {
      const inWishlist = wishlist.some((item) => item.id === property.id);
      setIsInWishlist(inWishlist);
    }
  }, [wishlist, property?.id]);

  useEffect(() => {
    if (property?.id && loadReviews) {
      clearReviewError?.();
      loadReviews(property.id)
        .then((result) => {
          if (result && result.length > 0) {
            setLocalReviews(result);
          } else {
            setLocalReviews(property.reviews || []);
          }
        })
        .catch(() => {
          setLocalReviews(property.reviews || []);
        });
    } else if (property?.reviews) {
      setLocalReviews(property.reviews);
    }
  }, [property?.id]);

  useEffect(() => {
    if (storeReviews && storeReviews.length > 0) {
      setLocalReviews(storeReviews);
    } else if (property?.reviews && property.reviews.length > 0) {
      setLocalReviews(property.reviews);
    }
  }, [storeReviews, property?.reviews]);

  useEffect(() => {
    if (reviewError) {
      if (!reviewError.includes('404')) {
        Alert.alert('Notice', reviewError);
      }
    }
  }, [reviewError]);

  const handleAddReview = async (reviewData) => {
    if (!property?.id) {
      Alert.alert('Error', 'Property not found');
      return;
    }
    try {
      await addReview(property.id, {
        ...reviewData,
        userId: user?.id || 'anonymous',
        userType: userType || 'client',
        userName: user?.name || 'Anonymous',
        date: new Date().toISOString(),
      });
      Alert.alert('Success', 'Your review has been submitted!');
      setShowRatingModal(false);
      await loadReviews(property.id);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit review. Please try again.');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setIsEditing(true);
    setShowRatingModal(true);
  };

  const handleDeleteReview = (review) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReview(property.id, review.id);
              Alert.alert('Success', 'Review deleted successfully');
              await loadReviews(property.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete review');
            }
          },
        },
      ]
    );
  };

  const handleSubmitReview = async (reviewData) => {
    if (!property?.id) {
      Alert.alert('Error', 'Property not found');
      return;
    }
    try {
      if (isEditing && editingReview) {
        await updateReview(property.id, editingReview.id, {
          rating: reviewData.rating,
          comment: reviewData.comment,
          userType: reviewData.userType,
        });
        Alert.alert('Success', 'Review updated successfully!');
      } else {
        await addReview(property.id, {
          ...reviewData,
          userId: user?.id || 'anonymous',
          userName: user?.name || 'Anonymous',
          date: new Date().toISOString(),
        });
        Alert.alert('Success', 'Review submitted successfully!');
      }
      setShowRatingModal(false);
      setEditingReview(null);
      setIsEditing(false);
      await loadReviews(property.id);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit review. Please try again.');
    }
  };

  const handleToggleWishlist = async () => {
    try {
      await toggleWishlist(property);
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      Alert.alert('Error', 'Failed to update wishlist.');
    }
  };

  const renderReviewItem = ({ item }) => {
    if (!item || typeof item !== 'object') return null;

    const isOwnReview = user?.id && (item.userId === user.id || item.userId === user._id);

    return (
      <View style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewUser}>
            <Ionicons
              name={item.userType === 'agent' ? 'business' : 'person'}
              size={20}
              color={colors.primary}
            />
            <Text style={styles.reviewUserType}>{item.userName || 'Anonymous'}</Text>
          </View>
          <View style={styles.reviewActions}>
            <View style={styles.reviewRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= (item.rating || 0) ? 'star' : 'star-outline'}
                  size={14}
                  color="#FFD700"
                />
              ))}
            </View>
            {isOwnReview && (
              <View style={styles.reviewActionButtons}>
                <TouchableOpacity
                  onPress={() => handleEditReview(item)}
                  style={styles.actionButton}
                >
                  <Ionicons name="pencil" size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteReview(item)}
                  style={styles.actionButton}
                >
                  <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.reviewComment}>{item.comment || ''}</Text>
        <Text style={styles.reviewDate}>
          {new Date(item.date || item.createdAt || Date.now()).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  if (isLoadingReviews) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image Carousel */}
      <View style={styles.imageCarouselContainer}>
        <FlatList
          data={property?.images || [property?.image || 'https://via.placeholder.com/400']}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            setCurrentImageIndex(index);
          }}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="cover" />
          )}
        />

        <TouchableOpacity style={styles.wishlistButton} onPress={handleToggleWishlist}>
          <Ionicons
            name={isInWishlist ? 'heart' : 'heart-outline'}
            size={26}
            color={isInWishlist ? '#FF3B30' : colors.text}
          />
        </TouchableOpacity>

        <View style={styles.paginationDots}>
          {(property?.images || [property?.image || 'https://via.placeholder.com/400']).map(
            (_, index) => (
              <View
                key={index}
                style={[styles.dot, currentImageIndex === index ? styles.dotActive : styles.dotInactive]}
              />
            )
          )}
        </View>

        <View style={styles.priceTag}>
          <Text style={styles.priceText}>
            K{property?.price?.toLocaleString() || 0}
            <Text style={styles.priceSubtext}> /month</Text>
          </Text>
        </View>
      </View>

      {/* Title & Location */}
      <View style={styles.contentSection}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{property?.title || 'Property'}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{property?.type || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={16} color={colors.primary} />
          <Text style={styles.locationText}>
            {property?.location || 'Location not specified'}
          </Text>
        </View>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>
            {property?.rating || 0}{' '}
            <Text style={styles.reviewCountText}>
              ({localReviews?.length || property?.reviews?.length || 0} reviews)
            </Text>
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Property Details */}
      <View style={styles.contentSection}>
        <Text style={styles.sectionHeader}>Property Details</Text>
        <View style={styles.specsGrid}>
          <View style={styles.specItem}>
            <Ionicons name="bed-outline" size={24} color={colors.primary} />
            <Text style={styles.specValue}>{property?.bedrooms || 0}</Text>
            <Text style={styles.specLabel}>Bedrooms</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="water-outline" size={24} color={colors.primary} />
            <Text style={styles.specValue}>{property?.bathrooms || 0}</Text>
            <Text style={styles.specLabel}>Bathrooms</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="resize-outline" size={24} color={colors.primary} />
            <Text style={styles.specValue}>{property?.area || 0}</Text>
            <Text style={styles.specLabel}>Sq Ft</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Description */}
      <View style={styles.contentSection}>
        <Text style={styles.sectionHeader}>About this property</Text>
        <Text style={styles.description}>
          {property?.description ||
            'Beautiful property in a prime location. Modern amenities and great views.'}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Amenities */}
      <View style={styles.contentSection}>
        <Text style={styles.sectionHeader}>Amenities</Text>
        <View style={styles.amenitiesGrid}>
          {property?.amenities && property.amenities.length > 0 ? (
            property.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noAmenitiesText}>No amenities listed</Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Host Info */}
      <View style={styles.contentSection}>
        <Text style={styles.sectionHeader}>Meet your host</Text>
        <View style={styles.hostCard}>
          <View style={styles.hostAvatar}>
            <Text style={styles.hostAvatarText}>
              {property?.host ? property.host.charAt(0).toUpperCase() : 'H'}
            </Text>
          </View>
          <View style={styles.hostInfo}>
            <Text style={styles.hostName}>{property?.host || 'Property Host'}</Text>
            <Text style={styles.hostPhone}>{property?.hostPhone || 'Contact via chat'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Rate & Review Button */}
      <View style={styles.contentSection}>
        <TouchableOpacity
          style={styles.rateButton}
          onPress={() => {
            setEditingReview(null);
            setIsEditing(false);
            setShowRatingModal(true);
          }}
        >
          <Ionicons name="star-outline" size={22} color={colors.primary} />
          <Text style={styles.rateButtonText}>Rate & Review This Property</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Reviews Section */}
      {(localReviews?.length > 0 || storeReviews?.length > 0) && (
        <>
          <View style={styles.divider} />
          <View style={styles.contentSection}>
            <Text style={styles.sectionHeader}>
              Reviews ({localReviews?.length || storeReviews?.length || 0})
            </Text>
            <FlatList
              data={localReviews?.length > 0 ? localReviews : storeReviews}
              renderItem={renderReviewItem}
              keyExtractor={(item, index) => {
                if (item?.id) return item.id.toString();
                if (item?._id) return item._id.toString();
                return `review-${index}`;
              }}
              scrollEnabled={false}
            />
          </View>
        </>
      )}

      <View style={{ height: 100 }} />

      {/* Bottom Action Bar */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('BookingForm', { property: property })}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() =>
            navigation.navigate('MainTabs', {
              screen: 'Messages',
              params: {
                screen: 'Messages',
                params: {
                  host: property?.host || 'Property Host',
                  avatar: 'https://i.pravatar.cc/150?img=1',
                  property: property?.title,
                  propertyId: property?.id,
                },
              },
            })
          }
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
          <Text style={styles.contactButtonText}>Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setEditingReview(null);
          setIsEditing(false);
        }}
        onSubmit={handleSubmitReview}
        propertyTitle={property?.title}
        editingReview={editingReview}
        isEditing={isEditing}
      />
    </ScrollView>
  );
};

// ✅ Styles generated from theme colors
const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 10,
      color: colors.secondaryText,
    },
    imageCarouselContainer: {
      position: 'relative',
      height: 320,
    },
    carouselImage: {
      width: screenWidth,
      height: 320,
      backgroundColor: colors.inputBackground,
    },
    wishlistButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      zIndex: 10,
    },
    paginationDots: {
      position: 'absolute',
      bottom: 15,
      alignSelf: 'center',
      flexDirection: 'row',
      gap: 8,
      zIndex: 10,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    dotActive: { backgroundColor: '#FFFFFF' },
    dotInactive: { backgroundColor: 'rgba(255, 255, 255, 0.4)' },
    priceTag: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
    },
    priceText: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: 'bold',
    },
    priceSubtext: {
      fontSize: 14,
      fontWeight: 'normal',
      color: '#CCCCCC',
    },
    contentSection: {
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
      marginRight: 10,
    },
    typeBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    typeBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    locationText: {
      fontSize: 14,
      color: colors.secondaryText,
      marginLeft: 4,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    ratingText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 4,
    },
    reviewCountText: {
      color: colors.secondaryText,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 20,
    },
    sectionHeader: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
    },
    specsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.card,
      paddingVertical: 16,
      borderRadius: 12,
    },
    specItem: { alignItems: 'center' },
    specValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 4,
    },
    specLabel: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 2,
    },
    description: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 24,
    },
    amenitiesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    amenityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 6,
    },
    amenityText: {
      fontSize: 14,
      color: colors.text,
    },
    noAmenitiesText: {
      fontSize: 14,
      color: colors.secondaryText,
      fontStyle: 'italic',
    },
    hostCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 12,
      gap: 12,
    },
    hostAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    hostAvatarText: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    hostInfo: { flex: 1 },
    hostName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    hostPhone: {
      fontSize: 14,
      color: colors.secondaryText,
    },
    rateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 12,
      backgroundColor: isDark ? '#0A2A50' : '#F8F9FF',
      gap: 8,
    },
    rateButtonText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
      textAlign: 'center',
    },
    bottomActionBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.card,
      paddingHorizontal: 20,
      paddingVertical: 12,
      flexDirection: 'row',
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    bookButton: {
      flex: 2,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    bookButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    contactButton: {
      flex: 1,
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      paddingVertical: 14,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    contactButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    reviewItem: {
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    reviewUser: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    reviewUserType: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    reviewRating: {
      flexDirection: 'row',
    },
    reviewComment: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
    },
    reviewDate: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 4,
    },
    reviewActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    reviewActionButtons: {
      flexDirection: 'row',
      gap: 4,
    },
    actionButton: {
      padding: 4,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
      marginLeft: 4,
    },
  });

export default PropertyDetailScreen;