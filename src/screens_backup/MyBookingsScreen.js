// src/screens/MyBookingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext'; // ✅ Theme hook
import Text from '../components/AccessibleText';

export default function MyBookingsScreen({ navigation }) {
  const { colors, isDark } = useTheme(); // ✅ Get theme
  const { bookings, isLoading, loadBookings } = useAppStore();
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const styles = getStyles(colors, isDark); // ✅ Generate themed styles

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (bookings) {
      if (activeFilter === 'All') {
        setFilteredBookings(bookings);
      } else {
        setFilteredBookings(
          bookings.filter((b) => b.status === activeFilter.toLowerCase())
        );
      }
    }
  }, [bookings, activeFilter]);

  const openFilterModal = () => setIsFilterModalVisible(true);
  const closeFilterModal = () => setIsFilterModalVisible(false);

  const selectFilter = (filter) => {
    setActiveFilter(filter);
    closeFilterModal();
  };

  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekDays = getNextDays();

  const hasBookingOnDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return bookings?.some((b) => b.date === dateString);
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Syncing your calendar...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <TouchableOpacity onPress={openFilterModal}>
            <Ionicons name="options-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Calendar Strip */}
        <View style={styles.calendarContainer}>
          {weekDays.map((date, index) => {
            const dateString = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = date.getDate();
            const isSelected = selectedDate.toDateString() === date.toDateString();
            const hasBooking = hasBookingOnDate(date);

            return (
              <TouchableOpacity
                key={index}
                style={[styles.calendarDay, isSelected && styles.calendarDaySelected]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                  {dateString}
                </Text>
                <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                  {dayNum}
                </Text>
                {hasBooking && (
                  <View style={[styles.bookingDot, isSelected && styles.bookingDotSelected]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Booking List */}
        <View style={styles.listContainer}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listTitle}>
              {filteredBookings.length > 0 ? 'Upcoming Bookings' : 'No bookings yet'}
            </Text>
            {activeFilter !== 'All' && (
              <TouchableOpacity onPress={() => setActiveFilter('All')}>
                <Text style={styles.clearFilterText}>Clear Filter</Text>
              </TouchableOpacity>
            )}
          </View>

          {filteredBookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color={colors.inputBackground} />
              <Text style={styles.emptyTitle}>Calendar is clear</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter !== 'All'
                  ? `No ${activeFilter.toLowerCase()} bookings found.`
                  : "When clients book your properties, you'll see them here."}
              </Text>
            </View>
          ) : (
            filteredBookings.map((item) => (
              <View key={item.id} style={styles.bookingCard}>
                {/* Header */}
                <View style={styles.cardHeader}>
                  <Text style={styles.propertyName} numberOfLines={1}>
                    {item.propertyName}
                  </Text>
                  <Text style={styles.price}>ZMW {item.price?.toLocaleString()}</Text>
                </View>

                {/* Body */}
                <View style={styles.cardBody}>
                  <View style={styles.clientInfo}>
                    <Ionicons name="person-outline" size={14} color={colors.secondaryText} />
                    <Text style={styles.clientName}>{item.clientName}</Text>
                  </View>
                  <View style={styles.dateInfo}>
                    <Ionicons name="calendar-outline" size={14} color={colors.secondaryText} />
                    <Text style={styles.dateText}>
                      {new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === 'confirmed' && styles.statusConfirmed,
                      item.status === 'pending' && styles.statusPending,
                      item.status === 'completed' && styles.statusCompleted,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.status === 'confirmed' && styles.statusTextConfirmed,
                        item.status === 'pending' && styles.statusTextPending,
                        item.status === 'completed' && styles.statusTextCompleted,
                      ]}
                    >
                      {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() =>
                      navigation.navigate('BookingDetail', { booking: item, bookingId: item.id })
                    }
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={closeFilterModal}
      >
        <TouchableWithoutFeedback onPress={closeFilterModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Filter Bookings</Text>

                <TouchableOpacity
                  style={[styles.modalOption, activeFilter === 'All' && styles.modalOptionActive]}
                  onPress={() => selectFilter('All')}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      activeFilter === 'All' && styles.modalOptionTextActive,
                    ]}
                  >
                    All Bookings
                  </Text>
                  {activeFilter === 'All' && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    activeFilter === 'Confirmed' && styles.modalOptionActive,
                  ]}
                  onPress={() => selectFilter('Confirmed')}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      activeFilter === 'Confirmed' && styles.modalOptionTextActive,
                    ]}
                  >
                    Confirmed
                  </Text>
                  {activeFilter === 'Confirmed' && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    activeFilter === 'Pending' && styles.modalOptionActive,
                  ]}
                  onPress={() => selectFilter('Pending')}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      activeFilter === 'Pending' && styles.modalOptionTextActive,
                    ]}
                  >
                    Pending
                  </Text>
                  {activeFilter === 'Pending' && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalCancelButton} onPress={closeFilterModal}>
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

