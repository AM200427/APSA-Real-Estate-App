// services/httpClient.js
import axios from 'axios';
import { API_BASE_URL } from './config';
import Storage from './storage';

// 🔍 Log the base URL
console.log('🌐 API_BASE_URL configured as:', API_BASE_URL);

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    // 🔥 REMOVED Content-Type so Axios can auto-detect FormData vs JSON
    'Accept': 'application/json',
  },
});

// Request Interceptor - Enhanced debugging
httpClient.interceptors.request.use(
  async (config) => {
    console.log('📤 REQUEST:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullPath: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data,
      params: config.params,
    });

    try {
      const result = await Storage.getItem('authToken');
      if (result.success && result.data) {
        config.headers.Authorization = `Bearer ${result.data}`;
        console.log('🔑 Token added to request');
      } else {
        console.log('⚠️ No auth token found');
      }
    } catch (error) {
      console.log('⚠️ Could not add token:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Enhanced debugging
httpClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API SUCCESS:`, {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    // Log the full error details
    console.error('❌ API ERROR:', {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      fullPath: error.config ? `${error.config.baseURL}${error.config.url}` : 'N/A',
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers,
    });

    if (!error.response) {
      console.log('❌ Network Error - No response received');
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your connection.',
        originalError: error,
      });
    }

    if (error.response.status === 401) {
      console.log('🔐 Unauthorized - Removing tokens');
      await Storage.removeItem('authToken');
      await Storage.removeItem('userData');
    }

    // Don't reject for 404 - let the caller handle it
    if (error.response.status === 404) {
      console.log('📭 Resource not found (404)');
    }

    return Promise.reject({
      success: false,
      status: error.response.status,
      message: error.response.data?.message || 'Something went wrong',
      data: error.response.data,
    });
  }
);

export default httpClient;