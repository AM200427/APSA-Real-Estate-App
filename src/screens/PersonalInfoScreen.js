// src/screens/PersonalInfoScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const SPECIALIZATIONS = ['Residential', 'Commercial', 'Luxury', 'Land', 'Rentals', 'Short-stay'];
const AREAS_SERVED = ['Lusaka', 'Ndola', 'Kitwe', 'Livingstone', 'Kabwe', 'Chingola', 'Solwezi', 'Mongu'];
const LANGUAGES = ['English', 'Bemba', 'Nyanja', 'Tonga', 'Lozi', 'Lunda', 'Kaonde', 'Luvale'];
const RESPONSE_TIMES = ['< 1 hr', 'Same day', '24 hrs'];
const AVAILABILITY = ['Weekdays', 'Weekends', 'Evenings'];

const InlineError = ({ message, styles }) => {
  if (!message) return null;
  return (
    <View style={styles.inlineErrorRow}>
      <Ionicons name="alert-circle" size={14} color="#FF3B30" />
      <Text style={styles.inlineErrorText}>{message}</Text>
    </View>
  );
};

const Chip = ({ label, selected, onPress, colors, isDark, interactive }) => {
  const bg = interactive
    ? selected
      ? colors.primary
      : isDark
      ? '#0A2A50'
      : '#F0F7FF'
    : isDark
    ? '#0A2A50'
    : '#F0F7FF';

  const textColor = interactive && selected ? '#FFFFFF' : colors.primary;

  const borderColor = interactive
    ? selected
      ? colors.primary
      : isDark
      ? '#123A66'
      : '#DCEAFF'
    : 'transparent';

  return (
    <TouchableOpacity
      style={[stylesStatic.chip, { backgroundColor: bg, borderColor }]}
      onPress={interactive ? onPress : undefined}
      activeOpacity={interactive ? 0.7 : 1}
      disabled={!interactive}
    >
      {interactive && selected && (
        <Ionicons name="checkmark" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
      )}
      <Text style={[stylesStatic.chipText, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
};

// Upload tile — used for ID photos and selfie
const UploadTile = ({ label, uri, onPress, onRemove, icon, colors, styles, isDark }) => (
  <View style={styles.uploadTileWrap}>
    <Text style={styles.uploadLabel}>{label}</Text>
    {uri ? (
      <View style={styles.uploadFilled}>
        <Image source={{ uri }} style={styles.uploadImage} />
        <TouchableOpacity
          style={styles.uploadRemoveBtn}
          onPress={onRemove}
          hitSlop={8}
        >
          <Ionicons name="close-circle" size={22} color="#FF3B30" />
        </TouchableOpacity>
        <View style={styles.uploadCheckBadge}>
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        </View>
      </View>
    ) : (
      <TouchableOpacity
        style={styles.uploadEmpty}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.uploadIconWrap,
            { backgroundColor: isDark ? '#0A2A50' : '#E8F0FE' },
          ]}
        >
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={styles.uploadEmptyText}>Tap to upload</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default function PersonalInfoScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { showSuccess, showError, showInfo } = useToast();
  const {
    user,
    updateProfile,
    updateAgentProfile,
    updateAgentVerification,
    properties,
    bookings,
  } = useAppStore();

  const styles = getStyles(colors, isDark);

  // Personal
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  // Agent
  const [agentBio, setAgentBio] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [company, setCompany] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [areasServed, setAreasServed] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [responseTime, setResponseTime] = useState('');
  const [availability, setAvailability] = useState([]);

  // Verification
  const [nrcNumber, setNrcNumber] = useState('');
  const [tpin, setTpin] = useState('');
  const [pacraNumber, setPacraNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [idFrontUri, setIdFrontUri] = useState('');
  const [idBackUri, setIdBackUri] = useState('');
  const [selfieUri, setSelfieUri] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState(null);
  const [yearsError, setYearsError] = useState(null);

  const isAgent = user?.role === 'Agent' || user?.role === 'agent';
  const userListings = properties?.filter((p) => p.hostId === user?.id) || [];
  const userBookings = bookings || [];

  const agentProfile = user?.agentProfile || {};
  const agentVerification = user?.agentVerification || {};
  const verificationStatus = agentVerification.status || 'unverified'; // 'unverified' | 'pending' | 'verified' | 'rejected'

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');

      const ap = user.agentProfile || {};
      setAgentBio(ap.bio || '');
      setYearsExperience(ap.yearsExperience ? String(ap.yearsExperience) : '');
      setCompany(ap.company || '');
      setSpecializations(ap.specializations || []);
      setAreasServed(ap.areasServed || []);
      setLanguages(ap.languages || []);
      setResponseTime(ap.responseTime || '');
      setAvailability(ap.availability || []);

      const av = user.agentVerification || {};
      setNrcNumber(av.nrcNumber || '');
      setTpin(av.tpin || '');
      setPacraNumber(av.pacraNumber || '');
      setLicenseNumber(av.licenseNumber || '');
      setIdFrontUri(av.idFrontUri || '');
      setIdBackUri(av.idBackUri || '');
      setSelfieUri(av.selfieUri || '');
    }
  }, [user]);

  const resetFromUser = () => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setBio(user?.bio || '');
    setAvatar(user?.avatar || '');

    const ap = user?.agentProfile || {};
    setAgentBio(ap.bio || '');
    setYearsExperience(ap.yearsExperience ? String(ap.yearsExperience) : '');
    setCompany(ap.company || '');
    setSpecializations(ap.specializations || []);
    setAreasServed(ap.areasServed || []);
    setLanguages(ap.languages || []);
    setResponseTime(ap.responseTime || '');
    setAvailability(ap.availability || []);

    const av = user?.agentVerification || {};
    setNrcNumber(av.nrcNumber || '');
    setTpin(av.tpin || '');
    setPacraNumber(av.pacraNumber || '');
    setLicenseNumber(av.licenseNumber || '');
    setIdFrontUri(av.idFrontUri || '');
    setIdBackUri(av.idBackUri || '');
    setSelfieUri(av.selfieUri || '');

    setNameError(null);
    setYearsError(null);
  };

  const toggleInArray = (value, list, setList) => {
    if (list.includes(value)) setList(list.filter((v) => v !== value));
    else setList([...list, value]);
  };

  const pickDocumentImage = async (setter) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showError('Permission needed', 'Please grant gallery access to upload documents.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setter(result.assets[0].uri);
    }
  };

  const pickSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showError('Permission needed', 'Please grant camera access for your selfie.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      cameraType: 'front',
    });
    if (!result.canceled && result.assets[0]) {
      setSelfieUri(result.assets[0].uri);
    }
  };

  const handleSubmitVerification = async () => {
    // Validate all required verification fields
    if (!nrcNumber.trim()) {
      showError('NRC required', 'Enter your NRC number.');
      return;
    }
    if (!idFrontUri) {
      showError('ID missing', 'Upload the front of your NRC.');
      return;
    }
    if (!idBackUri) {
      showError('ID missing', 'Upload the back of your NRC.');
      return;
    }
    if (!selfieUri) {
      showError('Selfie required', 'Take a selfie for identity verification.');
      return;
    }

    setIsSaving(true);
    try {
      await updateAgentVerification({
        nrcNumber: nrcNumber.trim(),
        tpin: tpin.trim(),
        pacraNumber: pacraNumber.trim(),
        licenseNumber: licenseNumber.trim(),
        idFrontUri,
        idBackUri,
        selfieUri,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      });
      showSuccess(
        'Verification submitted',
        'We will review your documents within 24–48 hours.',
        4000
      );
      setIsEditing(false);
    } catch (e) {
      showError('Submit failed', e?.message || 'Could not submit your documents.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError('Your name is required.');
      return;
    }
    if (name.trim().length < 2) {
      setNameError('Name is too short.');
      return;
    }

    if (isAgent) {
      if (!agentBio.trim()) {
        showError('Agent bio required', 'Tell buyers about your experience.');
        return;
      }
      if (agentBio.trim().length < 20) {
        showError('Bio too short', 'Try at least 20 characters.');
        return;
      }
      if (!yearsExperience.trim()) {
        setYearsError('Enter your years of experience.');
        return;
      }
      const yrs = parseInt(yearsExperience, 10);
      if (isNaN(yrs) || yrs < 0 || yrs > 60) {
        setYearsError('Enter a number between 0 and 60.');
        return;
      }
      if (specializations.length === 0) {
        showError('Specializations', 'Pick at least one area.');
        return;
      }
      if (!responseTime) {
        showError('Response time', 'Choose your typical response time.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const personalResult = await updateProfile({
        name: name.trim(),
        phone,
        bio,
        avatar,
      });

      let agentSynced = true;
      if (isAgent) {
        const agentResult = await updateAgentProfile({
          bio: agentBio.trim(),
          yearsExperience: parseInt(yearsExperience, 10) || 0,
          company: company.trim(),
          specializations,
          areasServed,
          languages,
          responseTime,
          availability,
          updatedAt: new Date().toISOString(),
        });
        agentSynced = agentResult?.synced !== false;
      }

      if (personalResult?.synced === false || !agentSynced) {
        showSuccess('Saved locally', 'Will sync when you are online.', 3000);
      } else {
        showSuccess('Profile updated ✨', 'Your changes have been saved.', 3000);
      }
      setIsEditing(false);
    } catch (e) {
      showError('Update failed', e?.message || 'Could not save your changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    resetFromUser();
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

  // -------- Verification card render --------
  const renderVerificationCard = () => {
    if (!isAgent) return null;

    const isVerified = verificationStatus === 'verified';
    const isPending = verificationStatus === 'pending';
    const isRejected = verificationStatus === 'rejected';

    // Status pill styling
    const statusConfig = isVerified
      ? { label: 'Verified', color: '#34C759', bg: isDark ? '#0A2A1A' : '#E8F8EE', icon: 'shield-checkmark' }
      : isPending
      ? { label: 'Pending review', color: '#FF9500', bg: isDark ? '#2A2010' : '#FFF4E5', icon: 'time' }
      : isRejected
      ? { label: 'Rejected', color: '#FF3B30', bg: isDark ? '#2A1010' : '#FFEBEB', icon: 'close-circle' }
      : { label: 'Not verified', color: colors.secondaryText, bg: isDark ? '#2C2C2E' : '#F1F3F5', icon: 'alert-circle' };

    return (
      <View style={[styles.section, styles.verificationCard]}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionIconWrap}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>Agent Verification</Text>
          <View style={styles.sectionHeaderSpacer} />
          <View style={[styles.statusPill, { backgroundColor: statusConfig.bg }]}>
            <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
            <Text style={[styles.statusPillText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Verified state — compact success */}
        {isVerified && (
          <View style={styles.verificationDone}>
            <Text style={styles.verificationDoneText}>
              Your identity has been verified. Your listings show the verified badge.
            </Text>
            <View style={styles.verificationMetaRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.secondaryText} />
              <Text style={styles.verificationMetaText}>
                Verified {new Date(agentVerification.verifiedAt || Date.now()).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}

        {/* Pending state — info */}
        {isPending && !isEditing && (
          <View style={styles.verificationPending}>
            <Text style={styles.verificationPendingText}>
              Your documents are under review. We'll notify you once verification is complete.
            </Text>
            <View style={styles.verificationMetaRow}>
              <Ionicons name="time-outline" size={13} color={colors.secondaryText} />
              <Text style={styles.verificationMetaText}>
                Submitted{' '}
                {agentVerification.submittedAt
                  ? new Date(agentVerification.submittedAt).toLocaleDateString()
                  : 'recently'}
              </Text>
            </View>
          </View>
        )}

        {/* Rejected state — show reason */}
        {isRejected && !isEditing && (
          <View style={styles.verificationRejected}>
            <Text style={styles.verificationRejectedText}>
              {agentVerification.rejectionReason ||
                'Some documents were not clear. Please re-upload.'}
            </Text>
          </View>
        )}

        {/* Unverified / Rejected / Pending — show the form when editing or when unverified */}
        {(!isVerified && !isPending || isEditing) && !isVerified && (
          <>
            <Text style={styles.verificationIntro}>
              To receive a verified badge and unlock payouts, we need to confirm your identity.
              Your documents are encrypted and reviewed by our team within 24–48 hours.
            </Text>

            {/* NRC number */}
            <View style={styles.field}>
              <Text style={styles.label}>NRC Number *</Text>
              <TextInput
                style={[styles.input, isEditing && styles.inputEditing]}
                value={nrcNumber}
                onChangeText={setNrcNumber}
                editable={isEditing}
                placeholder="e.g. 123456/78/9"
                placeholderTextColor={colors.secondaryText}
                keyboardType="default"
              />
              <Text style={styles.fieldHint}>Zambian National Registration Card number</Text>
            </View>

            {/* ID uploads */}
            <View style={styles.uploadRow}>
              <UploadTile
                label="NRC — Front *"
                uri={idFrontUri}
                onPress={() => pickDocumentImage(setIdFrontUri)}
                onRemove={() => setIdFrontUri('')}
                icon="card-outline"
                colors={colors}
                styles={styles}
                isDark={isDark}
              />
              <View style={{ width: 12 }} />
              <UploadTile
                label="NRC — Back *"
                uri={idBackUri}
                onPress={() => pickDocumentImage(setIdBackUri)}
                onRemove={() => setIdBackUri('')}
                icon="card-outline"
                colors={colors}
                styles={styles}
                isDark={isDark}
              />
            </View>

            {/* Selfie upload — full width */}
            <View style={styles.selfieWrap}>
              <UploadTile
                label="Selfie *"
                uri={selfieUri}
                onPress={pickSelfie}
                onRemove={() => setSelfieUri('')}
                icon="camera-outline"
                colors={colors}
                styles={styles}
                isDark={isDark}
              />
              <Text style={styles.selfieHint}>
                Take a clear photo of your face. Must match your NRC photo.
              </Text>
            </View>

            {/* Optional business details */}
            <View style={styles.field}>
              <Text style={styles.label}>TPIN (optional)</Text>
              <TextInput
                style={[styles.input, isEditing && styles.inputEditing]}
                value={tpin}
                onChangeText={setTpin}
                editable={isEditing}
                placeholder="Taxpayer Identification Number"
                placeholderTextColor={colors.secondaryText}
              />
              <Text style={styles.fieldHint}>Required for payouts</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>PACRA Registration (optional)</Text>
              <TextInput
                style={[styles.input, isEditing && styles.inputEditing]}
                value={pacraNumber}
                onChangeText={setPacraNumber}
                editable={isEditing}
                placeholder="Company registration number"
                placeholderTextColor={colors.secondaryText}
              />
              <Text style={styles.fieldHint}>If you operate as a registered business</Text>
            </View>

            <View style={styles.fieldLast}>
              <Text style={styles.label}>Real Estate License (optional)</Text>
              <TextInput
                style={[styles.input, isEditing && styles.inputEditing]}
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                editable={isEditing}
                placeholder="License number"
                placeholderTextColor={colors.secondaryText}
              />
              <Text style={styles.fieldHint}>If you hold a professional license</Text>
            </View>

            {/* Submit button — only in edit mode */}
            {isEditing && verificationStatus !== 'pending' && (
              <TouchableOpacity
                style={styles.submitVerificationBtn}
                onPress={handleSubmitVerification}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
                    <Text style={styles.submitVerificationText}>
                      Submit for verification
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBtn}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Information</Text>
          {isEditing ? (
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              style={styles.headerBtn}
              hitSlop={8}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.headerSaveText}>Save</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={styles.headerEditBtn}
              hitSlop={8}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={16} color={colors.primary} />
              <Text style={styles.headerEditText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Identity card */}
          <View style={styles.identityCard}>
            <TouchableOpacity
              style={styles.avatarWrap}
              onPress={isEditing ? pickImage : undefined}
              activeOpacity={isEditing ? 0.85 : 1}
            >
              <Image
                source={{ uri: avatar || 'https://i.pravatar.cc/150?img=1' }}
                style={styles.avatar}
              />
              {isEditing && (
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={13} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.name}>{name || 'User'}</Text>
            <Text style={styles.email}>{email || 'guest@email.com'}</Text>

                        {/* 🔥 DYNAMIC ROLE PILL */}
            <View
              style={[
                styles.rolePill,
                {
                  backgroundColor: !isAgent
                    ? isDark ? '#0A2A1A' : '#E8F8EE' // Green for client
                    : verificationStatus === 'verified'
                    ? isDark ? '#0A2A50' : '#E8F0FE' // Blue for verified agent
                    : verificationStatus === 'pending'
                    ? isDark ? '#2A2010' : '#FFF4E5' // Orange for pending
                    : isDark ? '#2A1010' : '#FFEBEB', // Red for unverified/rejected
                },
              ]}
            >
              <Ionicons
                name={
                  !isAgent
                    ? 'person'
                    : verificationStatus === 'verified'
                    ? 'shield-checkmark'
                    : verificationStatus === 'pending'
                    ? 'time'
                    : 'alert-circle'
                }
                size={12}
                color={
                  !isAgent
                    ? '#34C759'
                    : verificationStatus === 'verified'
                    ? colors.primary
                    : verificationStatus === 'pending'
                    ? '#FF9500'
                    : '#FF3B30'
                }
              />
              <Text
                style={[
                  styles.rolePillText,
                  {
                    color: !isAgent
                      ? '#34C759'
                      : verificationStatus === 'verified'
                      ? colors.primary
                      : verificationStatus === 'pending'
                      ? '#FF9500'
                      : '#FF3B30',
                  },
                ]}
              >
                {!isAgent
                  ? 'Client'
                  : verificationStatus === 'verified'
                  ? 'Verified Agent'
                  : verificationStatus === 'pending'
                  ? 'Verification Pending'
                  : 'Unverified Agent'}
              </Text>
            </View>
          </View>

          {/* Stats */}
          {isAgent && (
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userListings.length}</Text>
                <Text style={styles.statLabel}>Listings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userBookings.length}</Text>
                <Text style={styles.statLabel}>Bookings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.reviews?.length || 0}</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
            </View>
          )}

          {/* Personal Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconWrap}>
                <Ionicons name="person-outline" size={16} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, isEditing && styles.inputEditing]}
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  if (nameError) setNameError(null);
                }}
                editable={isEditing}
                placeholder="Your name"
                placeholderTextColor={colors.secondaryText}
              />
              <InlineError message={nameError} styles={styles} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={email}
                editable={false}
                placeholder="Email"
                placeholderTextColor={colors.secondaryText}
              />
              <Text style={styles.fieldHint}>Contact support to change</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={[styles.input, isEditing && styles.inputEditing]}
                value={phone}
                onChangeText={setPhone}
                editable={isEditing}
                placeholder="Phone number"
                keyboardType="phone-pad"
                placeholderTextColor={colors.secondaryText}
              />
            </View>

            <View style={styles.fieldLast}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput, isEditing && styles.inputEditing]}
                value={bio}
                onChangeText={setBio}
                editable={isEditing}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor={colors.secondaryText}
                maxLength={300}
              />
              {isEditing && <Text style={styles.charCount}>{bio.length}/300</Text>}
            </View>
          </View>

          {/* Agent Details */}
          {isAgent && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionIconWrap}>
                  <Ionicons name="briefcase-outline" size={16} color={colors.primary} />
                </View>
                <Text style={styles.sectionTitle}>Agent Details</Text>
              </View>

              <View style={styles.fieldLast}>
                <Text style={styles.label}>Professional bio *</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.bioInput,
                    isEditing && styles.inputEditing,
                  ]}
                  value={agentBio}
                  onChangeText={setAgentBio}
                  editable={isEditing}
                  placeholder="e.g. Property specialist with 8+ years helping clients find their perfect home..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor={colors.secondaryText}
                  maxLength={500}
                />
                {isEditing && (
                  <Text style={styles.charCount}>{agentBio.length}/500</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Company</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.input, styles.inputEditing]}
                    value={company}
                    onChangeText={setCompany}
                    placeholder="e.g. APSA Realty"
                    placeholderTextColor={colors.secondaryText}
                  />
                ) : (
                  <Text style={styles.readValue}>{company || 'Not set'}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Years of experience *</Text>
                {isEditing ? (
                  <>
                    <TextInput
                      style={[
                        styles.input,
                        styles.inputEditing,
                        yearsError && styles.inputError,
                      ]}
                      value={yearsExperience}
                      onChangeText={(t) => {
                        setYearsExperience(t);
                        if (yearsError) setYearsError(null);
                      }}
                      placeholder="8"
                      keyboardType="numeric"
                      maxLength={2}
                      placeholderTextColor={colors.secondaryText}
                    />
                    <InlineError message={yearsError} styles={styles} />
                  </>
                ) : (
                  <Text style={styles.readValue}>
                    {yearsExperience
                      ? `${yearsExperience} year${parseInt(yearsExperience) > 1 ? 's' : ''}`
                      : 'Not set'}
                  </Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Response time *</Text>
                {isEditing ? (
                  <View style={styles.chipsWrap}>
                    {RESPONSE_TIMES.map((r) => (
                      <Chip
                        key={r}
                        label={r}
                        selected={responseTime === r}
                        onPress={() => setResponseTime(r)}
                        colors={colors}
                        isDark={isDark}
                        interactive
                      />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.readValue}>{responseTime || 'Not set'}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Specializations *</Text>
                {isEditing ? (
                  <View style={styles.chipsWrap}>
                    {SPECIALIZATIONS.map((s) => (
                      <Chip
                        key={s}
                        label={s}
                        selected={specializations.includes(s)}
                        onPress={() => toggleInArray(s, specializations, setSpecializations)}
                        colors={colors}
                        isDark={isDark}
                        interactive
                      />
                    ))}
                  </View>
                ) : specializations.length > 0 ? (
                  <View style={styles.chipsWrap}>
                    {specializations.map((s, i) => (
                      <Chip key={i} label={s} colors={colors} isDark={isDark} />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.readValue}>Not set</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Areas served</Text>
                {isEditing ? (
                  <View style={styles.chipsWrap}>
                    {AREAS_SERVED.map((a) => (
                      <Chip
                        key={a}
                        label={a}
                        selected={areasServed.includes(a)}
                        onPress={() => toggleInArray(a, areasServed, setAreasServed)}
                        colors={colors}
                        isDark={isDark}
                        interactive
                      />
                    ))}
                  </View>
                ) : areasServed.length > 0 ? (
                  <View style={styles.chipsWrap}>
                    {areasServed.map((a, i) => (
                      <Chip key={i} label={a} colors={colors} isDark={isDark} />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.readValue}>Not set</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Languages spoken</Text>
                {isEditing ? (
                  <View style={styles.chipsWrap}>
                    {LANGUAGES.map((l) => (
                      <Chip
                        key={l}
                        label={l}
                        selected={languages.includes(l)}
                        onPress={() => toggleInArray(l, languages, setLanguages)}
                        colors={colors}
                        isDark={isDark}
                        interactive
                      />
                    ))}
                  </View>
                ) : languages.length > 0 ? (
                  <View style={styles.chipsWrap}>
                    {languages.map((l, i) => (
                      <Chip key={i} label={l} colors={colors} isDark={isDark} />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.readValue}>Not set</Text>
                )}
              </View>

              <View style={styles.fieldLast}>
                <Text style={styles.label}>Availability</Text>
                {isEditing ? (
                  <View style={styles.chipsWrap}>
                    {AVAILABILITY.map((a) => (
                      <Chip
                        key={a}
                        label={a}
                        selected={availability.includes(a)}
                        onPress={() => toggleInArray(a, availability, setAvailability)}
                        colors={colors}
                        isDark={isDark}
                        interactive
                      />
                    ))}
                  </View>
                ) : availability.length > 0 ? (
                  <View style={styles.chipsWrap}>
                    {availability.map((a, i) => (
                      <Chip key={i} label={a} colors={colors} isDark={isDark} />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.readValue}>Not set</Text>
                )}
              </View>
            </View>
          )}

          {/* Agent Verification — agents only */}
          {renderVerificationCard()}

          {/* Spacer when editing */}
          {isEditing && <View style={{ height: 1 }} />}
        </ScrollView>

        {/* Sticky bottom bar */}
        {isEditing && (
          <SafeAreaView edges={['bottom']} style={styles.stickyBarSafe}>
            <View style={styles.stickyBar}>
              <View style={styles.stickyHelperRow}>
                <Ionicons
                  name="information-circle-outline"
                  size={14}
                  color={colors.secondaryText}
                />
                <Text style={styles.stickyHelperText}>
                  Changes apply to your profile and listings.
                </Text>
              </View>

              <View style={styles.stickyActions}>
                <TouchableOpacity
                  style={styles.stickyCancelBtn}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                >
                  <Text style={styles.stickyCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.stickySaveBtn, isSaving && styles.stickySaveBtnDisabled]}
                  onPress={handleSave}
                  disabled={isSaving}
                  activeOpacity={0.85}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                      <Text style={styles.stickySaveText}>Save changes</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const stylesStatic = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
});

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    headerBtn: { padding: 4, minWidth: 44 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
    headerEditBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
    },
    headerEditText: { fontSize: 14, fontWeight: '700', color: colors.primary },
    headerSaveText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'right',
    },

    scrollContent: { paddingBottom: 1 },

    identityCard: {
      alignItems: 'center',
      paddingTop: 24,
      paddingBottom: 20,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
    avatarWrap: { position: 'relative', marginBottom: 14 },
    avatar: {
      width: 92,
      height: 92,
      borderRadius: 46,
      borderWidth: 3,
      borderColor: colors.card,
      backgroundColor: colors.inputBackground,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2.5,
      borderColor: colors.card,
    },
    name: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 2 },
    email: { fontSize: 13, color: colors.secondaryText, marginBottom: 10 },
    rolePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 14,
    },
    rolePillText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },

    statsCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 18,
      paddingVertical: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: '800', color: colors.text },
    statLabel: {
      fontSize: 11.5,
      color: colors.secondaryText,
      marginTop: 2,
      fontWeight: '500',
    },
    statDivider: { width: 1, backgroundColor: colors.border, marginVertical: 6 },

    section: {
      backgroundColor: colors.card,
      borderRadius: 20,
      marginHorizontal: 16,
      marginTop: 12,
      paddingHorizontal: 18,
      paddingVertical: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
    verificationCard: {
      // slightly stronger border for emphasis
      borderWidth: 1,
      borderColor: isDark ? '#123A66' : '#DCEAFF',
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 6,
    },
    sectionIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 9,
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
    sectionHeaderSpacer: { flex: 1 },

    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusPillText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.2,
    },

    // Verification content
    verificationIntro: {
      fontSize: 13,
      color: colors.secondaryText,
      lineHeight: 19,
      marginTop: 6,
      marginBottom: 12,
    },
    verificationDone: {
      paddingVertical: 12,
    },
    verificationDoneText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginBottom: 8,
    },
    verificationPending: {
      paddingVertical: 12,
    },
    verificationPendingText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginBottom: 8,
    },
    verificationRejected: {
      backgroundColor: isDark ? '#2A1010' : '#FFF1F0',
      borderRadius: 12,
      padding: 12,
      marginVertical: 12,
    },
    verificationRejectedText: {
      fontSize: 13,
      color: '#FF3B30',
      lineHeight: 19,
    },
    verificationMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    verificationMetaText: {
      fontSize: 12,
      color: colors.secondaryText,
    },

    // Upload tiles
    uploadRow: {
      flexDirection: 'row',
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    selfieWrap: {
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    uploadTileWrap: {
      flex: 1,
    },
    uploadLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.secondaryText,
      marginBottom: 8,
      letterSpacing: 0.2,
    },
    uploadEmpty: {
      aspectRatio: 1.5,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: isDark ? '#123A66' : '#DCEAFF',
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      gap: 6,
    },
    uploadIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadEmptyText: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: '600',
    },
    uploadFilled: {
      aspectRatio: 1.5,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: colors.inputBackground,
    },
    uploadImage: {
      width: '100%',
      height: '100%',
    },
    uploadRemoveBtn: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
    },
    uploadCheckBadge: {
      position: 'absolute',
      bottom: 6,
      left: 6,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#34C759',
      alignItems: 'center',
      justifyContent: 'center',
    },
    selfieHint: {
      fontSize: 11,
      color: colors.secondaryText,
      marginTop: 8,
      fontStyle: 'italic',
    },

    // Submit verification button
    submitVerificationBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      marginTop: 16,
      borderRadius: 14,
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    submitVerificationText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.2,
    },

    // Fields
    field: {
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    fieldLast: { paddingVertical: 12 },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.secondaryText,
      marginBottom: 8,
      letterSpacing: 0.2,
    },
    input: {
      fontSize: 15.5,
      color: colors.text,
      paddingVertical: 4,
      paddingHorizontal: 0,
    },
    inputEditing: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    inputError: { borderColor: '#FF3B30' },
    inputDisabled: { color: colors.secondaryText },
    fieldHint: {
      fontSize: 11,
      color: colors.secondaryText,
      marginTop: 4,
      fontStyle: 'italic',
    },
    bioInput: { minHeight: 68, textAlignVertical: 'top' },
    charCount: {
      fontSize: 11,
      color: colors.secondaryText,
      textAlign: 'right',
      marginTop: 4,
    },
    readValue: { fontSize: 15, color: colors.text, paddingVertical: 2 },

    inlineErrorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 6,
    },
    inlineErrorText: {
      fontSize: 12,
      color: '#FF3B30',
      fontWeight: '500',
      flex: 1,
    },

    chipsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 2,
    },

    // Sticky bar
    stickyBarSafe: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: isDark ? 0.4 : 0.08,
      shadowRadius: 16,
      elevation: 12,
      borderTopWidth: 0.5,
      borderTopColor: colors.border,
    },
    stickyBar: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 },
    stickyHelperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 4,
      marginBottom: 12,
    },
    stickyHelperText: {
      fontSize: 12,
      color: colors.secondaryText,
      flex: 1,
      lineHeight: 16,
    },
    stickyActions: { flexDirection: 'row', gap: 10 },
    stickyCancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stickyCancelText: { fontSize: 15, fontWeight: '600', color: colors.text },
    stickySaveBtn: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
    stickySaveBtnDisabled: { opacity: 0.7 },
    stickySaveText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.2,
    },
  });