// src/screens/PersonalInfoScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext'; // ✅ Theme hook
import * as ImagePicker from 'expo-image-picker';
import Text from '../components/AccessibleText';

const { width } = Dimensions.get('window');

export default function PersonalInfoScreen({ navigation }) {
  const { colors, isDark } = useTheme(); // ✅ Get theme
  const { user, updateProfile, isLoading, properties, bookings } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isAgent = user?.role === 'Agent' || user?.role === 'agent';
  const userListings = properties?.filter(p => p.hostId === user?.id) || [];
  const userBookings = bookings || [];

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={isAgent ? ['#6C63FF', '#3F3D8C'] : ['#007AFF', '#0055CC']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editToggle}>
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Avatar & Name */}
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
          <Ionicons name={isAgent ? 'shield-checkmark' : 'person'} size={14} color="#FFF" />
          <Text style={styles.roleText}>{isAgent ? 'Agent' : 'Client'}</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Agent Stats Card */}
        {isAgent && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userListings.length}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userBookings.length}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.reviews?.length || 0}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        )}

        {/* Personal Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={20} color={isAgent ? '#6C63FF' : colors.primary} />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, isEditing && styles.inputEditable]}
              value={name}
              onChangeText={setName}
              editable={isEditing}
              placeholder="Your name"
              placeholderTextColor={colors.secondaryText}
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, { color: colors.secondaryText }]}
              value={email}
              editable={false}
              placeholder="Email"
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={[styles.input, isEditing && styles.inputEditable]}
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
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput, isEditing && styles.inputEditable]}
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

        {/* Action Buttons */}
        {isEditing ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setIsEditing(false);
                setName(user?.name || '');
                setPhone(user?.phone || '');
                setBio(user?.bio || '');
                setAvatar(user?.avatar || '');
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton, isSaving && styles.disabledButton]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Save</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.editProfileButton, isAgent && styles.agentEditButton]}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="create-outline" size={20} color="#FFF" />
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

        {/* Agent Badge */}
        {isAgent && (
          <View style={styles.agentPromo}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.agentPromoText}>Verified Agent</Text>
            <Text style={styles.agentPromoSub}>Trusted by property seekers</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ✅ Styles generated from theme colors
const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    // Header
    headerGradient: {
      paddingTop: 12,
      paddingBottom: 30,
      alignItems: 'center',
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 16,
      paddingTop: 4,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
    editToggle: {
      padding: 4,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 20,
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarWrapper: {
      position: 'relative',
      marginTop: 8,
      marginBottom: 8,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 4,
      borderColor: '#FFFFFF',
      backgroundColor: colors.inputBackground,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
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
      marginTop: 4,
    },
    roleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderRadius: 20,
      marginTop: 4,
      gap: 6,
    },
    roleText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },

    content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },

    // Stats Card
    statsCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNumber: { fontSize: 22, fontWeight: '700', color: colors.text },
    statLabel: { fontSize: 13, color: colors.secondaryText, marginTop: 2 },
    statDivider: { width: 1, backgroundColor: colors.border },

    // Personal Info Card
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
      marginBottom: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
    field: { marginBottom: 12 },
    label: { fontSize: 13, fontWeight: '500', color: colors.secondaryText, marginBottom: 4 },
    input: {
      fontSize: 16,
      color: colors.text,
      paddingVertical: 8,
      paddingHorizontal: 0,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    inputEditable: {
      borderBottomColor: colors.primary,
      borderBottomWidth: 1.5,
    },
    bioInput: { minHeight: 60, textAlignVertical: 'top' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },

    // Actions
    actionRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 4,
      marginBottom: 16,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelText: { color: colors.text, fontSize: 16, fontWeight: '500' },
    saveButton: { backgroundColor: colors.primary },
    saveText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    disabledButton: { opacity: 0.6 },

    editProfileButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
      marginBottom: 16,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    },
    agentEditButton: {
      backgroundColor: '#6C63FF',
      shadowColor: '#6C63FF',
    },
    editProfileButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

    // Agent Promotion
    agentPromo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#2C2200' : '#FFF8E1',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      gap: 8,
      marginTop: 4,
    },
    agentPromoText: { fontSize: 16, fontWeight: '600', color: '#F57C00' },
    agentPromoSub: { fontSize: 12, color: '#F57C00', opacity: 0.8 },
  });