// src/components/APITest.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import httpClient from '../../services/httpClient';
import { API_BASE_URL } from '../../services/config';

const APITest = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [testPropertyId, setTestPropertyId] = useState('');

  // Test 1: Check API Base URL
  const testBaseURL = () => {
    const result = {
      test: '📡 Base URL Test',
      message: `API_BASE_URL: ${API_BASE_URL}`,
      timestamp: new Date().toISOString(),
    };
    setResults(prev => [result, ...prev]);
    console.log('🌐 API_BASE_URL:', API_BASE_URL);
  };

  // Test 2: Test Network Connection
  const testNetworkConnection = async () => {
    setLoading(true);
    try {
      const result = {
        test: '📡 Network Connection Test',
        message: 'Testing connection...',
        timestamp: new Date().toISOString(),
      };
      setResults(prev => [result, ...prev]);

      const startTime = Date.now();
      const response = await httpClient.get('/');
      const endTime = Date.now();

      const successResult = {
        test: '✅ Network Connection - SUCCESS',
        message: `Connected in ${endTime - startTime}ms`,
        status: response.status,
        data: JSON.stringify(response.data).substring(0, 200),
        timestamp: new Date().toISOString(),
      };
      setResults(prev => [successResult, ...prev]);
      console.log('✅ Network test successful:', response.data);
    } catch (error) {
      const errorResult = {
        test: '❌ Network Connection - FAILED',
        message: error.message || 'Failed to connect',
        status: error.status || 'N/A',
        details: JSON.stringify(error).substring(0, 200),
        timestamp: new Date().toISOString(),
      };
      setResults(prev => [errorResult, ...prev]);
      console.error('❌ Network test failed:', error);
    }
    setLoading(false);
  };

  // Test 3: Test Health Endpoint
  const testHealthEndpoint = async () => {
    setLoading(true);
    try {
      const result = {
        test: '📡 Health Check',
        message: 'Checking /health endpoint...',
        timestamp: new Date().toISOString(),
      };
      setResults(prev => [result, ...prev]);

      const response = await httpClient.get('/health');
      
      const successResult = {
        test: '✅ Health Check - SUCCESS',
        message: 'Server is healthy',
        status: response.status,
        data: JSON.stringify(response.data),
        timestamp: new Date().toISOString(),
      };
      setResults(prev => [successResult, ...prev]);
      console.log('✅ Health check successful:', response.data);
    } catch (error) {
      const errorResult = {
        test: '❌ Health Check - FAILED',
        message: error.message || 'Health check failed',
        status: error.status || 'N/A',
        details: JSON.stringify(error).substring(0, 200),
        timestamp: new Date().toISOString(),
      };
      setResults(prev => [errorResult, ...prev]);
      console.error('❌ Health check failed:', error);
    }
    setLoading(false);
  };

  // Test 4: Test Properties Endpoint
  const testPropertiesEndpoint = async () => {
    setLoading(true);
    try {
      const result = {
        test: '📡 Properties Endpoint',
        message: 'Fetching properties...',
        timestamp: new Date().toISOString(),
      };
      setResults(prev => [result, ...prev]);

      const response = await httpClient.get('/properties');
      
      const successResult = {
        test: '✅ Properties - SUCCESS',
        message: `Found ${response.data?.length || 0} properties`,
        status: response.status,
        data: JSON.stringify(response.data).substring(0, 300),
        timestamp: new Date().toISOString(),
      };
      setResults(prev => [successResult, ...prev]);
      
      // Store first property ID for review test
      if (response.data && response.data.length > 0) {
        const firstProperty = response.data[0];
        setTestPropertyId(firstProperty.id || firstProperty._id || '');
        console.log('📌 First property ID:', testPropertyId);
      }
      
      console.log('✅ Properties fetch successful:', response.data);
    } catch (error) {
      const errorResult = {
        test: '❌ Properties - FAILED',
        message: error.message || 'Failed to fetch properties',
        status: error.status || 'N/A',
        details: JSON.stringify(error).substring(0, 200),
        timestamp: new Date().toISOString(),
      };
      setResults(prev => [errorResult, ...prev]);
      console.error('❌ Properties fetch failed:', error);
    }
    setLoading(false);
  };

  // Test 5: Test Reviews Endpoint
  const testReviewsEndpoint = async (propertyId) => {
    if (!propertyId) {
      Alert.alert('Error', 'No property ID. Run "Test Properties" first.');
      return;
    }

    setLoading(true);
    try {
      const url = `/properties/${propertyId}/reviews`;
      const result = {
        test: '📡 Reviews Endpoint',
        message: `Testing: ${url}`,
        timestamp: new Date().toISOString(),
      };
      setResults(prev => [result, ...prev]);

      console.log(`📡 Testing reviews endpoint: ${url}`);
      const response = await httpClient.get(url);
      
      const successResult = {
        test: `✅ Reviews - SUCCESS`,
        message: `Found ${response.data?.reviews?.length || 0} reviews`,
        status: response.status,
        propertyId: propertyId,
        data: JSON.stringify(response.data).substring(0, 300),
        timestamp: new Date().toISOString(),
      };
      setResults(prev => [successResult, ...prev]);
      console.log('✅ Reviews fetch successful:', response.data);
    } catch (error) {
      const errorResult = {
        test: `❌ Reviews - FAILED`,
        message: error.message || 'Failed to fetch reviews',
        status: error.status || 'N/A',
        propertyId: propertyId,
        url: `/properties/${propertyId}/reviews`,
        details: JSON.stringify(error).substring(0, 200),
        timestamp: new Date().toISOString(),
      };
      setResults(prev => [errorResult, ...prev]);
      console.error('❌ Reviews fetch failed:', error);
    }
    setLoading(false);
  };

  // Test 6: Manual Property ID Input
  const testManualReview = () => {
    Alert.prompt(
      'Enter Property ID',
      'Enter a property ID to test reviews:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Test',
          onPress: (id) => {
            if (id && id.trim()) {
              testReviewsEndpoint(id.trim());
            } else {
              Alert.alert('Error', 'Please enter a valid property ID');
            }
          },
        },
      ],
      'plain-text',
      testPropertyId || ''
    );
  };

  // Clear results
  const clearResults = () => {
    setResults([]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>🔧 API Test Tool</Text>
        <Text style={styles.subtitle}>Test your API endpoints</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={testBaseURL}>
            <Text style={styles.buttonText}>1. Show Base URL</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={testNetworkConnection}>
            <Text style={styles.buttonText}>2. Test Network</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={testHealthEndpoint}>
            <Text style={styles.buttonText}>3. Test Health</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={testPropertiesEndpoint}>
            <Text style={styles.buttonText}>4. Test Properties</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.reviewButton]} 
            onPress={() => testReviewsEndpoint(testPropertyId)}
          >
            <Text style={styles.buttonText}>5. Test Reviews</Text>
            {testPropertyId ? (
              <Text style={styles.smallText}>ID: {testPropertyId.substring(0, 20)}...</Text>
            ) : (
              <Text style={styles.smallText}>Run Test Properties first</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.manualButton]} 
            onPress={testManualReview}
          >
            <Text style={styles.buttonText}>6. Manual Review Test</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.clearButton]} 
            onPress={clearResults}
          >
            <Text style={styles.buttonText}>Clear Results</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Testing...</Text>
          </View>
        )}

        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>📋 Test Results ({results.length})</Text>
          {results.length === 0 ? (
            <Text style={styles.noResults}>No tests run yet. Tap a button above.</Text>
          ) : (
            results.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <Text style={styles.resultTest}>{result.test}</Text>
                <Text style={styles.resultMessage}>{result.message}</Text>
                {result.status && (
                  <Text style={[
                    styles.resultStatus,
                    result.status === 200 || result.status === 201 ? styles.successStatus : styles.errorStatus
                  ]}>
                    Status: {result.status}
                  </Text>
                )}
                {result.propertyId && (
                  <Text style={styles.resultProperty}>Property ID: {result.propertyId}</Text>
                )}
                {result.url && (
                  <Text style={styles.resultUrl}>URL: {result.url}</Text>
                )}
                {result.data && (
                  <Text style={styles.resultData}>{result.data}</Text>
                )}
                <Text style={styles.resultTime}>
                  {new Date(result.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  reviewButton: {
    backgroundColor: '#34C759',
  },
  manualButton: {
    backgroundColor: '#FF9500',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  smallText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  resultsContainer: {
    marginTop: 8,
    marginBottom: 40,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  noResults: {
    color: '#999',
    fontStyle: 'italic',
    padding: 8,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultTest: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resultMessage: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  resultStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  successStatus: {
    color: '#34C759',
  },
  errorStatus: {
    color: '#FF3B30',
  },
  resultProperty: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 2,
  },
  resultUrl: {
    fontSize: 12,
    color: '#FF9500',
    marginBottom: 2,
  },
  resultData: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#f0f0f0',
    padding: 6,
    borderRadius: 4,
    marginTop: 4,
  },
  resultTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
});

export default APITest;