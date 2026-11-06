// store/slices/propertySlice.js
import PropertyService from '../../services/propertyService';

// 🔥 1. THE IMAGE FIXER
// This automatically turns "/uploads/123.jpg" into "http://192.168.1.195:5000/uploads/123.jpg"
const fixImages = (prop) => {
  if (!prop) return prop;
  
  const BASE_URL = 'http://192.168.1.195:5000';
  let rawImages = prop.images || prop.image || [];
  if (!Array.isArray(rawImages)) rawImages = [rawImages];

  const flatImages = [];
  rawImages.forEach(img => {
    let validImg = img;
    while (Array.isArray(validImg)) validImg = validImg[0];
    
    if (typeof validImg === 'string' && validImg.length > 2) {
      if (validImg.startsWith('/uploads')) {
        flatImages.push(`${BASE_URL}${validImg}`);
      } else if (!validImg.startsWith('http') && !validImg.startsWith('file://')) {
        flatImages.push(`${BASE_URL}/uploads/${validImg.replace(/^\/+/, '')}`);
      } else {
        flatImages.push(validImg);
      }
    }
  });

  return { 
    ...prop, 
    images: flatImages.length > 0 ? flatImages : ['https://via.placeholder.com/400x250?text=No+Image'] 
  };
};

// ✅ Helper: extract fields from FormData (including images)
const extractFormData = (formData) => {
  const data = {};
  if (!formData) return data;

  // Handle React Native FormData
  if (typeof formData.getParts === 'function') {
    formData.getParts().forEach((part) => {
      // Handle text fields
      if (part.fieldName && part.string !== undefined) {
        data[part.fieldName] = part.string;
      }
      // 🔥 Handle image files (Fix: grabs the local URI)
      if (part.fieldName === 'images' && part.uri) {
        if (!data.images) data.images = [];
        data.images.push(part.uri);
      }
    });
    return data;
  }

  // Handle plain object
  if (typeof formData === 'object' && !formData.append) {
    return { ...formData };
  }

  return data;
};

