// src/screens/AllReviewsScreen.js
import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext';
import Text from '../components/AccessibleText';

const FILTERS = ['All', '5', '4', '3', '2', '1'];

export default function AllReviewsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { userReviews, isLoadingUserReviews } = useAppStore();

  const styles = getStyles(colors, isDark);
  const [activeFilter, setActiveFilter] = useState('All');

  const reviews = userReviews || [];

  // Compute average + distribution
  const { average, total, distribution } = useMemo(() => {
    if (!reviews.length) {
      return { average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach((r) => {
      const rating = Math.round(r.rating || 0);
      sum += r.rating || 0;
      if (dist[rating] !== undefined) dist[rating] += 1;
    });
    return {
      average: sum / reviews.length,
      total: reviews.length,
      distribution: dist,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (activeFilter === 'All') return reviews;
    const target = parseInt(activeFilter, 10);
    return reviews.filter((r) => Math.round(r.rating || 0) === target);
  }, [reviews, activeFilter]);

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(item.userName || 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.reviewMeta}>
            <Text style={styles.reviewName}>
              {item.userName || 'Anonymous'}
            </Text>
            <View style={styles.reviewStarsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= (item.rating || 0) ? 'star' : 'star-outline'}
                  size={13}
                  color="#FFD700"
                />
              ))}
              <Text style={styles.reviewDate}>
                · {new Date(item.date || item.createdAt || Date.now()).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {item.userType === 'agent' && (
          <View style={styles.agentPill}>
            <Ionicons name="business" size={10} color={colors.primary} />
            <Text style={styles.agentPillText}>Agent</Text>
          </View>
        )}
      </View>

      {item.propertyTitle ? (
        <View style={styles.propertyRow}>
          <Ionicons name="home-outline" size={12} color={colors.secondaryText} />
          <Text style={styles.propertyText} numberOfLines={1}>
            {item.propertyTitle}
          </Text>
        </View>
      ) : null}

      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="star-outline" size={40} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>
        {reviews.length === 0
          ? 'No reviews yet'
          : `No ${activeFilter}-star reviews`}
      </Text>
      <Text style={styles.emptySubtitle}>
        {reviews.length === 0
          ? 'When clients review your listings, they will appear here.'
          : 'Try a different filter.'}
      </Text>
    </View>
  );

  if (isLoadingUserReviews && reviews.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Reviews</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading reviews...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={filteredReviews}
        keyExtractor={(item, index) =>
          item.id || item._id || `review-${index}`
        }
        renderItem={renderReviewItem}
        contentContainerStyle={
          filteredReviews.length === 0 ? styles.listEmpty : styles.list
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={
          reviews.length > 0 ? (
            <View>
              {/* Summary card */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.averageNumber}>
                    {average.toFixed(1)}
                  </Text>
                  <View style={styles.averageStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= Math.round(average) ? 'star' : 'star-outline'}
                        size={16}
                        color="#FFD700"
                      />
                    ))}
                  </View>
                  <Text style={styles.totalText}>
                    {total} {total === 1 ? 'review' : 'reviews'}
                  </Text>
                </View>

                <View style={styles.summaryRight}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = distribution[star] || 0;
                    const pct = total ? (count / total) * 100 : 0;
                    return (
                      <View key={star} style={styles.barRow}>
                        <Text style={styles.barLabel}>{star}</Text>
                        <Ionicons name="star" size={10} color="#FFD700" />
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              { width: `${pct}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.barCount}>{count}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Filters */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {FILTERS.map((f) => {
                  const selected = activeFilter === f;
                  const count = f === 'All' ? total : distribution[parseInt(f, 10)] || 0;
                  return (
                    <TouchableOpacity
                      key={f}
                      style={[styles.filterChip, selected && styles.filterChipActive]}
                      onPress={() => setActiveFilter(f)}
                      activeOpacity={0.8}
                    >
                      {f !== 'All' && (
                        <Ionicons
                          name="star"
                          size={11}
                          color={selected ? '#FFFFFF' : '#FFD700'}
                          style={{ marginRight: 4 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.filterChipText,
                          selected && styles.filterChipTextActive,
                        ]}
                      >
                        {f === 'All' ? `All (${count})` : `${f} (${count})`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.listHeader}>
                {filteredReviews.length}{' '}
                {filteredReviews.length === 1 ? 'review' : 'reviews'}
                {activeFilter !== 'All' ? ` · ${activeFilter}-star` : ''}
              </Text>
            </View>
          ) : null
        }
      />
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
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    backBtn: { padding: 4, minWidth: 40 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },

    loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loaderText: { marginTop: 10, color: colors.secondaryText },

    list: { paddingHorizontal: 16, paddingBottom: 40 },
    listEmpty: { flexGrow: 1, paddingHorizontal: 16 },

    // Summary card
    summaryCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 18,
      marginTop: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
    summaryLeft: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingRight: 18,
      borderRightWidth: 0.5,
      borderRightColor: colors.border,
      minWidth: 110,
    },
    averageNumber: {
      fontSize: 40,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -1,
    },
    averageStars: {
      flexDirection: 'row',
      gap: 2,
      marginTop: 6,
    },
    totalText: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 6,
      fontWeight: '500',
    },
    summaryRight: {
      flex: 1,
      paddingLeft: 18,
      justifyContent: 'center',
      gap: 4,
    },
    barRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    barLabel: {
      fontSize: 11,
      color: colors.secondaryText,
      fontWeight: '600',
      width: 10,
    },
    barTrack: {
      flex: 1,
      height: 6,
      backgroundColor: colors.inputBackground,
      borderRadius: 3,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      backgroundColor: '#FFD700',
      borderRadius: 3,
    },
    barCount: {
      fontSize: 11,
      color: colors.secondaryText,
      fontWeight: '500',
      minWidth: 18,
      textAlign: 'right',
    },

    // Filters
    filterRow: {
      gap: 8,
      paddingBottom: 12,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 12.5,
      fontWeight: '600',
      color: colors.text,
    },
    filterChipTextActive: { color: '#FFFFFF' },

    listHeader: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.secondaryText,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 10,
      marginLeft: 4,
    },

    // Review card
    reviewCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    reviewLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    avatarText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.primary,
    },
    reviewMeta: { flex: 1 },
    reviewName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 3,
    },
    reviewStarsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    reviewDate: {
      fontSize: 11,
      color: colors.secondaryText,
      marginLeft: 4,
    },
    agentPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    agentPillText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 0.2,
    },
    propertyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginBottom: 8,
      paddingHorizontal: 2,
    },
    propertyText: {
      fontSize: 12,
      color: colors.secondaryText,
      fontWeight: '500',
      flex: 1,
    },
    reviewComment: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },

    // Empty
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
      paddingTop: 60,
    },
    emptyIconWrap: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.secondaryText,
      textAlign: 'center',
      lineHeight: 20,
    },
  });