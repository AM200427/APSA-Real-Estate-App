// services/config.js
// ============================================
// ⚠️ IMPORTANT: Change this URL to match your backend
// ============================================

// For Android Emulator (backend running on your computer)
export const API_BASE_URL = 'http://192.168.1.195:5000/api'; // Replace with your computer's IP address and port

// For iOS Simulator
// export const API_BASE_URL = 'http://localhost:5000/api';

// For Physical Device (use your computer's IP address)
// export const API_BASE_URL = 'http://192.168.1.100:5000/api';

// For Production (your deployed backend)
// export const API_BASE_URL = 'https://your-api-domain.com/api';
// 🔍 Add this debug log to verify
console.log('🌐 API_BASE_URL:', API_BASE_URL);

// ============================================
// Storage Keys - Used to save data on the device
// ============================================
export const STORAGE_KEYS = {
  TOKEN: 'authToken',
  USER: 'userData',
  WISHLIST: 'wishlist',
  BOOKINGS: 'bookings',
};

// ============================================
// API Endpoints - All the URLs your app will call
// ============================================
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  
  // Properties
  PROPERTIES: {
    ALL: '/properties',
    FEATURED: '/properties/featured',
    SEARCH: '/properties/search',
    MY_LISTINGS: '/properties/my-listings',
    CREATE: '/properties',
    UPDATE: (id) => `/properties/${id}`,
    DELETE: (id) => `/properties/${id}`,
    DETAILS: (id) => `/properties/${id}`,
  },
  
  // Bookings
  BOOKINGS: {
    ALL: '/bookings',
    MY_BOOKINGS: '/bookings/my-bookings',
    CREATE: '/bookings',
    CANCEL: (id) => `/bookings/${id}/cancel`,
    DETAILS: (id) => `/bookings/${id}`,
  },
  
  // Wishlist
  WISHLIST: {
    ALL: '/wishlist',
    ADD: '/wishlist',
    REMOVE: (id) => `/wishlist/${id}`,
    CHECK: (id) => `/wishlist/check/${id}`,
  },
  
  // Payments
  PAYMENTS: {
    CREATE: '/payments',
    VERIFY: (id) => `/payments/${id}/verify`,
  },
};
