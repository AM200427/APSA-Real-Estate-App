// store/slices/notificationsSlice.js
export const createNotificationsSlice = (set, get) => ({
  notifications: [],      // [{ id, type, title, message, time, read }]

  // Add a notification — used by other actions (new booking, new message, etc.)
  addNotification: (notification) => {
    const entry = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: 'system',
      title: '',
      message: '',
      time: 'Just now',
      read: false,
      createdAt: new Date().toISOString(),
      ...notification,
    };
    set((state) => ({ notifications: [entry, ...state.notifications] }));
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  clearNotifications: () => set({ notifications: [] }),

  getUnreadCount: () =>
    get().notifications.filter((n) => !n.read).length,
});