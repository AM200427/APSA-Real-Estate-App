// screens/PropertyDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RatingModal from '../components/RatingModal';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Text from '../components/AccessibleText';

const { width: screenWidth } = Dimensions.get('window');

const getPriceSuffix = (listingType) => {
  if (listingType === 'Booking') return ' / night';
  if (listingType === 'For Sale') return '';
  return ' / month';
};

const getPrimaryCTA = (listingType) => {
  if (listingType === 'For Sale') {
    return { label: 'Contact Agent', icon: 'chatbubble-outline' };
  }
  return { label: 'Book Now', icon: null };
};

const PropertyDetailScreen = ({ route, navigation }) => {
  const { colors, isDark } = useTheme();
  const { showSuccess, showError } = useToast();
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
    ensureConversation,
  } = useAppStore();

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [localReviews, setLocalReviews] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const styles = getStyles(colors, isDark);

  // 🛡️ ULTIMATE SAFE IMAGE EXTRACTOR
  const getSafeImages = () => {
    let rawImages = property?.images || property?.image || [];
    if (!Array.isArray(rawImages)) rawImages = [rawImages]; 

    const flat = [];
    const BASE_URL = 'http://192.168.1.195:5000'; 

    const flatten = (arr) => {
      arr.forEach(item => {
        if (Array.isArray(item)) flatten(item);
        else if (item && typeof item === 'object') {
          const uri = item.uri || item.url || item.path;
          if (typeof uri === 'string') flatten([uri]);
        }
        else if (typeof item === 'string' && item.length > 2) {
          let finalUri = item;
          if (finalUri.startsWith('/uploads')) {
             finalUri = `${BASE_URL}${finalUri}`;
          } else if (!finalUri.startsWith('http') && !finalUri.startsWith('file://')) {
             finalUri = `${BASE_URL}/uploads/${finalUri.replace(/^\/+/, '')}`;
          }
          flat.push(finalUri);
        }
      });
    };

    flatten(rawImages);

    if (flat.length === 0) {
      return ['https://via.placeholder.com/600x400?text=No+Image'];
    }
    return flat;
  };

  const safeImages = getSafeImages();

  const hostProfile =
    property?.hostProfile ||
    (user?.id && property?.hostId === user.id ? user?.agentProfile : null) ||
    null;

  useEffect(() => {
    if (!property) {
      showError('Property not found', 'This listing may have been removed.');
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
          if (result && result.length > 0) setLocalReviews(result);
          else setLocalReviews(property.reviews || []);
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
        showError('Review Error', reviewError);
      }
    }
  }, [reviewError]);

  const handleDeleteReview = (review) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReview(property.id, review.id);
            showSuccess('Review deleted', 'Your review has been removed.', 3000);
            await loadReviews(property.id);
          } catch (error) {
            showError('Delete failed', 'Could not delete your review.');
          }
        },
      },
    ]);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setIsEditing(true);
    setShowRatingModal(true);
  };

  const handleSubmitReview = async (reviewData) => {
    if (!property?.id) return;
    try {
      if (isEditing && editingReview) {
        await updateReview(property.id, editingReview.id, reviewData);
        showSuccess('Review updated ✨', 'Your changes have been saved.', 3000);
      } else {
        await addReview(property.id, {
          ...reviewData,
          userId: user?.id || 'anonymous',
          userName: user?.name || 'Anonymous',
          date: new Date().toISOString(),
        });
        showSuccess('Review submitted 🎉', 'Thanks for sharing your experience!', 3000);
      }
      setShowRatingModal(false);
      setEditingReview(null);
      setIsEditing(false);
      await loadReviews(property.id);
    } catch (error) {
      showError('Submission failed', error.message || 'Could not submit your review.');
    }
  };

  const handleToggleWishlist = async () => {
    try {
      await toggleWishlist(property);
    } catch (error) {
      showError('Wishlist Error', 'Could not update wishlist.');
    }
  };

  const primaryCTA = getPrimaryCTA(property?.listingType);
  const priceSuffix = getPriceSuffix(property?.listingType);
  const safePrice = Number(property?.price) || 0;

  const handleContactHost = () => {
    const cid = property?.hostId ? `host_${property.hostId}` : `property_${property?.id}`;
    if (ensureConversation) {
      ensureConversation({
        chatId: cid,
        userName: property?.host || 'Property Host',
        avatar: property?.hostAvatar,
        propertyTitle: property?.title,
      });
    }
    navigation.navigate('ChatDetail', {
      userName: property?.host || 'Property Host',
      chatId: cid,
      propertyTitle: property?.title,
    });
  };

  const handlePrimaryPress = () => {
    if (property?.status && property.status !== 'Active') {
      Alert.alert(
        "Property Unavailable", 
        `This property is currently ${property.status.toLowerCase()} and cannot be booked right now.`
      );
      return;
    }
    if (property?.listingType === 'For Sale') handleContactHost();
    else navigation.navigate('BookingForm', { property });
  };

  const renderReviewItem = ({ item }) => {
    if (!item || typeof item !== 'object') return null;
    const isOwnReview = user?.id && (item.userId === user.id || item.userId === user._id);

    return (
      <View style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewUser}>
            <Ionicons name={item.userType === 'agent' ? 'business' : 'person'} size={20} color={colors.primary} />
            <Text style={styles.reviewUserType}>{item.userName || 'Anonymous'}</Text>
          </View>
          <View style={styles.reviewActions}>
            <View style={styles.reviewRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons key={star} name={star <= (item.rating || 0) ? 'star' : 'star-outline'} size={14} color="#FFD700" />
              ))}
            </View>
            {isOwnReview && (
              <View style={styles.reviewActionButtons}>
                <TouchableOpacity onPress={() => handleEditReview(item)} style={styles.actionButton}>
                  <Ionicons name="pencil" size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteReview(item)} style={styles.actionButton}>
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

  const isUnavailable = property?.status && property.status !== 'Active';
  const statusColor = property?.status === 'Sold' ? '#AF52DE' : property?.status === 'Booked' ? '#FF9500' : '#FF3B30';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageCarouselContainer}>
          <FlatList
            data={safeImages}
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

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.wishlistButton} onPress={handleToggleWishlist}>
            <Ionicons name={isInWishlist ? 'heart' : 'heart-outline'} size={26} color={isInWishlist ? '#FF3B30' : colors.text} />
          </TouchableOpacity>

          <View style={styles.paginationDots}>
            {safeImages.map((_, index) => (
              <View key={index} style={[styles.dot, currentImageIndex === index ? styles.dotActive : styles.dotInactive]} />
            ))}
          </View>

          <View style={styles.priceTag}>
            <Text style={styles.priceText}>
              K{safePrice.toLocaleString()}
              {priceSuffix ? <Text style={styles.priceSubtext}>{priceSuffix}</Text> : null}
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

          {property?.listingType ? (
            <View style={styles.listingTypeRow}>
              <Ionicons
                name={property.listingType === 'Booking' ? 'calendar-outline' : property.listingType === 'For Sale' ? 'pricetag-outline' : 'home-outline'}
                size={14}
                color={colors.primary}
              />
              <Text style={styles.listingTypeText}>{property.listingType}</Text>
            </View>
          ) : null}

          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={16} color={colors.primary} />
            <Text style={styles.locationText}>{property?.location || 'Location not specified'}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>
              {property?.rating || 0}{' '}
              <Text style={styles.reviewCountText}>({localReviews?.length || property?.reviews?.length || 0} reviews)</Text>
            </Text>
          </View>

          {/* 🔥 STEP 4: STATUS BANNER */}
          {isUnavailable && (
            <View style={[styles.statusBanner, { backgroundColor: `${statusColor}15`, borderColor: `${statusColor}40` }]}>
              <Ionicons 
                name={property.status === 'Sold' ? 'pricetag' : property.status === 'Booked' ? 'calendar' : 'key'} 
                size={24} 
                color={statusColor} 
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.statusBannerTitle, { color: statusColor }]}>
                  Currently {property.status}
                </Text>
                {property.availableDate ? (
                  <Text style={[styles.statusBannerSubtitle, { color: statusColor }]}>
                    Available again from: {property.availableDate}
                  </Text>
                ) : (
                  <Text style={[styles.statusBannerSubtitle, { color: statusColor }]}>
                    This property is no longer available for new bookings.
                  </Text>
                )}
              </View>
            </View>
          )}
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

        <View style={styles.contentSection}>
          <Text style={styles.sectionHeader}>About this property</Text>
          <Text style={styles.description}>{property?.description || 'Beautiful property in a prime location.'}</Text>
        </View>

        <View style={styles.divider} />

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

        {/* Meet your host */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionHeader}>Meet your host</Text>
          <View style={styles.hostCard}>
            <View style={styles.hostAvatarWrap}>
              {property?.hostAvatar ? (
                <Image source={{ uri: property.hostAvatar }} style={styles.hostAvatarImg} />
              ) : (
                <View style={styles.hostAvatar}>
                  <Text style={styles.hostAvatarText}>{property?.host ? property.host.charAt(0).toUpperCase() : 'H'}</Text>
                </View>
              )}
              {property?.hostVerified && (
                <View style={styles.hostVerifiedBadge}>
                  <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                </View>
              )}
            </View>
            <View style={styles.hostInfo}>
              <View style={styles.hostNameRow}>
                <Text style={styles.hostName} numberOfLines={1}>{property?.host || 'Property Host'}</Text>
                {property?.hostVerified && <Ionicons name="shield-checkmark" size={16} color={colors.primary} />}
              </View>
              {hostProfile?.yearsExperience ? (
                <Text style={styles.hostMeta}>
                  {hostProfile.yearsExperience} yr{hostProfile.yearsExperience > 1 ? 's' : ''} experience
                  {hostProfile.company ? ` · ${hostProfile.company}` : ''}
                </Text>
              ) : property?.hostPhone ? (
                <Text style={styles.hostMeta}>{property.hostPhone}</Text>
              ) : (
                <Text style={styles.hostMeta}>Contact via chat</Text>
              )}
              {hostProfile?.specializations?.length > 0 && (
                <View style={styles.hostChipsRow}>
                  {hostProfile.specializations.slice(0, 3).map((s, i) => (
                    <View key={i} style={styles.hostChip}><Text style={styles.hostChipText}>{s}</Text></View>
                  ))}
                  {hostProfile.specializations.length > 3 && (
                    <View style={styles.hostChip}><Text style={styles.hostChipText}>+{hostProfile.specializations.length - 3}</Text></View>
                  )}
                </View>
              )}
              {hostProfile?.responseTime ? (
                <View style={styles.hostResponseRow}>
                  <Ionicons name="time-outline" size={12} color={colors.secondaryText} />
                  <Text style={styles.hostResponseText}>Responds {hostProfile.responseTime.toLowerCase()}</Text>
                </View>
              ) : null}
            </View>
          </View>
          {hostProfile?.bio ? (
            <View style={styles.hostBioBlock}>
              <Text style={styles.hostBioText} numberOfLines={4}>{hostProfile.bio}</Text>
            </View>
          ) : null}
          <TouchableOpacity style={styles.viewAgentBtn} onPress={handleContactHost} activeOpacity={0.85}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
            <Text style={styles.viewAgentBtnText}>Contact {property?.host || 'agent'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.contentSection}>
          <TouchableOpacity style={styles.rateButton} onPress={() => { setEditingReview(null); setIsEditing(false); setShowRatingModal(true); }}>
            <Ionicons name="star-outline" size={22} color={colors.primary} />
            <Text style={styles.rateButtonText}>Rate & Review This Property</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {(localReviews?.length > 0 || storeReviews?.length > 0) && (
          <>
            <View style={styles.divider} />
            <View style={styles.contentSection}>
              <Text style={styles.sectionHeader}>Reviews ({localReviews?.length || storeReviews?.length || 0})</Text>
              <FlatList
                data={localReviews?.length > 0 ? localReviews : storeReviews}
                renderItem={renderReviewItem}
                keyExtractor={(item, index) => item?.id ? item.id.toString() : `review-${index}`}
                scrollEnabled={false}
              />
            </View>
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity 
          style={[styles.bookButton, isUnavailable && { backgroundColor: '#8E8E93' }]} 
          onPress={handlePrimaryPress}
        >
          {isUnavailable ? (
            <Text style={styles.bookButtonText}>Not Available</Text>
          ) : primaryCTA.icon ? (
            <View style={styles.ctaContent}>
              <Ionicons name={primaryCTA.icon} size={20} color="#FFFFFF" />
              <Text style={styles.bookButtonText}>{primaryCTA.label}</Text>
            </View>
          ) : (
            <Text style={styles.bookButtonText}>{primaryCTA.label}</Text>
          )}
        </TouchableOpacity>

        {property?.listingType !== 'For Sale' && (
          <TouchableOpacity style={styles.contactButton} onPress={handleContactHost}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            <Text style={styles.contactButtonText}>Contact</Text>
          </TouchableOpacity>
        )}
      </View>

      <RatingModal
        visible={showRatingModal}
        onClose={() => { setShowRatingModal(false); setEditingReview(null); setIsEditing(false); }}
        onSubmit={handleSubmitReview}
        propertyTitle={property?.title}
        editingReview={editingReview}
        isEditing={isEditing}
      />
    </View>
  );
};

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingText: { marginTop: 10, color: colors.secondaryText },
    imageCarouselContainer: { position: 'relative', height: 320 },
    carouselImage: { width: screenWidth, height: 320, backgroundColor: colors.inputBackground },
    backButton: { position: 'absolute', top: 16, left: 16, backgroundColor: colors.card, borderRadius: 30, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5, zIndex: 10 },
    wishlistButton: { position: 'absolute', top: 16, right: 16, backgroundColor: colors.card, borderRadius: 30, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5, zIndex: 10 },
    paginationDots: { position: 'absolute', bottom: 15, alignSelf: 'center', flexDirection: 'row', gap: 8, zIndex: 10 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    dotActive: { backgroundColor: '#FFFFFF' },
    dotInactive: { backgroundColor: 'rgba(255, 255, 255, 0.4)' },
    priceTag: { position: 'absolute', bottom: 20, left: 20, backgroundColor: 'rgba(0, 0, 0, 0.75)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    priceText: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
    priceSubtext: { fontSize: 14, fontWeight: 'normal', color: '#CCCCCC' },
    contentSection: { paddingHorizontal: 20, paddingVertical: 12 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', color: colors.text, flex: 1, marginRight: 10 },
    typeBadge: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    typeBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
    listingTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    listingTypeText: { fontSize: 13, fontWeight: '600', color: colors.primary },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    locationText: { fontSize: 14, color: colors.secondaryText, marginLeft: 4 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    ratingText: { fontSize: 14, color: colors.text, marginLeft: 4 },
    reviewCountText: { color: colors.secondaryText },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 20 },
    sectionHeader: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 10 },
    specsGrid: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.card, paddingVertical: 16, borderRadius: 12 },
    specItem: { alignItems: 'center' },
    specValue: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginTop: 4 },
    specLabel: { fontSize: 12, color: colors.secondaryText, marginTop: 2 },
    description: { fontSize: 15, color: colors.text, lineHeight: 24 },
    amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    amenityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#0A2A50' : '#F0F7FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
    amenityText: { fontSize: 14, color: colors.text },
    noAmenitiesText: { fontSize: 14, color: colors.secondaryText, fontStyle: 'italic' },
    hostCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.card, padding: 14, borderRadius: 14, gap: 14 },
    hostAvatarWrap: { position: 'relative' },
    hostAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
    hostAvatarImg: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.inputBackground },
    hostAvatarText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
    hostVerifiedBadge: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.card },
    hostInfo: { flex: 1 },
    hostNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
    hostName: { fontSize: 16, fontWeight: '700', color: colors.text, flexShrink: 1 },
    hostMeta: { fontSize: 13, color: colors.secondaryText, marginBottom: 6 },
    hostChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
    hostChip: { backgroundColor: isDark ? '#0A2A50' : '#F0F7FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    hostChipText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
    hostResponseRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    hostResponseText: { fontSize: 12, color: colors.secondaryText },
    hostBioBlock: { marginTop: 12, paddingHorizontal: 2 },
    hostBioText: { fontSize: 13, color: colors.text, lineHeight: 20, fontStyle: 'italic' },
    viewAgentBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.primary, backgroundColor: isDark ? '#0A2A50' : '#F0F7FF' },
    viewAgentBtnText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
    rateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.primary, borderRadius: 12, backgroundColor: isDark ? '#0A2A50' : '#F8F9FF', gap: 8 },
    rateButtonText: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.primary, textAlign: 'center' },
    bottomActionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.card, paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: colors.border, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    bookButton: { flex: 2, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    ctaContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    bookButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    contactButton: { flex: 1, backgroundColor: isDark ? '#0A2A50' : '#F0F7FF', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: colors.primary },
    contactButtonText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
    reviewItem: { backgroundColor: colors.card, padding: 12, borderRadius: 8, marginBottom: 12 },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    reviewUser: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    reviewUserType: { fontSize: 14, fontWeight: '600', color: colors.text },
    reviewRating: { flexDirection: 'row' },
    reviewComment: { fontSize: 15, color: colors.text, lineHeight: 22 },
    reviewDate: { fontSize: 12, color: colors.secondaryText, marginTop: 4 },
    reviewActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    reviewActionButtons: { flexDirection: 'row', gap: 4 },
    actionButton: { padding: 4, borderRadius: 12, backgroundColor: colors.inputBackground, marginLeft: 4 },
    
    // 🔥 NEW: Status Banner Styles
    statusBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      marginTop: 16,
      borderWidth: 1,
    },
    statusBannerTitle: {
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 2,
    },
    statusBannerSubtitle: {
      fontSize: 13,
      fontWeight: '500',
    },
  });

export default PropertyDetailScreen;