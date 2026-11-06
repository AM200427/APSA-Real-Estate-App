// store/slices/authSlice.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Define your API URL here (or import from config)
const API_URL = 'http://192.168.1.195:5000/api';

export const createAuthSlice = (set, get) => ({
  // State
  user: null,
  isLoggedIn: false,
  authToken: null,
  isLoading: false,
  authError: null,

  // ✅ LOGIN – integrated, no external service
  login: async (email, password) => {
    set({ isLoading: true, authError: null });
    try {
      console.log('🔐 Attempting login for:', email);

      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      console.log('📦 Login response:', response.data);

      const { token, user } = response.data;

      if (token) {
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));

        set({
          user: user,
          isLoggedIn: true,
          authToken: token,
          isLoading: false,
          authError: null,
        });

        console.log('✅ Login successful!');
        return { success: true };
      } else {
        set({ isLoading: false, authError: 'No token received' });
        return { success: false, message: 'No token received from server' };
      }
    } catch (error) {
      console.log('🔥 Login error:', error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.message || error.message || 'Login failed';
      set({ isLoading: false, authError: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  // ✅ REGISTER – integrated
  register: async (userData) => {
    set({ isLoading: true, authError: null });
    try {
      console.log('📝 Attempting registration for:', userData.email);

      const response = await axios.post(`${API_URL}/auth/register`, userData);
      console.log('📦 Register response:', response.data);

      const { token, user } = response.data;

      if (token) {
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));

        set({
          user: user,
          isLoggedIn: true,
          authToken: token,
          isLoading: false,
          authError: null,
        });

        return { success: true };
      } else {
        set({ isLoading: false });
        return { success: true, requiresLogin: true };
      }
    } catch (error) {
      console.log('🔥 Register error:', error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.message || error.message || 'Registration failed';
      set({ isLoading: false, authError: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  // ✅ UPDATE PROFILE — local-first, backend best-effort
  updateProfile: async (updates) => {
    const currentUser = get().user;

    if (!currentUser) {
      throw new Error('Not logged in');
    }

    const updatedUser = { ...currentUser, ...updates };

    set({ user: updatedUser });
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    } catch (storageError) {
      console.log('⚠️ Failed to persist user locally:', storageError);
    }

    const token = get().authToken;
    if (!token) {
      console.log('⚠️ No auth token — profile updated locally only');
      return { success: true, synced: false };
    }

    try {
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.user) {
        const serverUser = response.data.user;
        set({ user: serverUser });
        await AsyncStorage.setItem('userData', JSON.stringify(serverUser));
      }

      console.log('✅ Profile synced with backend');
      return { success: true, synced: true };
    } catch (error) {
      console.log(
        '⚠️ Backend profile update failed (local change kept):',
        error.response?.data || error.message
      );
      return { success: true, synced: false };
    }
  },

  // ✅ UPDATE AGENT PROFILE — local-first, backend best-effort
  updateAgentProfile: async (agentProfileUpdates) => {
    const currentUser = get().user;

    if (!currentUser) {
      throw new Error('Not logged in');
    }

    const currentAgentProfile = currentUser.agentProfile || {};
    const mergedAgentProfile = { ...currentAgentProfile, ...agentProfileUpdates };

    const updatedUser = { ...currentUser, agentProfile: mergedAgentProfile };

    set({ user: updatedUser });
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    } catch (storageError) {
      console.log('⚠️ Failed to persist agent profile locally:', storageError);
    }

    const token = get().authToken;
    if (!token) {
      console.log('⚠️ No auth token — agent profile updated locally only');
      return { success: true, synced: false };
    }

    try {
      const response = await axios.put(
        `${API_URL}/auth/agent-profile`,
        agentProfileUpdates,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.agentProfile) {
        const merged = { ...mergedAgentProfile, ...response.data.agentProfile };
        const serverUser = { ...get().user, agentProfile: merged };
        set({ user: serverUser });
        await AsyncStorage.setItem('userData', JSON.stringify(serverUser));
      }

      console.log('✅ Agent profile synced with backend');
      return { success: true, synced: true };
    } catch (error) {
      console.log(
        '⚠️ Backend agent profile update failed (local kept):',
        error.response?.data || error.message
      );
      return { success: true, synced: false };
    }
  },

  // ✅ NEW: UPDATE AGENT VERIFICATION — local-first, backend best-effort
  // Stores agent identity documents under user.agentVerification:
  // {
  //   nrcNumber, tpin, pacraNumber, licenseNumber,
  //   idFrontUri, idBackUri, selfieUri,
  //   status: 'unverified' | 'pending' | 'verified' | 'rejected',
  //   submittedAt, verifiedAt, rejectionReason
  // }
  updateAgentVerification: async (verificationData) => {
    const currentUser = get().user;

    if (!currentUser) {
      throw new Error('Not logged in');
    }

    const current = currentUser.agentVerification || {};
    const merged = { ...current, ...verificationData };

    const updatedUser = { ...currentUser, agentVerification: merged };

    // 1. Update local state + persist
    set({ user: updatedUser });
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    } catch (storageError) {
      console.log('⚠️ Failed to persist verification locally:', storageError);
    }

    // 2. Best-effort backend sync
    const token = get().authToken;
    if (!token) {
      console.log('⚠️ No auth token — verification updated locally only');
      return { success: true, synced: false };
    }

    try {
      const response = await axios.put(
        `${API_URL}/auth/agent-verification`,
        verificationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // If backend returns authoritative verification status, use it
      if (response.data?.agentVerification) {
        const serverMerged = {
          ...merged,
          ...response.data.agentVerification,
        };
        const serverUser = { ...get().user, agentVerification: serverMerged };
        set({ user: serverUser });
        await AsyncStorage.setItem('userData', JSON.stringify(serverUser));
      }

      console.log('✅ Agent verification synced with backend');
      return { success: true, synced: true };
    } catch (error) {
      console.log(
        '⚠️ Backend verification update failed (local kept):',
        error.response?.data || error.message
      );
      return { success: true, synced: false };
    }
  },

  // ✅ CHANGE PASSWORD — verifies with backend, keeps token in place
  changePassword: async (currentPassword, newPassword) => {
    const token = get().authToken;

    if (!token) {
      throw new Error('Not logged in');
    }

    try {
      await axios.put(
        `${API_URL}/auth/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ Password changed');
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to change password';
      console.log('🔥 Change password error:', message);
      throw new Error(message);
    }
  },

  // ✅ DELETE ACCOUNT
  deleteAccount: async () => {
    const token = get().authToken;

    try {
      if (token) {
        await axios.delete(`${API_URL}/auth/account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.log('⚠️ Backend account deletion failed:', error.message);
    }

    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    set({
      user: null,
      isLoggedIn: false,
      authToken: null,
      authError: null,
    });
    return { success: true };
  },

  // ✅ LOGOUT
  logout: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.log('Logout storage error:', error);
    }
    set({
      user: null,
      isLoggedIn: false,
      authToken: null,
      authError: null,
    });
  },
    // ✅ LOGOUT ALL DEVICES — logs out every session on the server
  logoutAllDevices: async () => {
    const token = get().authToken;

    if (!token) {
      throw new Error('Not logged in');
    }

    try {
      await axios.post(
        `${API_URL}/auth/logout-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ Logged out from all devices');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Could not log out from all devices';
      console.log('🔥 Logout all devices error:', message);
      throw new Error(message);
    }

    // On success, clear local session too
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    set({
      user: null,
      isLoggedIn: false,
      authToken: null,
      authError: null,
    });

    return { success: true };
  },

  // ✅ CHECK AUTH STATUS on app start
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          set({
            user,
            isLoggedIn: true,
            authToken: token,
            isLoading: false,
          });
          return { success: true };
        } catch (parseError) {
          console.log('Error parsing user data:', parseError);
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('userData');
          set({ isLoading: false });
          return { success: false };
        }
      } else {
        set({ isLoading: false });
        return { success: false };
      }
    } catch (error) {
      console.log('Check auth error:', error);
      set({ isLoading: false });
      return { success: false };
    }
  },

  // ✅ Clear error
  clearAuthError: () => set({ authError: null }),
});