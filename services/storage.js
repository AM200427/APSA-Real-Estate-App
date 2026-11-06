// services/storage.js
import * as SecureStore from 'expo-secure-store';

const Storage = {
  // Save data
  setItem: async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await SecureStore.setItemAsync(key, jsonValue);
      console.log(`✅ Saved ${key}`);
      return { success: true };
    } catch (error) {
      console.log(`❌ Error saving ${key}:`, error);
      return { success: false, error };
    }
  },

  // Get data
  getItem: async (key) => {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value) {
        console.log(`✅ Got ${key}`);
        return { success: true, data: JSON.parse(value) };
      }
      console.log(`ℹ️ ${key} not found`);
      return { success: true, data: null };
    } catch (error) {
      console.log(`❌ Error getting ${key}:`, error);
      return { success: false, error, data: null };
    }
  },

  // Remove data
  removeItem: async (key) => {
    try {
      await SecureStore.deleteItemAsync(key);
      console.log(`✅ Removed ${key}`);
      return { success: true };
    } catch (error) {
      console.log(`❌ Error removing ${key}:`, error);
      return { success: false, error };
    }
  },

  // Clear all data
  clearAll: async () => {
    try {
      const keys = ['authToken', 'userData', 'wishlist', 'bookings'];
      for (const key of keys) {
        await SecureStore.deleteItemAsync(key);
      }
      console.log('✅ Cleared all storage');
      return { success: true };
    } catch (error) {
      console.log('❌ Error clearing:', error);
      return { success: false, error };
    }
  },
};

export default Storage;