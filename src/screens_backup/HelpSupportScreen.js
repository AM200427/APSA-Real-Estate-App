// src/screens/HelpSupportScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext'; // ✅ Theme hook
import Text from '../components/AccessibleText';

export default function HelpSupportScreen({ navigation }) {
  const { colors, isDark } = useTheme(); // ✅ Get theme

  const styles = getStyles(colors, isDark); // ✅ Generate themed styles

  const supportItems = [
    {
      icon: 'help-circle-outline',
      title: 'FAQ',
      description: 'Frequently asked questions',
      onPress: () => Alert.alert('FAQ', 'Frequently asked questions coming soon.'),
    },
    {
      icon: 'chatbubble-outline',
      title: 'Live Chat',
      description: 'Chat with support team',
      onPress: () => Alert.alert('Live Chat', 'Connecting you to a support agent...'),
    },
    {
      icon: 'mail-outline',
      title: 'Email Support',
      description: 'support@apsa.com',
      onPress: () => Linking.openURL('mailto:support@apsa.com'),
    },
    {
      icon: 'call-outline',
      title: 'Call Us',
      description: '+260 97 123 4567',
      onPress: () => Linking.openURL('tel:+260971234567'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Support Cards */}
        {supportItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.cardIcon}>
              <Ionicons name={item.icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        ))}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>We're here to help</Text>
            <Text style={styles.infoDescription}>
              Our support team is available 24/7 to assist you with any questions or issues.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
      gap: 12,
      paddingBottom: 40,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    cardContent: { flex: 1 },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    cardDescription: {
      fontSize: 14,
      color: colors.secondaryText,
      marginTop: 2,
    },

    // Info card
    infoCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginTop: 12,
      gap: 12,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    infoText: { flex: 1 },
    infoTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    infoDescription: {
      fontSize: 13,
      color: colors.secondaryText,
      lineHeight: 18,
    },
  });