// src/screens/DashboardScreen.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext'; // ✅ Theme hook

export default function DashboardScreen({ navigation }) {
  const { colors, isDark } = useTheme(); // ✅ Get theme
  const { user, myProperties, bookings, loadMyProperties, loadBookings, isLoading } = useAppStore();

  const styles = getStyles(colors, isDark); // ✅ Generate themed styles

  useEffect(() => {
    loadMyProperties();
    loadBookings();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your insights...</Text>
      </View>
    );
  }

  const totalListings = myProperties?.length || 0;
  const activeBookings = bookings?.filter(b => b.status === 'active')?.length || 0;
  const pendingRequests = bookings?.filter(b => b.status === 'pending')?.length || 0;
  const totalEarnings = bookings?.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0) || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 1. Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user?.name || 'Agent'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Image source={require('../../assets/icon.png')} style={styles.profileImage} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Main KPI Card */}
        <View style={styles.kpiCard}>
          <LinearGradient
            colors={['#1A73E8', '#0059B3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.kpiGradient}
          >
            <View style={styles.kpiTopRow}>
              <Text style={styles.kpiLabel}>Total Revenue</Text>
              <Ionicons name="trending-up" size={20} color="rgba(255,255,255,0.8)" />
            </View>
            <Text style={styles.kpiValue}>${totalEarnings.toLocaleString()}</Text>
            <Text style={styles.kpiSubtext}>+12.5% from last month</Text>
          </LinearGradient>
        </View>

        {/* 3. Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Ionicons name="home-outline" size={24} color={colors.primary} style={styles.statIcon} />
            <Text style={styles.statNumber}>{totalListings}</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="calendar-outline" size={24} color="#28A745" style={styles.statIcon} />
            <Text style={styles.statNumber}>{activeBookings}</Text>
            <Text style={styles.statLabel}>Active Bookings</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="chatbox-ellipses-outline" size={24} color="#FD7E14" style={styles.statIcon} />
            <Text style={styles.statNumber}>{pendingRequests}</Text>
            <Text style={styles.statLabel}>Pending Reviews</Text>
          </View>
        </View>

        {/* 4. Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('AddProperty')}>
              <View style={[styles.actionIconWrapper, { backgroundColor: isDark ? '#0A2A50' : '#E6F0FF' }]}>
                <Ionicons name="add-outline" size={28} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>New Listing</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('MyListings')}>
              <View style={[styles.actionIconWrapper, { backgroundColor: isDark ? '#0A2A1A' : '#E6F7ED' }]}>
                <Ionicons name="list-outline" size={28} color="#28A745" />
              </View>
              <Text style={styles.actionLabel}>Manage Listings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('MyBookings')}>
              <View style={[styles.actionIconWrapper, { backgroundColor: isDark ? '#3A2500' : '#FFF3E0' }]}>
                <Ionicons name="calendar-outline" size={28} color="#FD7E14" />
              </View>
              <Text style={styles.actionLabel}>Booking Calendar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Messages' })}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: isDark ? '#2A1A50' : '#F3E8FF' }]}>
                <Ionicons name="chatbubbles-outline" size={28} color="#8B5CF6" />
              </View>
              <Text style={styles.actionLabel}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Pending Requests */}
        {pendingRequests > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitleNoPadding}>Pending Requests</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyBookings')}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {bookings?.filter(b => b.status === 'pending').slice(0, 2).map((booking) => (
              <View key={booking.id} style={styles.requestCard}>
                <View style={styles.requestInfo}>
                  <Text style={styles.clientName}>{booking.clientName || 'Guest'}</Text>
                  <Text style={styles.requestProperty} numberOfLines={1}>
                    {booking.propertyName || 'Property'}
                  </Text>
                  <View style={styles.requestMeta}>
                    <Ionicons name="calendar-outline" size={14} color={colors.secondaryText} />
                    <Text style={styles.metaText}>{booking.date || 'Dates TBC'}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.reviewButton} onPress={() => navigation.navigate('MyBookings')}>
                  <Text style={styles.reviewButtonText}>Review</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* 6. Weekly Insights Chart */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Weekly Insights</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartLabel}>Property Views</Text>
              <Text style={styles.chartTotal}>1,245</Text>
            </View>
            <View style={styles.chartBars}>
              <View style={[styles.bar, { height: 30 }]}></View>
              <View style={[styles.bar, { height: 55 }]}></View>
              <View style={[styles.bar, { height: 45 }]}></View>
              <View style={[styles.bar, { height: 80 }]}></View>
              <View style={[styles.bar, { height: 65 }]}></View>
              <View style={[styles.bar, { height: 40 }]}></View>
              <View style={[styles.bar, { height: 70 }]}></View>
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
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ✅ Styles generated from theme colors
const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 12,
      color: colors.secondaryText,
      fontWeight: '500',
    },
    scrollContent: {
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 10,
      paddingBottom: 20,
    },
    headerLeft: { flex: 1 },
    greeting: {
      fontSize: 14,
      color: colors.secondaryText,
      fontWeight: '500',
    },
    userName: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginTop: 2,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    iconButton: {
      position: 'relative',
      padding: 4,
    },
    notificationBadge: {
      position: 'absolute',
      top: 2,
      right: 2,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FF3B30',
      borderWidth: 1.5,
      borderColor: colors.background,
    },
    profileImage: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.inputBackground,
    },
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
    },
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
    seeAllText: {
      color: colors.primary,
      fontWeight: '600',
      fontSize: 14,
    },
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
    requestInfo: {
      flex: 1,
      marginRight: 12,
    },
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
    requestMeta: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    metaText: {
      fontSize: 12,
      color: colors.secondaryText,
      marginLeft: 6,
    },
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
    chartDays: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    dayText: {
      flex: 1,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '600',
      color: colors.secondaryText,
    },
  });