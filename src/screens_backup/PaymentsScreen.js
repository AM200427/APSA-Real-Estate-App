// src/screens/PaymentsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Text from '../components/AccessibleText';

export default function PaymentsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { showInfo, showSuccess, showError } = useToast();
  const styles = getStyles(colors, isDark);

  // ---------- STATE ----------
  const [cards, setCards] = useState([
    { id: '1', brand: 'Visa', last4: '4242', expiry: '12/26', isDefault: true },
    { id: '2', brand: 'Mastercard', last4: '8888', expiry: '06/25', isDefault: false },
  ]);

  const [mobileMoney, setMobileMoney] = useState([
    { id: 'mm1', provider: 'MTN Mobile Money', phone: '+260 96 123 4567', isDefault: true },
  ]);

  const [bankAccounts, setBankAccounts] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('card'); // 'card' | 'mobile' | 'bank'

  // Card form
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCVC, setNewCardCVC] = useState('');
  const [newCardName, setNewCardName] = useState('');

  // Mobile money form
  const [mmProvider, setMmProvider] = useState('MTN Mobile Money');
  const [mmPhone, setMmPhone] = useState('');
  const [mmName, setMmName] = useState('');

  // Bank form
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankBranch, setBankBranch] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  // ---------- HELPERS ----------
  const getBrandIcon = (brand) => {
    switch (brand) {
      case 'Visa': return 'card';
      case 'Mastercard': return 'card';
      default: return 'card-outline';
    }
  };

  const getProviderIcon = (provider) => {
    if (provider.includes('MTN')) return 'phone-portrait';
    if (provider.includes('Airtel')) return 'phone-portrait';
    if (provider.includes('Zamtel')) return 'phone-portrait';
    return 'phone-portrait-outline';
  };

  const formatCardNumber = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.match(/.{1,4}/g)?.join(' ') || digits;
    setNewCardNumber(formatted);
  };

  const formatExpiry = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      setNewCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setNewCardExpiry(digits);
    }
  };

  const formatPhone = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    let formatted = digits;
    if (digits.length >= 4) formatted = `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length >= 7) formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    setMmPhone(formatted);
  };

  // ---------- HANDLERS ----------
  const handleSetDefaultCard = (id) => {
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
    showSuccess('Default card updated');
  };

  const handleRemoveCard = (id) => {
    Alert.alert('Remove Card', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setCards((prev) => prev.filter((c) => c.id !== id));
          showInfo('Card removed');
        },
      },
    ]);
  };

  const handleSetDefaultMobile = (id) => {
    setMobileMoney((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
    showSuccess('Default mobile money updated');
  };

  const handleRemoveMobile = (id) => {
    Alert.alert('Remove Mobile Money', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setMobileMoney((prev) => prev.filter((m) => m.id !== id));
          showInfo('Mobile money removed');
        },
      },
    ]);
  };

  const handleRemoveBank = (id) => {
    Alert.alert('Remove Bank Account', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setBankAccounts((prev) => prev.filter((b) => b.id !== id));
          showInfo('Bank account removed');
        },
      },
    ]);
  };

  const openAddModal = (type) => {
    setModalType(type);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewCardNumber('');
    setNewCardExpiry('');
    setNewCardCVC('');
    setNewCardName('');
    setMmPhone('');
    setMmName('');
    setBankName('');
    setBankAccountNumber('');
    setBankBranch('');
  };

  const handleAddCard = () => {
    if (!newCardNumber || !newCardExpiry || !newCardCVC || !newCardName) {
      showError('Please fill in all fields');
      return;
    }
    if (newCardNumber.replace(/\s/g, '').length < 16) {
      showError('Card number must be 16 digits');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      const last4 = newCardNumber.replace(/\s/g, '').slice(-4);
      setCards((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          brand: 'Visa',
          last4,
          expiry: newCardExpiry,
          isDefault: prev.length === 0,
        },
      ]);
      setIsSaving(false);
      closeAddModal();
      showSuccess('Card added successfully');
    }, 1200);
  };

  const handleAddMobile = () => {
    if (!mmPhone || !mmName) {
      showError('Please fill in all fields');
      return;
    }
    if (mmPhone.replace(/\s/g, '').length < 9) {
      showError('Please enter a valid phone number');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setMobileMoney((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          provider: mmProvider,
          phone: `+260 ${mmPhone}`,
          isDefault: prev.length === 0,
        },
      ]);
      setIsSaving(false);
      closeAddModal();
      showSuccess('Mobile money added successfully');
    }, 1200);
  };

  const handleAddBank = () => {
    if (!bankName || !bankAccountNumber || !bankBranch) {
      showError('Please fill in all fields');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setBankAccounts((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          bankName,
          accountNumber: bankAccountNumber,
          branch: bankBranch,
        },
      ]);
      setIsSaving(false);
      closeAddModal();
      showSuccess('Bank account added successfully');
    }, 1200);
  };

  // ---------- RENDER ----------
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ============ SAVED CARDS ============ */}
        <Text style={styles.sectionTitle}>Saved Cards</Text>

        {cards.length === 0 ? (
          <TouchableOpacity style={styles.emptyCard} onPress={() => openAddModal('card')}>
            <Ionicons name="card-outline" size={32} color={colors.secondaryText} />
            <Text style={styles.emptyTitle}>Add a Card</Text>
            <Text style={styles.emptySubtitle}>Visa or Mastercard</Text>
          </TouchableOpacity>
        ) : (
          cards.map((card) => (
            <View key={card.id} style={styles.cardItem}>
              <View style={styles.cardTopRow}>
                <View style={styles.cardBrand}>
                  <Ionicons name={getBrandIcon(card.brand)} size={28} color={colors.primary} />
                  <Text style={styles.cardBrandText}>{card.brand}</Text>
                </View>
                {card.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>
              <View style={styles.cardBottomRow}>
                <View>
                  <Text style={styles.cardLabel}>EXPIRES</Text>
                  <Text style={styles.cardValue}>{card.expiry}</Text>
                </View>
                <View style={styles.cardActions}>
                  {!card.isDefault && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSetDefaultCard(card.id)}
                    >
                      <Text style={styles.actionButtonText}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleRemoveCard(card.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addButton} onPress={() => openAddModal('card')}>
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.addButtonText}>Add New Card</Text>
        </TouchableOpacity>

        {/* ============ MOBILE MONEY ============ */}
        <Text style={styles.sectionTitle}>Mobile Money</Text>

        {mobileMoney.map((mm) => (
          <View key={mm.id} style={styles.cardItem}>
            <View style={styles.cardTopRow}>
              <View style={styles.cardBrand}>
                <Ionicons name={getProviderIcon(mm.provider)} size={24} color={colors.primary} />
                <Text style={styles.cardBrandText}>{mm.provider}</Text>
              </View>
              {mm.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardNumber}>{mm.phone}</Text>
            <View style={styles.cardBottomRow}>
              <View />
              <View style={styles.cardActions}>
                {!mm.isDefault && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetDefaultMobile(mm.id)}
                  >
                    <Text style={styles.actionButtonText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, styles.removeButton]}
                  onPress={() => handleRemoveMobile(mm.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={() => openAddModal('mobile')}>
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.addButtonText}>Add Mobile Money</Text>
        </TouchableOpacity>

        {/* ============ BANK ACCOUNTS ============ */}
        <Text style={styles.sectionTitle}>Bank Accounts</Text>

        {bankAccounts.length === 0 ? (
          <TouchableOpacity style={styles.emptyCard} onPress={() => openAddModal('bank')}>
            <Ionicons name="business-outline" size={32} color={colors.secondaryText} />
            <Text style={styles.emptyTitle}>Add a Bank Account</Text>
            <Text style={styles.emptySubtitle}>For bank transfers</Text>
          </TouchableOpacity>
        ) : (
          bankAccounts.map((bank) => (
            <View key={bank.id} style={styles.cardItem}>
              <View style={styles.cardTopRow}>
                <View style={styles.cardBrand}>
                  <Ionicons name="business" size={24} color={colors.primary} />
                  <Text style={styles.cardBrandText}>{bank.bankName}</Text>
                </View>
              </View>
              <Text style={styles.cardNumber}>•••• {bank.accountNumber.slice(-4)}</Text>
              <View style={styles.cardBottomRow}>
                <View>
                  <Text style={styles.cardLabel}>BRANCH</Text>
                  <Text style={styles.cardValue}>{bank.branch}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleRemoveBank(bank.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addButton} onPress={() => openAddModal('bank')}>
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.addButtonText}>Add Bank Account</Text>
        </TouchableOpacity>

        {/* ============ OTHER OPTIONS ============ */}
        <Text style={styles.sectionTitle}>Other Options</Text>

        <View style={styles.otherOption}>
          <View style={styles.otherIcon}>
            <Ionicons name="cash-outline" size={22} color="#28A745" />
          </View>
          <View style={styles.otherContent}>
            <Text style={styles.otherTitle}>Pay at Property</Text>
            <Text style={styles.otherSubtitle}>Pay cash when you arrive</Text>
          </View>
          <Ionicons name="checkmark-circle" size={22} color="#28A745" />
        </View>

        <View style={styles.otherOption}>
          <View style={styles.otherIcon}>
            <Ionicons name="logo-google" size={22} color="#4285F4" />
          </View>
          <View style={styles.otherContent}>
            <Text style={styles.otherTitle}>Google Pay</Text>
            <Text style={styles.otherSubtitle}>Fast & secure checkout</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
        </View>

        <View style={styles.otherOption}>
          <View style={styles.otherIcon}>
            <Ionicons name="logo-apple" size={22} color={colors.text} />
          </View>
          <View style={styles.otherContent}>
            <Text style={styles.otherTitle}>Apple Pay</Text>
            <Text style={styles.otherSubtitle}>For iOS devices</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
        </View>

        <View style={styles.otherOption}>
          <View style={styles.otherIcon}>
            <Ionicons name="logo-paypal" size={22} color="#003087" />
          </View>
          <View style={styles.otherContent}>
            <Text style={styles.otherTitle}>PayPal</Text>
            <Text style={styles.otherSubtitle}>International payments</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            All payment information is encrypted and securely stored.
          </Text>
        </View>
      </ScrollView>

      {/* ============ ADD MODAL ============ */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {modalType === 'card' && 'Add Card'}
              {modalType === 'mobile' && 'Add Mobile Money'}
              {modalType === 'bank' && 'Add Bank Account'}
            </Text>

            {/* Card form */}
            {modalType === 'card' && (
              <>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={colors.secondaryText}
                  value={newCardName}
                  onChangeText={setNewCardName}
                />
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={colors.secondaryText}
                  value={newCardNumber}
                  onChangeText={formatCardNumber}
                  keyboardType="numeric"
                />
                <View style={styles.rowInputs}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Expiry</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="MM/YY"
                      placeholderTextColor={colors.secondaryText}
                      value={newCardExpiry}
                      onChangeText={formatExpiry}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.halfInput, { marginLeft: 12 }]}>
                    <Text style={styles.inputLabel}>CVC</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      placeholderTextColor={colors.secondaryText}
                      value={newCardCVC}
                      onChangeText={(t) => setNewCardCVC(t.replace(/\D/g, '').slice(0, 4))}
                      keyboardType="numeric"
                      secureTextEntry
                    />
                  </View>
                </View>
              </>
            )}

            {/* Mobile money form */}
            {modalType === 'mobile' && (
              <>
                <Text style={styles.inputLabel}>Provider</Text>
                <View style={styles.providerRow}>
                  {['MTN Mobile Money', 'Airtel Money', 'Zamtel Kwacha'].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.providerChip,
                        mmProvider === p && styles.providerChipActive,
                      ]}
                      onPress={() => setMmProvider(p)}
                    >
                      <Text
                        style={[
                          styles.providerChipText,
                          mmProvider === p && styles.providerChipTextActive,
                        ]}
                      >
                        {p.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Account Holder Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={colors.secondaryText}
                  value={mmName}
                  onChangeText={setMmName}
                />

                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.phoneInputRow}>
                  <Text style={styles.phonePrefix}>+260</Text>
                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    placeholder="96 123 4567"
                    placeholderTextColor={colors.secondaryText}
                    value={mmPhone}
                    onChangeText={formatPhone}
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}

            {/* Bank form */}
            {modalType === 'bank' && (
              <>
                <Text style={styles.inputLabel}>Bank Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Zanaco, Stanbic, Absa"
                  placeholderTextColor={colors.secondaryText}
                  value={bankName}
                  onChangeText={setBankName}
                />
                <Text style={styles.inputLabel}>Account Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 0123456789"
                  placeholderTextColor={colors.secondaryText}
                  value={bankAccountNumber}
                  onChangeText={(t) => setBankAccountNumber(t.replace(/\D/g, ''))}
                  keyboardType="numeric"
                />
                <Text style={styles.inputLabel}>Branch</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Cairo Road"
                  placeholderTextColor={colors.secondaryText}
                  value={bankBranch}
                  onChangeText={setBankBranch}
                />
              </>
            )}

            {/* Actions */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={
                modalType === 'card'
                  ? handleAddCard
                  : modalType === 'mobile'
                  ? handleAddMobile
                  : handleAddBank
              }
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {modalType === 'card' && 'Add Card'}
                  {modalType === 'mobile' && 'Add Mobile Money'}
                  {modalType === 'bank' && 'Add Bank Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={closeAddModal}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.secondaryText,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
      marginTop: 20,
      marginLeft: 4,
    },

    cardItem: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 10,
      elevation: 3,
    },
    cardTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    cardBrand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    cardBrandText: { fontSize: 15, fontWeight: '600', color: colors.text },
    defaultBadge: {
      backgroundColor: isDark ? '#0A2A1A' : '#E8F5E9',
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 10,
    },
    defaultBadgeText: { fontSize: 11, fontWeight: '600', color: '#34C759' },
    cardNumber: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: 2,
      marginBottom: 16,
    },
    cardBottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    cardLabel: {
      fontSize: 10,
      color: colors.secondaryText,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    cardValue: {
      fontSize: 14,
      color: colors.text,
      marginTop: 2,
      fontWeight: '500',
    },
    cardActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.inputBackground,
    },
    actionButtonText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
    removeButton: {
      paddingHorizontal: 8,
      backgroundColor: isDark ? '#3A0A0A' : '#FFF0F0',
    },

    // Add button
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.card,
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderStyle: 'dashed',
      marginBottom: 4,
    },
    addButtonText: { fontSize: 15, color: colors.primary, fontWeight: '600' },

    // Empty
    emptyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
    emptySubtitle: { fontSize: 13, color: colors.secondaryText, marginTop: 2 },

    // Other options
    otherOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 14,
      marginBottom: 10,
    },
    otherIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    otherContent: { flex: 1 },
    otherTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
    otherSubtitle: { fontSize: 12, color: colors.secondaryText, marginTop: 2 },

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
    infoText: { flex: 1, fontSize: 13, color: colors.secondaryText, lineHeight: 18 },

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
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    inputLabel: {
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
    rowInputs: { flexDirection: 'row', marginTop: 0 },
    halfInput: { flex: 1 },

    // Provider chips
    providerRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
    providerChip: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    providerChipActive: {
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      borderColor: colors.primary,
    },
    providerChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.secondaryText,
    },
    providerChipTextActive: { color: colors.primary },

    // Phone input
    phoneInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
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

    // Actions
    saveButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 24,
    },
    saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    cancelButton: {
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    cancelButtonText: {
      color: colors.secondaryText,
      fontSize: 15,
      fontWeight: '500',
    },
  });