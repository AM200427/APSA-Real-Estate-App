// services/wishlistService.js
import httpClient from './httpClient';
import { ENDPOINTS } from './config';

const WishlistService = {
  // Get wishlist
  getWishlist: async () => {
    try {
      const response = await httpClient.get(ENDPOINTS.WISHLIST.ALL);
      
      return {
        success: true,
        wishlist: response.data.wishlist || [],
      };
    } catch (error) {
      console.log('❌ Get Wishlist Error:', error);
      return {
        success: false,
        wishlist: [],
        message: error.message || 'Failed to fetch wishlist',
      };
    }
  },

  // Add to wishlist
    // Add to wishlist
  addToWishlist: async (property) => { // <--- 1. Change argument name to 'property'
    try {
      // 2. Send { property: property } instead of { propertyId }
      const response = await httpClient.post(ENDPOINTS.WISHLIST.ADD, { property });
      
      return {
        success: true,
        wishlist: response.data.wishlist,
      };
    } catch (error) {
      console.log('❌ Add to Wishlist Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to add to wishlist',
      };
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (propertyId) => {
    try {
      const response = await httpClient.delete(ENDPOINTS.WISHLIST.REMOVE(propertyId));
      
      return {
        success: true,
        wishlist: response.data.wishlist,
      };
    } catch (error) {
      console.log('❌ Remove from Wishlist Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to remove from wishlist',
      };
    }
  },

  // Check if property is in wishlist
  isInWishlist: async (propertyId) => {
    try {
      const response = await httpClient.get(ENDPOINTS.WISHLIST.CHECK(propertyId));
      
      return {
        success: true,
        isInWishlist: response.data.isInWishlist || false,
      };
    } catch (error) {
      console.log('❌ Check Wishlist Error:', error);
      return {
        success: false,
        isInWishlist: false,
      };
    }
  },

  // Toggle wishlist (add/remove)
    // Toggle wishlist (add/remove)
  toggleWishlist: async (property) => { // <--- 2. Change argument name to 'property'
    try {
      const checkResult = await WishlistService.isInWishlist(property.id);
      
      if (checkResult.success && checkResult.isInWishlist) {
        return await WishlistService.removeFromWishlist(property.id);
      } else {
        return await WishlistService.addToWishlist(property); // <--- Pass the full object here
      }
    } catch (error) {
      console.log('❌ Toggle Wishlist Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to toggle wishlist',
      };
    }
  },
};

export default WishlistService;