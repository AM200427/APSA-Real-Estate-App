// store/slices/wishlistSlice.js
import httpClient from '../../services/httpClient';

export const createWishlistSlice = (set, get) => ({
  wishlist: [],
  wishlistError: null,
  isLoading: false,

  toggleWishlist: async (property) => {
    console.log('🔄 Toggling wishlist for property:', property?.id);

    if (!property || !property.id) {
      console.error('❌ Invalid property:', property);
      set({ wishlistError: 'Invalid property data' });
      return;
    }

    const wasInWishlist = get().wishlist.some((item) => item.id === property.id);

    // 1. Update local state immediately (optimistic)
    set((state) => ({
      wishlist: wasInWishlist
        ? state.wishlist.filter((item) => item.id !== property.id)
        : [...state.wishlist, property],
      wishlistError: null,
    }));

    // 2. Sync with backend
    try {
      if (wasInWishlist) {
        // If we just removed it, tell backend to DELETE it
        await httpClient.delete(`/wishlist/${property.id}`);
        console.log('✅ Wishlist item removed from backend');
      } else {
        // If we just added it, tell backend to POST it
        const response = await httpClient.post('/wishlist', { property });
        console.log('✅ Wishlist item added to backend:', response.data);
      }
    } catch (error) {
      console.log('⚠️ Backend sync failed, local wishlist kept:', error?.message);
      set({ wishlistError: error?.message || 'Failed to sync wishlist' });
    }
  },

  isInWishlist: (propertyId) => {
    return get().wishlist.some((item) => item.id === propertyId);
  },

  loadWishlist: async () => {
    set({ isLoading: true, wishlistError: null });
    try {
      const response = await httpClient.get('/wishlist');
      const serverWishlist = response.data?.wishlist || [];

      // 🔥 THE FIX: Trust the server completely. 
      // If the server says it's empty, the phone goes empty.
      set({ wishlist: serverWishlist, isLoading: false });
      
      return serverWishlist;
    } catch (error) {
      console.log('⚠️ Load wishlist failed, keeping local data');
      set({ isLoading: false });
      // We don't clear on network error, but we don't add fake data either
    }
  },

  clearWishlist: () => set({ wishlist: [], wishlistError: null }),
});