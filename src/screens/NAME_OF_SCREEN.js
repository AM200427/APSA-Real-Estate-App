// src/screens/NAME_OF_SCREEN.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../context/ToastContext';
import Text from '../components/AccessibleText';

export default function ScreenName({ navigation }) {
  const { showInfo } = useToast();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Screen Title</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            showInfo('Feature coming soon');
          }}
        >
          <Text style={styles.optionText}>Option 1</Text>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            showInfo('Feature coming soon');
          }}
        >
          <Text style={styles.optionText}>Option 2</Text>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', padding: 16 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 12 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  optionText: { fontSize: 16, color: '#1C1C1E' },
});