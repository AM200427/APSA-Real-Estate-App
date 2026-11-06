// src/screens/PaymentsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAppStore } from '../../store/useAppStore';
import Text from '../components/AccessibleText';

const PAYMENT_OPTIONS = [
  {
    id: 'card',
    icon: 'card-outline',
    label: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard, American Express',
    color: '#1A73E8',
  },
  {
    id: 'mobile_money',
    icon: 'phone-portrait-outline',
    label: 'Mobile Money',
    subtitle: 'MTN, Airtel, Zamtel',
    color: '#FD7E14',
  },
  {
    id: 'bank',
    icon: 'business-outline',
    label: 'Bank Transfer',
    subtitle: 'Connect a bank account',
    color: '#28A745',
  },
  {
    id: 'paypal',
    icon: 'logo-paypal',
    label: 'PayPal',
    subtitle: 'Pay with your PayPal balance',
    color: '#003087',
  },
];

const MOBILE_NETWORKS = [
  { id: 'mtn', label: 'MTN Money' },
  { id: 'airtel', label: 'Airtel Money' },
  { id: 'zamtel', label: 'Zamtel Kwacha' },
];

export default function PaymentsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { showSuccess, showInfo, showError } = useToast();
  const styles = getStyles(colors, isDark);

  const {
    paymentMethods,
    transactions,
    paymentsLoading,
    loadPaymentMethods,
    loadTransactions,
    addPaymentMethod,
    removePaymentMethod,
  } = useAppStore();

  const [isAddSheetVisible, setIsAddSheetVisible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Card form
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Mobile money form
  const [mobileNetwork, setMobileNetwork] = useState('mtn');
  const [mobilePhone, setMobilePhone] = useState('');

  // Bank form
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  useEffect(() => {
    loadPaymentMethods();
    loadTransactions();
  }, []);

  const openAddSheet = () => {
    setSelectedMethod(null);
    setIsAddSheetVisible(true);
  };

  const closeAddSheet = () => {
    setIsAddSheetVisible(false);
    setSelectedMethod(null);
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCvv('');
    setMobileNetwork('mtn');
    setMobilePhone('');
    setBankName('');
    setAccountNumber('');
    setAccountName('');
  };

  const pickMethod = (id) => setSelectedMethod(id);
  const backToOptions = () => setSelectedMethod(null);

  const formatCardNumber = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    return digits.match(/.{1,4}/g)?.join(' ') || digits;
  };

  const formatExpiry = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const formatPhone = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    if (digits.length >= 7) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    if (digits.length >= 4) {
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    }
    return digits;
  };

  const handleSave = async () => {
    if (selectedMethod === 'card') {
      const digits = cardNumber.replace(/\s/g, '');
      if (digits.length < 16) {
        showError('Invalid card', 'Enter the full 16-digit card number.');
        return;
      }
      if (!cardName.trim()) {
        showError('Name missing', 'Enter the name on your card.');
        return;
      }
      if (cardExpiry.length < 5) {
        showError('Invalid expiry', 'Enter expiry as MM/YY.');
        return;
      }
      if (cardCvv.length < 3) {
        showError('Invalid CVV', 'Enter the 3-digit CVV from the back of your card.');
        return;
      }
    } else if (selectedMethod === 'mobile_money') {
      if (mobilePhone.replace(/\s/g, '').length < 10) {
        showError('Invalid number', 'Enter your mobile money phone number.');
        return;
      }
    } else if (selectedMethod === 'bank') {
      if (!bankName.trim()) {
        showError('Bank name missing', 'Enter your bank name.');
        return;
      }
      if (!accountNumber.trim()) {
        showError('Account missing', 'Enter your account number.');
        return;
      }
      if (!accountName.trim()) {
        showError('Name missing', 'Enter the account holder name.');
        return;
      }
    } else if (selectedMethod === 'paypal') {
      // nothing to validate
    } else {
      return;
    }

    setIsSaving(true);

    try {
      let payload = null;

      if (selectedMethod === 'card') {
        const digits = cardNumber.replace(/\s/g, '');
        payload = {
          type: 'Card',
          cardholderName: cardName.trim(),
          last4: digits.slice(-4),
          expiry: cardExpiry,
        };
      } else if (selectedMethod === 'mobile_money') {
        const net = MOBILE_NETWORKS.find((n) => n.id === mobileNetwork);
        payload = {
          type: net?.label || 'Mobile Money',
          phone: mobilePhone.replace(/\s/g, ''),
          last4: mobilePhone.replace(/\s/g, '').slice(-4),
          expiry: '—',
        };
      } else if (selectedMethod === 'bank') {
        payload = {
          type: bankName.trim(),
          accountHolderName: accountName.trim(),
          accountNumberMasked: `••••${accountNumber.slice(-4)}`,
          last4: accountNumber.slice(-4),
          expiry: '—',
        };
      } else if (selectedMethod === 'paypal') {
        payload = { type: 'PayPal', last4: '——', expiry: '—' };
      }

      if (!payload) {
        setIsSaving(false);
        return;
      }

      const result = await addPaymentMethod(payload);

      if (result?.success) {
        showSuccess(
          'Payment method added',
          `${payload.type} is ready to use.`,
          3000
        );
        closeAddSheet();
      } else {
        showError('Could not add', 'Please try again.');
      }
    } catch (err) {
      console.log('addPaymentMethod failed:', err);
      showError('Could not add', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveCard = (id) => {
    Alert.alert(
      'Remove payment method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removePaymentMethod(id);
            showInfo('Removed', 'Payment method removed.', 2500);
          },
        },
      ]
    );
  };

  const renderCardIcon = (type) => {
    let icon = 'card-outline';
    let color = colors.primary;
    if (type === 'PayPal') {
      icon = 'logo-paypal';
      color = '#003087';
    } else if (
      type === 'MTN Money' ||
      type === 'Airtel Money' ||
      type === 'Zamtel Kwacha'
    ) {
      icon = 'phone-portrait-outline';
      color = '#FD7E14';
    } else if (type === 'Visa') {
      icon = 'card';
      color = '#1A73E8';
    } else if (type === 'Mastercard') {
      icon = 'card';
      color = '#EB001B';
    } else if (type === 'Card') {
      icon = 'card-outline';
      color = '#1A73E8';
    } else {
      icon = 'business-outline';
      color = '#28A745';
    }
    return { icon, color };
  };

  const hasMethods = paymentMethods && paymentMethods.length > 0;
  const hasTransactions = transactions && transactions.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>

          {paymentsLoading && !hasMethods ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : !hasMethods ? (
            <View style={styles.emptyBlock}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="card-outline" size={28} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No payment methods yet</Text>
              <Text style={styles.emptySubtitle}>
                Add a card, mobile money number, or bank account to start
                booking.
              </Text>
            </View>
          ) : (
            paymentMethods.map((card) => {
              const { icon, color } = renderCardIcon(card.type);
              return (
                <View key={card.id} style={styles.cardItem}>
                  <View
                    style={[
                      styles.cardIcon,
                      { backgroundColor: (color || colors.primary) + '18' },
                    ]}
                  >
                    <Ionicons name={icon} size={24} color={color} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>
                      {card.type}
                      {card.last4 && card.last4 !== '——'
                        ? ` •••• ${card.last4}`
                        : ''}
                    </Text>
                    <Text style={styles.cardSubtitle}>
                      {card.expiry && card.expiry !== '—'
                        ? `Expires ${card.expiry}`
                        : 'Connected'}
                    </Text>
                    {card.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveCard(card.id)}
                    style={styles.removeBtn}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              );
            })
          )}

          <TouchableOpacity style={styles.addCardButton} onPress={openAddSheet}>
            <Ionicons
              name="add-circle-outline"
              size={22}
              color={colors.primary}
            />
            <Text style={styles.addCardText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          {!hasTransactions ? (
            <View style={styles.emptyBlock}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="receipt-outline"
                  size={28}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySubtitle}>
                Your payments and receipts will show up here once you book.
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsCard}>
              {transactions.map((tx, index) => (
                <View
                  key={tx.id}
                  style={[
                    styles.txItem,
                    index === transactions.length - 1 && styles.txItemLast,
                  ]}
                >
                  <View style={styles.txLeft}>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    <Text style={styles.txDate}>{tx.date}</Text>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={styles.txAmount}>
                      K{(tx.amount || 0).toLocaleString()}
                    </Text>
                    <View style={styles.txStatus}>
                      <Ionicons
                        name="checkmark-circle"
                        size={12}
                        color="#34C759"
                      />
                      <Text style={styles.txStatusText}>{tx.status}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Payment Sheet */}
      <Modal
        visible={isAddSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={closeAddSheet}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeAddSheet}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.sheetKeyboardWrap}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.sheet}
              onPress={() => {}}
            >
              <View style={styles.sheetHandle} />

              <View style={styles.sheetHeader}>
                {selectedMethod ? (
                  <TouchableOpacity
                    onPress={backToOptions}
                    style={styles.sheetBackBtn}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={22}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={{ width: 36 }} />
                )}
                <Text style={styles.sheetTitle}>
                  {selectedMethod
                    ? 'Add ' +
                      (selectedMethod === 'card'
                        ? 'Card'
                        : selectedMethod === 'mobile_money'
                        ? 'Mobile Money'
                        : selectedMethod === 'bank'
                        ? 'Bank Account'
                        : 'PayPal')
                    : 'Add Payment Method'}
                </Text>
                <TouchableOpacity
                  onPress={closeAddSheet}
                  style={styles.sheetCloseBtn}
                >
                  <Ionicons name="close" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.sheetScrollContent}
              >
                {!selectedMethod && (
                  <>
                    <Text style={styles.sheetSubtitle}>
                      Choose how you'd like to pay
                    </Text>

                    {PAYMENT_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        style={styles.methodOption}
                        onPress={() => pickMethod(option.id)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.methodIconWrap,
                            { backgroundColor: option.color + '18' },
                          ]}
                        >
                          <Ionicons
                            name={option.icon}
                            size={26}
                            color={option.color}
                          />
                        </View>
                        <View style={styles.methodTextWrap}>
                          <Text style={styles.methodLabel}>
                            {option.label}
                          </Text>
                          <Text style={styles.methodSubtitle}>
                            {option.subtitle}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={colors.secondaryText}
                        />
                      </TouchableOpacity>
                    ))}

                    <View style={styles.secureNote}>
                      <Ionicons
                        name="lock-closed"
                        size={14}
                        color={colors.secondaryText}
                      />
                      <Text style={styles.secureNoteText}>
                        Your payment details are encrypted and securely stored.
                      </Text>
                    </View>
                  </>
                )}

                {selectedMethod === 'card' && (
                  <>
                    <Text style={styles.sheetSubtitle}>
                      Enter your card details
                    </Text>

                    <Text style={styles.fieldLabel}>Card Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor={colors.secondaryText}
                      value={cardNumber}
                      onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                      keyboardType="number-pad"
                      maxLength={19}
                    />

                    <Text style={styles.fieldLabel}>Name on Card</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="John Doe"
                      placeholderTextColor={colors.secondaryText}
                      value={cardName}
                      onChangeText={setCardName}
                      autoCapitalize="words"
                    />

                    <View style={styles.row}>
                      <View style={styles.halfCol}>
                        <Text style={styles.fieldLabel}>Expiry</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="MM/YY"
                          placeholderTextColor={colors.secondaryText}
                          value={cardExpiry}
                          onChangeText={(t) => setCardExpiry(formatExpiry(t))}
                          keyboardType="number-pad"
                          maxLength={5}
                        />
                      </View>
                      <View style={[styles.halfCol, { marginLeft: 12 }]}>
                        <Text style={styles.fieldLabel}>CVV</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="123"
                          placeholderTextColor={colors.secondaryText}
                          value={cardCvv}
                          onChangeText={(t) =>
                            setCardCvv(t.replace(/\D/g, '').slice(0, 4))
                          }
                          keyboardType="number-pad"
                          secureTextEntry
                          maxLength={4}
                        />
                      </View>
                    </View>
                  </>
                )}

                {selectedMethod === 'mobile_money' && (
                  <>
                    <Text style={styles.sheetSubtitle}>
                      Pick your network and enter your number
                    </Text>

                    <Text style={styles.fieldLabel}>Network</Text>
                    <View style={styles.networkRow}>
                      {MOBILE_NETWORKS.map((net) => {
                        const selected = mobileNetwork === net.id;
                        return (
                          <TouchableOpacity
                            key={net.id}
                            style={[
                              styles.networkChip,
                              selected && styles.networkChipActive,
                            ]}
                            onPress={() => setMobileNetwork(net.id)}
                            activeOpacity={0.8}
                          >
                            {selected && (
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color="#FFFFFF"
                                style={{ marginRight: 4 }}
                              />
                            )}
                            <Text
                              style={[
                                styles.networkChipText,
                                selected && styles.networkChipTextActive,
                              ]}
                            >
                              {net.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <Text style={styles.fieldLabel}>Phone Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="097 123 4567"
                      placeholderTextColor={colors.secondaryText}
                      value={mobilePhone}
                      onChangeText={(t) => setMobilePhone(formatPhone(t))}
                      keyboardType="phone-pad"
                      maxLength={12}
                    />

                    <View style={styles.infoBox}>
                      <Ionicons
                        name="information-circle-outline"
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={styles.infoBoxText}>
                        We'll send a prompt to your phone to authorize this
                        payment method.
                      </Text>
                    </View>
                  </>
                )}

                {selectedMethod === 'bank' && (
                  <>
                    <Text style={styles.sheetSubtitle}>
                      Enter your bank account details
                    </Text>

                    <Text style={styles.fieldLabel}>Bank Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Zanaco, Stanbic, ABSA"
                      placeholderTextColor={colors.secondaryText}
                      value={bankName}
                      onChangeText={setBankName}
                      autoCapitalize="words"
                    />

                    <Text style={styles.fieldLabel}>Account Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your account number"
                      placeholderTextColor={colors.secondaryText}
                      value={accountNumber}
                      onChangeText={(t) =>
                        setAccountNumber(t.replace(/\D/g, '').slice(0, 15))
                      }
                      keyboardType="number-pad"
                    />

                    <Text style={styles.fieldLabel}>
                      Account Holder Name
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Name as it appears on the account"
                      placeholderTextColor={colors.secondaryText}
                      value={accountName}
                      onChangeText={setAccountName}
                      autoCapitalize="words"
                    />

                    <View style={styles.infoBox}>
                      <Ionicons
                        name="information-circle-outline"
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={styles.infoBoxText}>
                        We'll verify your account with a small temporary
                        deposit.
                      </Text>
                    </View>
                  </>
                )}

                {selectedMethod === 'paypal' && (
                  <View style={styles.paypalHero}>
                    <View style={styles.paypalLogoWrap}>
                      <Ionicons
                        name="logo-paypal"
                        size={44}
                        color="#003087"
                      />
                    </View>
                    <Text style={styles.paypalTitle}>Connect PayPal</Text>
                    <Text style={styles.paypalSubtitle}>
                      You'll be redirected to PayPal to authorize the
                      connection. No card details needed.
                    </Text>
                  </View>
                )}
              </ScrollView>

              {selectedMethod && (
                <SafeAreaView edges={['bottom']} style={styles.sheetFooter}>
                  <TouchableOpacity
                    style={[
                      styles.saveBtn,
                      isSaving && styles.saveBtnDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={isSaving}
                    activeOpacity={0.85}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons
                          name={
                            selectedMethod === 'paypal'
                              ? 'open-outline'
                              : 'checkmark-circle'
                          }
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.saveBtnText}>
                          {selectedMethod === 'paypal'
                            ? 'Continue with PayPal'
                            : selectedMethod === 'mobile_money'
                            ? 'Send authorization request'
                            : selectedMethod === 'bank'
                            ? 'Connect bank account'
                            : 'Save card'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </SafeAreaView>
              )}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
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
      backgroundColor: colors.card,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
    content: { padding: 16, paddingBottom: 40 },

    section: { marginBottom: 24 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.secondaryText,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 10,
      marginLeft: 4,
    },

    loadingBlock: { paddingVertical: 30, alignItems: 'center' },

    emptyBlock: {
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: 24,
      paddingHorizontal: 20,
      alignItems: 'center',
      marginBottom: 8,
    },
    emptyIconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    emptySubtitle: {
      fontSize: 13,
      color: colors.secondaryText,
      textAlign: 'center',
      lineHeight: 18,
      maxWidth: 280,
    },

    cardItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 10,
    },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
    cardSubtitle: {
      fontSize: 13,
      color: colors.secondaryText,
      marginTop: 2,
    },
    defaultBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      alignSelf: 'flex-start',
      marginTop: 6,
    },
    defaultBadgeText: {
      fontSize: 10,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    removeBtn: { padding: 8 },

    addCardButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.primary,
      marginTop: 4,
    },
    addCardText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primary,
    },

    transactionsCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
    },
    txItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    txItemLast: { borderBottomWidth: 0 },
    txLeft: { flex: 1 },
    txTitle: { fontSize: 15, fontWeight: '500', color: colors.text },
    txDate: { fontSize: 12, color: colors.secondaryText, marginTop: 2 },
    txRight: { alignItems: 'flex-end' },
    txAmount: { fontSize: 15, fontWeight: '700', color: colors.text },
    txStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    txStatusText: { fontSize: 11, color: '#34C759', fontWeight: '600' },

    // ---------- Add Payment Sheet ----------
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheetKeyboardWrap: { width: '100%' },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: 10,
      maxHeight: '90%',
    },
    sheetHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: 12,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    sheetBackBtn: { padding: 4, minWidth: 36 },
    sheetCloseBtn: { padding: 4, minWidth: 36, alignItems: 'flex-end' },
    sheetTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
    sheetScrollContent: {
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 20,
    },
    sheetSubtitle: {
      fontSize: 13,
      color: colors.secondaryText,
      marginBottom: 16,
      marginTop: 4,
    },

    methodOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 14,
      paddingHorizontal: 4,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    methodIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    methodTextWrap: { flex: 1 },
    methodLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
    methodSubtitle: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 2,
    },

    secureNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 20,
      paddingHorizontal: 4,
    },
    secureNoteText: {
      fontSize: 12,
      color: colors.secondaryText,
      flex: 1,
      lineHeight: 16,
    },

    // Form fields
    fieldLabel: {
      fontSize: 12,
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
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    row: { flexDirection: 'row' },
    halfCol: { flex: 1 },

    // Mobile money chips
    networkRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
    },
    networkChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.inputBackground,
    },
    networkChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    networkChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    networkChipTextActive: { color: '#FFFFFF' },

    // Info box
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: isDark ? '#0A2A50' : '#F0F7FF',
      borderRadius: 12,
      padding: 12,
      marginTop: 16,
    },
    infoBoxText: {
      fontSize: 12,
      color: colors.text,
      flex: 1,
      lineHeight: 17,
    },

    // PayPal hero
    paypalHero: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    paypalLogoWrap: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: isDark ? '#0A2A50' : '#E8F0FE',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    paypalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    paypalSubtitle: {
      fontSize: 13,
      color: colors.secondaryText,
      textAlign: 'center',
      lineHeight: 19,
      paddingHorizontal: 20,
    },

    // Sheet footer
    sheetFooter: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 12,
      borderTopWidth: 0.5,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
    },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      borderRadius: 14,
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.2,
    },
  });