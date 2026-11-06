// src/screens/NotificationsScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppStore } from '../../store/useAppStore';

export default function NotificationsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { preferences, setPreference, resetPreferences } = useAppStore();
  const styles = getStyles(colors, isDark);

  const notificationSections = [
    {
      title: 'General',
      items: [
        {
          key: 'pushNotifications',
          icon: 'notifications-outline',
          label: 'Push Notifications',
          description: 'Get alerts on your device',
        },
        {
          key: 'soundEnabled',
          icon: 'volume-high-outline',
          label: 'Sound',
          description: 'Play sound for new notifications',
        },
        {
          key: 'vibrationEnabled',
          icon: 'phone-portrait-outline',
          label: 'Vibration',
          description: 'Vibrate for new notifications',
        },
      ],
    },
    {
      title: 'Activity',
      items: [
        {
          key: 'bookingAlerts',
          icon: 'calendar-outline',
          label: 'Booking Alerts',
          description: 'Updates on your bookings',
        },
        {
          key: 'messageAlerts',
          icon: 'chatbubbles-outline',
          label: 'Message Alerts',
          description: 'New chat messages',
        },
        {
          key: 'propertyUpdates',
          icon: 'home-outline',
          label: 'Property Updates',
          description: 'Price drops and new listings',
        },
      ],
    },
    {
      title: 'Email',
      items: [
        {
          key: 'emailNotifications',
          icon: 'mail-outline',
          label: 'Email Notifications',
          description: 'Receive notifications by email',
        },
        {
          key: 'marketingEmails',
          icon: 'megaphone-outline',
          label: 'Marketing Emails',
          description: 'Promotions and special offers',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={resetPreferences} style={styles.resetButton}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {notificationSections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, itemIdx) => (
                <View
                  key={item.key}
                  style={[
                    styles.menuItem,
                    itemIdx === section.items.length - 1 && styles.menuItemLast,
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
                    onValueChange={(val) => setPreference(item.key, val)}
                    trackColor={{ false: '#D1D1D6', true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.footerNote}>
          Changes are saved automatically and apply to your device.
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
    resetButton: { padding: 4 },
    resetText: { fontSize: 14, color: colors.primary, fontWeight: '600' },

    content: { padding: 16, paddingBottom: 40 },
    section: { marginBottom: 20 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.secondaryText,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
      marginLeft: 4,
    },
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
      marginTop: 8,
      fontStyle: 'italic',
    },
  });