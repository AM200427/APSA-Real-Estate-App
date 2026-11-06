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
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
// 🔥 IMPORT SERVICES
import BookingService from '../services/bookingService';
import AuthService from '../services/authService';

export default function BookingFormScreen({ route, navigation }) {
  const { property } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;

  // State for booking form
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

  // 🔥 LOAD USER DATA ON MOUNT
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const result = await AuthService.getCurrentUser();
    if (result.success && result.user) {
      setFormData(prev => ({
        ...prev,
        fullName: result.user.name || '',
        email: result.user.email || '',
        phone: result.user.phone || '',
      }));
    }
  };

  // Calculate total price when dates change
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

  // Format date for display
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

  // Handle date selection
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

  // Handle guest count
  const updateGuests = (change) => {
    const newCount = formData.guests + change;
    if (newCount >= 1 && newCount <= 10) {
      setFormData({ ...formData, guests: newCount });
    }
  };

  // Submit booking
  const handleSubmitBooking = () => {
    // Validation
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

  // 🔥 CONFIRM BOOKING - WITH API
  const confirmBooking = async () => {
    setIsLoading(true);
    
    const bookingData = {
      propertyId: property.id,
      propertyTitle: property.title,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: formData.guests,
      totalPrice: totalPrice,
      paymentMethod: selectedPaymentMethod,
      specialRequests: formData.specialRequests,
      guestName: formData.fullName,
      guestEmail: formData.email,
      guestPhone: formData.phone,
    };

    const result = await BookingService.createBooking(bookingData);
    
    setIsLoading(false);
    setShowPaymentModal(false);
    
    if (result.success) {
      Alert.alert(
        '🎉 Booking Confirmed!',
        `Your stay at ${property?.title} is confirmed!\n\n` +
        `📅 Check-in: ${formatDate(formData.checkIn)}\n` +
        `📅 Check-out: ${formatDate(formData.checkOut)}\n` +
        `👤 Guests: ${formData.guests}\n` +
        `💰 Total: K${totalPrice.toLocaleString()}\n\n` +
        `You will receive a confirmation email shortly.`,
        [
          { 
            text: 'Back to Home', 
            onPress: () => navigation.navigate('Home') 
          }
        ]
      );
    } else {
      Alert.alert('Booking Failed', result.message || 'Failed to create booking. Please try again.');
    }
  };

  if (!property) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#ddd" />
        <Text style={styles.emptyTitle}>No Property Selected</Text>
        <Text style={styles.emptySubtitle}>Please select a property first</Text>
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 👇 IMAGE CAROUSEL (Identical to PropertyDetail) 👇 */}
      <View style={{ position: 'relative' }}> 
        <FlatList
          data={property.images || [property.image]}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / screenWidth
            );
            setCurrentImageIndex(index);
          }}
          renderItem={({ item }) => (
            <Image 
              source={{ uri: item }} 
              style={{ width: screenWidth, height: 220, resizeMode: 'cover' }} 
            />
          )}
        />

        {/* Pagination Dots */}
        <View style={{
          position: 'absolute',
          bottom: 12,
          alignSelf: 'center',
          flexDirection: 'row',
          gap: 6,
          zIndex: 10,
        }}>
          {(property.images || [property.image]).map((_, index) => (
            <View
              key={index}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: currentImageIndex === index ? '#007AFF' : 'rgba(255, 255, 255, 0.6)',
              }}
            />
          ))}
        </View>
      </View>

      {/* Booking Form */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Your Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
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
            placeholderTextColor="#999"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Booking Details */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Booking Details</Text>

        <TouchableOpacity
          style={styles.datePicker}
          onPress={() => {
            setCalendarMode('checkIn');
            setShowCalendar(true);
          }}
        >
          <Ionicons name="calendar-outline" size={24} color="#007AFF" />
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Check-in Date</Text>
            <Text style={styles.dateValue}>
              {formData.checkIn ? formatDate(formData.checkIn) : 'Select date'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.datePicker}
          onPress={() => {
            if (!formData.checkIn) {
              Alert.alert('Error', 'Please select check-in date first');
              return;
            }
            setCalendarMode('checkOut');
            setShowCalendar(true);
          }}
        >
          <Ionicons name="calendar-outline" size={24} color="#007AFF" />
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Check-out Date</Text>
            <Text style={styles.dateValue}>
              {formData.checkOut ? formatDate(formData.checkOut) : 'Select date'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.guestContainer}>
          <Text style={styles.guestLabel}>Number of Guests</Text>
          <View style={styles.guestControls}>
            <TouchableOpacity
              style={[styles.guestButton, formData.guests <= 1 && styles.guestButtonDisabled]}
              onPress={() => updateGuests(-1)}
              disabled={formData.guests <= 1}
            >
              <Ionicons name="remove" size={24} color={formData.guests <= 1 ? '#ccc' : '#007AFF'} />
            </TouchableOpacity>
            <Text style={styles.guestCount}>{formData.guests}</Text>
            <TouchableOpacity
              style={[styles.guestButton, formData.guests >= 10 && styles.guestButtonDisabled]}
              onPress={() => updateGuests(1)}
              disabled={formData.guests >= 10}
            >
              <Ionicons name="add" size={24} color={formData.guests >= 10 ? '#ccc' : '#007AFF'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Special Requests */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Special Requests</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any special requests or additional information..."
          placeholderTextColor="#999"
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
          <Text style={styles.priceSummaryTitle}>Price Summary</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>K{property.price} x {nights} nights</Text>
            <Text style={styles.priceValue}>K{(property.price * nights).toLocaleString()}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Cleaning Fee</Text>
            <Text style={styles.priceValue}>K{500}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Fee</Text>
            <Text style={styles.priceValue}>K{200}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalPriceRow]}>
            <Text style={styles.totalPriceLabel}>Total</Text>
            <Text style={styles.totalPriceValue}>K{(totalPrice + 700).toLocaleString()}</Text>
          </View>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!formData.checkIn || !formData.checkOut) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmitBooking}
        disabled={!formData.checkIn || !formData.checkOut}
      >
        <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
        <Text style={styles.submitButtonText}>
          {formData.checkIn && formData.checkOut ? 'Book Now' : 'Select Dates to Book'}
        </Text>
      </TouchableOpacity>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>
                {calendarMode === 'checkIn' ? 'Select Check-in Date' : 'Select Check-out Date'}
              </Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={handleDateSelect}
              minDate={new Date()}
              markedDates={{
                [formData.checkIn]: { selected: true, selectedColor: '#007AFF' },
                [formData.checkOut]: { selected: true, selectedColor: '#007AFF' },
              }}
              theme={{
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#007AFF',
                selectedDayBackgroundColor: '#007AFF',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#007AFF',
                dayTextColor: '#2d4150',
                textDisabledColor: '#d9e1e8',
                arrowColor: '#007AFF',
                monthTextColor: '#2d4150',
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModal}>
            <Text style={styles.paymentTitle}>Payment Details</Text>
            
            <View style={styles.paymentSummary}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Property:</Text>
                <Text style={styles.paymentValue}>{property?.title}</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Nights:</Text>
                <Text style={styles.paymentValue}>{nights}</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Total:</Text>
                <Text style={styles.totalValue}>K{totalPrice.toLocaleString()}</Text>
              </View>
            </View>

            <Text style={styles.paymentMethodTitle}>Select Payment Method</Text>
            
            {['card', 'mobile', 'bank'].map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod === method && styles.paymentOptionSelected,
                ]}
                onPress={() => setSelectedPaymentMethod(method)}
              >
                <Ionicons 
                  name={method === 'card' ? 'card-outline' : method === 'mobile' ? 'phone-portrait-outline' : 'business-outline'} 
                  size={24} 
                  color="#007AFF" 
                />
                <Text style={styles.paymentOptionText}>
                  {method === 'card' ? 'Credit/Debit Card' : method === 'mobile' ? 'Mobile Money' : 'Bank Transfer'}
                </Text>
                {selectedPaymentMethod === method && (
                  <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}

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
  );
}

