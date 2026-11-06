// src/components/ProfileModal.js
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import Text from './AccessibleText';

/**
 * Reusable profile sheet.
 *
 * Props:
 *   visible         — boolean
 *   onClose         — () => void
 *   profile         — { name, role, verified, bio, location, phone, email,
 *                       memberSince, responseTime, listings, rating,
 *                       reviewsCount, sharedMedia, isBlocked }
 *   isMuted         — boolean (optional)
 *   onCall          — () => void (optional)
 *   onMessage       — () => void (optional)
 *   onMuteToggle    — () => void (optional)
 *   onReport        — () => void (optional)
 *   onBlockToggle   — () => void (optional)
 *   hasReported     — boolean (optional)
 *   isBlocked       — boolean (optional)
 *   hideActions     — boolean (optional) — hides Report/Block row
 *   hideActionRow   — boolean (optional) — hides the 4-icon action row
 */

export default function ProfileModal({
  visible,
  onClose,
  profile,
  isMuted = false,
  onCall,
  onMessage,
  onMuteToggle,
  onReport,
  onBlockToggle,
  hasReported = false,
  isBlocked = false,
  hideActions = false,
  hideActionRow = false,
}) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  if (!profile) return null;

  const isAgent = profile.role === 'Agent' || profile.role === 'agent';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.profileSheet}
          onPress={() => {}}
        >
          <View style={styles.sheetHandle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.profileScrollContent}
          >
            {/* Header */}
            <View style={styles.profileHeaderSection}>
              <View style={styles.profileAvatarWrap}>
                {profile.avatar ? (
                  <Image
                    source={{ uri: profile.avatar }}
                    style={styles.profileAvatar}
                  />
                ) : (
                  <View style={[styles.profileAvatar, styles.avatarFallback]}>
                    <Text style={styles.avatarFallbackText}>
                      {(profile.name || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                {profile.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}
              </View>

              <View style={styles.profileNameRow}>
                <Text style={styles.profileName}>{profile.name}</Text>
                {profile.verified && (
                  <Ionicons
                    name="shield-checkmark"
                    size={18}
                    color={colors.primary}
                  />
                )}
              </View>

              <View style={styles.profileRoleBadge}>
                <Ionicons
                  name={isAgent ? 'business' : 'person'}
                  size={12}
                  color={isAgent ? colors.primary : '#34C759'}
                />
                <Text
                  style={[
                    styles.profileRoleText,
                    { color: isAgent ? colors.primary : '#34C759' },
                  ]}
                >
                  {isAgent ? 'Agent' : 'Client'}
                </Text>
              </View>

              {profile.location ? (
                <View style={styles.profileLocationRow}>
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={colors.secondaryText}
                  />
                  <Text style={styles.profileLocationText}>
                    {profile.location}
                  </Text>
                </View>
              ) : null}

              <View style={styles.profileStatusRow}>
                <View
                  style={[
                    styles.onlineDotLarge,
                    isBlocked && { backgroundColor: '#FF3B30' },
                  ]}
                />
                <Text
                  style={[
                    styles.profileStatusText,
                    isBlocked && { color: '#FF3B30' },
                  ]}
                >
                  {isBlocked ? 'Blocked' : 'Online now'}
                </Text>
              </View>
            </View>

            {/* Stats */}
            {(profile.listings !== undefined ||
              profile.rating !== undefined ||
              profile.responseTime) && (
              <View style={styles.statsRow}>
                {profile.listings !== undefined && (
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{profile.listings}</Text>
                    <Text style={styles.statLabel}>Listings</Text>
                  </View>
                )}

                {profile.rating !== undefined && (
                  <>
                    {profile.listings !== undefined && (
                      <View style={styles.statDivider} />
                    )}
                    <View style={styles.statItem}>
                      <View style={styles.ratingValueRow}>
                        <Ionicons name="star" size={14} color="#FFB800" />
                        <Text style={styles.statValue}>
                          {profile.rating?.toFixed
                            ? profile.rating.toFixed(1)
                            : profile.rating}
                        </Text>
                      </View>
                      <Text style={styles.statLabel}>
                        {profile.reviewsCount || 0} reviews
                      </Text>
                    </View>
                  </>
                )}

                {profile.responseTime && (
                  <>
                    {(profile.listings !== undefined ||
                      profile.rating !== undefined) && (
                      <View style={styles.statDivider} />
                    )}
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {profile.responseTime}
                      </Text>
                      <Text style={styles.statLabel}>Response</Text>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Action row */}
            {!hideActionRow && (
              <View style={styles.profileActionsRow}>
                <TouchableOpacity
                  style={styles.profileActionBtn}
                  onPress={onCall}
                  activeOpacity={0.7}
                >
                  <View style={styles.profileActionIconWrap}>
                    <Ionicons name="call" size={22} color={colors.primary} />
                  </View>
                  <Text style={styles.profileActionLabel}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.profileActionBtn}
                  onPress={onMessage}
                  activeOpacity={0.7}
                >
                  <View style={styles.profileActionIconWrap}>
                    <Ionicons name="chatbubble" size={22} color={colors.primary} />
                  </View>
                  <Text style={styles.profileActionLabel}>Message</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.profileActionBtn}
                  onPress={onMuteToggle}
                  activeOpacity={0.7}
                >
                  <View style={styles.profileActionIconWrap}>
                    <Ionicons
                      name={isMuted ? 'notifications' : 'notifications-off'}
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={styles.profileActionLabel}>
                    {isMuted ? 'Unmute' : 'Mute'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.profileActionBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <View style={styles.profileActionIconWrap}>
                    <Ionicons name="search" size={22} color={colors.primary} />
                  </View>
                  <Text style={styles.profileActionLabel}>Search</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* About */}
            {profile.bio ? (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>About</Text>
                </View>
                <Text style={styles.bioText}>{profile.bio}</Text>
              </View>
            ) : null}

            {/* Contact Info */}
            {(profile.phone || profile.email || profile.memberSince) && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons
                    name="call-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Contact Info</Text>
                </View>

                {profile.phone ? (
                  <>
                    <View style={styles.infoRow}>
                      <Ionicons
                        name="call-outline"
                        size={16}
                        color={colors.secondaryText}
                      />
                      <Text style={styles.infoLabel}>Phone</Text>
                      <Text style={styles.infoValue} numberOfLines={1}>
                        {profile.phone}
                      </Text>
                    </View>
                  </>
                ) : null}

                {profile.phone && profile.email ? (
                  <View style={styles.infoDivider} />
                ) : null}

                {profile.email ? (
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="mail-outline"
                      size={16}
                      color={colors.secondaryText}
                    />
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {profile.email}
                    </Text>
                  </View>
                ) : null}

                {(profile.phone || profile.email) && profile.memberSince ? (
                  <View style={styles.infoDivider} />
                ) : null}

                {profile.memberSince ? (
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={colors.secondaryText}
                    />
                    <Text style={styles.infoLabel}>Member since</Text>
                    <Text style={styles.infoValue}>{profile.memberSince}</Text>
                  </View>
                ) : null}
              </View>
            )}

            {/* Specializations / Areas / Languages / Availability (agents) */}
            {isAgent && profile.specializations?.length > 0 ? (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons
                    name="pricetags-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Specializations</Text>
                </View>
                <View style={styles.chipsWrap}>
                  {profile.specializations.map((s, i) => (
                    <View key={i} style={styles.chip}>
                      <Text style={styles.chipText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {isAgent && profile.languages?.length > 0 ? (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons
                    name="language-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Languages</Text>
                </View>
                <View style={styles.chipsWrap}>
                  {profile.languages.map((l, i) => (
                    <View key={i} style={styles.chip}>
                      <Text style={styles.chipText}>{l}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Shared Media */}
            {profile.sharedMedia?.length > 0 ? (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons
                    name="images-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>
                    Shared Media ({profile.sharedMedia.length})
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mediaStrip}
                >
                  {profile.sharedMedia.map((uri, idx) => (
                    <TouchableOpacity key={idx} activeOpacity={0.8}>
                      <Image source={{ uri }} style={styles.mediaThumb} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* Report + Block */}
            {!hideActions && (onReport || onBlockToggle) ? (
              <View style={styles.footerActions}>
                {onReport ? (
                  <TouchableOpacity
                    style={[
                      styles.footerActionBtn,
                      hasReported && styles.footerActionBtnDisabled,
                    ]}
                    onPress={onReport}
                    disabled={hasReported}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={
                        hasReported ? 'checkmark-circle-outline' : 'flag-outline'
                      }
                      size={18}
                      color={hasReported ? colors.secondaryText : '#FF9500'}
                    />
                    <Text
                      style={[
                        styles.footerActionText,
                        {
                          color: hasReported
                            ? colors.secondaryText
                            : '#FF9500',
                        },
                      ]}
                    >
                      {hasReported ? 'Reported' : 'Report'}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {onBlockToggle ? (
                  <TouchableOpacity
                    style={[
                      styles.footerActionBtn,
                      isBlocked && styles.footerActionBtnPrimary,
                    ]}
                    onPress={onBlockToggle}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isBlocked ? 'lock-open-outline' : 'ban-outline'}
                      size={18}
                      color={isBlocked ? colors.primary : '#FF3B30'}
                    />
                    <Text
                      style={[
                        styles.footerActionText,
                        { color: isBlocked ? colors.primary : '#FF3B30' },
                      ]}
                    >
                      {isBlocked ? 'Unblock' : 'Block'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    profileSheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: 10,
      maxHeight: '88%',
    },
    sheetHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: 12,
    },
    profileScrollContent: { paddingHorizontal: 24, paddingBottom: 30 },

    profileHeaderSection: {
      alignItems: 'center',
      paddingTop: 6,
      paddingBottom: 20,
    },
    profileAvatarWrap: { position: 'relative', marginBottom: 12 },
    profileAvatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.inputBackground,
    },
    avatarFallback: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    avatarFallbackText: {
      fontSize: 40,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: 4,
      right: 4,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.card,
    },
    profileNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    profileName: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
    },
    profileRoleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 8,
    },
    profileRoleText: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    profileLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 6,
    },
    profileLocationText: {
      fontSize: 13,
      color: colors.secondaryText,
    },
    profileStatusRow: { flexDirection: 'row', alignItems: 'center' },
    onlineDotLarge: {
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: '#34C759',
      marginRight: 6,
    },
    profileStatusText: {
      fontSize: 13,
      color: '#34C759',
      fontWeight: '600',
    },

    statsRow: {
      flexDirection: 'row',
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      paddingVertical: 16,
      marginBottom: 20,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
    },
    statLabel: {
      fontSize: 11,
      color: colors.secondaryText,
      marginTop: 3,
      fontWeight: '500',
    },
    ratingValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginVertical: 6,
    },

    profileActionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
    },
    profileActionBtn: { alignItems: 'center', width: 70 },
    profileActionIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    profileActionLabel: {
      fontSize: 12,
      color: colors.text,
      fontWeight: '500',
    },

    sectionCard: {
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    bioText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 21,
    },

    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 13,
      color: colors.secondaryText,
      marginLeft: 10,
      flex: 1,
    },
    infoValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      maxWidth: '55%',
      textAlign: 'right',
    },
    infoDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 2,
    },

    chipsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },

    mediaStrip: {
      paddingVertical: 4,
      gap: 8,
    },
    mediaThumb: {
      width: 88,
      height: 88,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
    },

    footerActions: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
    },
    footerActionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
    },
    footerActionBtnDisabled: {
      backgroundColor: colors.inputBackground,
      opacity: 0.6,
    },
    footerActionBtnPrimary: {
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
    },
    footerActionText: {
      fontSize: 13,
      fontWeight: '600',
    },

    closeBtn: {
      width: '100%',
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: colors.inputBackground,
      alignItems: 'center',
    },
    closeBtnText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
  });