// ✅ Styles generated from theme colors
const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loaderText: {
      marginTop: 12,
      color: colors.secondaryText,
      fontWeight: '500',
    },
    scrollContent: { paddingBottom: 40 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 10,
      paddingBottom: 20,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
    },
    calendarContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    calendarDay: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      width: 50,
      borderRadius: 16,
      backgroundColor: colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    calendarDaySelected: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOpacity: 0.15,
      elevation: 5,
    },
    dayLabel: {
      fontSize: 12,
      color: colors.secondaryText,
      fontWeight: '600',
      marginBottom: 4,
    },
    dayLabelSelected: { color: '#FFFFFF' },
    dayNumber: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    dayNumberSelected: { color: '#FFFFFF' },
    bookingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginTop: 4,
    },
    bookingDotSelected: { backgroundColor: '#FFFFFF' },
    listContainer: { paddingHorizontal: 24 },
    listHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    listTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    clearFilterText: {
      color: colors.primary,
      fontWeight: '600',
      fontSize: 14,
    },
    bookingCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 12,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    propertyName: {
      flex: 1,
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginRight: 8,
    },
    price: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.primary,
    },
    cardBody: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    clientInfo: { flexDirection: 'row', alignItems: 'center' },
    clientName: {
      fontSize: 14,
      color: colors.secondaryText,
      marginLeft: 4,
    },
    dateInfo: { flexDirection: 'row', alignItems: 'center' },
    dateText: {
      fontSize: 14,
      color: colors.secondaryText,
      marginLeft: 4,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusConfirmed: { backgroundColor: isDark ? '#0A2A1A' : '#E6F7ED' },
    statusPending: { backgroundColor: isDark ? '#3A2500' : '#FFF3E0' },
    statusCompleted: { backgroundColor: colors.inputBackground },
    statusText: { fontSize: 12, fontWeight: '700' },
    statusTextConfirmed: { color: '#28A745' },
    statusTextPending: { color: '#FD7E14' },
    statusTextCompleted: { color: colors.secondaryText },
    viewDetailsButton: { flexDirection: 'row', alignItems: 'center' },
    viewDetailsText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      marginRight: 4,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.secondaryText,
      textAlign: 'center',
      marginTop: 8,
      paddingHorizontal: 40,
      lineHeight: 24,
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
      paddingHorizontal: 24,
      paddingBottom: 40,
      paddingTop: 12,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
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
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 16,
      marginBottom: 4,
      backgroundColor: colors.inputBackground,
    },
    modalOptionActive: {
      backgroundColor: isDark ? '#0A2A50' : '#F0F5FF',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    modalOptionText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    modalOptionTextActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    modalCancelButton: {
      marginTop: 16,
      paddingVertical: 16,
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      alignItems: 'center',
    },
    modalCancelText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.secondaryText,
    },
  });