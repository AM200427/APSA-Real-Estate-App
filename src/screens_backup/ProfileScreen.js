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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext'; // ✅ Theme hook
import Text from '../components/AccessibleText';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const { colors, isDark } = useTheme(); // ✅ Get theme

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
    if (isLoggedIn && user?.id) {
      loadUserReviews(user.id);
    }
  }, [isLoggedIn, user?.id]);

  const userProperties = properties?.filter(p => p.hostId === user?.id) || [];
  const isAgent = user?.role === 'Agent' || user?.role === 'agent';

  const styles = getStyles(colors); // ✅ Generate themed styles

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.replace('Login');
          },
        },
      ]
    );
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
        icon: 'person-outline',
        title: 'My Profile',
        onPress: () => navigation.navigate('ViewProfile'),
      },
      {
        icon: 'settings-outline',
        title: 'Settings',
        onPress: () => navigation.navigate('AccountSettings'),
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.headerGradient} />
        <View style={styles.headerContent}>
          <Image
            source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=1' }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          <View style={styles.roleBadge}>
            <View style={[styles.roleBadgeDot, { backgroundColor: isAgent ? '#FFD700' : '#34C759' }]} />
            <Text style={styles.roleBadgeText}>{isAgent ? 'Agent' : 'Client'}</Text>
          </View>
          {isAgent && (
            <View style={styles.agentBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#fff" />
              <Text style={styles.agentBadgeText}>Verified Agent</Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userProperties.length}</Text>
          <Text style={styles.statLabel}>Listings</Text>
        </View>
        <View style={styles.statDivider} />
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

      {/* Menu */}
      <View style={styles.menuContainer}>
        {getMenuItems().map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index === 0 && styles.menuItemFirst,
              index === getMenuItems().length - 1 && styles.menuItemLast,
              item.isDashboard && styles.dashboardMenuItem,
            ]}
            onPress={item.onPress}
          >
            <View style={styles.menuLeft}>
              <View style={[
                styles.menuIconWrapper,
                item.isDashboard && styles.dashboardIconWrapper
              ]}>
                <Ionicons 
                  name={item.icon} 
                  size={22} 
                  color={item.isDashboard ? '#FFD700' : colors.primary} 
                />
              </View>
              <Text style={[
                styles.menuTitle,
                item.isDashboard && styles.dashboardMenuTitle
              ]}>
                {item.title}
              </Text>
              {item.isDashboard && (
                <View style={styles.dashboardLabel}>
                  <Text style={styles.dashboardLabelText}>PRO</Text>
                </View>
              )}
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

      {/* Reviews Section - ONLY for Agents */}
      {isAgent && (
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            {userReviews?.length > 0 && (
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          {isLoadingUserReviews ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
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
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="star-outline" size={32} color={colors.secondaryText} />
              </View>
              <Text style={styles.emptyStateText}>No reviews yet</Text>
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

// ✅ Styles generated from theme colors
const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
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
    roleBadgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    roleBadgeText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    agentBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,215,0,0.25)',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 6,
      gap: 4,
    },
    agentBadgeText: {
      color: '#FFD700',
      fontSize: 11,
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
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 4,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
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
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
    },
    menuContainer: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
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
    menuItemFirst: {
      paddingTop: 16,
    },
    menuItemLast: {
      borderBottomWidth: 0,
      paddingBottom: 16,
    },
    dashboardMenuItem: {
      backgroundColor: isDarkSafeBackground(colors),
      borderBottomColor: colors.border,
    },
    menuLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    menuIconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dashboardIconWrapper: {
      backgroundColor: '#FFF8E1',
    },
    menuTitle: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    dashboardMenuTitle: {
      fontWeight: '700',
      color: colors.primary,
    },
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
    menuRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    menuCountBadge: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 2,
      minWidth: 24,
      alignItems: 'center',
    },
    menuCountText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    reviewsSection: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
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
    seeAllText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    reviewsList: {
      paddingBottom: 4,
    },
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
    reviewProperty: {
      flex: 1,
    },
    reviewPropertyTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    reviewStars: {
      flexDirection: 'row',
      marginTop: 2,
    },
    reviewDate: {
      fontSize: 11,
      color: colors.secondaryText,
    },
    reviewComment: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    loadingContainer: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 8,
      color: colors.secondaryText,
      fontSize: 13,
    },
    emptyState: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      gap: 10,
    },
    emptyIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyStateText: {
      fontSize: 14,
      color: colors.secondaryText,
    },
    notLoggedInText: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginTop: 12,
    },
    notLoggedInSubtext: {
      fontSize: 14,
      color: colors.secondaryText,
      marginTop: 4,
    },
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
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 4,
    },
    logoutText: {
      color: '#FF3B30',
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    footerText: {
      color: colors.secondaryText,
      fontSize: 12,
      letterSpacing: 0.5,
    },
  });

// Helper: detect dark mode from colors
function isDarkSafeBackground(colors) {
  return colors.background === '#0F0F12' ? '#1A1A1D' : '#F8FAFF';
}