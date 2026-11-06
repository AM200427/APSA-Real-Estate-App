// src/screens/AgentSignUpScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import { useAppStore } from '../../store/useAppStore';

const SPECIALIZATIONS = [
  'Residential',
  'Commercial',
  'Rentals',
  'Luxury',
  'Land',
  'Industrial',
];

const LANGUAGES = ['English', 'Bemba', 'Nyanja', 'Tonga', 'Lozi', 'Kaonde', 'Lunda'];

export default function AgentSignUpScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { register } = useAppStore();
  const styles = getStyles(colors, isDark);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STEP 1 – Identity
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nrc, setNrc] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // STEP 2 – Professional
  const [yearsExperience, setYearsExperience] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [areasServed, setAreasServed] = useState('');
  const [languages, setLanguages] = useState(['English']);
  const [bio, setBio] = useState('');

  // STEP 3 – Credentials
  const [ecazNumber, setEcazNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('Estate Agents Council of Zambia (ECAZ)');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [brokerageName, setBrokerageName] = useState('');
  const [brokerageLicense, setBrokerageLicense] = useState('');

  // STEP 4 – Documents & Business
  const [licenseDoc, setLicenseDoc] = useState(null);
  const [nrcFront, setNrcFront] = useState(null);
  const [nrcBack, setNrcBack] = useState(null);
  const [businessAddress, setBusinessAddress] = useState('');
  const [pacraNumber, setPacraNumber] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('mobile');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // ---------- HELPERS ----------
  const toggleItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const pickDocument = async (setter) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'info',
        text1: 'Permission Needed',
        text2: 'Please grant gallery permissions.',
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setter(result.assets[0].uri);
    }
  };

  const formatPhone = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 9);
    let formatted = digits;
    if (digits.length >= 3) formatted = `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length >= 6) formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    setPhone(formatted);
  };

  const formatExpiry = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) setLicenseExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    else setLicenseExpiry(digits);
  };

  // ---------- VALIDATION ----------
  const validateStep = (s) => {
    if (s === 1) {
      if (!fullName || !email || !phone || !nrc || !password || !confirmPassword) {
        Toast.show({ type: 'error', text1: 'Please fill in all fields' });
        return false;
      }
      if (password.length < 6) {
        Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
        return false;
      }
      if (password !== confirmPassword) {
        Toast.show({ type: 'error', text1: 'Passwords do not match' });
        return false;
      }
      return true;
    }
    if (s === 2) {
      if (!yearsExperience || specializations.length === 0 || !areasServed) {
        Toast.show({ type: 'error', text1: 'Please complete professional details' });
        return false;
      }
      return true;
    }
    if (s === 3) {
      if (!ecazNumber || !licenseExpiry || !brokerageName) {
        Toast.show({ type: 'error', text1: 'Please complete credentials' });
        return false;
      }
      return true;
    }
    if (s === 4) {
      if (!licenseDoc || !nrcFront || !nrcBack || !businessAddress) {
        Toast.show({ type: 'error', text1: 'Please upload required documents' });
        return false;
      }
      if (!agreeTerms) {
        Toast.show({ type: 'error', text1: 'You must agree to the terms' });
        return false;
      }
      return true;
    }
    return true;
  };

  const goNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
    else navigation.goBack();
  };

  // ---------- SUBMIT ----------
  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      const result = await register({
        name: fullName,
        email,
        phone,
        nrc,
        password,
        role: 'Agent',
        profile: {
          yearsExperience,
          specializations,
          areasServed,
          languages,
          bio,
          ecazNumber,
          issuingAuthority,
          licenseExpiry,
          brokerageName,
          brokerageLicense,
          businessAddress,
          pacraNumber,
          payoutMethod,
        },
        documents: {
          licenseDoc,
          nrcFront,
          nrcBack,
        },
      });

      if (result?.success) {
        Toast.show({
          type: 'success',
          text1: 'Application Submitted 🎉',
          text2: 'Your agent account is pending verification.',
        });
        setTimeout(() => navigation.navigate('Login'), 1500);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Submission failed',
          text2: result?.error || 'Please try again',
        });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Network error', text2: 'Please try again' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- STEP RENDERERS ----------
  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>Identity & Credentials</Text>

      <Text style={styles.label}>Full Legal Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. John Mulenga"
        placeholderTextColor={colors.secondaryText}
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        placeholderTextColor={colors.secondaryText}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Phone Number</Text>
      <View style={styles.phoneRow}>
        <Text style={styles.phonePrefix}>+260</Text>
        <TextInput
          style={[styles.input, styles.phoneInput]}
          placeholder="96 123 4567"
          placeholderTextColor={colors.secondaryText}
          value={phone}
          onChangeText={formatPhone}
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.label}>NRC Number</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 123456/78/9"
        placeholderTextColor={colors.secondaryText}
        value={nrc}
        onChangeText={setNrc}
      />

      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Minimum 6 characters"
          placeholderTextColor={colors.secondaryText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
          <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Re-enter password"
        placeholderTextColor={colors.secondaryText}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showPassword}
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>Professional Details</Text>

      <Text style={styles.label}>Years of Experience</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 5"
        placeholderTextColor={colors.secondaryText}
        value={yearsExperience}
        onChangeText={setYearsExperience}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Specializations</Text>
      <View style={styles.chipsRow}>
        {SPECIALIZATIONS.map((spec) => (
          <TouchableOpacity
            key={spec}
            style={[styles.chip, specializations.includes(spec) && styles.chipActive]}
            onPress={() => toggleItem(specializations, setSpecializations, spec)}
          >
            <Text style={[styles.chipText, specializations.includes(spec) && styles.chipTextActive]}>
              {spec}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Areas / Neighborhoods Served</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="e.g. Lusaka, Kabulonga, Woodlands"
        placeholderTextColor={colors.secondaryText}
        value={areasServed}
        onChangeText={setAreasServed}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Languages Spoken</Text>
      <View style={styles.chipsRow}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[styles.chip, languages.includes(lang) && styles.chipActive]}
            onPress={() => toggleItem(languages, setLanguages, lang)}
          >
            <Text style={[styles.chipText, languages.includes(lang) && styles.chipTextActive]}>
              {lang}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Bio / Professional Summary</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Tell clients about your experience..."
        placeholderTextColor={colors.secondaryText}
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={4}
      />
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>Verification & Licensing</Text>

      <Text style={styles.label}>ECAZ License Number</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. ECAZ/2024/12345"
        placeholderTextColor={colors.secondaryText}
        value={ecazNumber}
        onChangeText={setEcazNumber}
      />

      <Text style={styles.label}>Issuing Authority</Text>
      <TextInput
        style={styles.input}
        value={issuingAuthority}
        onChangeText={setIssuingAuthority}
      />

      <Text style={styles.label}>License Expiry (MM/YY)</Text>
      <TextInput
        style={styles.input}
        placeholder="MM/YY"
        placeholderTextColor={colors.secondaryText}
        value={licenseExpiry}
        onChangeText={formatExpiry}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Brokerage / Agency Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. ABC Real Estate Ltd"
        placeholderTextColor={colors.secondaryText}
        value={brokerageName}
        onChangeText={setBrokerageName}
      />

      <Text style={styles.label}>Brokerage License (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. BROK/2024/987"
        placeholderTextColor={colors.secondaryText}
        value={brokerageLicense}
        onChangeText={setBrokerageLicense}
      />
    </>
  );

  const renderDocumentUpload = (label, uri, setter, icon) => (
    <TouchableOpacity style={styles.uploadBox} onPress={() => pickDocument(setter)}>
      {uri ? (
        <Image source={{ uri }} style={styles.uploadPreview} />
      ) : (
        <>
          <Ionicons name={icon} size={28} color={colors.primary} />
          <Text style={styles.uploadLabel}>{label}</Text>
          <Text style={styles.uploadHint}>Tap to upload</Text>
        </>
      )}
    </TouchableOpacity>
  );

  const renderStep4 = () => (
    <>
      <Text style={styles.stepTitle}>Documents & Business</Text>

      <Text style={styles.label}>Required Documents</Text>
      <View style={styles.uploadRow}>
        {renderDocumentUpload('License', licenseDoc, setLicenseDoc, 'document-text-outline')}
        {renderDocumentUpload('NRC Front', nrcFront, setNrcFront, 'card-outline')}
        {renderDocumentUpload('NRC Back', nrcBack, setNrcBack, 'card-outline')}
      </View>

      <Text style={styles.label}>Business Address</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="e.g. Plot 123, Cairo Road, Lusaka"
        placeholderTextColor={colors.secondaryText}
        value={businessAddress}
        onChangeText={setBusinessAddress}
        multiline
        numberOfLines={2}
      />

      <Text style={styles.label}>PACRA Registration (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. PACRA/2024/001234"
        placeholderTextColor={colors.secondaryText}
        value={pacraNumber}
        onChangeText={setPacraNumber}
      />

      <Text style={styles.label}>Payout Method</Text>
      <View style={styles.chipsRow}>
        <TouchableOpacity
          style={[styles.chip, payoutMethod === 'mobile' && styles.chipActive]}
          onPress={() => setPayoutMethod('mobile')}
        >
          <Text style={[styles.chipText, payoutMethod === 'mobile' && styles.chipTextActive]}>
            Mobile Money
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, payoutMethod === 'bank' && styles.chipActive]}
          onPress={() => setPayoutMethod('bank')}
        >
          <Text style={[styles.chipText, payoutMethod === 'bank' && styles.chipTextActive]}>
            Bank Transfer
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => setAgreeTerms(!agreeTerms)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={agreeTerms ? 'checkbox' : 'square-outline'}
          size={22}
          color={agreeTerms ? colors.primary : colors.secondaryText}
        />
        <Text style={styles.termsText}>
          I agree to the Terms of Service, Privacy Policy, and Code of Conduct.
        </Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agent Sign Up</Text>
          <Text style={styles.stepCount}>{step}/4</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.footer}>
          {step > 1 && (
            <TouchableOpacity style={styles.backFooterBtn} onPress={goBack}>
              <Text style={styles.backFooterText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextBtn, step === 1 && { flex: 1 }]}
            onPress={step === 4 ? handleSubmit : goNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.nextBtnText}>
                {step === 4 ? 'Submit Application' : 'Continue'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------- STYLES ----------
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
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    stepCount: { fontSize: 14, color: colors.primary, fontWeight: '700' },
    progressBar: {
      height: 3,
      backgroundColor: colors.border,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
    },
    content: { padding: 20, paddingBottom: 100 },
    stepTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 20,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.secondaryText,
      marginBottom: 6,
      marginTop: 12,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    phonePrefix: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      backgroundColor: colors.inputBackground,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    phoneInput: { flex: 1 },
    passwordRow: { flexDirection: 'row', alignItems: 'center' },
    eyeBtn: { padding: 12, marginLeft: 4 },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
      marginBottom: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      borderColor: colors.primary,
    },
    chipText: { fontSize: 13, fontWeight: '500', color: colors.text },
    chipTextActive: { color: colors.primary, fontWeight: '700' },
    uploadRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    uploadBox: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      padding: 8,
    },
    uploadPreview: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
    },
    uploadLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
      marginTop: 6,
      textAlign: 'center',
    },
    uploadHint: {
      fontSize: 10,
      color: colors.secondaryText,
      marginTop: 2,
      textAlign: 'center',
    },
    termsRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginTop: 20,
      padding: 12,
      backgroundColor: colors.card,
      borderRadius: 12,
    },
    termsText: {
      flex: 1,
      fontSize: 13,
      color: colors.text,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.card,
      borderTopWidth: 0.5,
      borderTopColor: colors.border,
    },
    backFooterBtn: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 14,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
    },
    backFooterText: { fontSize: 15, fontWeight: '600', color: colors.text },
    nextBtn: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  });