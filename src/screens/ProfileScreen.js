// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext';

// Robust role detection
const detectIsAgent = (user) => {
  const candidates = [user?.role, user?.userRole, user?.accountType, user?.type];
  return candidates.some(
    (raw) => typeof raw === 'string' && raw.trim().toLowerCase() === 'agent'
  );
};

export default function ProfileScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const {
    user,
    isLoggedIn,
    logout,
    userReviews,
    isLoadingUserReviews,
    loadUserReviews,
    wishlist,
    properties,
    bookings,
  } = useAppStore();

  const styles = getStyles(colors, isDark);

  const navigateToLogin = () => {
    try {
      navigation.resetRoot({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (e) {
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate('Login');
      } else {
        navigation.navigate('Login');
      }
    }
  };

  const [activeTab, setActiveTab] = useState('reviews');

  useEffect(() => {
    // Load reviews if the user is an agent and logged in
    if (isLoggedIn && user?.id) {
      loadUserReviews(user.id);
    }
  }, [isLoggedIn, user?.id]);

  const userProperties = properties?.filter((p) => p.hostId === user?.id) || [];
  const isAgent = detectIsAgent(user);

  // Verification status
  const verificationStatus = user?.agentVerification?.status || 'unverified';
  const isVerified = verificationStatus === 'verified';
  const isPending = verificationStatus === 'pending';
  const isRejected = verificationStatus === 'rejected';
  const needsVerification = isAgent && !isVerified && !isPending;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const getMenuItems = () => {
    const items = [];

    if (isAgent) {
      items.push({
        icon: 'stats-chart-outline',
        title: 'Dashboard',
        onPress: () => navigation.navigate('Dashboard'),
        isDashboard: true,
      });
    }

    items.push(
      {
        icon: 'settings-outline',
        title: 'Account Settings',
        onPress: () => navigation.navigate('AccountSettings'),
      },
      {
        icon: 'eye-outline',
        title: 'View Profile',
        subtitle: '',
        onPress: () => navigation.navigate('PublicProfile'),
      },
      {
        icon: 'heart-outline',
        title: 'Wishlist',
        count: wishlist?.length || 0,
        onPress: () => navigation.navigate('Wishlist'),
      },
      {
        icon: 'calendar-outline',
        title: 'Bookings',
        count: bookings?.length || 0,
        onPress: () => navigation.navigate('MyBookings'),
      },
      {
        icon: 'chatbubbles-outline',
        title: 'Messages',
        count: 0,
        onPress: () => {
          navigation.getParent()?.navigate('MainTabs', { screen: 'Messages' });
        },
      },
      {
        icon: 'help-circle-outline',
        title: 'Help & Support',
        onPress: () => navigation.navigate('HelpSupport'),
      }
    );

    return items;
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewProperty}>
          <Text style={styles.reviewPropertyTitle}>
            {item.propertyTitle || 'Property'}
          </Text>
          <View style={styles.reviewStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= (item.rating || 0) ? 'star' : 'star-outline'}
                size={14}
                color="#FFD700"
              />
            ))}
          </View>
        </View>
        <Text style={styles.reviewDate}>
          {new Date(item.date || item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  // Verification nudge banner
  const renderVerificationNudge = () => {
    if (!needsVerification) return null;

    const isRejection = isRejected;

    return (
      <TouchableOpacity
        style={[
          styles.nudgeCard,
          isRejection ? styles.nudgeCardError : styles.nudgeCardInfo,
        ]}
        onPress={() => navigation.navigate('PersonalInfo')}
        activeOpacity={0.85}
      >
        <View
          style={[
            styles.nudgeIconWrap,
            {
              backgroundColor: isRejection
                ? isDark
                  ? '#2A1010'
                  : '#FFEBEB'
                : isDark
                ? '#2A2010'
                : '#FFF4E5',
            },
          ]}
        >
          <Ionicons
            name={isRejection ? 'alert-circle' : 'shield-outline'}
            size={20}
            color={isRejection ? '#FF3B30' : '#FF9500'}
          />
        </View>

        <View style={styles.nudgeContent}>
          <Text style={styles.nudgeTitle}>
            {isRejection
              ? 'Verification was rejected'
              : 'Complete your verification'}
          </Text>
          <Text style={styles.nudgeSubtitle} numberOfLines={2}>
            {isRejection
              ? 'Please re-submit your documents to get verified.'
              : 'Verify your identity to earn a verified badge and start receiving bookings.'}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
      </TouchableOpacity>
    );
  };

  // Not logged in
  if (!isLoggedIn) {
    return (
      <View style={styles.centered}>
        <View style={styles.emptyAvatar}>
          <Ionicons name="person" size={60} color="#fff" />
        </View>
        <Text style={styles.notLoggedInText}>Not Logged In</Text>
        <Text style={styles.notLoggedInSubtext}>Please login to access your profile</Text>
        <TouchableOpacity style={styles.loginButton} onPress={navigateToLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const menuItems = getMenuItems();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerGradient} />
        <View style={styles.headerContent}>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=1' }}
              style={styles.avatar}
            />
            {isVerified && (
              <View style={styles.headerVerifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user?.name || 'Guest'}</Text>

          {/* Role badge */}
          <View style={styles.roleBadge}>
            <View
              style={[
                styles.roleBadgeDot,
                {
                  backgroundColor: !isAgent
                    ? '#34C759'
                    : isVerified
                    ? '#34C759'
                    : isPending
                    ? '#FF9500'
                    : '#8E8E93',
                },
              ]}
            />
            <Text style={styles.roleBadgeText}>
              {!isAgent
                ? 'Client'
                : isVerified
                ? 'Verified Agent'
                : isPending
                ? 'Agent · Verification pending'
                : 'Agent · Not verified'}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {isAgent && (
          <>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProperties.length}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statDivider} />
          </>
        )}

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{wishlist?.length || 0}</Text>
          <Text style={styles.statLabel}>Wishlist</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{bookings?.length || 0}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
      </View>

      {/* Verification nudge */}
      {renderVerificationNudge()}

      {/* Menu */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index === 0 && styles.menuItemFirst,
              index === menuItems.length - 1 && styles.menuItemLast,
              item.isDashboard && styles.dashboardMenuItem,
            ]}
            onPress={item.onPress}
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIconWrapper,
                  item.isDashboard && styles.dashboardIconWrapper,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={item.isDashboard ? '#FFD700' : colors.primary}
                />
              </View>

              <View style={styles.menuTextCol}>
                <View style={styles.menuTitleRow}>
                  <Text
                    style={[
                      styles.menuTitle,
                      item.isDashboard && styles.dashboardMenuTitle,
                    ]}
                  >
                    {item.title}
                  </Text>
                  {item.isDashboard && (
                    <View style={styles.dashboardLabel}>
                      <Text style={styles.dashboardLabelText}>PRO</Text>
                    </View>
                  )}
                </View>
                {item.subtitle ? (
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.menuRight}>
              {item.count !== undefined && item.count !== null && (
                <View style={styles.menuCountBadge}>
                  <Text style={styles.menuCountText}>{item.count}</Text>
                </View>
              )}
              <Ionicons
                name="chevron-forward"
                size={20}
                color={item.isDashboard ? '#FFD700' : colors.secondaryText}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔥 Reviews — Agents only */}
      {isAgent && (
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            {userReviews?.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('AllReviews')}>
                <Text style={styles.seeAllText}>
                  See All {userReviews.length > 3 ? `(${userReviews.length})` : ''}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {isLoadingUserReviews ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading reviews...</Text>
            </View>
          ) : userReviews && userReviews.length > 0 ? (
            <FlatList
              data={userReviews.slice(0, 3)}
              renderItem={renderReviewItem}
              keyExtractor={(item) => item.id || item._id || Math.random().toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.reviewsList}
            />
          ) : (
            <View style={styles.emptyReviews}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="star-outline" size={32} color={colors.primary} />
              </View>
              <Text style={styles.emptyReviewsTitle}>No reviews yet</Text>
              <Text style={styles.emptyReviewsSubtitle}>
                When clients review your properties, they will appear here.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>APSA v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { backgroundColor: colors.background },
    text: { color: colors.text },

    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.background,
    },
    emptyAvatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },

    header: {
      backgroundColor: colors.primary,
      paddingTop: 60,
      paddingBottom: 30,
      position: 'relative',
      overflow: 'hidden',
    },
    headerGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.primary,
    },
    headerContent: {
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    avatarWrap: { position: 'relative' },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 4,
      borderColor: 'rgba(255,255,255,0.8)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    headerVerifiedBadge: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: '#34C759',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: '#FFFFFF',
    },
    userName: {
      fontSize: 24,
      fontWeight: '700',
      color: '#FFFFFF',
      marginTop: 12,
      letterSpacing: 0.5,
    },
    roleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 6,
      gap: 6,
    },
    roleBadgeDot: { width: 6, height: 6, borderRadius: 3 },
    roleBadgeText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0.3,
    },

    statsContainer: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: -16,
      borderRadius: 16,
      paddingVertical: 18,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 12,
      elevation: 4,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.5,
    },
    statLabel: {
      fontSize: 13,
      color: colors.secondaryText,
      marginTop: 2,
      fontWeight: '500',
    },
    statDivider: { width: 1, backgroundColor: colors.border },

    // Verification nudge banner
    nudgeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginHorizontal: 16,
      marginTop: 16,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
    },
    nudgeCardInfo: {
      backgroundColor: isDark ? '#2A2010' : '#FFFBF0',
      borderColor: isDark ? '#4A3A18' : '#FFEFCC',
    },
    nudgeCardError: {
      backgroundColor: isDark ? '#2A1010' : '#FFF5F5',
      borderColor: isDark ? '#4A1E1E' : '#FFD6D3',
    },
    nudgeIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nudgeContent: { flex: 1 },
    nudgeTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    nudgeSubtitle: {
      fontSize: 12,
      color: colors.secondaryText,
      lineHeight: 17,
    },

    menuContainer: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 12,
      elevation: 4,
    },
    menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    menuItemFirst: { paddingTop: 16 },
    menuItemLast: { borderBottomWidth: 0, paddingBottom: 16 },

    dashboardMenuItem: {
      backgroundColor: isDark ? '#0A2A50' : '#F8FAFF',
      borderBottomColor: isDark ? '#0F3057' : '#E8F0FE',
    },

    menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
    menuIconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dashboardIconWrapper: {
      backgroundColor: isDark ? '#2A2010' : '#FFF8E1',
    },
    menuTextCol: { flex: 1 },
    menuSubtitle: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 2,
    },
    menuTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    menuTitle: { fontSize: 16, color: colors.text, fontWeight: '500' },
    dashboardMenuTitle: { fontWeight: '700', color: colors.primary },

    dashboardLabel: {
      backgroundColor: '#FFD700',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    dashboardLabelText: {
      color: '#1C1C1E',
      fontSize: 8,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    menuCountBadge: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 2,
      minWidth: 24,
      alignItems: 'center',
    },
    menuCountText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

    // 🔥 REVIEWS SECTION STYLES
    reviewsSection: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 12,
      elevation: 4,
    },
    reviewsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: 0.3,
    },
    seeAllText: { fontSize: 14, color: colors.primary, fontWeight: '500' },
    reviewsList: { paddingBottom: 4 },
    reviewCard: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    reviewProperty: { flex: 1 },
    reviewPropertyTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
    reviewStars: { flexDirection: 'row', marginTop: 2 },
    reviewDate: { fontSize: 11, color: colors.secondaryText },
    reviewComment: { fontSize: 14, color: colors.text, lineHeight: 20 },
    
    loadingContainer: { paddingVertical: 20, alignItems: 'center' },
    loadingText: { marginTop: 8, color: colors.secondaryText, fontSize: 13 },
    
    // 🔥 NEW EMPTY STATE STYLES
    emptyReviews: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
      paddingHorizontal: 10,
    },
    emptyIconCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    emptyReviewsTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    emptyReviewsSubtitle: {
      fontSize: 13,
      color: colors.secondaryText,
      textAlign: 'center',
      lineHeight: 18,
    },

    notLoggedInText: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginTop: 12,
    },
    notLoggedInSubtext: { fontSize: 14, color: colors.secondaryText, marginTop: 4 },
    loginButton: {
      marginTop: 20,
      backgroundColor: colors.primary,
      paddingHorizontal: 48,
      paddingVertical: 14,
      borderRadius: 12,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.5,
    },

    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 16,
      padding: 14,
      borderRadius: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: '#FF3B30',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 12,
      elevation: 4,
    },
    logoutText: {
      color: '#FF3B30',
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.3,
    },

    footer: { alignItems: 'center', paddingVertical: 24 },
    footerText: { color: colors.secondaryText, fontSize: 12, letterSpacing: 0.5 },
  });