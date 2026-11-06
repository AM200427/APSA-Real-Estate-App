// src/screens/AccountSettingsScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function AccountSettingsScreen({ navigation }) {
  const { user, logout, preferences, setPreference } = useAppStore(); // ✅ Preferences from store
  const { showInfo } = useToast();
  const { colors, isDark, toggleTheme } = useTheme();

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'Personal Info',
          onPress: () => navigation.navigate('PersonalInfo'),
        },
        {
          icon: 'lock-closed-outline',
          label: 'Login & Security',
          onPress: () => navigation.navigate('LoginSecurity'),
        },
        {
          icon: 'shield-outline',
          label: 'Privacy',
          onPress: () => navigation.navigate('Privacy'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
  icon: 'notifications-outline',
  label: 'Notifications',
  onPress: () => navigation.navigate('Notifications'),
  right: (
    <Switch
      value={preferences.pushNotifications}
      onValueChange={(val) => {
        
        setPreference('pushNotifications', val);
        
        showInfo(val ? 'Push notifications enabled' : 'Push notifications disabled');
      }}
      trackColor={{ false: '#D1D1D6', true: colors.primary }}
      thumbColor="#FFFFFF"
    />
  ),
},
        {
  icon: 'mail-outline',
  label: 'Email Notifications',
  onPress: () => navigation.navigate('EmailNotifications'),
  right: (
    <Switch
      value={preferences.emailNotifications}
      onValueChange={(val) => {
        setPreference('emailNotifications', val);
        showInfo(val ? 'Email notifications enabled' : 'Email notifications disabled');
      }}
      trackColor={{ false: '#D1D1D6', true: colors.primary }}
      thumbColor="#FFFFFF"
    />
  ),
},
        {
          icon: isDark ? 'sunny-outline' : 'moon-outline',
          label: isDark ? 'Light Mode' : 'Dark Mode',
          onPress: toggleTheme,
          right: (
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D1D1D6', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          ),
        },
      ],
    },
    {
      title: 'Payments',
      items: [
        {
          icon: 'card-outline',
          label: 'Payment Methods',
          onPress: () => navigation.navigate('Payments'),
        },
        {
          icon: 'receipt-outline',
          label: 'Billing History',
          onPress: () => navigation.navigate('BillingHistory'),   
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Help & Support',
          onPress: () => navigation.navigate('HelpSupport'),
        },
        {
          icon: 'accessibility-outline',
          label: 'Accessibility',
          onPress: () => navigation.navigate('Accessibility'),
        },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const styles = getStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userCard}>
          <Image
            source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=1' }}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'guest@email.com'}</Text>
            <View style={styles.userRoleBadge}>
              <Text style={styles.userRoleText}>{user?.role || 'Client'}</Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex === section.items.length - 1 && styles.menuItemLast,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuLeft}>
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={colors.primary}
                      style={styles.menuIcon}
                    />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  {item.right || (
                    <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>APSA v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ✅ Styles generated from theme colors
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
    placeholder: { width: 32 },
    content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
    },
    userAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.inputBackground,
    },
    userInfo: { flex: 1, marginLeft: 14 },
    userName: { fontSize: 18, fontWeight: '700', color: colors.text },
    userEmail: { fontSize: 14, color: colors.secondaryText, marginTop: 2 },
    userRoleBadge: {
      backgroundColor: isDark ? '#0A2A1A' : '#E8F5E9',
      paddingHorizontal: 10,
      paddingVertical: 2,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginTop: 4,
    },
    userRoleText: { fontSize: 12, fontWeight: '500', color: '#2E7D32' },
    section: { marginBottom: 16 },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.secondaryText,
      marginBottom: 8,
      marginLeft: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sectionCard: {
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
    menuIcon: { marginRight: 14 },
    menuLabel: { fontSize: 16, color: colors.text },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      paddingVertical: 16,
      borderRadius: 16,
      marginTop: 8,
      borderWidth: 1,
      borderColor: '#FF3B30',
      gap: 8,
    },
    logoutText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
    versionText: {
      textAlign: 'center',
      color: colors.secondaryText,
      fontSize: 12,
      marginTop: 20,
    },
  });