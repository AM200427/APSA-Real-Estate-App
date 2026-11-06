// services/bookingService.js
import httpClient from './httpClient';
import { ENDPOINTS } from './config';

const BookingService = {
  // Create a booking
  createBooking: async (bookingData) => {
    try {
      const response = await httpClient.post(ENDPOINTS.BOOKINGS.CREATE, bookingData);
      
      return {
        success: true,
        booking: response.data.booking,
      };
    } catch (error) {
      console.log('❌ Create Booking Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create booking',
      };
    }
  },

  // Get user's bookings
  getMyBookings: async () => {
    try {
      const response = await httpClient.get(ENDPOINTS.BOOKINGS.MY_BOOKINGS);
      
      return {
        success: true,
        bookings: response.data.bookings || [],
      };
    } catch (error) {
      console.log('❌ Get My Bookings Error:', error);
      return {
        success: false,
        bookings: [],
        message: error.message || 'Failed to fetch bookings',
      };
    }
  },

  // Get booking by ID
  getBookingById: async (id) => {
    try {
      const response = await httpClient.get(ENDPOINTS.BOOKINGS.DETAILS(id));
      
      return {
        success: true,
        booking: response.data.booking,
      };
    } catch (error) {
      console.log('❌ Get Booking Error:', error);
      return {
        success: false,
        booking: null,
        message: error.message || 'Booking not found',
      };
    }
  },

  // Cancel booking
  cancelBooking: async (id) => {
    try {
      const response = await httpClient.put(ENDPOINTS.BOOKINGS.CANCEL(id));
      
      return {
        success: true,
        booking: response.data.booking,
      };
    } catch (error) {
      console.log('❌ Cancel Booking Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to cancel booking',
      };
    }
  },

  // Update booking status (for hosts)
  updateBookingStatus: async (id, status) => {
    try {
      const response = await httpClient.put(`/bookings/${id}/status`, { status });
      
      return {
        success: true,
        booking: response.data.booking,
      };
    } catch (error) {
      console.log('❌ Update Booking Status Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update booking',
      };
    }
  },

  // Get host bookings
  getHostBookings: async () => {
    try {
      const response = await httpClient.get('/bookings/host');
      
      return {
        success: true,
        bookings: response.data.bookings || [],
      };
    } catch (error) {
      console.log('❌ Get Host Bookings Error:', error);
      return {
        success: false,
        bookings: [],
        message: error.message || 'Failed to fetch host bookings',
      };
    }
  },
};

export default BookingService;