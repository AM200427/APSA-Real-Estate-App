// src/components/SafeImage.js
import React from 'react';
import { Image } from 'react-native';

export const SafeImage = ({ source, ...props }) => {
  let safeUri = source?.uri;

  // Unwrap arrays
  while (Array.isArray(safeUri)) {
    safeUri = safeUri[0];
  }

  // If it's a local object, pass it through
  if (typeof safeUri === 'object' && safeUri !== null) {
    return <Image source={safeUri} {...props} />;
  }

  // 🔥 THE FIX: Attach backend URL if it's a local upload
  const BASE_URL = 'http://192.168.1.195:5000'; // Make sure this matches your backend IP!
  
  if (typeof safeUri === 'string' && safeUri.length > 2) {
    if (safeUri.startsWith('/uploads')) {
      safeUri = `${BASE_URL}${safeUri}`;
    } else if (!safeUri.startsWith('http') && !safeUri.startsWith('file://')) {
      // If it's just a filename like "123.jpg"
      safeUri = `${BASE_URL}/uploads/${safeUri.replace(/^\/+/, '')}`;
    }
  } else {
    // Fallback for empty/invalid
    safeUri = 'https://via.placeholder.com/400x250?text=No+Image';
  }

  return <Image source={{ uri: safeUri }} {...props} />;
};