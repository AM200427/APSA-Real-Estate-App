// src/screens/AgentProfileScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

const AVATAR_FALLBACK = 'https://i.pravatar.cc/150?img=1';

const SPECIALIZATIONS = [
  'Residential',
  'Commercial',
  'Luxury',
  'Land',
  'Rentals',
  'Short-stay',
];

const AREAS_SERVED = [
  'Lusaka',
  'Ndola',
  'Kitwe',
  'Livingstone',
  'Kabwe',
  'Chingola',
  'Solwezi',
  'Mongu',
];

const LANGUAGES = [
  'English',
  'Bemba',
  'Nyanja',
  'Tonga',
  'Lozi',
  'Lunda',
  'Kaonde',
  'Luvale',
];

const RESPONSE_TIMES = ['< 1 hr', 'Same day', '24 hrs'];

const AVAILABILITY = ['Weekdays', 'Weekends', 'Evenings'];

// Reusable chip — receives theme-aware styles as a prop
const Chip = ({ label, selected, onPress, icon, styles, colors }) => (
  <TouchableOpacity
    style={[styles.chip, selected && styles.chipActive]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    {icon && (
      <Ionicons
        name={selected ? 'checkmark' : icon}
        size={14}
        color={selected ? '#FFFFFF' : colors.primary}
      />
    )}
    <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// Inline error message — receives styles as a prop
const InlineError = ({ message, styles }) => {
  if (!message) return null;
  return (
    <View style={styles.inlineErrorRow}>
      <Ionicons name="alert-circle" size={14} color="#FF3B30" />
      <Text style={styles.inlineErrorText}>{message}</Text>
    </View>
  );
};

export default function AgentProfileScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { user, updateAgentProfile } = useAppStore();
  const { showSuccess, showError } = useToast();

  const styles = getStyles(colors, isDark);

  const [bio, setBio] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [company, setCompany] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [areasServed, setAreasServed] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [responseTime, setResponseTime] = useState('');
  const [availability, setAvailability] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Inline validation errors
  const [errors, setErrors] = useState({
    bio: null,
    yearsExperience: null,
    specializations: null,
    responseTime: null,
  });

  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Load existing values on mount
  useEffect(() => {
    const p = user?.agentProfile || {};
    setBio(p.bio || '');
    setYearsExperience(p.yearsExperience ? String(p.yearsExperience) : '');
    setCompany(p.company || '');
    setSpecializations(p.specializations || []);
    setAreasServed(p.areasServed || []);
    setLanguages(p.languages || []);
    setResponseTime(p.responseTime || '');
    setAvailability(p.availability || []);
  }, [user?.agentProfile]);

  const toggleInArray = (value, list, setList) => {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  const clearError = (key) => {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: null } : prev));
  };

  const validate = () => {
    const next = {
      bio: null,
      yearsExperience: null,
      specializations: null,
      responseTime: null,
    };

    if (!bio.trim()) {
      next.bio = 'Add a short bio so buyers know who they are contacting.';
    } else if (bio.trim().length < 20) {
      next.bio = 'A bit more detail helps — try at least 20 characters.';
    }

    if (!yearsExperience.trim()) {
      next.yearsExperience = 'Enter your years of experience.';
    } else {
      const years = parseInt(yearsExperience, 10);
      if (isNaN(years) || years < 0 || years > 60) {
        next.yearsExperience = 'Enter a number between 0 and 60.';
      }
    }

    if (specializations.length === 0) {
      next.specializations = 'Pick at least one area you specialize in.';
    }

    if (!responseTime) {
      next.responseTime = 'Choose how quickly you typically respond.';
    }

    setErrors(next);
    return !Object.values(next).some((v) => v !== null);
  };

  const runShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSave = async () => {
    if (!validate()) {
      runShake();
      return;
    }

    setIsSaving(true);
    try {
      await updateAgentProfile({
        bio: bio.trim(),
        yearsExperience: parseInt(yearsExperience, 10) || 0,
        company: company.trim(),
        specializations,
        areasServed,
        languages,
        responseTime,
        availability,
        updatedAt: new Date().toISOString(),
      });

      showSuccess(
        'Agent profile saved ✨',
        'Your details will appear on every listing.',
        3000
      );
      navigation.goBack();
    } catch (e) {
      showError('Save failed', e?.message || 'Could not save your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const shakeStyle = {
    transform: [
      {
        translateX: shakeAnim.interpolate({
          inputRange: [-1, 1],
          outputRange: [-8, 8],
        }),
      },
    ],
  };

  const missingCount = Object.values(errors).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agent Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={styles.headerSaveBtn}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.headerSaveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar + Name (read-only) */}
          <View style={styles.avatarSection}>
            <Image
              source={{ uri: user?.avatar || AVATAR_FALLBACK }}
              style={styles.avatar}
            />
            <View style={styles.nameRow}>
              <Text style={styles.name}>{user?.name || 'Agent'}</Text>
              <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
            </View>
            <Text style={styles.subtitle}>
              This information appears on every property you list
            </Text>
          </View>

          {/* Error summary banner */}
          {missingCount > 0 && (
            <Animated.View style={[styles.errorBanner, shakeStyle]}>
              <Ionicons name="alert-circle" size={20} color="#FF3B30" />
              <View style={styles.errorBannerTextCol}>
                <Text style={styles.errorBannerTitle}>
                  {missingCount === 1
                    ? 'One field needs your attention'
                    : `${missingCount} fields need your attention`}
                </Text>
                <Text style={styles.errorBannerSubtitle}>
                  Check the highlighted fields below
                </Text>
              </View>
            </Animated.View>
          )}

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About you</Text>
            <Text style={styles.label}>Bio *</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.bio && styles.inputError]}
              placeholder="e.g. Property specialist with 8+ years of experience helping clients find their perfect home in Lusaka..."
              placeholderTextColor={colors.secondaryText}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={bio}
              onChangeText={(t) => {
                setBio(t);
                clearError('bio');
              }}
              maxLength={500}
            />
            {errors.bio ? (
              <InlineError message={errors.bio} styles={styles} />
            ) : (
              <Text style={styles.charCount}>{bio.length}/500</Text>
            )}
          </View>

          {/* Experience + Company */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Years *</Text>
                <TextInput
                  style={[styles.input, errors.yearsExperience && styles.inputError]}
                  placeholder="8"
                  placeholderTextColor={colors.secondaryText}
                  keyboardType="numeric"
                  value={yearsExperience}
                  onChangeText={(t) => {
                    setYearsExperience(t);
                    clearError('yearsExperience');
                  }}
                  maxLength={2}
                />
                {errors.yearsExperience ? (
                  <InlineError message={errors.yearsExperience} styles={styles} />
                ) : null}
              </View>
              <View style={[styles.halfCol, { marginLeft: 12 }]}>
                <Text style={styles.label}>Company</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. APSA Realty"
                  placeholderTextColor={colors.secondaryText}
                  value={company}
                  onChangeText={setCompany}
                />
              </View>
            </View>
          </View>

          {/* Specializations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Specializations <Text style={styles.requiredStar}>*</Text>
            </Text>
            <Text style={styles.helper}>Pick everything you focus on</Text>
            <View
              style={[
                styles.chipsWrap,
                errors.specializations && styles.chipsWrapError,
              ]}
            >
              {SPECIALIZATIONS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  selected={specializations.includes(s)}
                  onPress={() => {
                    toggleInArray(s, specializations, setSpecializations);
                    clearError('specializations');
                  }}
                  icon="add"
                  styles={styles}
                  colors={colors}
                />
              ))}
            </View>
            {errors.specializations ? (
              <InlineError message={errors.specializations} styles={styles} />
            ) : null}
          </View>

          {/* Areas Served */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Areas served</Text>
            <Text style={styles.helper}>Where do you work?</Text>
            <View style={styles.chipsWrap}>
              {AREAS_SERVED.map((a) => (
                <Chip
                  key={a}
                  label={a}
                  selected={areasServed.includes(a)}
                  onPress={() => toggleInArray(a, areasServed, setAreasServed)}
                  icon="add"
                  styles={styles}
                  colors={colors}
                />
              ))}
            </View>
          </View>

          {/* Languages */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages spoken</Text>
            <View style={styles.chipsWrap}>
              {LANGUAGES.map((l) => (
                <Chip
                  key={l}
                  label={l}
                  selected={languages.includes(l)}
                  onPress={() => toggleInArray(l, languages, setLanguages)}
                  icon="add"
                  styles={styles}
                  colors={colors}
                />
              ))}
            </View>
          </View>

          {/* Response time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Typical response time <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View
              style={[
                styles.chipsWrap,
                errors.responseTime && styles.chipsWrapError,
              ]}
            >
              {RESPONSE_TIMES.map((r) => (
                <Chip
                  key={r}
                  label={r}
                  selected={responseTime === r}
                  onPress={() => {
                    setResponseTime(r);
                    clearError('responseTime');
                  }}
                  icon="time-outline"
                  styles={styles}
                  colors={colors}
                />
              ))}
            </View>
            {errors.responseTime ? (
              <InlineError message={errors.responseTime} styles={styles} />
            ) : null}
          </View>

          {/* Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <Text style={styles.helper}>When can buyers reach you?</Text>
            <View style={styles.chipsWrap}>
              {AVAILABILITY.map((a) => (
                <Chip
                  key={a}
                  label={a}
                  selected={availability.includes(a)}
                  onPress={() => toggleInArray(a, availability, setAvailability)}
                  icon="add"
                  styles={styles}
                  colors={colors}
                />
              ))}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Sticky save */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Save agent profile</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
      backgroundColor: colors.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
    headerSaveBtn: {
      paddingVertical: 4,
      paddingHorizontal: 4,
      minWidth: 44,
      alignItems: 'flex-end',
    },
    headerSaveText: { fontSize: 16, fontWeight: '700', color: colors.primary },

    scrollContent: { paddingBottom: 40 },

    avatarSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 16 },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.inputBackground,
      marginBottom: 12,
    },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: { fontSize: 20, fontWeight: '700', color: colors.text },
    subtitle: {
      fontSize: 13,
      color: colors.secondaryText,
      marginTop: 6,
      textAlign: 'center',
      paddingHorizontal: 40,
    },

    // Error banner
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 14,
      borderRadius: 14,
      backgroundColor: isDark ? '#2A1010' : '#FFF1F0',
      borderWidth: 1,
      borderColor: isDark ? '#4A1E1E' : '#FFD6D3',
    },
    errorBannerTextCol: { flex: 1 },
    errorBannerTitle: { fontSize: 14, fontWeight: '700', color: '#FF3B30' },
    errorBannerSubtitle: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 2,
    },

    // Sections
    section: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginTop: 12,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
    },
    requiredStar: { color: '#FF3B30' },
    helper: {
      fontSize: 12,
      color: colors.secondaryText,
      marginBottom: 10,
      marginTop: -6,
    },

    label: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.secondaryText,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    inputError: {
      borderColor: '#FF3B30',
      backgroundColor: isDark ? '#2A1010' : '#FFF5F5',
    },
    textArea: { minHeight: 110, paddingTop: 12 },
    charCount: {
      fontSize: 11,
      color: colors.secondaryText,
      textAlign: 'right',
      marginTop: 6,
    },

    // Inline error
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

    row: { flexDirection: 'row' },
    halfCol: { flex: 1 },

    // Chips
    chipsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      padding: 2,
      borderRadius: 12,
    },
    chipsWrapError: {
      backgroundColor: isDark ? '#2A1010' : '#FFF5F5',
      borderWidth: 1.5,
      borderColor: '#FF3B30',
      padding: 10,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    chipTextActive: { color: '#FFFFFF' },

    // Bottom save bar
    bottomBar: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 12,
      backgroundColor: colors.card,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 14,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 5,
    },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  });