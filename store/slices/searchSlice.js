// store/slices/searchSlice.js
import axios from 'axios';

// ✅ Define your API base URL (adjust if you have a config file)
const API_URL = 'http://192.168.1.195:5000/api'; // change to your backend IP

export const createSearchSlice = (set, get) => ({
  // State
  searchResults: [],
  searchLoading: false,
  searchError: null,
  searchQuery: '',
  searchFilters: {
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    location: '',
  },
  hasSearched: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
  },

  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),

  setSearchFilter: (key, value) => {
    set((state) => ({
      searchFilters: { ...state.searchFilters, [key]: value },
    }));
  },

  resetSearchFilters: () => {
    set({
      searchFilters: {
        propertyType: '',
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        bathrooms: '',
        location: '',
      },
      searchQuery: '',
      searchResults: [],
      hasSearched: false,
      pagination: { page: 1, limit: 10, total: 0, hasMore: false },
    });
  },

  searchProperties: async (params = {}, append = false) => {
    const state = get();
    const { searchQuery, searchFilters, pagination } = state;

    // Combine search query + filters
    const searchParams = {
      q: searchQuery || params.q || '',
      ...searchFilters,
      ...params,
      page: append ? pagination.page + 1 : 1,
      limit: pagination.limit,
    };

    // Remove empty values
    Object.keys(searchParams).forEach((key) => {
      if (!searchParams[key] || searchParams[key] === '') {
        delete searchParams[key];
      }
    });

    set({ searchLoading: true, searchError: null });

    try {
      const queryString = new URLSearchParams(searchParams).toString();
      const url = `${API_URL}/properties/search?${queryString}`;
      const response = await axios.get(url);

      const results = response.data.data || response.data;
      const total = response.data.total || results.length;

      set((state) => ({
        searchResults: append ? [...state.searchResults, ...results] : results,
        searchLoading: false,
        hasSearched: true,
        pagination: {
          ...state.pagination,
          page: append ? state.pagination.page + 1 : 1,
          total: total,
          hasMore: results.length === state.pagination.limit,
        },
      }));

      return results;
    } catch (error) {
      set({
        searchError: error.response?.data?.message || error.message || 'Search failed',
        searchLoading: false,
      });
      throw error;
    }
  },

  clearSearchResults: () => {
    set({
      searchResults: [],
      hasSearched: false,
      searchQuery: '',
      pagination: { page: 1, limit: 10, total: 0, hasMore: false },
    });
  },

  loadMoreSearchResults: async () => {
    const state = get();
    if (state.pagination.hasMore && !state.searchLoading) {
      await state.searchProperties({}, true);
    }
  },

  clearSearchError: () => set({ searchError: null }),
});