import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('🚨 App Crashed:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#fff', marginTop: 50 }}>
          <Text style={{ color: 'red', fontSize: 22, fontWeight: 'bold' }}>App Crashed</Text>
          <Text style={{ marginTop: 20, fontSize: 16, color: 'black' }}>
            {this.state.error?.toString()}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}