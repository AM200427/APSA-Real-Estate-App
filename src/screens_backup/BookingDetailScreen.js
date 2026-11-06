// src/screens/BookingDetailScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function BookingDetailScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const { booking } = route.params || {};

  const [isCancelling, setIsCancelling] = useState(false);

  const styles = getStyles(colors, isDark);

  // Fallback if no booking passed
  const bookingData = booking || {
    id: route.params?.bookingId || 'N/A',
    propertyTitle: 'Property',
    location: 'Location',
    image: 'https://via.placeholder.com/400x250?text=No+Image',
    checkIn: '2025-01-01',
    checkOut: '2025-01-05',
    guests: 2,
    nights: 4,
    totalPrice: 0,
    status: 'confirmed',
    paymentMethod: 'Card',
    bookingDate: new Date().toISOString(),
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'cancelled':
        return '#FF3B30';
      case 'completed':
        return '#007AFF';
      default:
        return colors.secondaryText;
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            // Simulate API call
            setTimeout(() => {
              setIsCancelling(false);
              Alert.alert('Cancelled', 'Your booking has been cancelled.');
              navigation.goBack();
            }, 1500);
          },
        },
      ]
    );
  };

  const handleContactHost = () => {
    Alert.alert('Contact Host', 'Opening chat with host...');
    // navigation.navigate('ChatDetail', { chatId: bookingData.hostId, userName: bookingData.hostName });
  };

  const handleViewProperty = () => {
    navigation.navigate('PropertyDetail', { property: bookingData.property });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={styles.statusWrapper}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(bookingData.status) + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(bookingData.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(bookingData.status) }]}>
              {(bookingData.status || 'Confirmed').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.bookingId}>#{bookingData.id}</Text>
        </View>

        {/* Property Card */}
        <TouchableOpacity style={styles.propertyCard} onPress={handleViewProperty} activeOpacity={0.9}>
          <Image source={{ uri: bookingData.image }} style={styles.propertyImage} />
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyTitle} numberOfLines={1}>
              {bookingData.propertyTitle}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={colors.secondaryText} />
              <Text style={styles.propertyLocation} numberOfLines={1}>
                {bookingData.location}
              </Text>
            </View>
            <TouchableOpacity onPress={handleViewProperty}>
              <Text style={styles.viewPropertyText}>View Property →</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Dates Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Stay Details</Text>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Check-in</Text>
              <Text style={styles.dateValue}>{formatDate(bookingData.checkIn)}</Text>
            </View>
            <View style={styles.dateArrow}>
              <Ionicons name="arrow-forward" size={20} color={colors.secondaryText} />
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Check-out</Text>
              <Text style={styles.dateValue}>{formatDate(bookingData.checkOut)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="moon-outline" size={18} color={colors.secondaryText} />
              <Text style={styles.infoText}>{bookingData.nights} nights</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={18} color={colors.secondaryText} />
              <Text style={styles.infoText}>
                {bookingData.guests} guest{bookingData.guests > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="card-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Payment Summary</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Accommodation ({bookingData.nights} nights)
            </Text>
            <Text style={styles.priceValue}>
              K{bookingData.totalPrice?.toLocaleString() || 0}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Cleaning fee</Text>
            <Text style={styles.priceValue}>K500</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service fee</Text>
            <Text style={styles.priceValue}>K200</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>
              K{((bookingData.totalPrice || 0) + 700).toLocaleString()}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.paymentMethodRow}>
            <Ionicons name="checkmark-circle" size={18} color="#34C759" />
            <Text style={styles.paymentMethodText}>
              Paid via {bookingData.paymentMethod || 'Card'}
            </Text>
          </View>
        </View>

        {/* Host Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Your Host</Text>
          </View>

          <View style={styles.hostRow}>
            <Image
              source={{ uri: bookingData.hostAvatar || 'https://i.pravatar.cc/150?img=5' }}
              style={styles.hostAvatar}
            />
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>{bookingData.hostName || 'Host'}</Text>
              <Text style={styles.hostSubtext}>Verified Host</Text>
            </View>
            <TouchableOpacity style={styles.contactButton} onPress={handleContactHost}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={isCancelling}
        >
          {isCancelling ? (
            <ActivityIndicator color="#FF3B30" />
          ) : (
            <>
              <Ionicons name="close-circle-outline" size={20} color="#FF3B30" />
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Booked on {formatDate(bookingData.bookingDate)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: { padding: 4 },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 40,
    },

    // Status
    statusWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 6,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    bookingId: {
      fontSize: 13,
      color: colors.secondaryText,
      fontWeight: '500',
    },

    // Property Card
    propertyCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 12,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    propertyImage: {
      width: 90,
      height: 90,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
    },
    propertyInfo: {
      flex: 1,
      marginLeft: 12,
      justifyContent: 'center',
    },
    propertyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    propertyLocation: {
      fontSize: 13,
      color: colors.secondaryText,
      marginLeft: 4,
      flex: 1,
    },
    viewPropertyText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '600',
    },

    // Cards
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 14,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },

    // Dates
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dateItem: {
      flex: 1,
    },
    dateLabel: {
      fontSize: 12,
      color: colors.secondaryText,
      marginBottom: 4,
      fontWeight: '500',
    },
    dateValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    dateArrow: {
      paddingHorizontal: 8,
    },

    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
    },

    infoRow: {
      flexDirection: 'row',
      gap: 20,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    infoText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },

    // Price
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
    },
    priceLabel: {
      fontSize: 14,
      color: colors.secondaryText,
      flex: 1,
    },
    priceValue: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    totalValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
    },
    paymentMethodRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    paymentMethodText: {
      fontSize: 13,
      color: colors.secondaryText,
    },

    // Host
    hostRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    hostAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.inputBackground,
    },
    hostInfo: {
      flex: 1,
      marginLeft: 12,
    },
    hostName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    hostSubtext: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 2,
    },
    contactButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Cancel
    cancelButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.card,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#FF3B30',
      marginBottom: 12,
    },
    cancelButtonText: {
      color: '#FF3B30',
      fontSize: 16,
      fontWeight: '600',
    },

    footer: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    footerText: {
      fontSize: 12,
      color: colors.secondaryText,
    },
  });