// src/screens/PublicProfileScreen.js
import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext';
import Text from '../components/AccessibleText';

const detectIsAgent = (user) => {
  const candidates = [user?.role, user?.userRole, user?.accountType, user?.type];
  return candidates.some(
    (raw) => typeof raw === 'string' && raw.trim().toLowerCase() === 'agent'
  );
};

const AVATAR_FALLBACK = 'https://i.pravatar.cc/150?img=1';

function getStyles(colors, isDark) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    backBtn: { padding: 4, minWidth: 40 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    headerEditBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
    },
    headerEditText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },

    scrollContent: { paddingBottom: 40 },

    // Hero card
    heroCard: {
      alignItems: 'center',
      paddingTop: 28,
      paddingBottom: 24,
      paddingHorizontal: 20,
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
    avatarWrap: { position: 'relative', marginBottom: 14 },
    avatar: {
      width: 108,
      height: 108,
      borderRadius: 54,
      borderWidth: 3,
      borderColor: colors.card,
      backgroundColor: colors.inputBackground,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#34C759',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: colors.card,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    name: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.2,
    },
    rolePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 14,
      marginBottom: 8,
    },
    rolePillText: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 8,
    },
    locationText: {
      fontSize: 13,
      color: colors.secondaryText,
    },
    bioText: {
      fontSize: 14,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 21,
      marginTop: 8,
      paddingHorizontal: 8,
      fontStyle: 'italic',
      opacity: 0.9,
    },

    // Stats card
    statsCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 18,
      paddingVertical: 18,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },
    statValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    statLabel: {
      fontSize: 11.5,
      color: colors.secondaryText,
      marginTop: 3,
      fontWeight: '500',
    },
    statDivider: { width: 1, backgroundColor: colors.border, marginVertical: 6 },

    // Sections
    section: {
      backgroundColor: colors.card,
      borderRadius: 20,
      marginHorizontal: 16,
      marginTop: 12,
      paddingHorizontal: 18,
      paddingVertical: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },
    sectionIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 9,
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },

    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
    },
    infoLabel: {
      fontSize: 13,
      color: colors.secondaryText,
      marginLeft: 10,
      flex: 1,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      maxWidth: '60%',
      textAlign: 'right',
    },
    infoDivider: { height: 0.5, backgroundColor: colors.border },

    // Chips
    chipsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },

    // Listings strip
    listingStrip: { gap: 10, paddingBottom: 4 },
    listingCard: {
      width: 160,
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: colors.inputBackground,
    },
    listingImage: {
      width: '100%',
      height: 100,
      backgroundColor: colors.inputBackground,
    },
    listingInfo: { padding: 10 },
    listingTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 3,
    },
    listingPrice: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },

    // Reviews preview
    reviewRow: {
      flexDirection: 'row',
      gap: 10,
      paddingVertical: 10,
      borderTopWidth: 0.5,
      borderTopColor: colors.border,
    },
    reviewAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
      alignItems: 'center',
      justifyContent: 'center',
    },
    reviewAvatarText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },
    reviewContent: { flex: 1 },
    reviewStarsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      marginBottom: 4,
    },
    reviewName: {
      fontSize: 12,
      color: colors.secondaryText,
      fontWeight: '500',
      marginLeft: 4,
    },
    reviewText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
    },
    seeAllReviews: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      marginTop: 4,
      borderTopWidth: 0.5,
      borderTopColor: colors.border,
    },
    seeAllReviewsText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
    },

    // Empty states
    emptyText: {
      fontSize: 13,
      color: colors.secondaryText,
      fontStyle: 'italic',
      lineHeight: 19,
    },
    emptyActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    emptyActionText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },

    // Footer note
    footerNote: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      marginHorizontal: 16,
      marginTop: 20,
      paddingHorizontal: 4,
    },
    footerNoteText: {
      fontSize: 11.5,
      color: colors.secondaryText,
      flex: 1,
      lineHeight: 16,
    },
  });
}

