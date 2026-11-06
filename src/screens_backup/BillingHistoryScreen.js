// src/screens/BillingHistoryScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function BillingHistoryScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  // Mock transactions (replace with API later)
  const [transactions] = useState([
    {
      id: 'tx-001',
      type: 'booking',
      title: 'Luxury Apartment - Lusaka',
      date: '2026-09-22',
      amount: 9200,
      status: 'paid',
      method: 'Visa •••• 4242',
      invoiceId: 'INV-2026-0922-001',
    },
    {
      id: 'tx-002',
      type: 'booking',
      title: 'Modern Villa - Kitwe',
      date: '2026-09-15',
      amount: 15500,
      status: 'paid',
      method: 'MTN Mobile Money',
      invoiceId: 'INV-2026-0915-002',
    },
    {
      id: 'tx-003',
      type: 'subscription',
      title: 'Agent Pro Subscription',
      date: '2026-09-01',
      amount: 500,
      status: 'paid',
      method: 'Airtel Money',
      invoiceId: 'INV-2026-0901-003',
    },
    {
      id: 'tx-004',
      type: 'booking',
      title: 'Studio Apartment - Ndola',
      date: '2026-08-28',
      amount: 3400,
      status: 'refunded',
      method: 'Visa •••• 4242',
      invoiceId: 'INV-2026-0828-004',
    },
    {
      id: 'tx-005',
      type: 'booking',
      title: 'Family Home - Lusaka',
      date: '2026-08-20',
      amount: 12000,
      status: 'pending',
      method: 'Bank Transfer',
      invoiceId: 'INV-2026-0820-005',
    },
    {
      id: 'tx-006',
      type: 'commission',
      title: 'Agent Commission - Sep',
      date: '2026-09-20',
      amount: -1200,
      status: 'paid',
      method: 'Wallet Credit',
      invoiceId: 'INV-2026-0920-006',
    },
  ]);

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState(null);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'paid', label: 'Paid' },
    { key: 'pending', label: 'Pending' },
    { key: 'refunded', label: 'Refunded' },
  ];

  const filteredTransactions =
    activeFilter === 'all'
      ? transactions
      : transactions.filter((t) => t.status === activeFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#34C759';
      case 'pending': return '#FF9500';
      case 'refunded': return '#8E8E93';
      default: return colors.secondaryText;
    }
  };
  const getAmountColor = (amount) => {
  if (amount < 0) return '#FF3B30'; // red for deductions
  return '#34C759';                  // green for credits
};

  const getTypeIcon = (type) => {
    switch (type) {
      case 'booking': return 'home-outline';
      case 'subscription': return 'star-outline';
      case 'commission': return 'cash-outline';
      default: return 'receipt-outline';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAmount = (amount) => {
  const formatted = Math.abs(amount).toLocaleString();
  return amount < 0 ? `-K${formatted}` : `+K${formatted}`;
};

  const totalSpent = Math.abs(
  transactions
    .filter((t) => t.amount < 0 && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0)
);

const totalRefunded = transactions
  .filter((t) => t.amount > 0 && t.status === 'refunded')
  .reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Billing History</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="trending-down" size={20} color="#FF3B30" />
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryAmount}>K{totalSpent.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryCard, { marginLeft: 12 }]}>
            <Ionicons name="refresh-outline" size={20} color="#8E8E93" />
            <Text style={styles.summaryLabel}>Refunded</Text>
            <Text style={styles.summaryAmount}>K{totalRefunded.toLocaleString()}</Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                activeFilter === filter.key && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === filter.key && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transactions List */}
        <Text style={styles.sectionTitle}>
          {filteredTransactions.length} Transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </Text>

        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color={colors.secondaryText} />
            <Text style={styles.emptyTitle}>No transactions</Text>
            <Text style={styles.emptySubtitle}>
              Transactions matching "{activeFilter}" will appear here.
            </Text>
          </View>
        ) : (
          filteredTransactions.map((tx) => (
            <TouchableOpacity
              key={tx.id}
              style={styles.txCard}
              onPress={() => setSelectedTx(tx)}
              activeOpacity={0.85}
            >
              <View style={styles.txIcon}>
                <Ionicons name={getTypeIcon(tx.type)} size={22} color={colors.primary} />
              </View>

              <View style={styles.txContent}>
                <Text style={styles.txTitle} numberOfLines={1}>{tx.title}</Text>
                <View style={styles.txMeta}>
                  <Text style={styles.txDate}>{formatDate(tx.date)}</Text>
                  <Text style={styles.txDot}>•</Text>
                  <Text style={styles.txMethod} numberOfLines={1}>{tx.method}</Text>
                </View>
              </View>

              <View style={styles.txRight}>
                <Text
  style={[
    styles.txAmount,
    { color: getAmountColor(tx.amount) },
  ]}
>
  {formatAmount(tx.amount)}
</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(tx.status) + '20' },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: getStatusColor(tx.status) }]}
                  >
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Info Note */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Tap any transaction to see full details, invoice, and download options.
          </Text>
        </View>
      </ScrollView>

      {/* Transaction Detail Modal */}
      <Modal visible={!!selectedTx} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedTx(null)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <View style={styles.modalHandle} />

            {selectedTx && (
              <>
                <View style={styles.modalIconWrapper}>
                  <Ionicons
                    name={getTypeIcon(selectedTx.type)}
                    size={32}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.modalTitle}>{selectedTx.title}</Text>

                <View
  style={[
    styles.modalAmountBadge,
    { backgroundColor: getAmountColor(selectedTx.amount) + '20' },
  ]}
>
  <Text
    style={[
      styles.modalAmount,
      { color: getAmountColor(selectedTx.amount) },
    ]}
  >
    {formatAmount(selectedTx.amount)}
  </Text>
</View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={[styles.detailValue, { color: getStatusColor(selectedTx.status) }]}>
                    {selectedTx.status.charAt(0).toUpperCase() + selectedTx.status.slice(1)}
                  </Text>
                </View>
                <View style={styles.detailDivider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedTx.date)}</Text>
                </View>
                <View style={styles.detailDivider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment Method</Text>
                  <Text style={styles.detailValue}>{selectedTx.method}</Text>
                </View>
                <View style={styles.detailDivider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Invoice</Text>
                  <Text style={styles.detailValue}>{selectedTx.invoiceId}</Text>
                </View>

                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => {
                    setSelectedTx(null);
                  }}
                >
                  <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.downloadButtonText}>Download Invoice</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedTx(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ✅ Styles generated from theme colors
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

    // Summary
    summaryRow: { flexDirection: 'row', marginBottom: 16 },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 16,
      gap: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.secondaryText,
      fontWeight: '500',
    },
    summaryAmount: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },

    // Filters
    filtersRow: {
      gap: 8,
      paddingVertical: 8,
      marginBottom: 8,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.secondaryText,
    },
    filterChipTextActive: { color: '#FFFFFF' },

    // Section
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.secondaryText,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 8,
      marginBottom: 12,
      marginLeft: 4,
    },

    // Transaction card
    txCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    txIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    txContent: { flex: 1 },
    txTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    txMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    txDate: { fontSize: 12, color: colors.secondaryText },
    txDot: { fontSize: 12, color: colors.secondaryText },
    txMethod: {
      fontSize: 12,
      color: colors.secondaryText,
      flex: 1,
    },
    txRight: { alignItems: 'flex-end', gap: 4 },
    txAmount: {
      fontSize: 15,
      fontWeight: '700',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

    // Empty
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginTop: 12,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.secondaryText,
      textAlign: 'center',
      marginTop: 6,
      paddingHorizontal: 40,
    },

    // Info
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      marginTop: 20,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: colors.secondaryText,
      lineHeight: 18,
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
      paddingHorizontal: 24,
      paddingBottom: 40,
      paddingTop: 12,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      alignItems: 'center',
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginBottom: 16,
    },
    modalIconWrapper: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 10,
    },
    modalAmountBadge: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 16,
      marginBottom: 20,
    },
    modalAmount: {
      fontSize: 24,
      fontWeight: '800',
    },

    // Detail rows
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingVertical: 12,
    },
    detailLabel: {
      fontSize: 14,
      color: colors.secondaryText,
    },
    detailValue: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
    detailDivider: {
      height: 0.5,
      backgroundColor: colors.border,
      width: '100%',
    },

    // Actions
    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 14,
      width: '100%',
      marginTop: 24,
    },
    downloadButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    closeButton: {
      paddingVertical: 14,
      alignItems: 'center',
      width: '100%',
      marginTop: 8,
    },
    closeButtonText: {
      color: colors.secondaryText,
      fontSize: 15,
      fontWeight: '500',
    },
  });