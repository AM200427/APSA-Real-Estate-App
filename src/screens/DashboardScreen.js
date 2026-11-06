// src/screens/DashboardScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Text from '../components/AccessibleText';

export default function DashboardScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { showError } = useToast();
  const {
    user,
    myProperties,
    bookings,
    notifications,
    loadMyProperties,
    loadBookings,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAppStore();

  const [isNotifModalVisible, setIsNotifModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const styles = getStyles(colors, isDark);

  const loadDashboard = useCallback(async () => {
    await Promise.all([loadMyProperties(), loadBookings()]);
  }, [loadMyProperties, loadBookings]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Once the notifications endpoint lands, add it here:
      //   const notifData = await api.getNotifications();
      // For now, simulate a short fetch so the gesture feels responsive.
      await Promise.all([
        loadDashboard(),
        new Promise((r) => setTimeout(r, 500)),
      ]);
    } catch (e) {
      showError('Error', 'Could not refresh.');
    } finally {
      setRefreshing(false);
    }
  };

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  const openNotifications = () => setIsNotifModalVisible(true);
  const closeNotifications = () => setIsNotifModalVisible(false);

  const handleMarkAll = () => {
    markAllNotificationsRead();
  };

  const handleNotificationPress = (notification) => {
    markNotificationRead(notification.id);
    closeNotifications();

    setTimeout(() => {
      if (notification.type === 'booking') {
        navigation.navigate('MyBookings');
      } else if (notification.type === 'message') {
        navigation.navigate('MainTabs', { screen: 'Messages' });
      } else if (notification.type === 'review') {
        navigation.navigate('Profile');
      }
    }, 200);
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'booking':
        return { name: 'calendar', color: '#28A745' };
      case 'message':
        return { name: 'chatbubble', color: '#1A73E8' };
      case 'review':
        return { name: 'star', color: '#FFD700' };
      case 'system':
        return { name: 'information-circle', color: '#8B5CF6' };
      default:
        return { name: 'notifications', color: colors.primary };
    }
  };

  const totalListings = myProperties?.length || 0;
  const activeBookings =
    bookings?.filter((b) => b.status === 'confirmed' || b.status === 'active')
      ?.length || 0;
  const pendingRequests =
    bookings?.filter((b) => b.status === 'pending')?.length || 0;
  const totalEarnings =
    bookings?.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0) || 0;

  const renderNotificationItem = ({ item }) => {
    const iconData = getNotifIcon(item.type);
    return (
      <TouchableOpacity
        style={[styles.notifItem, !item.read && styles.notifItemUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View
          style={[styles.notifIconCircle, { backgroundColor: iconData.color + '20' }]}
        >
          <Ionicons name={iconData.name} size={20} color={iconData.color} />
        </View>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.notifMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || 'Agent'}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={openNotifications}
              activeOpacity={0.7}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.text}
              />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <Image
              source={{
                uri: user?.avatar || 'https://i.pravatar.cc/150?img=1',
              }}
              style={styles.profileImage}
            />
          </View>
        </View>

        {/* KPI Card */}
        <View style={styles.kpiCard}>
          <LinearGradient
            colors={['#1A73E8', '#0059B3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.kpiGradient}
          >
            <View style={styles.kpiTopRow}>
              <Text style={styles.kpiLabel}>Total Revenue</Text>
              <Ionicons
                name="trending-up"
                size={20}
                color="rgba(255,255,255,0.8)"
              />
            </View>
            <Text style={styles.kpiValue}>
              K{totalEarnings.toLocaleString()}
            </Text>
            <Text style={styles.kpiSubtext}>
              {bookings?.length || 0} booking
              {bookings?.length === 1 ? '' : 's'} recorded
            </Text>
          </LinearGradient>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Ionicons
              name="home-outline"
              size={24}
              color={colors.primary}
              style={styles.statIcon}
            />
            <Text style={styles.statNumber}>{totalListings}</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons
              name="calendar-outline"
              size={24}
              color="#28A745"
              style={styles.statIcon}
            />
            <Text style={styles.statNumber}>{activeBookings}</Text>
            <Text style={styles.statLabel}>Active Bookings</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons
              name="time-outline"
              size={24}
              color="#FD7E14"
              style={styles.statIcon}
            />
            <Text style={styles.statNumber}>{pendingRequests}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AddProperty')}
            >
              <View
                style={[
                  styles.actionIconWrapper,
                  { backgroundColor: isDark ? '#0A2A50' : '#E6F0FF' },
                ]}
              >
                <Ionicons name="add-outline" size={28} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>New Listing</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('MyListings')}
            >
              <View
                style={[
                  styles.actionIconWrapper,
                  { backgroundColor: isDark ? '#0A2A1A' : '#E6F7ED' },
                ]}
              >
                <Ionicons name="list-outline" size={28} color="#28A745" />
              </View>
              <Text style={styles.actionLabel}>Manage Listings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('MyBookings')}
            >
              <View
                style={[
                  styles.actionIconWrapper,
                  { backgroundColor: isDark ? '#3A2500' : '#FFF3E0' },
                ]}
              >
                <Ionicons name="calendar-outline" size={28} color="#FD7E14" />
              </View>
              <Text style={styles.actionLabel}>Booking Calendar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() =>
                navigation.navigate('MainTabs', { screen: 'Messages' })
              }
            >
              <View
                style={[
                  styles.actionIconWrapper,
                  { backgroundColor: isDark ? '#2A1A50' : '#F3E8FF' },
                ]}
              >
                <Ionicons
                  name="chatbubbles-outline"
                  size={28}
                  color="#8B5CF6"
                />
              </View>
              <Text style={styles.actionLabel}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pending Requests */}
        {pendingRequests > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitleNoPadding}>
                Pending Requests
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('MyBookings')}
              >
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {bookings
              ?.filter((b) => b.status === 'pending')
              .slice(0, 2)
              .map((booking) => (
                <View key={booking.id} style={styles.requestCard}>
                  <View style={styles.requestInfo}>
                    <Text style={styles.clientName}>
                      {booking.clientName || 'Guest'}
                    </Text>
                    <Text
                      style={styles.requestProperty}
                      numberOfLines={1}
                    >
                      {booking.propertyName || 'Property'}
                    </Text>
                    <View style={styles.requestMeta}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={colors.secondaryText}
                      />
                      <Text style={styles.metaText}>
                        {booking.date || 'Dates TBC'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.reviewButton}
                    onPress={() => navigation.navigate('MyBookings')}
                  >
                    <Text style={styles.reviewButtonText}>Review</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        )}

        {/* Weekly Insights (keep visual chart, but show real booking count context) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Weekly Insights</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartLabel}>Booking activity</Text>
              <Text style={styles.chartTotal}>
                {bookings?.length || 0}
              </Text>
            </View>
            <View style={styles.chartBars}>
              <View style={[styles.bar, { height: 30 }]} />
              <View style={[styles.bar, { height: 55 }]} />
              <View style={[styles.bar, { height: 45 }]} />
              <View style={[styles.bar, { height: 80 }]} />
              <View style={[styles.bar, { height: 65 }]} />
              <View style={[styles.bar, { height: 40 }]} />
              <View style={[styles.bar, { height: 70 }]} />
            </View>
            <View style={styles.chartDays}>
              <Text style={styles.dayText}>M</Text>
              <Text style={styles.dayText}>T</Text>
              <Text style={styles.dayText}>W</Text>
              <Text style={styles.dayText}>T</Text>
              <Text style={styles.dayText}>F</Text>
              <Text style={styles.dayText}>S</Text>
              <Text style={styles.dayText}>S</Text>
            </View>
            <Text style={styles.chartFootnote}>
              Chart uses placeholder data until real analytics arrives.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Notifications Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={isNotifModalVisible}
        onRequestClose={closeNotifications}
      >
        <TouchableWithoutFeedback onPress={closeNotifications}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHandle} />

                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Notifications</Text>
                  {unreadCount > 0 && (
                    <TouchableOpacity onPress={handleMarkAll}>
                      <Text style={styles.markAllText}>Mark all as read</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {!notifications || notifications.length === 0 ? (
                  <View style={styles.emptyNotif}>
                    <Ionicons
                      name="notifications-off-outline"
                      size={48}
                      color={colors.secondaryText}
                    />
                    <Text style={styles.emptyNotifText}>
                      No notifications yet
                    </Text>
                    <Text style={styles.emptyNotifSubtext}>
                      You'll see booking requests, messages, and reviews here.
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderNotificationItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.notifList}
                  />
                )}

                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={closeNotifications}
                >
                  <Text style={styles.closeModalText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingBottom: 40 },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 20,
    },
    backButton: { padding: 6, marginRight: 8 },
    headerCenter: { flex: 1 },
    greeting: {
      fontSize: 13,
      color: colors.secondaryText,
      fontWeight: '500',
    },
    userName: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginTop: 2,
    },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconButton: { position: 'relative', padding: 4 },
    notificationBadge: {
      position: 'absolute',
      top: -2,
      right: -4,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#FF3B30',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      borderWidth: 2,
      borderColor: colors.background,
    },
    notificationBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
    profileImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.inputBackground,
    },

    // KPI
    kpiCard: {
      marginHorizontal: 24,
      borderRadius: 24,
      overflow: 'hidden',
      shadowColor: '#1A73E8',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.4 : 0.15,
      shadowRadius: 20,
      elevation: 8,
      marginBottom: 24,
    },
    kpiGradient: { padding: 24 },
    kpiTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    kpiLabel: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
      fontWeight: '500',
    },
    kpiValue: {
      fontSize: 38,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    kpiSubtext: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.7)',
      fontWeight: '500',
    },

    // Stats
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      marginBottom: 28,
    },
    statBox: {
      backgroundColor: colors.card,
      paddingVertical: 16,
      paddingHorizontal: 10,
      borderRadius: 20,
      alignItems: 'center',
      width: '30%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 10,
      elevation: 3,
    },
    statIcon: { marginBottom: 6 },
    statNumber: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 11,
      color: colors.secondaryText,
      fontWeight: '500',
      textAlign: 'center',
    },

    // Section
    sectionContainer: { marginBottom: 32 },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      paddingHorizontal: 24,
      marginBottom: 16,
    },
    sectionTitleNoPadding: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    seeAllText: { color: colors.primary, fontWeight: '600', fontSize: 14 },

    // Actions
    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
    },
    actionCard: {
      width: '48%',
      backgroundColor: colors.card,
      paddingVertical: 18,
      paddingHorizontal: 12,
      borderRadius: 20,
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 10,
      elevation: 2,
    },
    actionIconWrapper: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    actionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },

    // Requests
    requestCard: {
      backgroundColor: colors.card,
      marginHorizontal: 24,
      marginBottom: 12,
      padding: 16,
      borderRadius: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 10,
      elevation: 2,
    },
    requestInfo: { flex: 1, marginRight: 12 },
    clientName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    requestProperty: {
      fontSize: 14,
      color: colors.secondaryText,
      fontWeight: '500',
      marginBottom: 4,
    },
    requestMeta: { flexDirection: 'row', alignItems: 'center' },
    metaText: { fontSize: 12, color: colors.secondaryText, marginLeft: 6 },
    reviewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#0A2A50' : '#F0F5FF',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      gap: 6,
    },
    reviewButtonText: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 14,
    },

    // Chart
    chartCard: {
      backgroundColor: colors.card,
      marginHorizontal: 24,
      borderRadius: 24,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 12,
      elevation: 3,
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 16,
    },
    chartLabel: {
      fontSize: 14,
      color: colors.secondaryText,
      fontWeight: '500',
    },
    chartTotal: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    chartBars: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 110,
      marginBottom: 8,
    },
    bar: {
      flex: 1,
      maxWidth: 20,
      backgroundColor: colors.primary,
      borderRadius: 8,
      marginHorizontal: 6,
      opacity: 0.6,
    },
    chartDays: { flexDirection: 'row', justifyContent: 'space-between' },
    dayText: {
      flex: 1,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '600',
      color: colors.secondaryText,
    },
    chartFootnote: {
      marginTop: 12,
      fontSize: 11,
      color: colors.secondaryText,
      textAlign: 'center',
      fontStyle: 'italic',
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingBottom: 30,
      paddingTop: 12,
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 10,
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 16,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    modalTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
    markAllText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
    },
    notifList: { paddingBottom: 8 },
    notifItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 14,
      borderRadius: 16,
      marginBottom: 8,
      backgroundColor: colors.background,
      gap: 12,
    },
    notifItemUnread: {
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      borderWidth: 1,
      borderColor: isDark ? '#0A4A80' : '#D0E6FF',
    },
    notifIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    notifContent: { flex: 1 },
    notifTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    notifMessage: {
      fontSize: 13,
      color: colors.secondaryText,
      lineHeight: 18,
      marginBottom: 4,
    },
    notifTime: {
      fontSize: 11,
      color: colors.secondaryText,
      fontWeight: '500',
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginTop: 4,
    },
    emptyNotif: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      gap: 8,
    },
    emptyNotifText: {
      fontSize: 15,
      color: colors.text,
      fontWeight: '700',
    },
    emptyNotifSubtext: {
      fontSize: 13,
      color: colors.secondaryText,
      textAlign: 'center',
      paddingHorizontal: 20,
      lineHeight: 18,
    },
    closeModalButton: {
      marginTop: 12,
      paddingVertical: 14,
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      alignItems: 'center',
    },
    closeModalText: { fontSize: 16, fontWeight: '600', color: colors.text },
  });