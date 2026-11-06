import React, { createContext, useState, useContext } from 'react';
import { mockProperties } from '../data/mockData';

const PropertyContext = createContext();

export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState(mockProperties);
  const [userProperties, setUserProperties] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const addProperty = (property) => {
    const newProperty = {
      ...property,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setUserProperties([...userProperties, newProperty]);
    setProperties([newProperty, ...properties]);
    return newProperty;
  };

  const removeProperty = (propertyId) => {
    setUserProperties(userProperties.filter(p => p.id !== propertyId));
    setProperties(properties.filter(p => p.id !== propertyId));
  };

  const toggleWishlist = (propertyId) => {
    if (wishlist.includes(propertyId)) {
      setWishlist(wishlist.filter(id => id !== propertyId));
    } else {
      setWishlist([...wishlist, propertyId]);
    }
  };

  const getPropertyById = (id) => {
    return [...properties, ...userProperties].find(p => p.id === id);
  };

  const searchProperties = (query, filters = {}) => {
    let results = [...properties, ...userProperties];
    
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(p => 
        p.title.toLowerCase().includes(searchTerm) ||
        p.location.toLowerCase().includes(searchTerm) ||
        p.type.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.minPrice) {
      results = results.filter(p => p.price >= filters.minPrice);
    }
    
    if (filters.maxPrice) {
      results = results.filter(p => p.price <= filters.maxPrice);
    }
    
    if (filters.type && filters.type !== 'All') {
      results = results.filter(p => p.type === filters.type);
    }
    
    return results;
  };

  return (
    <PropertyContext.Provider value={{
      properties,
      userProperties,
      wishlist,
      addProperty,
      removeProperty,
      toggleWishlist,
      getPropertyById,
      searchProperties,
    }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
};