export default function PublicProfileScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { user, properties, userReviews } = useAppStore();

  const styles = getStyles(colors, isDark);

  const isAgent = detectIsAgent(user);
  const agentProfile = user?.agentProfile || {};
  const verificationStatus = user?.agentVerification?.status || 'unverified';
  const isVerified = verificationStatus === 'verified';

  const userProperties = useMemo(
    () => properties?.filter((p) => p.hostId === user?.id) || [],
    [properties, user?.id]
  );

  const reviews = userReviews || [];
  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return sum / reviews.length;
  }, [reviews]);

  const avatarUri = user?.avatar || AVATAR_FALLBACK;
  const name = user?.name || 'You';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Profile</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('PersonalInfo')}
          style={styles.headerEditBtn}
          hitSlop={8}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <Text style={styles.headerEditText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            {isAgent && isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={13} color="#FFFFFF" />
              </View>
            )}
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            {isAgent && isVerified && (
              <Ionicons
                name="shield-checkmark"
                size={20}
                color={colors.primary}
              />
            )}
          </View>

          <View
            style={[
              styles.rolePill,
              {
                backgroundColor: isAgent
                  ? isDark
                    ? '#0A2A50'
                    : '#E8F0FE'
                  : isDark
                  ? '#0A2A1A'
                  : '#E8F8EE',
              },
            ]}
          >
            <Ionicons
              name={isAgent ? 'briefcase' : 'person'}
              size={12}
              color={isAgent ? colors.primary : '#34C759'}
            />
            <Text
              style={[
                styles.rolePillText,
                { color: isAgent ? colors.primary : '#34C759' },
              ]}
            >
              {isAgent ? (isVerified ? 'Verified Agent' : 'Agent') : 'Client'}
            </Text>
          </View>

          {agentProfile.areasServed?.length > 0 || user?.location ? (
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={13}
                color={colors.secondaryText}
              />
              <Text style={styles.locationText}>
                {agentProfile.areasServed?.[0] || user?.location}
              </Text>
            </View>
          ) : null}

          {agentProfile.bio || user?.bio ? (
            <Text style={styles.bioText} numberOfLines={5}>
              {agentProfile.bio || user.bio}
            </Text>
          ) : null}
        </View>

        {/* Stats — agents only */}
        {isAgent && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProperties.length}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statValueRow}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.statValue}>
                  {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                </Text>
              </View>
              <Text style={styles.statLabel}>
                {reviews.length} review{reviews.length === 1 ? '' : 's'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {agentProfile.responseTime || '—'}
              </Text>
              <Text style={styles.statLabel}>Response</Text>
            </View>
          </View>
        )}

        {/* About */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          {agentProfile.bio || user?.bio ? (
            <Text style={styles.reviewText}>
              {agentProfile.bio || user.bio}
            </Text>
          ) : (
            <TouchableOpacity
              style={styles.emptyActionRow}
              onPress={() => navigation.navigate('PersonalInfo')}
              activeOpacity={0.7}
            >
              <Text style={styles.emptyText}>You haven't added a bio yet.</Text>
              <Text style={styles.emptyActionText}>Add one</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="call-outline" size={16} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Contact</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color={colors.secondaryText} />
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {user?.phone || 'Not provided'}
            </Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={16} color={colors.secondaryText} />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {user?.email || 'Not provided'}
            </Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.secondaryText} />
            <Text style={styles.infoLabel}>Member since</Text>
            <Text style={styles.infoValue}>{memberSince}</Text>
          </View>
        </View>

        {/* Agent Details — agents only */}
        {isAgent && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconWrap}>
                <Ionicons name="briefcase-outline" size={16} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Agent Details</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={16} color={colors.secondaryText} />
              <Text style={styles.infoLabel}>Company</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {agentProfile.company || 'Not set'}
              </Text>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color={colors.secondaryText} />
              <Text style={styles.infoLabel}>Experience</Text>
              <Text style={styles.infoValue}>
                {agentProfile.yearsExperience
                  ? `${agentProfile.yearsExperience} year${
                      agentProfile.yearsExperience > 1 ? 's' : ''
                    }`
                  : 'Not set'}
              </Text>
            </View>

            {agentProfile.specializations?.length > 0 && (
              <>
                <View style={styles.infoDivider} />
                <View style={{ paddingVertical: 12 }}>
                  <Text style={styles.infoLabel}>Specializations</Text>
                  <View style={[styles.chipsWrap, { marginTop: 10 }]}>
                    {agentProfile.specializations.map((s, i) => (
                      <View key={i} style={styles.chip}>
                        <Text style={styles.chipText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}

            {agentProfile.languages?.length > 0 && (
              <>
                <View style={styles.infoDivider} />
                <View style={{ paddingVertical: 12 }}>
                  <Text style={styles.infoLabel}>Languages</Text>
                  <View style={[styles.chipsWrap, { marginTop: 10 }]}>
                    {agentProfile.languages.map((l, i) => (
                      <View key={i} style={styles.chip}>
                        <Text style={styles.chipText}>{l}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* Listings — agents only */}
        {isAgent && userProperties.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconWrap}>
                <Ionicons name="home-outline" size={16} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>
                Listings ({userProperties.length})
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listingStrip}
            >
              {userProperties.slice(0, 8).map((p, idx) => (
                <TouchableOpacity
                  key={p.id || idx}
                  style={styles.listingCard}
                  activeOpacity={0.85}
                  onPress={() =>
                    navigation.navigate('PropertyDetail', { property: p })
                  }
                >
                  <Image
                    source={{
                      uri:
                        p.images?.[0] ||
                        p.image ||
                        'https://via.placeholder.com/200',
                    }}
                    style={styles.listingImage}
                  />
                  <View style={styles.listingInfo}>
                    <Text style={styles.listingTitle} numberOfLines={1}>
                      {p.title || 'Untitled'}
                    </Text>
                    <Text style={styles.listingPrice}>
                      K{p.price?.toLocaleString() || 0}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconWrap}>
                <Ionicons name="star-outline" size={16} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>
                Reviews ({reviews.length})
              </Text>
            </View>

            {reviews.slice(0, 3).map((r, idx) => (
              <View key={r.id || idx} style={styles.reviewRow}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>
                    {(r.userName || 'A').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.reviewContent}>
                  <View style={styles.reviewStarsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= (r.rating || 0) ? 'star' : 'star-outline'}
                        size={12}
                        color="#FFD700"
                      />
                    ))}
                    <Text style={styles.reviewName}>
                      · {r.userName || 'Anonymous'}
                    </Text>
                  </View>
                  <Text style={styles.reviewText} numberOfLines={2}>
                    {r.comment}
                  </Text>
                </View>
              </View>
            ))}

            {reviews.length > 3 && (
              <TouchableOpacity
                style={styles.seeAllReviews}
                onPress={() => navigation.navigate('AllReviews')}
                activeOpacity={0.8}
              >
                <Text style={styles.seeAllReviewsText}>
                  See all {reviews.length} reviews
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Footer note */}
        <View style={styles.footerNote}>
          <Ionicons
            name="information-circle-outline"
            size={14}
            color={colors.secondaryText}
          />
          <Text style={styles.footerNoteText}>
            This is how other users see your profile when they view it.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}