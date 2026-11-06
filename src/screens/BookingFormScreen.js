// screens/BookingFormScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Image,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAppStore } from '../../store/useAppStore';

const STEPS = [
  { id: 1, label: 'Details', icon: 'person-outline' },
  { id: 2, label: 'Payment', icon: 'card-outline' },
];

const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard, American Express',
    icon: 'card-outline',
    color: '#1A73E8',
  },
  {
    id: 'mobile',
    label: 'Mobile Money',
    subtitle: 'MTN, Airtel, Zamtel',
    icon: 'phone-portrait-outline',
    color: '#FD7E14',
  },
  {
    id: 'bank',
    label: 'Bank Transfer',
    subtitle: 'Pay directly from your bank',
    icon: 'business-outline',
    color: '#28A745',
  },
];

const CLEANING_FEE = 500;
const SERVICE_FEE = 200;

export default function BookingFormScreen({ route, navigation }) {
  const { property } = route.params || {};
  const { colors, isDark } = useTheme();
  const { showError } = useToast();
  const { user, createBooking } = useAppStore();

  const styles = getStyles(colors, isDark);

  const [step, setStep] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState('checkIn');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    phone: '',
    email: '',
    fullName: '',
    specialRequests: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('');

  const propertyImageUri =
    property?.images?.[0] ||
    property?.image ||
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500';

  // Pre-fill user info
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  // Auto-clear validation error when user fixes it
  useEffect(() => {
    if (validationError) setValidationError(null);
  }, [
    formData.fullName,
    formData.email,
    formData.phone,
    formData.checkIn,
    formData.checkOut,
    paymentMethod,
  ]);

  // Compute nights + totals
  const nights =
    formData.checkIn && formData.checkOut
      ? Math.max(
          1,
          Math.ceil(
            (new Date(formData.checkOut) - new Date(formData.checkIn)) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const baseTotal = (property?.price || 0) * nights;
  const grandTotal = nights > 0 ? baseTotal + CLEANING_FEE + SERVICE_FEE : 0;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDateSelect = (day) => {
    const selected = day.dateString;

    if (calendarMode === 'checkIn') {
      setFormData((prev) => ({ ...prev, checkIn: selected, checkOut: '' }));
      setShowCalendar(false);
      setTimeout(() => {
        setCalendarMode('checkOut');
        setShowCalendar(true);
      }, 350);
    } else {
      if (selected > formData.checkIn) {
        setFormData((prev) => ({ ...prev, checkOut: selected }));
        setShowCalendar(false);
      } else {
        showError('Invalid date', 'Check-out must be after check-in.');
      }
    }
  };

  const updateGuests = (delta) => {
    const next = formData.guests + delta;
    if (next >= 1 && next <= 10) {
      setFormData((prev) => ({ ...prev, guests: next }));
    }
  };

  const validateDetails = () => {
    if (!formData.fullName.trim()) {
      setValidationError('Please enter your full name.');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return false;
    }
    if (!formData.phone.trim()) {
      setValidationError('Please enter your phone number.');
      return false;
    }
    if (!formData.checkIn) {
      setValidationError('Please select a check-in date.');
      return false;
    }
    if (!formData.checkOut) {
      setValidationError('Please select a check-out date.');
      return false;
    }
    return true;
  };

  const handleContinueToPayment = () => {
    if (!validateDetails()) return;
    setStep(2);
  };

  const handleConfirmBooking = async () => {
    if (!paymentMethod) {
      setValidationError('Please choose a payment method.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newBooking = {
        propertyId: property?.id,
        property: property,
        propertyName: property?.title,
        propertyImage: propertyImageUri,
        image: propertyImageUri,
        location: property?.location,
        price: property?.price,

        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        date: formData.checkIn,
        nights,
        guests: formData.guests,

        clientName: formData.fullName || user?.name || 'Guest',
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        specialRequests: formData.specialRequests,

        paymentMethod,
        totalPrice: grandTotal,
        breakdown: {
          base: baseTotal,
          cleaningFee: CLEANING_FEE,
          serviceFee: SERVICE_FEE,
          nights,
        },

        status: 'confirmed',
        bookingDate: new Date().toISOString(),

        hostId: property?.hostId,
        hostName: property?.host,
        hostAvatar: property?.hostAvatar,
      };

      const result = await createBooking(newBooking);

      if (result?.success) {
        setConfirmedBooking(result.booking || newBooking);
        setShowSuccessScreen(true);
      } else {
        setValidationError(
          result?.error || 'Could not complete your booking. Try again.'
        );
      }
    } catch (err) {
      console.log('Booking error:', err);
      setValidationError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- No property fallback ----------
  if (!property) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={60}
          color={colors.secondaryText}
        />
        <Text style={styles.emptyTitle}>No Property Selected</Text>
        <Text style={styles.emptySubtitle}>
          Please select a property first.
        </Text>
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ---------- Success screen ----------
  if (showSuccessScreen && confirmedBooking) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <View style={styles.successContent}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark" size={48} color="#FFFFFF" />
          </View>

          <Text style={styles.successTitle}>Booking Confirmed</Text>
          <Text style={styles.successSubtitle}>
            Your stay at {property?.title} is booked. We've sent the
            confirmation to {formData.email}.
          </Text>

          <View style={styles.successCard}>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Property</Text>
              <Text style={styles.successValue} numberOfLines={1}>
                {property?.title}
              </Text>
            </View>
            <View style={styles.successDivider} />
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Dates</Text>
              <Text style={styles.successValue}>
                {formatShortDate(formData.checkIn)} —{' '}
                {formatShortDate(formData.checkOut)}
              </Text>
            </View>
            <View style={styles.successDivider} />
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Guests</Text>
              <Text style={styles.successValue}>
                {formData.guests}{' '}
                {formData.guests === 1 ? 'guest' : 'guests'}
              </Text>
            </View>
            <View style={styles.successDivider} />
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Total paid</Text>
              <Text style={styles.successTotal}>
                K{grandTotal.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.successActions}>
            <TouchableOpacity
              style={styles.primarySuccessBtn}
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                })
              }
              activeOpacity={0.85}
            >
              <Ionicons name="home-outline" size={18} color="#FFFFFF" />
              <Text style={styles.primarySuccessText}>Done</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondarySuccessBtn}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
                setTimeout(() => {
                  navigation.navigate('MyBookings');
                }, 300);
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <Text style={styles.secondarySuccessText}>View My Bookings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Main render ----------
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() =>
                step === 2 ? setStep(1) : navigation.goBack()
              }
              style={styles.backButton}
              hitSlop={8}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Book Your Stay</Text>
            <View style={{ width: 32 }} />
          </View>

          {/* Property preview */}
          <View style={styles.propertyPreview}>
            <Image source={{ uri: propertyImageUri }} style={styles.previewImage} />
            <View style={styles.previewInfo}>
              <Text style={styles.previewTitle} numberOfLines={2}>
                {property.title}
              </Text>
              <View style={styles.previewLocation}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={colors.secondaryText}
                />
                <Text style={styles.previewLocationText} numberOfLines={1}>
                  {property.location}
                </Text>
              </View>
              <Text style={styles.previewPrice}>
                K{property.price?.toLocaleString()}{' '}
                <Text style={styles.previewPricePer}>/ night</Text>
              </Text>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <View style={styles.progressStep}>
                  <View
                    style={[
                      styles.progressCircle,
                      step >= s.id && styles.progressCircleActive,
                    ]}
                  >
                    {step > s.id ? (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    ) : (
                      <Text
                        style={[
                          styles.progressNumber,
                          step >= s.id && styles.progressNumberActive,
                        ]}
                      >
                        {s.id}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.progressLabel,
                      step >= s.id && styles.progressLabelActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                </View>
                {i < STEPS.length - 1 && (
                  <View
                    style={[
                      styles.progressLine,
                      step > s.id && styles.progressLineActive,
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* Validation banner */}
          {validationError && (
            <View style={styles.errorBanner}>
              <Ionicons
                name="alert-circle"
                size={18}
                color="#FF3B30"
              />
              <Text style={styles.errorBannerText}>{validationError}</Text>
            </View>
          )}

          {/* STEP 1 — Details */}
          {step === 1 && (
            <>
              <View style={styles.stepContainer}>
                <Text style={styles.sectionTitle}>Your Details</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Jane Doe"
                    placeholderTextColor={colors.secondaryText}
                    value={formData.fullName}
                    onChangeText={(t) =>
                      setFormData((prev) => ({ ...prev, fullName: t }))
                    }
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="jane@email.com"
                    placeholderTextColor={colors.secondaryText}
                    value={formData.email}
                    onChangeText={(t) =>
                      setFormData((prev) => ({ ...prev, email: t }))
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+260 97 123 4567"
                    placeholderTextColor={colors.secondaryText}
                    value={formData.phone}
                    onChangeText={(t) =>
                      setFormData((prev) => ({ ...prev, phone: t }))
                    }
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.stepContainer}>
                <Text style={styles.sectionTitle}>Travel Dates</Text>

                <TouchableOpacity
                  style={styles.datePickerCard}
                  onPress={() => {
                    setCalendarMode('checkIn');
                    setShowCalendar(true);
                  }}
                >
                  <View style={styles.datePickerIcon}>
                    <Ionicons
                      name="calendar-outline"
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.datePickerInfo}>
                    <Text style={styles.datePickerLabel}>Check-in</Text>
                    <Text
                      style={[
                        styles.datePickerValue,
                        !formData.checkIn && styles.datePickerPlaceholder,
                      ]}
                    >
                      {formData.checkIn
                        ? formatDate(formData.checkIn)
                        : 'Select date'}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.secondaryText}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.datePickerCard, styles.datePickerCardLast]}
                  onPress={() => {
                    if (!formData.checkIn) {
                      showError(
                        'Check-in first',
                        'Please select your check-in date first.'
                      );
                      return;
                    }
                    setCalendarMode('checkOut');
                    setShowCalendar(true);
                  }}
                >
                  <View style={styles.datePickerIcon}>
                    <Ionicons
                      name="calendar-outline"
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.datePickerInfo}>
                    <Text style={styles.datePickerLabel}>Check-out</Text>
                    <Text
                      style={[
                        styles.datePickerValue,
                        !formData.checkOut && styles.datePickerPlaceholder,
                      ]}
                    >
                      {formData.checkOut
                        ? formatDate(formData.checkOut)
                        : 'Select date'}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.secondaryText}
                  />
                </TouchableOpacity>

                <View style={styles.guestContainer}>
                  <View style={styles.guestInfo}>
                    <Ionicons
                      name="people-outline"
                      size={22}
                      color={colors.primary}
                    />
                    <View style={styles.guestInfoText}>
                      <Text style={styles.guestLabel}>Guests</Text>
                      <Text style={styles.guestSubtext}>
                        {formData.guests}{' '}
                        {formData.guests === 1 ? 'guest' : 'guests'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.guestControls}>
                    <TouchableOpacity
                      style={[
                        styles.guestButton,
                        formData.guests <= 1 && styles.guestButtonDisabled,
                      ]}
                      onPress={() => updateGuests(-1)}
                      disabled={formData.guests <= 1}
                    >
                      <Ionicons
                        name="remove"
                        size={18}
                        color={
                          formData.guests <= 1
                            ? colors.secondaryText
                            : colors.primary
                        }
                      />
                    </TouchableOpacity>
                    <Text style={styles.guestCount}>{formData.guests}</Text>
                    <TouchableOpacity
                      style={[
                        styles.guestButton,
                        formData.guests >= 10 && styles.guestButtonDisabled,
                      ]}
                      onPress={() => updateGuests(1)}
                      disabled={formData.guests >= 10}
                    >
                      <Ionicons
                        name="add"
                        size={18}
                        color={
                          formData.guests >= 10
                            ? colors.secondaryText
                            : colors.primary
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.stepContainer}>
                <Text style={styles.sectionTitle}>Special Requests</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Anything the host should know? (Optional)"
                  placeholderTextColor={colors.secondaryText}
                  value={formData.specialRequests}
                  onChangeText={(t) =>
                    setFormData((prev) => ({ ...prev, specialRequests: t }))
                  }
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Continue */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleContinueToPayment}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Continue to Payment</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}

          {/* STEP 2 — Payment */}
          {step === 2 && (
            <>
              <View style={styles.stepContainer}>
                <Text style={styles.sectionTitle}>Payment Method</Text>

                {PAYMENT_METHODS.map((method) => {
                  const selected = paymentMethod === method.id;
                  return (
                    <TouchableOpacity
                      key={method.id}
                      style={[
                        styles.paymentRow,
                        selected && styles.paymentRowSelected,
                      ]}
                      onPress={() => setPaymentMethod(method.id)}
                      activeOpacity={0.75}
                    >
                      <View
                        style={[
                          styles.paymentIconWrap,
                          {
                            backgroundColor: selected
                              ? method.color
                              : method.color + '18',
                          },
                        ]}
                      >
                        <Ionicons
                          name={method.icon}
                          size={22}
                          color={selected ? '#FFFFFF' : method.color}
                        />
                      </View>
                      <View style={styles.paymentTextWrap}>
                        <Text style={styles.paymentLabel}>{method.label}</Text>
                        <Text style={styles.paymentSubtitle}>
                          {method.subtitle}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.radioOuter,
                          selected && styles.radioOuterSelected,
                        ]}
                      >
                        {selected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                <View style={styles.infoRow}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={14}
                    color={colors.secondaryText}
                  />
                  <Text style={styles.infoText}>
                    Payment is collected securely by the host. You won't be
                    charged here.
                  </Text>
                </View>
              </View>

              {/* Price Breakdown */}
              {nights > 0 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.sectionTitle}>Price Breakdown</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>
                      K{property.price?.toLocaleString()} × {nights} night
                      {nights === 1 ? '' : 's'}
                    </Text>
                    <Text style={styles.priceValue}>
                      K{baseTotal.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Cleaning fee</Text>
                    <Text style={styles.priceValue}>
                      K{CLEANING_FEE.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Service fee</Text>
                    <Text style={styles.priceValue}>
                      K{SERVICE_FEE.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.priceDivider} />
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>
                      K{grandTotal.toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Confirm */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!paymentMethod || isSubmitting) && styles.primaryButtonDisabled,
                ]}
                onPress={handleConfirmBooking}
                disabled={!paymentMethod || isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.primaryButtonText}>
                      {paymentMethod
                        ? 'Confirm Booking'
                        : 'Select a payment method'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backToDetailsBtn}
                onPress={() => setStep(1)}
              >
                <Text style={styles.backToDetailsText}>
                  ← Back to details
                </Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.footerText}>
            By confirming, you agree to APSA's booking terms and host policies.
          </Text>
        </ScrollView>

        {/* Calendar Modal */}
        <Modal
          visible={showCalendar}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCalendar(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.calendarModal}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>
                  {calendarMode === 'checkIn'
                    ? 'Select check-in'
                    : 'Select check-out'}
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
                    textColor: '#FFFFFF',
                  },
                  [formData.checkOut]: {
                    selected: true,
                    selectedColor: colors.primary,
                    endingDay: true,
                    color: colors.primary,
                    textColor: '#FFFFFF',
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, backgroundColor: colors.background },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 12,
      backgroundColor: colors.background,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },

    // Empty
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: colors.background,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 20,
    },
    emptySubtitle: {
      fontSize: 15,
      color: colors.secondaryText,
      textAlign: 'center',
      marginTop: 8,
    },
    goBackButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 14,
      marginTop: 24,
    },
    goBackButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

    // Property preview
    propertyPreview: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      marginHorizontal: 16,
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    previewImage: {
      width: 84,
      height: 84,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
    },
    previewInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
    previewTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    previewLocation: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    previewLocationText: {
      fontSize: 12,
      color: colors.secondaryText,
      marginLeft: 4,
      flex: 1,
    },
    previewPrice: { fontSize: 16, fontWeight: '700', color: colors.primary },
    previewPricePer: { fontSize: 12, fontWeight: 'normal', color: colors.secondaryText },

    // Progress
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      marginHorizontal: 16,
      marginBottom: 12,
      backgroundColor: colors.card,
      borderRadius: 14,
    },
    progressStep: { alignItems: 'center' },
    progressCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    progressCircleActive: { backgroundColor: colors.primary },
    progressNumber: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.secondaryText,
    },
    progressNumberActive: { color: '#FFFFFF' },
    progressLabel: { fontSize: 11, color: colors.secondaryText, fontWeight: '500' },
    progressLabelActive: { color: colors.primary, fontWeight: '700' },
    progressLine: {
      width: 44,
      height: 2,
      backgroundColor: colors.border,
      marginHorizontal: 10,
      marginBottom: 18,
    },
    progressLineActive: { backgroundColor: colors.primary },

    // Error banner
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: isDark ? '#2A1010' : '#FFF1F0',
      borderWidth: 1,
      borderColor: isDark ? '#4A1E1E' : '#FFD6D3',
    },
    errorBannerText: {
      flex: 1,
      fontSize: 13,
      color: '#FF3B30',
      fontWeight: '500',
    },

    // Step container
    stepContainer: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 16,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 10,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 14,
    },

    // Inputs
    inputGroup: { marginBottom: 14 },
    inputLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.secondaryText,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      backgroundColor: colors.inputBackground,
      color: colors.text,
    },
    textArea: { height: 90, textAlignVertical: 'top', paddingTop: 12 },

    // Date pickers
    datePickerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    datePickerCardLast: { borderBottomWidth: 0 },
    datePickerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    datePickerInfo: { flex: 1, marginLeft: 12 },
    datePickerLabel: {
      fontSize: 12,
      color: colors.secondaryText,
      fontWeight: '500',
    },
    datePickerValue: { fontSize: 15, color: colors.text, marginTop: 2, fontWeight: '500' },
    datePickerPlaceholder: { color: colors.secondaryText, fontStyle: 'italic', fontWeight: '400' },

    // Guests
    guestContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
    },
    guestInfo: { flexDirection: 'row', alignItems: 'center' },
    guestInfoText: { marginLeft: 12 },
    guestLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
    guestSubtext: { fontSize: 12, color: colors.secondaryText, marginTop: 2 },
    guestControls: { flexDirection: 'row', alignItems: 'center' },
    guestButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    guestButtonDisabled: { borderColor: colors.border },
    guestCount: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginHorizontal: 16,
      minWidth: 26,
      textAlign: 'center',
    },

    // Payment methods
    paymentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.inputBackground,
      marginBottom: 10,
    },
    paymentRowSelected: {
      borderColor: colors.primary,
      backgroundColor: isDark ? '#0A2A50' : '#F0F8FF',
    },
    paymentIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    paymentTextWrap: { flex: 1 },
    paymentLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
    paymentSubtitle: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 2,
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioOuterSelected: { borderColor: colors.primary },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },

    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
    },
    infoText: {
      flex: 1,
      fontSize: 12,
      color: colors.secondaryText,
      lineHeight: 17,
    },

    // Price
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
    },
    priceLabel: { fontSize: 14, color: colors.secondaryText },
    priceValue: { fontSize: 14, color: colors.text, fontWeight: '500' },
    priceDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 8,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 4,
    },
    totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
    totalValue: { fontSize: 20, fontWeight: '800', color: colors.primary },

    // Buttons
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      marginHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 14,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.28,
      shadowRadius: 10,
      elevation: 5,
    },
    primaryButtonDisabled: {
      backgroundColor: colors.secondaryText,
      shadowOpacity: 0,
      elevation: 0,
    },
    primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

    backToDetailsBtn: {
      alignItems: 'center',
      paddingVertical: 14,
      marginTop: 4,
    },
    backToDetailsText: {
      fontSize: 13,
      color: colors.secondaryText,
      fontWeight: '500',
    },

    footerText: {
      fontSize: 11,
      color: colors.secondaryText,
      textAlign: 'center',
      paddingHorizontal: 32,
      marginTop: 8,
      lineHeight: 16,
    },

    // Modal
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
    calendarTitle: { fontSize: 17, fontWeight: '700', color: colors.text },

    // Success screen
    successContainer: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    successContent: { alignItems: 'center' },
    successIconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: '#34C759',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: '#34C759',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    successTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    successSubtitle: {
      fontSize: 14,
      color: colors.secondaryText,
      textAlign: 'center',
      lineHeight: 21,
      marginBottom: 24,
      paddingHorizontal: 8,
    },
    successCard: {
      width: '100%',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
    },
    successRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    successLabel: { fontSize: 13, color: colors.secondaryText },
    successValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      maxWidth: '65%',
      textAlign: 'right',
    },
    successTotal: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.primary,
    },
    successDivider: { height: 0.5, backgroundColor: colors.border },
    successActions: { width: '100%', gap: 10 },
    primarySuccessBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 14,
    },
    primarySuccessText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    secondarySuccessBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.card,
      paddingVertical: 16,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    secondarySuccessText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '700',
    },
  });