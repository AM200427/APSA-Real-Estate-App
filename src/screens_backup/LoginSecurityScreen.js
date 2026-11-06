// src/screens/LoginSecurityScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useToast } from '../context/ToastContext';
import { useAppStore } from '../../store/useAppStore'; // adjust path
import { useTheme } from '../context/ThemeContext';
import Text from '../components/AccessibleText';

export default function LoginSecurityScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { showInfo, showSuccess, showError } = useToast();
  const { user, logout } = useAppStore();

  // State for toggles
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // State for password change modal
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- Change Password ---
  const handleChangePassword = () => {
    if (currentPassword.length < 6) {
      showError('Current password must be at least 6 characters');
      return;
    }
    if (newPassword.length < 6) {
      showError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    if (currentPassword === newPassword) {
      showError('New password must be different from current');
      return;
    }

    // Here you would call your API to change the password
    // For demo, we'll just show success
    showSuccess('Password changed successfully!');
    setPasswordModalVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // --- Toggle 2FA ---
  const handleTwoFactorToggle = () => {
    if (!twoFactorEnabled) {
      // Ask for phone/email verification first
      Alert.alert(
        'Enable Two-Factor Authentication',
        'You will receive a verification code via SMS or email to confirm this change.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              // Here you would send verification code
              // For demo, we'll just enable it
              setTwoFactorEnabled(true);
              showInfo('2FA verification code sent to your email');
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Disable Two-Factor Authentication',
        'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => {
              setTwoFactorEnabled(false);
              showInfo('2FA disabled');
            },
          },
        ]
      );
    }
  };

  // --- Biometrics ---
  const handleBiometricsToggle = () => {
    if (!biometricsEnabled) {
      Alert.alert(
        'Enable Biometrics',
        'Use Face ID / Fingerprint to unlock the app.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              setBiometricsEnabled(true);
              showSuccess('Biometrics enabled');
            },
          },
        ]
      );
    } else {
      setBiometricsEnabled(false);
      showInfo('Biometrics disabled');
    }
  };

  // --- Logout All Devices ---
  const handleLogoutAll = () => {
    Alert.alert(
      'Logout from all devices',
      'This will log you out from all devices except this one. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout All',
          style: 'destructive',
          onPress: () => {
            // Here you would call your API to invalidate all tokens
            showInfo('Logged out from all other devices');
          },
        },
      ]
    );
  };

  // --- Delete Account ---
  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This action is irreversible. All your data, messages, and listings will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'This cannot be undone. All your property listings, messages, and account data will be gone forever.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm Delete',
                  style: 'destructive',
                  onPress: async () => {
                    // Here you would call your API to delete the account
                    showInfo('Account deleted');
                    await logout();
                    navigation.navigate('Login');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  // --- Render Password Modal ---
  const renderPasswordModal = () => (
    <Modal
      animationType="slide"
      transparent
      visible={passwordModalVisible}
      onRequestClose={() => setPasswordModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Password</Text>

          <Text style={styles.modalLabel}>Current Password</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter current password"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />

          <Text style={styles.modalLabel}>New Password</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter new password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <Text style={styles.modalLabel}>Confirm New Password</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Confirm new password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => setPasswordModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalSaveButton]}
              onPress={handleChangePassword}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // --- Main Render ---
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Section 1: Password */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        <TouchableOpacity
          style={styles.option}
          onPress={() => setPasswordModalVisible(true)}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="lock-closed-outline" size={22} color="#1A73E8" style={styles.optionIcon} />
            <Text style={styles.optionText}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={handleLogoutAll}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="log-out-outline" size={22} color="#FF6B35" style={styles.optionIcon} />
            <Text style={styles.optionText}>Logout from all devices</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      {/* Section 2: Authentication */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentication</Text>

        <View style={styles.option}>
          <View style={styles.optionLeft}>
            <Ionicons name="finger-print-outline" size={22} color="#8B5CF6" style={styles.optionIcon} />
            <Text style={styles.optionText}>Biometric Login</Text>
          </View>
          <Switch
            value={biometricsEnabled}
            onValueChange={handleBiometricsToggle}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.option}>
          <View style={styles.optionLeft}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#28A745" style={styles.optionIcon} />
            <Text style={styles.optionText}>Two-Factor Authentication</Text>
          </View>
          <Switch
            value={twoFactorEnabled}
            onValueChange={handleTwoFactorToggle}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Section 3: Session */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session</Text>

        <View style={styles.option}>
          <View style={styles.optionLeft}>
            <Ionicons name="time-outline" size={22} color="#FF6B35" style={styles.optionIcon} />
            <Text style={styles.optionText}>Remember Me</Text>
          </View>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            showInfo('Session expires in 30 days');
          }}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="calendar-outline" size={22} color="#607D8B" style={styles.optionIcon} />
            <Text style={styles.optionText}>Session Expiry</Text>
          </View>
          <View style={styles.optionRight}>
            <Text style={styles.optionSubText}>30 days</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Section 4: Danger Zone */}
      <View style={[styles.section, styles.dangerSection]}>
        <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>

        <TouchableOpacity
          style={[styles.option, styles.dangerOption]}
          onPress={handleDeleteAccount}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="trash-outline" size={22} color="#FF3B30" style={styles.optionIcon} />
            <Text style={[styles.optionText, styles.dangerText]}>Delete Account</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {/* Password Change Modal */}
      {renderPasswordModal()}
    </ScrollView>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: 14,
    width: 24,
  },
  optionText: {
    fontSize: 16,
    color: '#1C1C1E',
    flex: 1,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionSubText: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  // Danger Zone
  dangerSection: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  dangerTitle: {
    color: '#FF3B30',
  },
  dangerOption: {
    borderBottomColor: '#FFE5E5',
  },
  dangerText: {
    color: '#FF3B30',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1C1E',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#F2F2F7',
  },
  modalCancelText: {
    color: '#1C1C1E',
    fontSize: 16,
    fontWeight: '500',
  },
  modalSaveButton: {
    backgroundColor: '#1A73E8',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});