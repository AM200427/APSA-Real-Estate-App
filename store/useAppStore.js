// store/useAppStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAuthSlice } from './slices/authSlice';
import { createPropertySlice } from './slices/propertySlice';
import { createBookingSlice } from './slices/bookingSlice';
import { createWishlistSlice } from './slices/wishlistSlice';
import { createUISlice } from './slices/uiSlice';
import { createReviewSlice } from './slices/reviewSlice';
import { createSearchSlice } from './slices/searchSlice';
import { createMessagesSlice } from './slices/messagesSlice';
import { createNotificationsSlice } from './slices/notificationsSlice';
import { createPaymentsSlice } from './slices/paymentsSlice';

// ✅ Inline preferences slice
const PREFERENCES_KEY = 'appPreferences';

const defaultPreferences = {
  pushNotifications: true,
  emailNotifications: true,
  marketingEmails: false,
  bookingAlerts: true,
  messageAlerts: true,
  propertyUpdates: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

const createPreferencesSlice = (set, get) => ({
  preferences: defaultPreferences,
  preferencesLoaded: false,

  loadPreferences: async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          preferences: { ...defaultPreferences, ...parsed },
          preferencesLoaded: true,
        });
      } else {
        set({ preferencesLoaded: true });
      }
    } catch (error) {
      console.log('Error loading preferences:', error);
      set({ preferencesLoaded: true });
    }
  },

  setPreference: async (key, value) => {
    const updated = { ...get().preferences, [key]: value };
    set({ preferences: updated });
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.log('Error saving preferences:', error);
    }
  },

  updatePreferences: async (partial) => {
    const updated = { ...get().preferences, ...partial };
    set({ preferences: updated });
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.log('Error saving preferences:', error);
    }
  },

  resetPreferences: async () => {
    set({ preferences: defaultPreferences });
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(defaultPreferences));
    } catch (error) {
      console.log('Error resetting preferences:', error);
    }
  },
});

export const useAppStore = create(
  persist(
    (...args) => {
      const store = {
        ...createAuthSlice(...args),
        ...createPropertySlice(...args),
        ...createBookingSlice(...args),
        ...createWishlistSlice(...args),
        ...createUISlice(...args),
        ...createReviewSlice(...args),
        ...createSearchSlice(...args),
        ...createPreferencesSlice(...args),
        ...createMessagesSlice(...args),
        ...createNotificationsSlice(...args),
        ...createPaymentsSlice(...args),   // ✅ new
      };

      console.log('✅ Store ready. loadPreferences:', typeof store.loadPreferences);
      return store;
    },
    {
      name: 'apsa-store',
      storage: createJSONStorage(() => AsyncStorage),

      // ✅ Only persist these keys (skip transient ones)
      partialize: (state) => ({
        // Auth
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        authToken: state.authToken,

        // Properties
        properties: state.properties,
        myProperties: state.myProperties,
        featuredProperties: state.featuredProperties,

        // Wishlist & Bookings
        wishlist: state.wishlist,
        bookings: state.bookings,

        // Reviews
        reviews: state.reviews,

        // Chat — persist both conversations list AND per-chat messages
        conversations: state.conversations,
        messages: state.messages,

        // Notifications
        notifications: state.notifications,

        // Payments
        paymentMethods: state.paymentMethods,
        transactions: state.transactions,

        // Preferences
        preferences: state.preferences,

        // Welcome state
        hasSeenWelcome: state.hasSeenWelcome,
      }),

      // ✅ Log when data is loaded from storage
      onRehydrateStorage: () => (state) => {
        console.log('💾 Store rehydrated from AsyncStorage');
        if (state) {
          console.log('📦 Loaded:', {
            user: state.user?.email || 'none',
            isLoggedIn: state.isLoggedIn,
            propertiesCount: state.properties?.length || 0,
            myPropertiesCount: state.myProperties?.length || 0,
            wishlistCount: state.wishlist?.length || 0,
            bookingsCount: state.bookings?.length || 0,
            conversationsCount: state.conversations?.length || 0,
            notificationsCount: state.notifications?.length || 0,
            paymentMethodsCount: state.paymentMethods?.length || 0,
            transactionsCount: state.transactions?.length || 0,
          });
        }
      },
    }
  )
);

// ✅ Add a global reset helper (useful for testing)
export const resetAppStore = async () => {
  try {
    await AsyncStorage.clear();
    useAppStore.persist.clearStorage();
    useAppStore.setState({
      user: null,
      isLoggedIn: false,
      authToken: null,
      properties: [],
      myProperties: [],
      featuredProperties: [],
      wishlist: [],
      bookings: [],
      reviews: [],
      conversations: [],
      messages: {},
      notifications: [],
      paymentMethods: [],
      transactions: [],
      hasSeenWelcome: false,
    });
    console.log('🔄 App store reset');
  } catch (error) {
    console.log('Error resetting store:', error);
  }
};