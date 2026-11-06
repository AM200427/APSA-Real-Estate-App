// store/slices/uiSlice.js
export const createUISlice = (set, get) => ({
  // State
  isLoading: false,
  isModalVisible: false,
  modalContent: null,
  alertConfig: null,
  isAlertVisible: false,
  theme: 'light',
  
  // ✅ New flag
  hasSeenWelcome: false,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  
  showModal: (content) => set({ 
    isModalVisible: true, 
    modalContent: content 
  }),
  
  hideModal: () => set({ 
    isModalVisible: false, 
    modalContent: null 
  }),

  showAlert: (config) => set({ 
    isAlertVisible: true, 
    alertConfig: config 
  }),
  
  hideAlert: () => set({ 
    isAlertVisible: false, 
    alertConfig: null 
  }),
  
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),

  // ✅ New action
  setHasSeenWelcome: (value) => set({ hasSeenWelcome: value }),
});