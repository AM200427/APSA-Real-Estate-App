// services/propertyService.js
import httpClient from './httpClient';
import { ENDPOINTS } from './config';

const PropertyService = {
  // Get all properties with filters
  getProperties: async (filters = {}) => {
    try {
      const response = await httpClient.get(ENDPOINTS.PROPERTIES.ALL, {
        params: filters,
      });
      
      return {
        success: true,
        properties: response.data.properties || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        totalPages: response.data.totalPages || 1,
      };
    } catch (error) {
      console.log('❌ Get Properties Error:', error);
      return {
        success: false,
        properties: [],
        message: error.message || 'Failed to fetch properties',
      };
    }
  },

  // Get featured properties
  getFeaturedProperties: async (limit = 5) => {
    try {
      const response = await httpClient.get(ENDPOINTS.PROPERTIES.FEATURED, {
        params: { limit },
      });
      
      return {
        success: true,
        properties: response.data.properties || [],
      };
    } catch (error) {
      console.log('❌ Get Featured Properties Error:', error);
      return {
        success: false,
        properties: [],
        message: error.message || 'Failed to fetch featured properties',
      };
    }
  },

  // Get property by ID
  getPropertyById: async (id) => {
    try {
      const response = await httpClient.get(ENDPOINTS.PROPERTIES.DETAILS(id));
      
      return {
        success: true,
        property: response.data.property,
      };
    } catch (error) {
      console.log('❌ Get Property Error:', error);
      return {
        success: false,
        property: null,
        message: error.message || 'Property not found',
      };
    }
  },

  // Search properties
  searchProperties: async (query, filters = {}) => {
    try {
      const response = await httpClient.get(ENDPOINTS.PROPERTIES.SEARCH, {
        params: { q: query, ...filters },
      });
      
      return {
        success: true,
        properties: response.data.properties || [],
      };
    } catch (error) {
      console.log('❌ Search Properties Error:', error);
      return {
        success: false,
        properties: [],
        message: error.message || 'Search failed',
      };
    }
  },

  // Create property listing
  createProperty: async (propertyData) => {
    try {
      let data = propertyData;

      if (propertyData.images && propertyData.images.length > 0) {
        const formData = new FormData();
        
        // Append all text fields
        Object.keys(propertyData).forEach((key) => {
          if (key !== 'images') {
            formData.append(key, propertyData[key]);
          }
        });
        
        // Append the images safely
        propertyData.images.forEach((image, index) => {
          let imageString = image;
          while (Array.isArray(imageString)) imageString = imageString[0];
          if (imageString && typeof imageString === 'object' && imageString.uri) {
            imageString = imageString.uri;
          }

          if (typeof imageString === 'string' && imageString.length > 5) {
            formData.append('images', {
              uri: imageString,
              type: 'image/jpeg',
              name: `property_${Date.now()}_${index}.jpg`,
            });
          }
        });
        
        data = formData;
        // 🔥 No headers are set here. Axios will automatically set the correct multipart boundary.
      }

      const response = await httpClient.post(ENDPOINTS.PROPERTIES.CREATE, data);
      
      return {
        success: true,
        property: response.data.property,
      };
    } catch (error) {
      console.log('❌ Create Property Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create property',
      };
    }
  },

  // Update property
  updateProperty: async (id, propertyData) => {
    try {
      // 🔥 No manual headers. Axios handles JSON vs FormData automatically.
      const response = await httpClient.put(ENDPOINTS.PROPERTIES.UPDATE(id), propertyData);
      
      return {
        success: true,
        property: response.data.property,
      };
    } catch (error) {
      console.log('❌ Update Property Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update property',
      };
    }
  },

  // Delete property
  deleteProperty: async (id) => {
    try {
      await httpClient.delete(ENDPOINTS.PROPERTIES.DELETE(id));
      return { success: true };
    } catch (error) {
      console.log('❌ Delete Property Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete property',
      };
    }
  },

  // Get user's properties
  getMyProperties: async () => {
    try {
      const response = await httpClient.get(ENDPOINTS.PROPERTIES.MY_LISTINGS);
      
      return {
        success: true,
        properties: response.data.properties || [],
      };
    } catch (error) {
      console.log('❌ Get My Properties Error:', error);
      return {
        success: false,
        properties: [],
        message: error.message || 'Failed to fetch your properties',
      };
    }
  },
};

export default PropertyService;