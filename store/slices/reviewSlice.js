// store/slices/reviewSlice.js
import httpClient from '../../services/httpClient';

// Helper for user-friendly errors
const getUserFriendlyError = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // Network errors
  if (error.message?.includes('Network') || error.message?.includes('network')) {
    return 'Network error. Please check your internet connection.';
  }
  
  // HTTP status codes
  if (error.status === 404) {
    return 'No reviews found for this property. Be the first to review!';
  }
  if (error.status === 401) {
    return 'Please login to submit a review.';
  }
  if (error.status === 403) {
    return 'You don\'t have permission to do this.';
  }
  if (error.status === 500) {
    return 'Server error. Please try again later.';
  }
  if (error.status === 400) {
    return 'Invalid data. Please check your input.';
  }
  if (error.status === 429) {
    return 'Too many requests. Please wait a moment.';
  }
  
  // Fallback
  return error.message || 'Something went wrong. Please try again.';
};

// Helper to create mock reviews
const createMockReviews = (propertyId) => {
  return [
    {
      id: `mock-1-${Date.now()}`,
      userId: 'user1',
      userName: 'John Doe',
      userType: 'client',
      rating: 4.5,
      comment: 'Great property! Very clean and comfortable. Would highly recommend! ⭐️⭐️⭐️⭐️',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: `mock-2-${Date.now()}`,
      userId: 'user2',
      userName: 'Jane Smith',
      userType: 'client',
      rating: 5,
      comment: 'Amazing experience! The host was very helpful and the location was perfect.',
      date: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: `mock-3-${Date.now()}`,
      userId: 'user3',
      userName: 'Mike Johnson',
      userType: 'agent',
      rating: 4,
      comment: 'Good property with great amenities. Would recommend.',
      date: new Date(Date.now() - 172800000).toISOString(),
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];
};

export const createReviewSlice = (set, get) => ({
  // State
  reviews: [],
  reviewError: null,
  isLoadingReviews: false,
  userReviews: [],
  isLoadingUserReviews: false,

  // Load reviews for a property
  loadReviews: async (propertyId) => {
    console.log('🔄 loadReviews called with propertyId:', propertyId);
    
    if (!propertyId) {
      const errorMsg = 'Property ID is required';
      set({ isLoadingReviews: false, reviewError: errorMsg });
      
      // Show toast if available
      const { showError } = get().toast || {};
      if (showError) showError(errorMsg);
      
      return [];
    }

    set({ isLoadingReviews: true, reviewError: null });
    
    try {
      const url = `/properties/${propertyId}/reviews`;
      console.log('📡 Calling API:', url);
      
      const response = await httpClient.get(url);
      console.log('✅ API Response:', response.data);
      
      const reviews = response.data?.reviews || response.data?.data?.reviews || [];
      const averageRating = response.data?.averageRating || response.data?.data?.averageRating || 0;
      
      set((currentState) => {
        const updatedProperties = currentState.properties.map((prop) => {
          if (prop.id === propertyId || prop._id === propertyId) {
            return {
              ...prop,
              reviews: reviews,
              rating: averageRating || prop.rating || 0,
              reviewCount: reviews.length,
            };
          }
          return prop;
        });
        return {
          properties: updatedProperties,
          reviews: reviews,
          isLoadingReviews: false,
          reviewError: null,
        };
      });
      
      // Show success toast if reviews loaded
      if (reviews.length > 0) {
        const { showSuccess } = get().toast || {};
        if (showSuccess) showSuccess(`✅ ${reviews.length} reviews loaded`);
      }
      
      return reviews;
      
    } catch (error) {
      console.error('❌ Load reviews error:', error);
      
      // Handle 404 with mock data
      if (error.status === 404) {
        console.warn(`⚠️ Using MOCK reviews for property: ${propertyId}`);
        
        const mockReviews = createMockReviews(propertyId);
        const avgRating = mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length;
        
        set((currentState) => {
          const updatedProperties = currentState.properties.map((prop) => {
            if (prop.id === propertyId || prop._id === propertyId) {
              return {
                ...prop,
                reviews: mockReviews,
                rating: parseFloat(avgRating.toFixed(1)),
                reviewCount: mockReviews.length,
              };
            }
            return prop;
          });
          
          return {
            properties: updatedProperties,
            reviews: mockReviews,
            isLoadingReviews: false,
            reviewError: null,
          };
        });
        
        // Show info toast about mock data
        const { showInfo } = get().toast || {};
        if (showInfo) showInfo('📝 Showing sample reviews');
        
        return mockReviews;
      }
      
      // User-friendly error message
      const userFriendlyError = getUserFriendlyError(error);
      
      // Show error toast
      const { showError } = get().toast || {};
      if (showError) showError(userFriendlyError);
      
      set({ 
        reviewError: userFriendlyError,
        isLoadingReviews: false 
      });
      throw error;
    }
  },

  // Add a review
  addReview: async (propertyId, reviewData) => {
    console.log('📝 Adding review for property:', propertyId, reviewData);
    
    set({ isLoadingReviews: true, reviewError: null });
    
    try {
      const response = await httpClient.post(`/properties/${propertyId}/reviews`, reviewData);
      const newReview = response.data?.review || response.data?.data?.review || response.data;
      
      console.log('✅ Review added:', newReview);
      
      // Show success toast
      const { showSuccess } = get().toast || {};
      if (showSuccess) showSuccess('✅ Review submitted successfully!');

      set((currentState) => {
        const updatedProperties = currentState.properties.map((prop) => {
          if (prop.id === propertyId || prop._id === propertyId) {
            const updatedReviews = [...(prop.reviews || []), newReview];
            const total = updatedReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
            const avg = updatedReviews.length > 0 ? total / updatedReviews.length : 0;
            return {
              ...prop,
              reviews: updatedReviews,
              rating: parseFloat(avg.toFixed(1)),
              reviewCount: updatedReviews.length,
            };
          }
          return prop;
        });

        const currentUser = currentState.user;
        if (currentUser && newReview.userId === currentUser.id) {
          return {
            properties: updatedProperties,
            reviews: [...currentState.reviews, newReview],
            userReviews: [...(currentState.userReviews || []), newReview],
            isLoadingReviews: false,
            reviewError: null,
          };
        }

        return {
          properties: updatedProperties,
          reviews: [...currentState.reviews, newReview],
          isLoadingReviews: false,
          reviewError: null,
        };
      });

      return newReview;
      
    } catch (error) {
      console.error('❌ Add review error:', error);
      
      const userFriendlyError = getUserFriendlyError(error);
      const { showError } = get().toast || {};
      if (showError) showError(userFriendlyError);
      
      set({ 
        reviewError: userFriendlyError,
        isLoadingReviews: false 
      });
      throw error;
    }
  },

  // Edit/Update a review
  updateReview: async (propertyId, reviewId, reviewData) => {
    console.log('✏️ Updating review:', reviewId, reviewData);
    
    set({ isLoadingReviews: true, reviewError: null });
    
    try {
      const response = await httpClient.put(`/properties/${propertyId}/reviews/${reviewId}`, reviewData);
      const updatedReview = response.data?.review || response.data?.data?.review || response.data;
      
      console.log('✅ Review updated:', updatedReview);
      
      const { showSuccess } = get().toast || {};
      if (showSuccess) showSuccess('✏️ Review updated successfully!');
      
      set((currentState) => {
        const updatedProperties = currentState.properties.map((prop) => {
          if (prop.id === propertyId || prop._id === propertyId) {
            const updatedReviews = prop.reviews?.map(r => 
              (r.id === reviewId || r._id === reviewId) ? { ...r, ...updatedReview } : r
            ) || [];
            const total = updatedReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
            const avg = updatedReviews.length > 0 ? total / updatedReviews.length : 0;
            return {
              ...prop,
              reviews: updatedReviews,
              rating: parseFloat(avg.toFixed(1)),
              reviewCount: updatedReviews.length,
            };
          }
          return prop;
        });

        const updatedReviews = currentState.reviews.map(r => 
          (r.id === reviewId || r._id === reviewId) ? { ...r, ...updatedReview } : r
        );

        const updatedUserReviews = (currentState.userReviews || []).map(r => 
          (r.id === reviewId || r._id === reviewId) ? { ...r, ...updatedReview } : r
        );

        return {
          properties: updatedProperties,
          reviews: updatedReviews,
          userReviews: updatedUserReviews,
          isLoadingReviews: false,
          reviewError: null,
        };
      });

      return updatedReview;
      
    } catch (error) {
      console.error('❌ Update review error:', error);
      
      const userFriendlyError = getUserFriendlyError(error);
      const { showError } = get().toast || {};
      if (showError) showError(userFriendlyError);
      
      set({ 
        reviewError: userFriendlyError,
        isLoadingReviews: false 
      });
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (propertyId, reviewId) => {
    console.log('🗑️ Deleting review:', reviewId);
    
    set({ isLoadingReviews: true, reviewError: null });
    
    try {
      await httpClient.delete(`/properties/${propertyId}/reviews/${reviewId}`);
      
      console.log('✅ Review deleted');
      
      const { showSuccess } = get().toast || {};
      if (showSuccess) showSuccess('🗑️ Review deleted successfully');
      
      set((currentState) => {
        const updatedProperties = currentState.properties.map((prop) => {
          if (prop.id === propertyId || prop._id === propertyId) {
            const updatedReviews = prop.reviews?.filter(r => r.id !== reviewId && r._id !== reviewId) || [];
            const total = updatedReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
            const avg = updatedReviews.length > 0 ? total / updatedReviews.length : 0;
            return {
              ...prop,
              reviews: updatedReviews,
              rating: parseFloat(avg.toFixed(1)),
              reviewCount: updatedReviews.length,
            };
          }
          return prop;
        });

        const filteredReviews = currentState.reviews.filter(r => r.id !== reviewId && r._id !== reviewId);
        const filteredUserReviews = (currentState.userReviews || []).filter(r => r.id !== reviewId && r._id !== reviewId);

        return {
          properties: updatedProperties,
          reviews: filteredReviews,
          userReviews: filteredUserReviews,
          isLoadingReviews: false,
          reviewError: null,
        };
      });
      
    } catch (error) {
      console.error('❌ Delete review error:', error);
      
      const userFriendlyError = getUserFriendlyError(error);
      const { showError } = get().toast || {};
      if (showError) showError(userFriendlyError);
      
      set({ 
        reviewError: userFriendlyError,
        isLoadingReviews: false 
      });
      throw error;
    }
  },

  // Load user's reviews (for profile)
  loadUserReviews: async (userId) => {
    console.log('👤 Loading user reviews for:', userId);
    
    set({ isLoadingUserReviews: true, reviewError: null });
    
    try {
      const response = await httpClient.get(`/users/${userId}/reviews`);
      const userReviews = response.data?.reviews || [];
      
      set({
        userReviews: userReviews,
        isLoadingUserReviews: false,
        reviewError: null,
      });
      
      return userReviews;
      
    } catch (error) {
      console.error('❌ Load user reviews error:', error);
      
      const userFriendlyError = getUserFriendlyError(error);
      const { showError } = get().toast || {};
      if (showError) showError(userFriendlyError);
      
      set({ 
        reviewError: userFriendlyError,
        isLoadingUserReviews: false 
      });
      throw error;
    }
  },

  clearReviewError: () => set({ reviewError: null }),
});