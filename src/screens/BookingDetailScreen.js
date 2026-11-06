// src/screens/BookingDetailScreen.js
import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAppStore } from '../../store/useAppStore';
import Text from '../components/AccessibleText';

export default function BookingDetailScreen({ route, navigation }) {
  const { colors, isDark } = useTheme();
  const { showSuccess, showError } = useToast();
  const { bookings, cancelBooking } = useAppStore();

  const styles = getStyles(colors, isDark);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // 1. Try to get the booking from params (passed from MyBookingsScreen)
  const passedBooking = route.params?.booking;
  const bookingId = route.params?.bookingId;

  // 2. Fallback: Try to find it in the global store by ID
  const storeBooking = useMemo(() => {
    if (!bookingId || !bookings) return null;
    return bookings.find((b) => b.id === bookingId);
  }, [bookings, bookingId]);

  // 3. Use whichever is found
  const booking = passedBooking || storeBooking;

  // ---------- FALLBACK: If no booking is found, show a clear error screen ----------
  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorTitle}>Booking Not Found</Text>
          <Text style={styles.errorSubtitle}>
            We couldn't load the details for this booking. It may have been deleted.
          </Text>
          <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.goBackBtnText}>Go Back to Bookings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCancelled = booking.status === 'cancelled';

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const paymentLabel = {
    card: 'Credit / Debit Card',
    mobile: 'Mobile Money',
    bank: 'Bank Transfer',
  }[booking.paymentMethod] || booking.paymentMethod || '—';

  // ---------- Cancel Booking Logic ----------
  const handleCancel = () => setShowCancelModal(true);

  const confirmCancel = async () => {
    if (cancelling) return;
    if (!cancelBooking) {
      showError('Error', 'Cancel function not found.');
      return;
    }
    setCancelling(true);
    try {
      await cancelBooking(booking.id);
      setShowCancelModal(false);
      showSuccess('Booking Cancelled', 'Your booking has been cancelled.', 3000);
      navigation.goBack();
    } catch (e) {
      showError('Error', e?.message || 'Could not cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  // ---------- Navigation ----------
  const handleViewProperty = () => {
    if (booking.property) {
      navigation.navigate('PropertyDetail', { property: booking.property });
    } else if (booking.propertyId) {
      // Fallback if you only saved the ID
      navigation.navigate('PropertyDetail', { propertyId: booking.propertyId });
    } else {
      showError('Error', 'Property details not found.');
    }
  };

  const handleContactHost = () => {
    if (!booking.hostId) {
      showError('Error', 'Host ID not found.');
      return;
    }
    navigation.navigate('ChatDetail', {
      chatId: `host_${booking.hostId}`,
      userName: booking.hostName || 'Property Host',
    });
  };

  const imageUri = booking.propertyImage || booking.image || 'https://via.placeholder.com/400';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Property Card */}
        <View style={styles.propertyCard}>
          <Image source={{ uri: imageUri }} style={styles.propertyImage} />
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyName} numberOfLines={2}>
              {booking.propertyName || 'Property'}
            </Text>
            {booking.location && (
              <View style={styles.row}>
                <Ionicons name="location-outline" size={14} color={colors.secondaryText} />
                <Text style={styles.mutedText}>{booking.location}</Text>
              </View>
            )}
            <Text style={styles.priceTag}>
              K{booking.price?.toLocaleString()} 
              <Text style={styles.priceSub}> / night</Text>
            </Text>
          </View>
        </View>

        {/* Status & Ref */}
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, isCancelled ? styles.statusCancelled : styles.statusConfirmed]}>
            <Text style={[styles.statusText, isCancelled ? styles.statusTextCancelled : styles.statusTextConfirmed]}>
              {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
            </Text>
          </View>
          <Text style={styles.bookingRef}>Ref: {String(booking.id).slice(-8)}</Text>
        </View>

        {/* Stay Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Stay Details</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Check-in</Text>
            <Text style={styles.detailValue}>{formatDate(booking.checkIn || booking.date)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Check-out</Text>
            <Text style={styles.detailValue}>{formatDate(booking.checkOut)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nights</Text>
            <Text style={styles.detailValue}>{booking.nights || 1}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Guests</Text>
            <Text style={styles.detailValue}>{booking.guests || 1}</Text>
          </View>
        </View>

        {/* Guest Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Guest Information</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>{booking.fullName || booking.clientName || '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{booking.email || '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{booking.phone || '—'}</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Payment Details</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Method</Text>
            <Text style={styles.detailValue}>{paymentLabel}</Text>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>
              K{Number(booking.totalPrice || 0).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Special Requests */}
        {booking.specialRequests ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Special Requests</Text>
            </View>
            <Text style={styles.requestText}>{booking.specialRequests}</Text>
          </View>
        ) : null}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleViewProperty}>
            <Ionicons name="home-outline" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>View Property</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleContactHost}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Contact Host</Text>
          </TouchableOpacity>
        </View>

        {/* Cancel Button */}
        {!isCancelled && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Ionicons name="close-circle-outline" size={20} color="#E53935" />
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ───────── Modern Cancel Modal ───────── */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => !cancelling && setShowCancelModal(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {/* Drag handle */}
            <View style={styles.modalHandle} />

            {/* Icon */}
            <View style={styles.modalIconWrap}>
              <Ionicons name="calendar-outline" size={26} color="#E53935" />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Cancel this booking?</Text>

            {/* Subtitle */}
            <Text style={styles.modalSubtitle}>
              Your stay at{' '}
              <Text style={styles.modalStrong}>
                {booking.propertyName || 'this property'}
              </Text>{' '}
              on {formatDate(booking.checkIn || booking.date)} will be released.
              You can always book again later.
            </Text>

            {/* Property mini-preview */}
            <View style={styles.modalPreview}>
              <Image source={{ uri: imageUri }} style={styles.modalPreviewImg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.modalPreviewName} numberOfLines={1}>
                  {booking.propertyName || 'Property'}
                </Text>
                <Text style={styles.modalPreviewMeta} numberOfLines={1}>
                  {booking.location || '—'} · {booking.nights || 1} night
                  {(booking.nights || 1) > 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={confirmCancel}
              disabled={cancelling}
              activeOpacity={0.85}
            >
              <Text style={styles.modalConfirmText}>
                {cancelling ? 'Cancelling…' : 'Cancel Booking'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalKeepBtn}
              onPress={() => setShowCancelModal(false)}
              disabled={cancelling}
              activeOpacity={0.7}
            >
              <Text style={styles.modalKeepText}>Keep My Booking</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
    scrollContent: { padding: 16, paddingBottom: 40 },

    // Error Fallback
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    errorTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginTop: 16 },
    errorSubtitle: {
      fontSize: 15,
      color: colors.secondaryText,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 22,
    },
    goBackBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 25,
      marginTop: 24,
    },
    goBackBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

    // Property Card
    propertyCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    propertyImage: { width: '100%', height: 180, backgroundColor: colors.inputBackground },
    propertyInfo: { padding: 16 },
    propertyName: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 6 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    mutedText: { fontSize: 13, color: colors.secondaryText, marginLeft: 4 },
    priceTag: { fontSize: 18, fontWeight: '800', color: colors.primary },
    priceSub: { fontSize: 13, fontWeight: '500', color: colors.secondaryText },

    // Status
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
    statusConfirmed: { backgroundColor: isDark ? '#0A2A1A' : '#E6F7ED' },
    statusCancelled: { backgroundColor: isDark ? '#3A0A0A' : '#FDECEA' },
    statusText: { fontSize: 13, fontWeight: '700' },
    statusTextConfirmed: { color: '#28A745' },
    statusTextCancelled: { color: '#E53935' },
    bookingRef: { fontSize: 12, color: colors.secondaryText },

    // Sections
    section: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
    },
    detailLabel: { fontSize: 14, color: colors.secondaryText, fontWeight: '500' },
    detailValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      textAlign: 'right',
      marginLeft: 12,
    },
    divider: { height: 0.5, backgroundColor: colors.border },

    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
    },
    totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
    totalValue: { fontSize: 20, fontWeight: '800', color: colors.primary },

    requestText: { fontSize: 14, color: colors.text, lineHeight: 20 },

    // Actions
    actionsContainer: { flexDirection: 'row', gap: 12, marginTop: 4, marginBottom: 12 },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.card,
    },
    actionButtonText: { color: colors.primary, fontSize: 14, fontWeight: '600' },

    // Cancel
    cancelButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
      marginTop: 4,
      borderWidth: 1,
      borderColor: '#E53935',
      backgroundColor: isDark ? '#2A0A0A' : '#FFF5F5',
    },
    cancelButtonText: { color: '#E53935', fontSize: 15, fontWeight: '700' },

    // ───────── Modern Cancel Modal ─────────
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },
    modalCard: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 28,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 12,
    },
    modalHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: 20,
    },
    modalIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: isDark ? '#3A0A0A' : '#FDECEA',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: 14,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: 14,
      color: colors.secondaryText,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 18,
    },
    modalStrong: { fontWeight: '700', color: colors.text },
    modalPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground || (isDark ? '#1C1C1E' : '#F5F5F7'),
      borderRadius: 14,
      padding: 10,
      marginBottom: 20,
      gap: 12,
    },
    modalPreviewImg: {
      width: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: colors.border,
    },
    modalPreviewName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    modalPreviewMeta: {
      fontSize: 12,
      color: colors.secondaryText,
    },
    modalConfirmBtn: {
      backgroundColor: '#E53935',
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: 'center',
      marginBottom: 10,
    },
    modalConfirmText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    modalKeepBtn: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    modalKeepText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
  });