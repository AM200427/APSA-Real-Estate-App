// src/screens/NotificationsScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import Text from '../components/AccessibleText';

export default function NotificationsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  // Notification preferences
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [priceDrops, setPriceDrops] = useState(true);

  const sections = [
    {
      title: 'Channels',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Push Notifications',
          value: pushEnabled,
          onToggle: setPushEnabled,
        },
        {
          icon: 'mail-outline',
          label: 'Email Notifications',
          value: emailEnabled,
          onToggle: setEmailEnabled,
        },
        {
          icon: 'chatbubble-outline',
          label: 'SMS Notifications',
          value: smsEnabled,
          onToggle: setSmsEnabled,
        },
      ],
    },
    {
      title: 'Activity',
      items: [
        {
          icon: 'calendar-outline',
          label: 'Booking Updates',
          value: bookingUpdates,
          onToggle: setBookingUpdates,
        },
        {
          icon: 'chatbubbles-outline',
          label: 'Message Alerts',
          value: messageAlerts,
          onToggle: setMessageAlerts,
        },
        {
          icon: 'trending-down-outline',
          label: 'Price Drops',
          value: priceDrops,
          onToggle: setPriceDrops,
        },
        {
          icon: 'megaphone-outline',
          label: 'Promotions & Offers',
          value: promotions,
          onToggle: setPromotions,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <View
                  key={itemIndex}
                  style={[
                    styles.option,
                    itemIndex === section.items.length - 1 && styles.optionLast,
                  ]}
                >
                  <View style={styles.optionLeft}>
                    <Ionicons name={item.icon} size={20} color={colors.primary} />
                    <Text style={styles.optionLabel}>{item.label}</Text>
                  </View>
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.footerNote}>
          You can change these settings anytime.
        </Text>
      </ScrollView>
    </View>
  );
}

// ✅ Styles generated from theme colors
const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
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
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.secondaryText,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
      marginLeft: 4,
    },
    sectionCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
    },
    option: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    optionLast: {
      borderBottomWidth: 0,
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    optionLabel: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    footerNote: {
      fontSize: 12,
      color: colors.secondaryText,
      textAlign: 'center',
      marginTop: 8,
      fontStyle: 'italic',
    },
  });