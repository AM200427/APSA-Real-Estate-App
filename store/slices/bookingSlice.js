// store/slices/bookingSlice.js
import BookingService from '../../services/bookingService';

export const createBookingSlice = (set, get) => ({
  // State
  bookings: [],
  currentBooking: null,
  isLoading: false,
  bookingError: null,

  // ✅ Load bookings (keeps local data if backend fails)
  loadBookings: async () => {
    set({ isLoading: true, bookingError: null });
    try {
      const result = await BookingService.getMyBookings();

      if (result.success && result.bookings?.length > 0) {
        // Merge backend with existing local bookings
        const existingLocal = get().bookings.filter((b) => b.isLocal);
        const backendBookings = result.bookings;

        // Deduplicate by id
        const merged = [
          ...backendBookings,
          ...existingLocal.filter(
            (lb) => !backendBookings.some((bb) => bb.id === lb.id)
          ),
        ];

        set({ bookings: merged, isLoading: false });
      } else {
        // ✅ Backend returned nothing – KEEP local bookings
        console.log('⚠️ No bookings from backend, keeping local data');
        set({ isLoading: false });
      }
    } catch (error) {
      console.log('⚠️ Failed to load bookings, keeping local data');
      set({ isLoading: false });
    }
  },

  // ✅ Create booking with local flag
  createBooking: async (bookingData) => {
    set({ isLoading: true, bookingError: null });
    try {
      const newBooking = {
        id: `local-${Date.now().toString()}`,
        ...bookingData,
        status: 'confirmed',
        isLocal: true,   // ✅ Marked as local so merge knows
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        bookings: [newBooking, ...state.bookings],
        currentBooking: newBooking,
        isLoading: false,
      }));

      console.log('✅ Booking saved to store:', newBooking.id);
      return { success: true, booking: newBooking };
    } catch (error) {
      set({
        bookingError: 'Failed to create booking',
        isLoading: false,
      });
      return { success: false };
    }
  },

  cancelBooking: async (bookingId) => {
  set({ isLoading: true });
  try {
    // ✅ ONLY send to backend if it's a real database ID (not a local fallback)
    if (!String(bookingId).startsWith('local-')) {
      try {
        await BookingService.cancelBooking(bookingId);
      } catch (e) {
        console.log('⚠️ Backend cancel failed, falling back to local update');
      }
    } else {
      console.log('📦 Local booking detected, skipping backend call');
    }

    // ✅ Always update locally
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ),
      isLoading: false,
    }));

    console.log('✅ Booking cancelled locally:', bookingId);
    return { success: true };
  } catch (error) {
    console.log('❌ Cancel error:', error);
    set({ isLoading: false });
    return { success: false, error: error.message };
  }
},

  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  clearCurrentBooking: () => set({ currentBooking: null }),
});