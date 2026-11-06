// src/screens/PrivacyScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../components/AccessibleText';

export default function PrivacyScreen({ navigation }) {
  const [shareData, setShareData] = useState(false);
  const [locationTracking, setLocationTracking] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [pushAds, setPushAds] = useState(false);
  const [showProfile, setShowProfile] = useState(true);

  const handleDataRequest = () => {
    Alert.alert(
      'Request Your Data',
      'We will send you a copy of your personal data within 30 days.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#007AFF', '#0055CC']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Privacy Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-outline" size={22} color="#007AFF" />
            <Text style={styles.cardTitle}>Privacy Settings</Text>
          </View>

          <View style={styles.field}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="location-outline" size={20} color="#007AFF" />
                <Text style={styles.fieldLabel}>Location Tracking</Text>
              </View>
              <Switch
                value={locationTracking}
                onValueChange={setLocationTracking}
                trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <Text style={styles.fieldDescription}>
              Allow the app to use your location to show nearby properties.
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="analytics-outline" size={20} color="#007AFF" />
                <Text style={styles.fieldLabel}>Analytics & Usage</Text>
              </View>
              <Switch
                value={analytics}
                onValueChange={setAnalytics}
                trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <Text style={styles.fieldDescription}>
              Help us improve the app by sharing anonymous usage data.
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="person-outline" size={20} color="#007AFF" />
                <Text style={styles.fieldLabel}>Show Profile Publicly</Text>
              </View>
              <Switch
                value={showProfile}
                onValueChange={setShowProfile}
                trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <Text style={styles.fieldDescription}>
              Allow other users to see your profile information.
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="share-outline" size={20} color="#007AFF" />
                <Text style={styles.fieldLabel}>Share Data</Text>
              </View>
              <Switch
                value={shareData}
                onValueChange={setShareData}
                trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <Text style={styles.fieldDescription}>
              Allow sharing of non-personal data with third-party partners.
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="megaphone-outline" size={20} color="#007AFF" />
                <Text style={styles.fieldLabel}>Personalized Ads</Text>
              </View>
              <Switch
                value={pushAds}
                onValueChange={setPushAds}
                trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <Text style={styles.fieldDescription}>
              Show ads tailored to your interests based on your activity.
            </Text>
          </View>
        </View>

        {/* Data Request Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={22} color="#007AFF" />
            <Text style={styles.cardTitle}>Data & Security</Text>
          </View>

          <TouchableOpacity style={styles.menuItem} onPress={handleDataRequest}>
            <View style={styles.menuLeft}>
              <Ionicons name="download-outline" size={20} color="#007AFF" />
              <Text style={styles.menuLabel}>Request My Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Delete Account', 'This action is irreversible. Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive' },
            ])}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={[styles.menuLabel, { color: '#FF3B30' }]}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },

  headerGradient: {
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  placeholder: { width: 32 },

  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },

  field: { marginBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldLabel: { fontSize: 16, fontWeight: '500', color: '#1C1C1E' },
  fieldDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
    marginLeft: 34,
  },
  divider: { height: 1, backgroundColor: '#F2F2F7', marginVertical: 12 },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: { fontSize: 16, color: '#1C1C1E' },
});