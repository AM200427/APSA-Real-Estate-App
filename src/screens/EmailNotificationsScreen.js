// src/screens/EmailNotificationsScreen.js
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../context/ToastContext';
import Text from '../components/AccessibleText';

export default function EmailNotificationsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { preferences, setPreference } = useAppStore();
  const { showInfo } = useToast();
  const styles = getStyles(colors, isDark);

  const emailOptions = [
    {
      key: 'emailNotifications',
      icon: 'mail-outline',
      label: 'All Email Notifications',
      description: 'Master switch for all emails',
    },
    {
      key: 'marketingEmails',
      icon: 'megaphone-outline',
      label: 'Marketing Emails',
      description: 'Promotions, tips, and special offers',
    },
    {
      key: 'bookingAlerts',
      icon: 'calendar-outline',
      label: 'Booking Reminders',
      description: 'Get reminder emails before your bookings',
    },
    {
      key: 'propertyUpdates',
      icon: 'home-outline',
      label: 'Property Updates',
      description: 'Price drops on saved properties',
    },
  ];

  const handleToggle = (key, label, value) => {
    setPreference(key, value);
    showInfo(`${label} ${value ? 'enabled' : 'disabled'}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Email Notifications</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {emailOptions.map((item, idx) => (
            <View
              key={item.key}
              style={[
                styles.menuItem,
                idx === emailOptions.length - 1 && styles.menuItemLast,
              ]}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconWrapper}>
                  <Ionicons name={item.icon} size={20} color={colors.primary} />
                </View>
                <View style={styles.textWrapper}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
              </View>
              <Switch
                value={preferences[item.key]}
                onValueChange={(val) => handleToggle(item.key, item.label, val)}
                trackColor={{ false: '#D1D1D6', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </View>

        <Text style={styles.footerNote}>
          Email preferences apply to the email address associated with your account.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.headerBackground,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
    content: { padding: 16, paddingBottom: 40 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    menuItemLast: { borderBottomWidth: 0 },
    menuLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    textWrapper: { flex: 1, marginRight: 8 },
    menuLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
    menuDescription: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 2,
    },
    footerNote: {
      textAlign: 'center',
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 16,
      fontStyle: 'italic',
      paddingHorizontal: 20,
    },
  });