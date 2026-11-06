// src/screens/MyBookingsScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext';
import Text from '../components/AccessibleText';
import { useFocusEffect } from '@react-navigation/native';

const DAY_WIDTH = 56;
const DAY_GAP = 8;

export default function MyBookingsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { bookings, isLoading, loadBookings } = useAppStore();

  const [filteredBookings, setFilteredBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const calendarScrollRef = useRef(null);

  const styles = getStyles(colors, isDark);

  const toDateKey = (input) => {
    if (!input) return '';
    const d = input instanceof Date ? input : new Date(input);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const isToday = (date) => date && toDateKey(date) === toDateKey(new Date());

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings])
  );

  useEffect(() => {
    if (!bookings) return;

    let list = bookings.filter((b) => {
      if (selectedDate) {
        const bookingKey = toDateKey(b.date || b.checkIn);
        const selectedKey = toDateKey(selectedDate);
        if (bookingKey !== selectedKey) return false;
      }
      if (activeFilter !== 'All' && b.status !== activeFilter.toLowerCase()) {
        return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      const da = new Date(a.date || a.checkIn).getTime();
      const db = new Date(b.date || b.checkIn).getTime();
      return da - db;
    });

    setFilteredBookings(list);
  }, [bookings, activeFilter, selectedDate]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadBookings();
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadBookings]);

  const openFilterModal = () => setIsFilterModalVisible(true);
  const closeFilterModal = () => setIsFilterModalVisible(false);

  const selectFilter = (filter) => {
    setActiveFilter(filter);
    closeFilterModal();
  };

  const getUpcomingDays = (count = 60) => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const upcomingDays = getUpcomingDays(60);

  const hasBookingOnDate = (date) => {
    const key = toDateKey(date);
    return bookings?.some((b) => toDateKey(b.date || b.checkIn) === key);
  };

  const toggleDate = (date) => {
    if (selectedDate && toDateKey(selectedDate) === toDateKey(date)) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  const clearDateFilter = () => setSelectedDate(null);

  const goBrowseProperties = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  // ---------- Card status ----------
  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed':
        return {
          bg: isDark ? '#0A2A1A' : '#E7F8EE',
          text: '#22A06B',
          label: 'Confirmed',
          icon: 'checkmark-circle',
        };
      case 'pending':
        return {
          bg: isDark ? '#2E1F00' : '#FFF6E5',
          text: '#E8990C',
          label: 'Pending',
          icon: 'time',
        };
      case 'cancelled':
        return {
          bg: isDark ? '#2A1010' : '#FFECEC',
          text: '#E23B3B',
          label: 'Cancelled',
          icon: 'close-circle',
        };
      case 'completed':
      default:
        return {
          bg: colors.inputBackground,
          text: colors.secondaryText,
          label:
            status?.charAt(0).toUpperCase() + status?.slice(1) || 'Completed',
          icon: 'checkmark-done-circle',
        };
    }
  };

  const formatShortDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading && (!bookings || bookings.length === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Syncing your calendar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Determine which empty state to show
  const isEmpty = filteredBookings.length === 0;
  const isFilteredEmpty = isEmpty && (selectedDate !== null || activeFilter !== 'All');
  const isAccountEmpty = isEmpty && selectedDate === null && activeFilter === 'All';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
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
            style={styles.iconBtn}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <TouchableOpacity
            onPress={openFilterModal}
            style={styles.iconBtn}
            hitSlop={8}
          >
            <Ionicons name="options-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Calendar strip */}
        <View style={styles.calendarSection}>
          <ScrollView
            ref={calendarScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarContainer}
            style={styles.calendarScroll}
            directionalLockEnabled
            nestedScrollEnabled
            snapToInterval={DAY_WIDTH + DAY_GAP}
            decelerationRate="fast"
          >
            {upcomingDays.map((date, index) => {
              const weekday = date.toLocaleDateString('en-US', {
                weekday: 'short',
              });
              const dayNum = date.getDate();
              const isSelected =
                selectedDate && toDateKey(selectedDate) === toDateKey(date);
              const hasBooking = hasBookingOnDate(date);
              const isTodayDate = toDateKey(date) === toDateKey(new Date());

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayTile,
                    isTodayDate && styles.dayTileToday,
                    isSelected && styles.dayTileSelected,
                  ]}
                  onPress={() => toggleDate(date)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.dayWeekday,
                      isSelected && styles.dayWeekdaySelected,
                    ]}
                  >
                    {weekday}
                  </Text>
                  <Text
                    style={[
                      styles.dayNum,
                      isSelected && styles.dayNumSelected,
                    ]}
                  >
                    {dayNum}
                  </Text>
                  {hasBooking ? (
                    <View
                      style={[
                        styles.dayDot,
                        isSelected && styles.dayDotSelected,
                      ]}
                    />
                  ) : (
                    <View style={styles.dayDotPlaceholder} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Active date chip */}
        {selectedDate && (
          <View style={styles.activeFilterWrap}>
            <TouchableOpacity
              style={styles.activeChip}
              onPress={clearDateFilter}
              activeOpacity={0.8}
            >
              <Ionicons
                name="calendar"
                size={13}
                color={colors.primary}
              />
              <Text style={styles.activeChipText}>
                {isToday(selectedDate)
                  ? "Today's bookings"
                  : selectedDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
              </Text>
              <Ionicons
                name="close-circle"
                size={15}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* List header */}
        <View style={styles.listContainer}>
          <View style={styles.listHeaderRow}>
            <View>
              <Text style={styles.listEyebrow}>
                {selectedDate === null
                  ? 'All bookings'
                  : 'Selected day'}
              </Text>
              <Text style={styles.listTitle}>
                {selectedDate === null
                  ? `${filteredBookings.length} total`
                  : isToday(selectedDate)
                  ? "Today's bookings"
                  : selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
              </Text>
            </View>
            {activeFilter !== 'All' && (
              <TouchableOpacity
                onPress={() => setActiveFilter('All')}
                style={styles.clearFilterBtn}
              >
                <Text style={styles.clearFilterText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Empty / List */}
          {isEmpty ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name={isFilteredEmpty ? 'funnel-outline' : 'calendar-outline'}
                  size={34}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {isFilteredEmpty ? 'No matching bookings' : 'No bookings yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {isFilteredEmpty
                  ? selectedDate
                    ? 'Nothing booked for this day. Try another date or clear the filter.'
                    : `You have no ${activeFilter.toLowerCase()} bookings right now.`
                  : "When you book a stay, it'll appear here. Start exploring properties to find your next getaway."}
              </Text>

              {isFilteredEmpty ? (
                <TouchableOpacity
                  style={styles.emptyPrimaryBtn}
                  onPress={() => {
                    setSelectedDate(null);
                    setActiveFilter('All');
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="refresh" size={16} color="#FFFFFF" />
                  <Text style={styles.emptyPrimaryBtnText}>Clear Filters</Text>
                </TouchableOpacity>
              ) : isAccountEmpty ? (
                <TouchableOpacity
                  style={styles.emptyPrimaryBtn}
                  onPress={goBrowseProperties}
                  activeOpacity={0.85}
                >
                  <Ionicons name="search" size={16} color="#FFFFFF" />
                  <Text style={styles.emptyPrimaryBtnText}>Browse Properties</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            filteredBookings.map((item) => {
              const status = getStatusStyle(item.status);
              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardIconCircle}>
                      <Ionicons name="home" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.cardTitleWrap}>
                      <Text
                        style={styles.cardTitle}
                        numberOfLines={1}
                      >
                        {item.propertyName}
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        {formatShortDate(item.date || item.checkIn)}
                        {item.nights ? ` · ${item.nights} night${item.nights > 1 ? 's' : ''}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.cardPrice}>
                      K{item.price?.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.cardBottom}>
                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: status.bg },
                      ]}
                    >
                      <Ionicons
                        name={status.icon}
                        size={12}
                        color={status.text}
                      />
                      <Text
                        style={[styles.statusText, { color: status.text }]}
                      >
                        {status.label}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.viewBtn}
                      onPress={() =>
                        navigation.navigate('BookingDetail', {
                          booking: item,
                          bookingId: item.id,
                        })
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.viewBtnText}>View details</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={14}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Filter modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={closeFilterModal}
      >
        <TouchableWithoutFeedback onPress={closeFilterModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Filter bookings</Text>
                <Text style={styles.modalSubtitle}>
                  Show only bookings with a specific status
                </Text>

                {['All', 'Confirmed', 'Pending'].map((filter) => {
                  const active = activeFilter === filter;
                  return (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterOption,
                        active && styles.filterOptionActive,
                      ]}
                      onPress={() => selectFilter(filter)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          active && styles.filterOptionTextActive,
                        ]}
                      >
                        {filter === 'All' ? 'All bookings' : filter}
                      </Text>
                      {active && (
                        <View style={styles.filterCheck}>
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color="#FFFFFF"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={closeFilterModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
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
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loaderText: {
      marginTop: 14,
      color: colors.secondaryText,
      fontWeight: '500',
    },
    scrollContent: { paddingBottom: 40 },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.2,
    },

    calendarSection: { marginBottom: 12 },
    calendarScroll: { flexGrow: 0 },
    calendarContainer: {
      paddingHorizontal: 16,
      gap: DAY_GAP,
    },
    dayTile: {
      width: DAY_WIDTH,
      paddingVertical: 10,
      borderRadius: 18,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#1F1F22' : '#F1F3F5',
    },
    dayTileToday: {
      borderColor: colors.primary,
      borderWidth: 1.5,
    },
    dayTileSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    dayWeekday: {
      fontSize: 11,
      color: colors.secondaryText,
      fontWeight: '600',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    dayWeekdaySelected: { color: 'rgba(255,255,255,0.85)' },
    dayNum: {
      fontSize: 19,
      fontWeight: '800',
      color: colors.text,
      marginTop: 2,
      letterSpacing: -0.3,
    },
    dayNumSelected: { color: '#FFFFFF' },
    dayDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: colors.primary,
      marginTop: 4,
    },
    dayDotSelected: { backgroundColor: '#FFFFFF' },
    dayDotPlaceholder: { width: 5, height: 5, marginTop: 4 },

    activeFilterWrap: {
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    activeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
    },
    activeChipText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.primary,
      marginRight: 2,
    },

    listContainer: { paddingHorizontal: 16 },
    listHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 4,
      marginBottom: 14,
      marginTop: 4,
    },
    listEyebrow: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.secondaryText,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 2,
    },
    listTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.3,
    },
    clearFilterBtn: { paddingVertical: 6, paddingHorizontal: 10 },
    clearFilterText: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 13,
    },

    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.04,
      shadowRadius: 10,
      elevation: 2,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    cardIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTitleWrap: { flex: 1 },
    cardTitle: {
      fontSize: 15.5,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 3,
    },
    cardSubtitle: {
      fontSize: 12.5,
      color: colors.secondaryText,
      fontWeight: '500',
    },
    cardPrice: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: -0.3,
    },
    cardDivider: {
      height: 0.5,
      backgroundColor: colors.border,
      marginVertical: 12,
    },
    cardBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    statusText: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0.2 },
    viewBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
    },
    viewBtnText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.primary,
    },

    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      paddingHorizontal: 32,
    },
    emptyIconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    emptySubtitle: {
      fontSize: 13,
      color: colors.secondaryText,
      textAlign: 'center',
      lineHeight: 19,
      marginBottom: 20,
    },
    emptyPrimaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 24,
      paddingVertical: 13,
      borderRadius: 14,
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    emptyPrimaryBtnText: {
      color: '#FFFFFF',
      fontSize: 14.5,
      fontWeight: '700',
      letterSpacing: 0.2,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
      paddingHorizontal: 24,
      paddingBottom: 28,
      paddingTop: 10,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 19,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    modalSubtitle: {
      fontSize: 12.5,
      color: colors.secondaryText,
      textAlign: 'center',
      marginBottom: 18,
    },
    filterOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 15,
      paddingHorizontal: 16,
      borderRadius: 14,
      marginBottom: 8,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    filterOptionActive: {
      borderColor: colors.primary,
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
    },
    filterOptionText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
    },
    filterOptionTextActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    filterCheck: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalCancelBtn: {
      marginTop: 8,
      paddingVertical: 15,
      borderRadius: 14,
      backgroundColor: colors.inputBackground,
      alignItems: 'center',
    },
    modalCancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
  });