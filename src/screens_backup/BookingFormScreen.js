// screens/BookingFormScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../context/ThemeContext'; // ✅ Theme hook

export default function BookingFormScreen({ route, navigation }) {
  const { colors, isDark } = useTheme(); // ✅ Get theme
  const { property } = route.params || {};

  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    phone: '',
    email: '',
    fullName: '',
    specialRequests: '',
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState('checkIn');
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [nights, setNights] = useState(0);
  const [activeStep, setActiveStep] = useState(1);

  const styles = getStyles(colors, isDark); // ✅ Generate themed styles

  useEffect(() => {
    if (formData.checkIn && formData.checkOut && property) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      const diffTime = Math.abs(checkOutDate - checkInDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNights(diffDays);
      setTotalPrice(property.price * diffDays);
    }
  }, [formData.checkIn, formData.checkOut, property]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDateSelect = (day) => {
    const selectedDate = day.dateString;

    if (calendarMode === 'checkIn') {
      setFormData({ ...formData, checkIn: selectedDate });
      setShowCalendar(false);
      setTimeout(() => {
        setCalendarMode('checkOut');
        setShowCalendar(true);
      }, 300);
    } else {
      if (selectedDate > formData.checkIn) {
        setFormData({ ...formData, checkOut: selectedDate });
        setShowCalendar(false);
      } else {
        Alert.alert('Invalid Date', 'Check-out date must be after check-in date');
      }
    }
  };

  const updateGuests = (change) => {
    const newCount = formData.guests + change;
    if (newCount >= 1 && newCount <= 10) {
      setFormData({ ...formData, guests: newCount });
    }
  };

  const handleSubmitBooking = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    if (!formData.checkIn) {
      Alert.alert('Error', 'Please select check-in date');
      return;
    }
    if (!formData.checkOut) {
      Alert.alert('Error', 'Please select check-out date');
      return;
    }
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setShowPaymentModal(true);
  };

  const confirmBooking = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setShowPaymentModal(false);

      Alert.alert(
        '🎉 Booking Confirmed!',
        `Your stay at ${property?.title} is confirmed!\n\n` +
          `📅 Check-in: ${formatDate(formData.checkIn)}\n` +
          `📅 Check-out: ${formatDate(formData.checkOut)}\n` +
          `👤 Guests: ${formData.guests}\n` +
          `💰 Total: K${totalPrice.toLocaleString()}\n\n` +
          `You will receive a confirmation email shortly.`,
        [
          { text: 'View Bookings', onPress: () => navigation.navigate('Home') },
          { text: 'Back to Home', onPress: () => navigation.navigate('Home') },
        ]
      );
    }, 2000);
  };

  if (!property) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.secondaryText} />
        <Text style={styles.emptyTitle}>No Property Selected</Text>
        <Text style={styles.emptySubtitle}>Please select a property first</Text>
        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Your Stay</Text>
        </View>

        {/* Property Preview */}
        <View style={styles.propertyPreview}>
          <Image source={{ uri: property.image }} style={styles.previewImage} />
          <View style={styles.previewInfo}>
            <Text style={styles.previewTitle}>{property.title}</Text>
            <View style={styles.previewLocation}>
              <Ionicons name="location-outline" size={14} color={colors.secondaryText} />
              <Text style={styles.previewLocationText}>{property.location}</Text>
            </View>
            <View style={styles.previewRating}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.previewRatingText}>
                {property.rating} · {property.reviews} reviews
              </Text>
            </View>
            <Text style={styles.previewPrice}>
              K{property.price} <Text style={styles.previewPricePer}>/ night</Text>
            </Text>
          </View>
        </View>

        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[styles.progressCircle, activeStep >= 1 && styles.progressCircleActive]}>
              <Text style={[styles.progressNumber, activeStep >= 1 && styles.progressNumberActive]}>1</Text>
            </View>
            <Text style={[styles.progressLabel, activeStep >= 1 && styles.progressLabelActive]}>Details</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={[styles.progressCircle, activeStep >= 2 && styles.progressCircleActive]}>
              <Text style={[styles.progressNumber, activeStep >= 2 && styles.progressNumberActive]}>2</Text>
            </View>
            <Text style={[styles.progressLabel, activeStep >= 2 && styles.progressLabelActive]}>Payment</Text>
          </View>
        </View>

        {/* Step 1: Details */}
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Your Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={colors.secondaryText}
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.secondaryText}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.secondaryText}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.stepTitle}>Travel Dates</Text>

          <TouchableOpacity
            style={styles.datePickerCard}
            onPress={() => {
              setCalendarMode('checkIn');
              setShowCalendar(true);
            }}
          >
            <View style={styles.datePickerIcon}>
              <Ionicons name="calendar-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.datePickerInfo}>
              <Text style={styles.datePickerLabel}>Check-in</Text>
              <Text style={styles.datePickerValue}>
                {formData.checkIn ? formatDate(formData.checkIn) : 'Select date'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.datePickerCard, styles.datePickerCardLast]}
            onPress={() => {
              if (!formData.checkIn) {
                Alert.alert('Error', 'Please select check-in date first');
                return;
              }
              setCalendarMode('checkOut');
              setShowCalendar(true);
            }}
          >
            <View style={styles.datePickerIcon}>
              <Ionicons name="calendar-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.datePickerInfo}>
              <Text style={styles.datePickerLabel}>Check-out</Text>
              <Text style={styles.datePickerValue}>
                {formData.checkOut ? formatDate(formData.checkOut) : 'Select date'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          <View style={styles.guestContainer}>
            <View style={styles.guestInfo}>
              <Ionicons name="people-outline" size={24} color={colors.primary} />
              <View style={styles.guestInfoText}>
                <Text style={styles.guestLabel}>Guests</Text>
                <Text style={styles.guestSubtext}>
                  {formData.guests} guest{formData.guests > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            <View style={styles.guestControls}>
              <TouchableOpacity
                style={[styles.guestButton, formData.guests <= 1 && styles.guestButtonDisabled]}
                onPress={() => updateGuests(-1)}
                disabled={formData.guests <= 1}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={formData.guests <= 1 ? colors.secondaryText : colors.primary}
                />
              </TouchableOpacity>
              <Text style={styles.guestCount}>{formData.guests}</Text>
              <TouchableOpacity
                style={[styles.guestButton, formData.guests >= 10 && styles.guestButtonDisabled]}
                onPress={() => updateGuests(1)}
                disabled={formData.guests >= 10}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={formData.guests >= 10 ? colors.secondaryText : colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.stepTitle}>Special Requests</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special requests or additional information..."
            placeholderTextColor={colors.secondaryText}
            value={formData.specialRequests}
            onChangeText={(text) => setFormData({ ...formData, specialRequests: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Price Summary */}
        {formData.checkIn && formData.checkOut && (
          <View style={styles.priceSummary}>
            <Text style={styles.priceSummaryTitle}>Price Breakdown</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                K{property.price} × {nights} nights
              </Text>
              <Text style={styles.priceValue}>K{(property.price * nights).toLocaleString()}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Cleaning fee</Text>
              <Text style={styles.priceValue}>K500</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service fee</Text>
              <Text style={styles.priceValue}>K200</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={[styles.priceRow, styles.totalPriceRow]}>
              <Text style={styles.totalPriceLabel}>Total</Text>
              <Text style={styles.totalPriceValue}>K{(totalPrice + 700).toLocaleString()}</Text>
            </View>
          </View>
        )}

        {/* Step 2: Payment Method */}
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Payment Method</Text>

          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              selectedPaymentMethod === 'card' && styles.paymentMethodCardSelected,
            ]}
            onPress={() => setSelectedPaymentMethod('card')}
          >
            <Ionicons
              name="card-outline"
              size={24}
              color={selectedPaymentMethod === 'card' ? colors.primary : colors.secondaryText}
            />
            <Text
              style={[
                styles.paymentMethodText,
                selectedPaymentMethod === 'card' && styles.paymentMethodTextSelected,
              ]}
            >
              Credit / Debit Card
            </Text>
            {selectedPaymentMethod === 'card' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              selectedPaymentMethod === 'mobile' && styles.paymentMethodCardSelected,
            ]}
            onPress={() => setSelectedPaymentMethod('mobile')}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={24}
              color={selectedPaymentMethod === 'mobile' ? colors.primary : colors.secondaryText}
            />
            <Text
              style={[
                styles.paymentMethodText,
                selectedPaymentMethod === 'mobile' && styles.paymentMethodTextSelected,
              ]}
            >
              Mobile Money
            </Text>
            {selectedPaymentMethod === 'mobile' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              selectedPaymentMethod === 'bank' && styles.paymentMethodCardSelected,
            ]}
            onPress={() => setSelectedPaymentMethod('bank')}
          >
            <Ionicons
              name="business-outline"
              size={24}
              color={selectedPaymentMethod === 'bank' ? colors.primary : colors.secondaryText}
            />
            <Text
              style={[
                styles.paymentMethodText,
                selectedPaymentMethod === 'bank' && styles.paymentMethodTextSelected,
              ]}
            >
              Bank Transfer
            </Text>
            {selectedPaymentMethod === 'bank' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!formData.checkIn || !formData.checkOut || !selectedPaymentMethod) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitBooking}
          disabled={!formData.checkIn || !formData.checkOut || !selectedPaymentMethod}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
          <Text style={styles.submitButtonText}>
            {!formData.checkIn || !formData.checkOut
              ? 'Select dates to book'
              : !selectedPaymentMethod
              ? 'Select payment method'
              : 'Confirm Booking'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You won't be charged yet. Payment will be collected by the host.
          </Text>
        </View>

        {/* Calendar Modal */}
        <Modal visible={showCalendar} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.calendarModal}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>
                  {calendarMode === 'checkIn' ? 'Select Check-in Date' : 'Select Check-out Date'}
                </Text>
                <TouchableOpacity onPress={() => setShowCalendar(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <Calendar
                onDayPress={handleDateSelect}
                minDate={new Date()}
                markedDates={{
                  [formData.checkIn]: {
                    selected: true,
                    selectedColor: colors.primary,
                    startingDay: true,
                    color: colors.primary,
                  },
                  [formData.checkOut]: {
                    selected: true,
                    selectedColor: colors.primary,
                    endingDay: true,
                    color: colors.primary,
                  },
                }}
                markingType="period"
                theme={{
                  calendarBackground: colors.card,
                  textSectionTitleColor: colors.primary,
                  selectedDayBackgroundColor: colors.primary,
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: colors.primary,
                  dayTextColor: colors.text,
                  textDisabledColor: colors.secondaryText,
                  arrowColor: colors.primary,
                  monthTextColor: colors.text,
                  textDayFontWeight: '400',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '500',
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                }}
              />
            </View>
          </View>
        </Modal>

        {/* Payment Modal */}
        <Modal visible={showPaymentModal} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.paymentModal}>
              <View style={styles.paymentModalHeader}>
                <Text style={styles.paymentModalTitle}>Confirm Payment</Text>
                <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.paymentSummaryCard}>
                <Text style={styles.paymentSummaryTitle}>Booking Summary</Text>
                <View style={styles.paymentSummaryRow}>
                  <Text style={styles.paymentSummaryLabel}>Property</Text>
                  <Text style={styles.paymentSummaryValue}>{property?.title}</Text>
                </View>
                <View style={styles.paymentSummaryRow}>
                  <Text style={styles.paymentSummaryLabel}>Dates</Text>
                  <Text style={styles.paymentSummaryValue}>
                    {formatDate(formData.checkIn)} - {formatDate(formData.checkOut)}
                  </Text>
                </View>
                <View style={styles.paymentSummaryRow}>
                  <Text style={styles.paymentSummaryLabel}>Guests</Text>
                  <Text style={styles.paymentSummaryValue}>{formData.guests}</Text>
                </View>
                <View style={styles.paymentSummaryRow}>
                  <Text style={styles.paymentSummaryLabel}>Total</Text>
                  <Text style={styles.paymentSummaryTotal}>
                    K{totalPrice.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.paymentSummaryRow}>
                  <Text style={styles.paymentSummaryLabel}>Payment Method</Text>
                  <Text style={styles.paymentSummaryValue}>
                    {selectedPaymentMethod === 'card'
                      ? 'Credit/Debit Card'
                      : selectedPaymentMethod === 'mobile'
                      ? 'Mobile Money'
                      : 'Bank Transfer'}
                  </Text>
                </View>
              </View>

              <View style={styles.paymentActions}>
                <TouchableOpacity
                  style={[styles.paymentButton, styles.cancelPaymentButton]}
                  onPress={() => setShowPaymentModal(false)}
                >
                  <Text style={styles.cancelPaymentText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.paymentButton, styles.confirmPaymentButton]}
                  onPress={confirmBooking}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.confirmPaymentText}>Confirm Payment</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ✅ Styles generated from theme colors
