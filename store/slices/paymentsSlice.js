// store/slices/paymentsSlice.js
import axios from 'axios';

const API_URL = 'http://192.168.1.195:5000/api';

const getAuthToken = () => {
  try {
    const { useAppStore } = require('../useAppStore');
    return useAppStore?.getState?.()?.authToken || null;
  } catch {
    return null;
  }
};

export const createPaymentsSlice = (set, get) => ({
  // State
  paymentMethods: [],
  transactions: [],
  paymentsLoading: false,
  paymentsError: null,

  // ---------- Load payment methods ----------
  loadPaymentMethods: async () => {
    set({ paymentsLoading: true, paymentsError: null });
    const token = getAuthToken();

    if (token) {
      try {
        const response = await axios.get(`${API_URL}/payments/methods`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = response.data?.methods || [];
        set({ paymentMethods: list, paymentsLoading: false });
        return { success: true, synced: true };
      } catch (err) {
        console.log(
          '⚠️ loadPaymentMethods failed (keeping local):',
          err.response?.data || err.message
        );
      }
    }

    set({ paymentsLoading: false });
    return { success: true, synced: false };
  },

  // ---------- Load transactions ----------
  loadTransactions: async () => {
    set({ paymentsLoading: true, paymentsError: null });
    const token = getAuthToken();

    if (token) {
      try {
        const response = await axios.get(`${API_URL}/payments/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = response.data?.transactions || [];
        set({ transactions: list, paymentsLoading: false });
        return { success: true, synced: true };
      } catch (err) {
        console.log(
          '⚠️ loadTransactions failed (keeping local):',
          err.response?.data || err.message
        );
      }
    }

    set({ paymentsLoading: false });
    return { success: true, synced: false };
  },

  // ---------- Add payment method ----------
  addPaymentMethod: async (payload) => {
    const newMethod = {
      id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      isDefault: (get().paymentMethods || []).length === 0,
      createdAt: new Date().toISOString(),
      ...payload,
    };

    set((state) => ({
      paymentMethods: [...state.paymentMethods, newMethod],
    }));

    const token = getAuthToken();
    if (token) {
      try {
        await axios.post(`${API_URL}/payments/methods`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.log(
          '⚠️ addPaymentMethod sync failed (local kept):',
          err.response?.data || err.message
        );
      }
    }

    return { success: true, method: newMethod };
  },

  // ---------- Remove payment method ----------
  removePaymentMethod: async (id) => {
    if (!id) return { success: false };

    const removed = (get().paymentMethods || []).find((p) => p.id === id);

    set((state) => ({
      paymentMethods: state.paymentMethods.filter((p) => p.id !== id),
    }));

    const remaining = get().paymentMethods || [];
    if (
      removed?.isDefault &&
      remaining.length > 0 &&
      !remaining.some((p) => p.isDefault)
    ) {
      set({
        paymentMethods: remaining.map((p, i) =>
          i === 0 ? { ...p, isDefault: true } : p
        ),
      });
    }

    const token = getAuthToken();
    if (token) {
      try {
        await axios.delete(`${API_URL}/payments/methods/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.log(
          '⚠️ removePaymentMethod sync failed (local kept):',
          err.response?.data || err.message
        );
      }
    }

    return { success: true };
  },

  // ---------- Set default ----------
  setDefaultPaymentMethod: (id) => {
    set((state) => ({
      paymentMethods: state.paymentMethods.map((p) => ({
        ...p,
        isDefault: p.id === id,
      })),
    }));
  },
});