export const createPropertySlice = (set, get) => ({
  // State
  properties: [],
  featuredProperties: [],
  myProperties: [],
  selectedProperty: null,
  isLoading: false,
  propertyError: null,

  // ✅ Load all properties
  loadProperties: async () => {
    set({ isLoading: true, propertyError: null });
    try {
      const result = await PropertyService.getProperties();
      if (result.success && result.properties?.length > 0) {
        // 🔥 APPLY FIX TO ALL LOADED PROPERTIES
        const fixedProperties = result.properties.map(fixImages);
        set({ properties: fixedProperties, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.log('⚠️ Backend unavailable, using local properties');
      set({ isLoading: false });
    }
  },

  // ✅ Load featured properties
  loadFeaturedProperties: async () => {
    try {
      const result = await PropertyService.getFeaturedProperties(5);
      if (result.success && result.properties?.length > 0) {
        // 🔥 APPLY FIX TO FEATURED PROPERTIES
        const fixedFeatured = result.properties.map(fixImages);
        set({ featuredProperties: fixedFeatured });
      } else {
        const localProps = get().properties.slice(0, 5);
        set({ featuredProperties: localProps });
      }
    } catch (error) {
      console.log('⚠️ Featured: using local fallback');
      const localProps = get().properties.slice(0, 5);
      set({ featuredProperties: localProps });
    }
  },

  // ✅ Load my properties
  loadMyProperties: async () => {
    set({ isLoading: true });
    try {
      const result = await PropertyService.getMyProperties();
      if (result.success && result.properties?.length > 0) {
        // 🔥 APPLY FIX TO MY PROPERTIES
        const fixedMyProps = result.properties.map(fixImages);
        set({ myProperties: fixedMyProps, isLoading: false });
      } else {
        const userId = get().user?.id;
        const localMine = get().properties.filter((p) => p.hostId === userId);
        set({ myProperties: localMine, isLoading: false });
      }
    } catch (error) {
      console.log('⚠️ MyProperties: using local fallback');
      const userId = get().user?.id;
      const localMine = get().properties.filter((p) => p.hostId === userId);
      set({ myProperties: localMine, isLoading: false });
    }
  },

  selectProperty: (property) => set({ selectedProperty: property }),
  clearSelectedProperty: () => set({ selectedProperty: null }),

  // ✅ ADD PROPERTY
  addProperty: async (propertyData) => {
    set({ isLoading: true });

    try {
      // 1. Try backend first
      const result = await PropertyService.createProperty(propertyData);

      if (result.success && result.property) {
        // 🔥 APPLY FIX TO NEWLY CREATED PROPERTY
        const newProperty = fixImages(result.property);
        
        set((state) => ({
          properties: [newProperty, ...state.properties],
          myProperties: [newProperty, ...state.myProperties],
          isLoading: false,
        }));
        return { success: true, property: newProperty };
      }

      throw new Error(result.message || 'Backend rejected property');
    } catch (error) {
      console.log('⚠️ Backend failed, creating locally:', error.message);

      // 2. Fallback: build locally from FormData
      const fields = extractFormData(propertyData);
      
      // Extract images safely
      let localImages = ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500'];
      if (fields.images && fields.images.length > 0) {
        localImages = fields.images;
      } else if (fields.images && !Array.isArray(fields.images)) {
        localImages = [fields.images];
      }

      const newProperty = {
        id: `local-${Date.now()}`,
        title: fields.title || 'Untitled Property',
        description: fields.description || '',
        price: parseFloat(fields.price) || 0,
        location: fields.location || 'Unknown',
        bedrooms: parseInt(fields.bedrooms) || 0,
        bathrooms: parseInt(fields.bathrooms) || 0,
        type: fields.type || 'House',
        listingType: fields.listingType || 'For Rent',
        images: localImages, 
        hostId: get().user?.id || 'local-user',
        host: get().user?.name || 'You',
        hostPhone: get().user?.phone || '',
        hostAvatar: get().user?.avatar || '',
        rating: 0,
        reviews: [],
        amenities: [],
        isLocal: true,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        properties: [newProperty, ...state.properties],
        myProperties: [newProperty, ...state.myProperties],
        isLoading: false,
        propertyError: null,
      }));

      console.log('✅ Property added locally:', newProperty.title);
      return { success: true, property: newProperty };
    }
  },

  // ✅ Update property
  updateProperty: async (propertyId, updates) => {
    set({ isLoading: true });
    try {
      const result = await PropertyService.updateProperty(propertyId, updates);

      if (result.success && result.property) {
        // 🔥 APPLY FIX TO UPDATED PROPERTY
        const updatedProp = fixImages(result.property);
        
        set((state) => ({
          properties: state.properties.map((p) => p.id === propertyId ? updatedProp : p),
          myProperties: state.myProperties.map((p) => p.id === propertyId ? updatedProp : p),
          isLoading: false,
        }));
        return { success: true, property: updatedProp };
      }
      throw new Error(result.message || 'Backend update failed');
    } catch (error) {
      console.log('⚠️ Backend update failed, updating locally:', error.message);
      
      const fields = extractFormData(updates);
      
      if (fields.images && fields.images.length > 0) {
        let existing = [];
        if (fields.existingImages) {
          try { existing = JSON.parse(fields.existingImages); } catch(e){}
        }
        fields.images = [...existing, ...fields.images];
      } else if (fields.existingImages) {
        try { fields.images = JSON.parse(fields.existingImages); } catch(e){}
      }

      delete fields.existingImages;

      set((state) => ({
        properties: state.properties.map((p) =>
          p.id === propertyId ? { ...p, ...fields } : p
        ),
        myProperties: state.myProperties.map((p) =>
          p.id === propertyId ? { ...p, ...fields } : p
        ),
        isLoading: false,
      }));
      return { success: true, isLocal: true };
    }
  },

  // ✅ Delete property
  deleteProperty: async (propertyId) => {
    set({ isLoading: true });
    try {
      await PropertyService.deleteProperty(propertyId);
    } catch (error) {
      console.log('⚠️ Backend delete failed, removing locally');
    }

    set((state) => ({
      properties: state.properties.filter((p) => p.id !== propertyId),
      myProperties: state.myProperties.filter((p) => p.id !== propertyId),
      isLoading: false,
    }));

    return { success: true };
  },
});