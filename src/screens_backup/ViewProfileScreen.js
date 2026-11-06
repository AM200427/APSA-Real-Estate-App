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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/useAppStore';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext'; // ✅ Theme hook
import Text from '../components/AccessibleText';

const { width } = Dimensions.get('window');

export default function ViewProfileScreen({ navigation }) {
  const { colors, isDark } = useTheme(); // ✅ Get theme
  const { user, isLoggedIn, updateProfile, isLoading } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const styles = getStyles(colors, isDark); // ✅ Generate themed styles

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
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({ name, phone, bio, avatar });
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant gallery permissions');
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

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="person-outline" size={60} color={colors.secondaryText} />
        <Text style={styles.notLoggedInText}>Not Logged In</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        {!isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cover + Avatar */}
        <View style={styles.coverContainer}>
          <LinearGradient
            colors={['#007AFF', '#0055CC']}
            style={styles.coverGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity style={styles.avatarWrapper} onPress={isEditing ? pickImage : undefined}>
              <Image source={{ uri: avatar || 'https://i.pravatar.cc/150?img=1' }} style={styles.avatar} />
              {isEditing && (
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={16} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.userName}>{name || 'User'}</Text>
            <View style={styles.roleBadge}>
              <View style={[styles.roleDot, user?.role === 'Agent' ? styles.agentDot : styles.clientDot]} />
              <Text style={styles.roleText}>{user?.role || 'Client'}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Info Cards */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
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
              placeholderTextColor={colors.secondaryText}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={[styles.fieldValue, { color: colors.secondaryText }]}
              value={email}
              editable={false}
              placeholder="Email"
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
              placeholderTextColor={colors.secondaryText}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[styles.fieldValue, styles.bioField, isEditing && styles.fieldEditable]}
              value={bio}
              onChangeText={setBio}
              editable={isEditing}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor={colors.secondaryText}
            />
          </View>
        </View>

        {/* Actions */}
        {isEditing ? (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => {
              setIsEditing(false);
              setName(user?.name || '');
              setPhone(user?.phone || '');
              setBio(user?.bio || '');
              setAvatar(user?.avatar || '');
            }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.saveButton, isSaving && styles.disabledButton]} onPress={handleSave} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.editProfileButton} onPress={() => setIsEditing(true)}>
            <Ionicons name="create-outline" size={20} color="#FFF" />
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ✅ Styles generated from theme colors
const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    notLoggedInText: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 12 },
    loginButton: { marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 48, paddingVertical: 14, borderRadius: 12 },
    loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

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
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    editButton: {
      padding: 6,
      backgroundColor: colors.inputBackground,
      borderRadius: 20,
    },

    content: { paddingBottom: 40 },

    coverContainer: { marginBottom: 20 },
    coverGradient: {
      paddingTop: 40,
      paddingBottom: 30,
      alignItems: 'center',
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    avatarWrapper: {
      position: 'relative',
      marginBottom: 12,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 4,
      borderColor: '#FFFFFF',
      backgroundColor: colors.inputBackground,
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
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
    roleDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
    },
    agentDot: { backgroundColor: '#FFD700' },
    clientDot: { backgroundColor: '#34C759' },
    roleText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },

    card: {
      backgroundColor: colors.card,
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
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    field: { paddingVertical: 8 },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.secondaryText,
      marginBottom: 4,
    },
    fieldValue: {
      fontSize: 16,
      color: colors.text,
      paddingVertical: 4,
      paddingHorizontal: 0,
      backgroundColor: 'transparent',
    },
    fieldEditable: {
      borderBottomWidth: 1,
      borderBottomColor: colors.primary,
      paddingBottom: 2,
    },
    bioField: { minHeight: 60, textAlignVertical: 'top' },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },

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
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
    },
    saveButton: { backgroundColor: colors.primary },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    disabledButton: { opacity: 0.6 },

    editProfileButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 14,
      gap: 8,
      marginTop: 24,
      marginHorizontal: 16,
      shadowColor: colors.primary,
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