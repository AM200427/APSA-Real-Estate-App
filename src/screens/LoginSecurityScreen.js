// src/screens/LoginSecurityScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useToast } from '../context/ToastContext';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext';
import Text from '../components/AccessibleText';

export default function LoginSecurityScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { showInfo, showSuccess, showError } = useToast();
  const {
    user,
    changePassword,
    deleteAccount,
    logout,
    logoutAllDevices,
    updateProfile,
  } = useAppStore();

  const [biometricsEnabled, setBiometricsEnabled] = useState(
    user?.biometricsEnabled || false
  );
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user?.twoFactorEnabled || false
  );
  const [rememberMe, setRememberMe] = useState(true);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');   // ← inline error

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitting2FA, setIsSubmitting2FA] = useState(false);
  const [isSubmittingBio, setIsSubmittingBio] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const styles = getStyles(colors, isDark);

  const openPasswordModal = () => {
    setPasswordError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordModalVisible(true);
  };

  const closePasswordModal = () => {
    if (isChangingPassword) return;
    setPasswordError('');
    setPasswordModalVisible(false);
  };

  // --- Change Password ---
  const handleChangePassword = async () => {
    if (isChangingPassword) return;
    setPasswordError('');

    if (currentPassword.length < 6) {
      setPasswordError('Current password must be at least 6 characters.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from the current one.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      showSuccess('Password changed', 'Your password has been updated.', 3000);
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    } catch (err) {
      // Show the real error inline + as a toast
      const msg = err?.message || 'Please try again.';
      setPasswordError(msg);
      showError('Could not change password', msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // --- Toggle 2FA ---
  const applyTwoFactor = async (nextValue) => {
    if (isSubmitting2FA) return;
    setIsSubmitting2FA(true);
    try {
      const result = await updateProfile({ twoFactorEnabled: nextValue });
      if (result?.success === false) {
        showError('Failed', 'Could not update two-factor setting.');
        return;
      }
      setTwoFactorEnabled(nextValue);
      if (nextValue) {
        showSuccess('2FA enabled', 'You will be asked for a code on future logins.', 3000);
      } else {
        showInfo('2FA disabled', 'Your account is less secure without 2FA.');
      }
    } catch (err) {
      showError('Failed', err?.message || 'Could not update two-factor setting.');
    } finally {
      setIsSubmitting2FA(false);
    }
  };

  const handleTwoFactorToggle = () => {
    if (!twoFactorEnabled) {
      Alert.alert(
        'Enable Two-Factor Authentication',
        'You will receive a verification code via SMS or email to confirm this change.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: () => applyTwoFactor(true) },
        ]
      );
    } else {
      Alert.alert(
        'Disable Two-Factor Authentication',
        'Are you sure? This will make your account less secure.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => applyTwoFactor(false),
          },
        ]
      );
    }
  };

  // --- Toggle Biometrics ---
  const applyBiometrics = async (nextValue) => {
    if (isSubmittingBio) return;
    setIsSubmittingBio(true);
    try {
      const result = await updateProfile({ biometricsEnabled: nextValue });
      if (result?.success === false) {
        showError('Failed', 'Could not update biometric setting.');
        return;
      }
      setBiometricsEnabled(nextValue);
      if (nextValue) {
        showSuccess('Biometrics enabled', 'Face ID / fingerprint will unlock the app.', 3000);
      } else {
        showInfo('Biometrics disabled');
      }
    } catch (err) {
      showError('Failed', err?.message || 'Could not update biometric setting.');
    } finally {
      setIsSubmittingBio(false);
    }
  };

  const handleBiometricsToggle = () => {
    if (!biometricsEnabled) {
      Alert.alert(
        'Enable Biometrics',
        'Use Face ID / Fingerprint to unlock the app.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: () => applyBiometrics(true) },
        ]
      );
    } else {
      applyBiometrics(false);
    }
  };

  // --- Logout All Devices ---
  const handleLogoutAll = () => {
    Alert.alert(
      'Logout from all devices',
      'This will end your session on every device, including this one. You will need to log in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout All',
          style: 'destructive',
          onPress: async () => {
            if (isLoggingOutAll) return;
            setIsLoggingOutAll(true);
            try {
              await logoutAllDevices();
              showSuccess('Logged out everywhere', 'All sessions have ended.', 3000);
              navigation.navigate('Login');
            } catch (err) {
              showError(
                'Could not log out from all devices',
                err?.message || 'Please try again.'
              );
            } finally {
              setIsLoggingOutAll(false);
            }
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
                    if (isDeleting) return;
                    setIsDeleting(true);
                    try {
                      await deleteAccount();
                      showSuccess('Account deleted', 'Your local session has been cleared.', 3000);
                      navigation.navigate('Login');
                    } catch (err) {
                      showError('Delete failed', err?.message || 'Please try again.');
                    } finally {
                      setIsDeleting(false);
                    }
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
      onRequestClose={closePasswordModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Password</Text>

          <Text style={styles.modalLabel}>Current Password</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter current password"
            placeholderTextColor={colors.secondaryText}
            secureTextEntry
            value={currentPassword}
            onChangeText={(t) => {
              setCurrentPassword(t);
              if (passwordError) setPasswordError('');
            }}
            editable={!isChangingPassword}
          />

          <Text style={styles.modalLabel}>New Password</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter new password"
            placeholderTextColor={colors.secondaryText}
            secureTextEntry
            value={newPassword}
            onChangeText={(t) => {
              setNewPassword(t);
              if (passwordError) setPasswordError('');
            }}
            editable={!isChangingPassword}
          />

          <Text style={styles.modalLabel}>Confirm New Password</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Confirm new password"
            placeholderTextColor={colors.secondaryText}
            secureTextEntry
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (passwordError) setPasswordError('');
            }}
            editable={!isChangingPassword}
          />

          {passwordError ? (
            <View style={styles.modalErrorBox}>
              <Ionicons name="alert-circle" size={18} color="#FF3B30" />
              <Text style={styles.modalErrorText}>{passwordError}</Text>
            </View>
          ) : null}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={closePasswordModal}
              disabled={isChangingPassword}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalSaveButton, isChangingPassword && { opacity: 0.7 }]}
              onPress={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.modalSaveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Login & Security</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <TouchableOpacity style={styles.option} onPress={openPasswordModal}>
            <View style={styles.optionLeft}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.primary} style={styles.optionIcon} />
              <Text style={styles.optionText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleLogoutAll}>
            <View style={styles.optionLeft}>
              <Ionicons name="log-out-outline" size={22} color="#FF6B35" style={styles.optionIcon} />
              <Text style={styles.optionText}>Logout from all devices</Text>
            </View>
            {isLoggingOutAll ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
            )}
          </TouchableOpacity>
        </View>

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
              disabled={isSubmittingBio}
              trackColor={{ false: colors.border, true: '#34C759' }}
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
              disabled={isSubmitting2FA}
              trackColor={{ false: colors.border, true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

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
              trackColor={{ false: colors.border, true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity
            style={styles.option}
            onPress={() => showInfo('Session expires in 30 days')}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="calendar-outline" size={22} color="#607D8B" style={styles.optionIcon} />
              <Text style={styles.optionText}>Session Expiry</Text>
            </View>
            <View style={styles.optionRight}>
              <Text style={styles.optionSubText}>30 days</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, styles.dangerSection]}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>

          <TouchableOpacity
            style={[styles.option, styles.dangerOption]}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="trash-outline" size={22} color="#FF3B30" style={styles.optionIcon} />
              <Text style={[styles.optionText, styles.dangerText]}>
                {isDeleting ? 'Deleting…' : 'Delete Account'}
              </Text>
            </View>
            {isDeleting ? (
              <ActivityIndicator size="small" color="#FF3B30" />
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
            )}
          </TouchableOpacity>
        </View>

        {renderPasswordModal()}
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
    scrollView: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 40 },
    section: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 16,
      paddingHorizontal: 16,
      overflow: 'hidden',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.secondaryText,
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
      borderBottomColor: colors.border,
    },
    optionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    optionIcon: { marginRight: 14, width: 24 },
    optionText: { fontSize: 16, color: colors.text, flex: 1 },
    optionRight: { flexDirection: 'row', alignItems: 'center' },
    optionSubText: { fontSize: 14, color: colors.secondaryText, marginRight: 8 },
    dangerSection: {
      borderWidth: 1,
      borderColor: '#FF3B30',
      backgroundColor: isDark ? '#2A0F0F' : '#FFF5F5',
    },
    dangerTitle: { color: '#FF3B30' },
    dangerOption: { borderBottomColor: isDark ? '#3A1A1A' : '#FFE5E5' },
    dangerText: { color: '#FF3B30' },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    modalLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 4,
      marginTop: 12,
    },
    modalInput: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
    },
    modalErrorBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: isDark ? '#2A0F0F' : '#FFF5F5',
      borderRadius: 10,
      padding: 12,
      marginTop: 16,
      borderWidth: 1,
      borderColor: isDark ? '#5A1F1F' : '#FFD5D5',
    },
    modalErrorText: {
      flex: 1,
      fontSize: 13,
      color: '#FF3B30',
      lineHeight: 18,
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
      justifyContent: 'center',
      minHeight: 48,
    },
    modalCancelButton: { backgroundColor: colors.inputBackground },
    modalCancelText: { color: colors.text, fontSize: 16, fontWeight: '500' },
    modalSaveButton: { backgroundColor: colors.primary },
    modalSaveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  });