const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: { padding: 4 },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginLeft: 12,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: colors.background,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 20,
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.secondaryText,
      textAlign: 'center',
      marginTop: 10,
    },
    goBackButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 30,
      paddingVertical: 14,
      borderRadius: 25,
      marginTop: 20,
    },
    goBackButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    propertyPreview: {
      backgroundColor: colors.card,
      flexDirection: 'row',
      padding: 16,
      marginBottom: 12,
    },
    previewImage: {
      width: 100,
      height: 100,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
    },
    previewInfo: {
      flex: 1,
      marginLeft: 12,
      justifyContent: 'center',
    },
    previewTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    previewLocation: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    previewLocationText: {
      fontSize: 12,
      color: colors.secondaryText,
      marginLeft: 4,
    },
    previewRating: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    previewRatingText: {
      fontSize: 12,
      color: colors.secondaryText,
      marginLeft: 4,
    },
    previewPrice: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
    },
    previewPricePer: {
      fontSize: 14,
      fontWeight: 'normal',
      color: colors.secondaryText,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 12,
    },
    progressStep: { alignItems: 'center' },
    progressCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    progressCircleActive: {
      backgroundColor: colors.primary,
    },
    progressNumber: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.secondaryText,
    },
    progressNumberActive: {
      color: '#fff',
    },
    progressLabel: {
      fontSize: 12,
      color: colors.secondaryText,
    },
    progressLabelActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    progressLine: {
      width: 40,
      height: 2,
      backgroundColor: colors.border,
      marginHorizontal: 8,
    },
    stepContainer: {
      backgroundColor: colors.card,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    stepTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    inputGroup: { marginBottom: 16 },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.secondaryText,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 14,
      fontSize: 16,
      backgroundColor: colors.inputBackground,
      color: colors.text,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
    datePickerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    datePickerCardLast: { borderBottomWidth: 0 },
    datePickerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    datePickerInfo: {
      flex: 1,
      marginLeft: 12,
    },
    datePickerLabel: {
      fontSize: 12,
      color: colors.secondaryText,
    },
    datePickerValue: {
      fontSize: 16,
      color: colors.text,
      marginTop: 2,
    },
    guestContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      marginTop: 8,
    },
    guestInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    guestInfoText: { marginLeft: 12 },
    guestLabel: {
      fontSize: 16,
      color: colors.text,
    },
    guestSubtext: {
      fontSize: 12,
      color: colors.secondaryText,
    },
    guestControls: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    guestButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    guestButtonDisabled: {
      borderColor: colors.border,
    },
    guestCount: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginHorizontal: 16,
      minWidth: 30,
      textAlign: 'center',
    },
    priceSummary: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    priceSummaryTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
    },
    priceLabel: {
      fontSize: 14,
      color: colors.secondaryText,
    },
    priceValue: {
      fontSize: 14,
      color: colors.text,
    },
    priceDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 8,
    },
    totalPriceRow: { paddingTop: 8 },
    totalPriceLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    totalPriceValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
    },
    paymentMethodCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      marginBottom: 10,
      backgroundColor: colors.inputBackground,
    },
    paymentMethodCardSelected: {
      borderColor: colors.primary,
      backgroundColor: isDark ? '#0A2A50' : '#f0f8ff',
    },
    paymentMethodText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: colors.text,
    },
    paymentMethodTextSelected: {
      color: colors.primary,
      fontWeight: '600',
    },
    submitButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 12,
      padding: 16,
      borderRadius: 12,
      gap: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    submitButtonDisabled: {
      backgroundColor: colors.secondaryText,
      shadowOpacity: 0,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    footer: {
      paddingHorizontal: 16,
      paddingBottom: 30,
    },
    footerText: {
      fontSize: 12,
      color: colors.secondaryText,
      textAlign: 'center',
      lineHeight: 18,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    calendarModal: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
    },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    calendarTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    paymentModal: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      width: '90%',
      maxHeight: '80%',
    },
    paymentModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    paymentModalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
    },
    paymentSummaryCard: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    paymentSummaryTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    paymentSummaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
    },
    paymentSummaryLabel: {
      fontSize: 14,
      color: colors.secondaryText,
    },
    paymentSummaryValue: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
      textAlign: 'right',
    },
    paymentSummaryTotal: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primary,
    },
    paymentActions: {
      flexDirection: 'row',
      marginTop: 16,
      gap: 12,
    },
    paymentButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    cancelPaymentButton: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    confirmPaymentButton: {
      backgroundColor: colors.primary,
    },
    cancelPaymentText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    confirmPaymentText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });