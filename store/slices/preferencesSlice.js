// store/slices/preferencesSlice.js

console.log('✅ preferencesSlice.js is being loaded!');
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'appPreferences';

const defaultPreferences = {
  pushNotifications: true,
  emailNotifications: true,
  marketingEmails: false,
  bookingAlerts: true,
  messageAlerts: true,
  propertyUpdates: true,
  soundEnabled: true,
  vibrationEnabled: true,
   textSize: 'medium',
  boldText: false,
  highContrast: false,
  reduceMotion: false,
  screenReader: false,
  captions: false,
};

export const createPreferencesSlice = (set, get) => ({
  preferences: defaultPreferences,
  preferencesLoaded: false,

  // Load preferences from AsyncStorage
  loadPreferences: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
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

  // Update a single preference
  setPreference: async (key, value) => {
    const updated = { ...get().preferences, [key]: value };
    set({ preferences: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.log('Error saving preferences:', error);
    }
  },

  // Update multiple preferences at once
  updatePreferences: async (partial) => {
    const updated = { ...get().preferences, ...partial };
    set({ preferences: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.log('Error saving preferences:', error);
    }
  },

  // Reset to defaults
  resetPreferences: async () => {
    set({ preferences: defaultPreferences });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPreferences));
    } catch (error) {
      console.log('Error resetting preferences:', error);
    }
  },
});
