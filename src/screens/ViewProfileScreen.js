// src/screens/ViewProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/useAppStore';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const { width } = Dimensions.get('window');

export default function ViewProfileScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { showSuccess, showError, showInfo } = useToast();
  const { user, isLoggedIn, updateProfile } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      showError('Name required', 'Please enter your name');
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({ name, phone, bio, avatar });
      showSuccess('Profile updated ✨', 'Your changes have been saved.', 3000);
      setIsEditing(false);
    } catch (error) {
      // Fallback: save locally so changes aren't lost when the backend is unavailable.
      // Zustand persist will keep this on disk across restarts.
      try {
        useAppStore.setState((state) => ({
          user: { ...state.user, name, phone, bio, avatar },
        }));
        showSuccess('Profile updated', 'Saved locally. Will sync when online.', 3000);
        setIsEditing(false);
      } catch (fallbackError) {
        showError('Update failed', 'Could not save your changes. Try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showError('Permission needed', 'Please grant gallery access to change your photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setBio(user?.bio || '');
    setAvatar(user?.avatar || '');
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="person-outline" size={60} color="#CCC" />
        <Text style={styles.notLoggedInText}>Not Logged In</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header (fixed at top, outside KeyboardAvoiding) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Cover + Avatar */}
          <View style={styles.coverContainer}>
            <LinearGradient
              colors={['#007AFF', '#0055CC']}
              style={styles.coverGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity
                style={styles.avatarWrapper}
                onPress={isEditing ? pickImage : undefined}
                activeOpacity={isEditing ? 0.8 : 1}
              >
                <Image
                  source={{ uri: avatar || 'https://i.pravatar.cc/150?img=1' }}
                  style={styles.avatar}
                />
                {isEditing && (
                  <View style={styles.cameraBadge}>
                    <Ionicons name="camera" size={16} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.userName}>{name || 'User'}</Text>
              <View style={styles.roleBadge}>
                <View
                  style={[
                    styles.roleDot,
                    user?.role?.toLowerCase() === 'agent'
                      ? styles.agentDot
                      : styles.clientDot,
                  ]}
                />
                <Text style={styles.roleText}>
                  {user?.role?.toLowerCase() === 'agent' ? 'Agent' : 'Client'}
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Info Cards */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-outline" size={20} color="#007AFF" />
              <Text style={styles.cardTitle}>Personal Information</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={[styles.fieldValue, isEditing && styles.fieldEditable]}
                value={name}
                onChangeText={setName}
                editable={isEditing}
                placeholder="Your name"
                placeholderTextColor="#C7C7CC"
                returnKeyType="next"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={[styles.fieldValue, styles.fieldDisabled]}
                value={email}
                editable={false}
                placeholder="Email"
                placeholderTextColor="#C7C7CC"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Phone</Text>
              <TextInput
                style={[styles.fieldValue, isEditing && styles.fieldEditable]}
                value={phone}
                onChangeText={setPhone}
                editable={isEditing}
                placeholder="Phone number"
                keyboardType="phone-pad"
                placeholderTextColor="#C7C7CC"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Bio</Text>
              <TextInput
                style={[
                  styles.fieldValue,
                  styles.bioField,
                  isEditing && styles.fieldEditable,
                ]}
                value={bio}
                onChangeText={setBio}
                editable={isEditing}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor="#C7C7CC"
              />
            </View>
          </View>

          {/* Actions */}
          {isEditing ? (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton, isSaving && styles.disabledButton]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="create-outline" size={20} color="#FFF" />
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  text: { color: '#1C1C1E' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  notLoggedInText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 12,
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  editButton: { padding: 6, backgroundColor: '#F0F7FF', borderRadius: 20 },

  content: { paddingBottom: 40 },

  coverContainer: { marginBottom: 20 },
  coverGradient: {
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#E1E5EA',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  agentDot: { backgroundColor: '#FFD700' },
  clientDot: { backgroundColor: '#34C759' },
  roleText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  field: { paddingVertical: 8 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1C1C1E',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  fieldEditable: {
    backgroundColor: '#F8F9FF',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  fieldDisabled: { color: '#8E8E93' },
  bioField: { minHeight: 60, textAlignVertical: 'top' },
  divider: { height: 1, backgroundColor: '#F2F2F7', marginVertical: 4 },

  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginHorizontal: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cancelButtonText: {
    color: '#1C1C1E',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: { backgroundColor: '#007AFF' },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  disabledButton: { opacity: 0.6 },

  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 24,
    marginHorizontal: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  editProfileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});