// Styles remain the same as before...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#717171',
    textAlign: 'center',
    marginTop: 10,
  },
  goBackButton: {
    backgroundColor: '#007AFF',
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
  propertyHeader: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  propertyInfo: {
    marginTop: 12,
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#717171',
    marginTop: 4,
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    color: '#222',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dateInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
  },
  dateValue: {
    fontSize: 16,
    color: '#222',
    marginTop: 2,
  },
  guestContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  guestLabel: {
    fontSize: 16,
    color: '#222',
  },
  guestControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestButtonDisabled: {
    borderColor: '#ccc',
  },
  guestCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModal: {
    backgroundColor: '#fff',
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
    color: '#222',
  },
  paymentModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  paymentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentSummary: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
  },
  paymentOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E8F2FF',
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#222',
    flex: 1,
    marginLeft: 12,
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
    backgroundColor: '#f0f0f0',
  },
  confirmPaymentButton: {
    backgroundColor: '#007AFF',
  },
  cancelPaymentText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmPaymentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  priceSummary: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  priceSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#222',
  },
  totalPriceRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 12,
    marginTop: 4,
  },
  totalPriceLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  totalPriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    marginHorizontal: 16,
    marginBottom: 30,
    padding: 16,
    borderRadius: 10,
    gap: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});