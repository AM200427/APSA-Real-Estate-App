// services/authService.js
import httpClient from './httpClient';
import Storage from './storage';
import { ENDPOINTS } from './config';

const AuthService = {
  login: async (email, password) => {
    try {
      const response = await httpClient.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      if (response.data.success) {
        await Storage.setItem('authToken', response.data.token);
        await Storage.setItem('userData', response.data.user);
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
        };
      }
      return {
        success: false,
        message: response.data.message || 'Login failed',
      };
    } catch (error) {
      console.log('❌ Login Error:', error);
      return {
        success: false,
        message: error.message || 'Login failed',
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await httpClient.post(ENDPOINTS.AUTH.REGISTER, userData);

      if (response.data.success) {
        await Storage.setItem('authToken', response.data.token);
        await Storage.setItem('userData', response.data.user);
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
        };
      }
      return {
        success: false,
        message: response.data.message || 'Registration failed',
      };
    } catch (error) {
      console.log('❌ Register Error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed',
      };
    }
  },

  logout: async () => {
    try {
      await Storage.removeItem('authToken');
      await Storage.removeItem('userData');
      return { success: true };
    } catch (error) {
      console.log('❌ Logout Error:', error);
      return { success: false };
    }
  },

  getCurrentUser: async () => {
    try {
      const result = await Storage.getItem('userData');
      if (result.success && result.data) {
        return {
          success: true,
          user: result.data,
        };
      }
      return { success: false, user: null };
    } catch (error) {
      console.log('❌ Get User Error:', error);
      return { success: false, user: null };
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await httpClient.put(ENDPOINTS.AUTH.PROFILE, userData);

      if (response.data.success) {
        await Storage.setItem('userData', response.data.user);
        return {
          success: true,
          user: response.data.user,
        };
      }
      return {
        success: false,
        message: response.data.message || 'Update failed',
      };
    } catch (error) {
      console.log('❌ Update Profile Error:', error);
      return {
        success: false,
        message: error.message || 'Update failed',
      };
    }
  },
};

export default AuthService;