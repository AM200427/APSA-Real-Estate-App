// src/screens/AccessibilityScreen.js
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAppStore } from '../../store/useAppStore';
import Text from '../components/AccessibleText';

export default function AccessibilityScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { showInfo, showSuccess } = useToast();
  const { preferences, setPreference, resetPreferences } = useAppStore();
  const styles = getStyles(colors, isDark);

  // ✅ Read from global store – NO local state
  const textSize = preferences.textSize || 'medium';
  const highContrast = preferences.highContrast || false;
  const reduceMotion = preferences.reduceMotion || false;
  const screenReader = preferences.screenReader || false;
  const boldText = preferences.boldText || false;
  const captions = preferences.captions || false;

  const textSizeOptions = [
    { key: 'small', label: 'Small', size: 13 },
    { key: 'medium', label: 'Medium', size: 16 },
    { key: 'large', label: 'Large', size: 20 },
    { key: 'xlarge', label: 'Extra Large', size: 24 },
  ];
  

  const handleTextSizeChange = (size) => {
    setPreference('textSize', size);
    showSuccess(`Text size set to ${size}`);
  };

  const handleToggle = (key, label) => {
    const newValue = !preferences[key];
    setPreference(key, newValue);
    showInfo(`${label} ${newValue ? 'enabled' : 'disabled'}`);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Accessibility',
      'Reset all accessibility settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await setPreference('textSize', 'medium');
            await setPreference('highContrast', false);
            await setPreference('reduceMotion', false);
            await setPreference('screenReader', false);
            await setPreference('boldText', false);
            await setPreference('captions', false);
            showSuccess('Accessibility settings reset');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accessibility</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.infoCard}>
          <Ionicons name="accessibility-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Customize your experience to make the app easier to use.
          </Text>
        </View>

        {/* VISUAL */}
        <Text style={styles.sectionTitle}>Visual</Text>
        <View style={styles.card}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.iconWrapper}>
                <Ionicons name="text-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.menuLabel}>Text Size</Text>
                <Text style={styles.menuDescription}>
                  Adjust the size of text throughout the app
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.textSizeRow}>
            {textSizeOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.textSizeChip,
                  textSize === option.key && styles.textSizeChipActive,
                ]}
                onPress={() => handleTextSizeChange(option.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.textSizeChipText,
                    { fontSize: option.size - 4 },
                    textSize === option.key && styles.textSizeChipTextActive,
                  ]}
                >
                  A
                </Text>
                <Text
                  style={[
                    styles.textSizeChipLabel,
                    textSize === option.key && styles.textSizeChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.iconWrapper}>
                <Ionicons name="barbell-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.menuLabel}>Bold Text</Text>
                <Text style={styles.menuDescription}>
                  Make text heavier for better visibility
                </Text>
              </View>
            </View>
            <Switch
              value={boldText}
              onValueChange={() => handleToggle('boldText', 'Bold Text')}
              trackColor={{ false: '#D1D1D6', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.iconWrapper}>
                <Ionicons name="contrast-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.menuLabel}>High Contrast</Text>
                <Text style={styles.menuDescription}>
                  Increase color contrast for readability
                </Text>
              </View>
            </View>
            <Switch
              value={highContrast}
              onValueChange={() => handleToggle('highContrast', 'High Contrast')}
              trackColor={{ false: '#D1D1D6', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* MOTION */}
        <Text style={styles.sectionTitle}>Motion</Text>
        <View style={styles.card}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.iconWrapper}>
                <Ionicons name="pulse-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.menuLabel}>Reduce Motion</Text>
                <Text style={styles.menuDescription}>
                  Minimize animations and transitions
                </Text>
              </View>
            </View>
            <Switch
              value={reduceMotion}
              onValueChange={() => handleToggle('reduceMotion', 'Reduce Motion')}
              trackColor={{ false: '#D1D1D6', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ASSISTIVE */}
        <Text style={styles.sectionTitle}>Assistive</Text>
        <View style={styles.card}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.iconWrapper}>
                <Ionicons name="volume-high-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.menuLabel}>Screen Reader</Text>
                <Text style={styles.menuDescription}>
                  Optimize for TalkBack / VoiceOver
                </Text>
              </View>
            </View>
            <Switch
              value={screenReader}
              onValueChange={() => handleToggle('screenReader', 'Screen Reader')}
              trackColor={{ false: '#D1D1D6', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.iconWrapper}>
                <Ionicons name="text-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.menuLabel}>Closed Captions</Text>
                <Text style={styles.menuDescription}>
                  Show captions for videos with audio
                </Text>
              </View>
            </View>
            <Switch
              value={captions}
              onValueChange={() => handleToggle('captions', 'Closed Captions')}
              trackColor={{ false: '#D1D1D6', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* SHORTCUTS */}
        <Text style={styles.sectionTitle}>Shortcuts</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => showInfo('Keyboard shortcuts: Coming soon')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconWrapper}>
                <Ionicons name="keypad-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.menuLabel}>Keyboard Shortcuts</Text>
                <Text style={styles.menuDescription}>
                  View all available shortcuts
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert(
                'Voice Commands',
                'Voice commands let you navigate the app by speaking. This feature requires microphone permission.',
                [{ text: 'Got it' }]
              )
            }
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconWrapper}>
                <Ionicons name="mic-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.menuLabel}>Voice Commands</Text>
                <Text style={styles.menuDescription}>
                  Navigate with your voice
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>

        {/* Reset */}
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh-outline" size={20} color={colors.primary} />
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
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
    content: { padding: 16, paddingBottom: 40 },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      marginBottom: 20,
    },
    infoText: { flex: 1, fontSize: 13, color: colors.secondaryText, lineHeight: 18 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.secondaryText,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
      marginTop: 8,
      marginLeft: 4,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    menuLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    textWrapper: { flex: 1, marginRight: 8 },
    menuLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
    menuDescription: { fontSize: 12, color: colors.secondaryText, marginTop: 2 },
    divider: { height: 0.5, backgroundColor: colors.border, marginLeft: 64 },
    textSizeRow: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      paddingBottom: 16,
      flexWrap: 'wrap',
    },
    textSizeChip: {
      flex: 1,
      minWidth: 70,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    textSizeChipActive: {
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      borderColor: colors.primary,
    },
    textSizeChipText: { fontWeight: '700', color: colors.text, marginBottom: 4 },
    textSizeChipLabel: { fontSize: 11, color: colors.secondaryText, fontWeight: '500' },
    textSizeChipTextActive: { color: colors.primary },
    resetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.card,
      paddingVertical: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.primary,
      marginTop: 8,
    },
    resetButtonText: { fontSize: 15, fontWeight: '600', color: colors.primary },
  });