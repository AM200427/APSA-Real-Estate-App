// src/screens/MyListingsScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, 
  SafeAreaView, Image, StatusBar, Modal, Alert, Share, TextInput, Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../context/ThemeContext';

export default function MyListingsScreen({ navigation }) {
  const { properties = [], deleteProperty, updateProperty } = useAppStore();
  const { colors, isDark } = useTheme();
  
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null); 
  const [availableDate, setAvailableDate] = useState(''); 

  // 🔥 Custom Toast State
  const [toastMessage, setToastMessage] = useState(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-100)).current;

  const styles = getStyles(colors, isDark);
  const handleAddProperty = () => navigation.navigate('AddProperty');

  // 🔥 Function to show the modern toast
  const showCustomToast = (message, isError = false) => {
    setToastMessage({ text: message, isError });
    
    Animated.sequence([
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(toastTranslateY, { toValue: 0, duration: 300, useNativeDriver: true })
      ]),
      Animated.delay(2500),
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(toastTranslateY, { toValue: -100, duration: 300, useNativeDriver: true })
      ])
    ]).start(() => setToastMessage(null));
  };

  const getImageUri = (item) => {
    let rawImages = item?.images || item?.image || [];
    if (!Array.isArray(rawImages)) rawImages = [rawImages];
    let firstValidImage = null;
    const BASE_URL = 'http://192.168.1.195:5000'; 
    const flatten = (arr) => {
      arr.forEach(img => {
        if (firstValidImage) return;
        if (Array.isArray(img)) flatten(img);
        else if (img && typeof img === 'object') {
          const uri = img.uri || img.url || img.path;
          if (typeof uri === 'string') flatten([uri]);
        }
        else if (typeof img === 'string' && img.length > 2) {
          let finalUri = img;
          if (finalUri.startsWith('/uploads')) finalUri = `${BASE_URL}${finalUri}`;
          else if (!finalUri.startsWith('http') && !finalUri.startsWith('file://')) finalUri = `${BASE_URL}/uploads/${finalUri.replace(/^\/+/, '')}`;
          firstValidImage = finalUri;
        }
      });
    };
    flatten(rawImages);
    return firstValidImage ? { uri: firstValidImage } : { uri: 'https://via.placeholder.com/400' };
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Listing", "Are you sure you want to permanently delete this property?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
          if (deleteProperty) deleteProperty(id);
          setShowActionMenu(false);
        }
      }
    ]);
  };

  const handleShare = async (property) => {
    try {
      const shareUrl = `https://apsa-app.com/property/${property.id}`;
      await Share.share({
        message: `Check out this property on APSA: ${property.title} for K${property.price}/month. View details here: ${shareUrl}`,
        url: shareUrl,
        title: property.title,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const openStatusModal = () => {
    setShowActionMenu(false);
    setPendingStatus(null); 
    setAvailableDate(''); 
    setTimeout(() => setShowStatusModal(true), 300); 
  };

  const executeStatusChange = () => {
    if (!selectedProperty || !pendingStatus) return;
    updateProperty(selectedProperty.id, { 
      status: pendingStatus,
      availableDate: availableDate || null
    }).then(() => {
       setShowStatusModal(false);
       showCustomToast(`Property marked as ${pendingStatus}`);
    }).catch(() => {
       showCustomToast("Could not update status.", true);
    });
  };

  // 🔥 Updated Toggle Deactivation with Custom Toast
  const toggleDeactivation = () => {
    if (!selectedProperty) return;
    const isCurrentlyDeactivated = selectedProperty.status === 'Deactivated';
    const newStatus = isCurrentlyDeactivated ? 'Active' : 'Deactivated';
    
    updateProperty(selectedProperty.id, { status: newStatus }).then(() => {
       setShowActionMenu(false);
       showCustomToast(isCurrentlyDeactivated ? "Listing Reactivated" : "Listing Deactivated");
    }).catch(() => {
       showCustomToast("Could not update property.", true);
    });
  };

  const openActionMenu = (property) => {
    setSelectedProperty(property);
    setShowActionMenu(true);
  };

  const getBadgeColor = (status) => {
    if (status === 'Rented') return '#FF3B30';
    if (status === 'Sold') return '#AF52DE';
    if (status === 'Booked') return '#FF9500';
    if (status === 'Deactivated') return '#8E8E93'; // Slate Grey
    return '#34C759'; // Green (Active)
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* 🔥 CUSTOM TOAST ANIMATION */}
      {toastMessage && (
        <Animated.View style={[
          styles.toastContainer, 
          { 
            opacity: toastOpacity, 
            transform: [{ translateY: toastTranslateY }],
            backgroundColor: toastMessage.isError ? '#FF3B30' : '#34C759'
          }
        ]}>
          <Ionicons 
            name={toastMessage.isError ? "alert-circle" : "checkmark-circle"} 
            size={24} 
            color="#FFF" 
          />
          <Text style={styles.toastText}>{toastMessage.text}</Text>
        </Animated.View>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Listings</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProperty}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.dashboardRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{properties.filter(p => p.status !== 'Deactivated').length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>124</Text> 
          <Text style={styles.statLabel}>Views</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Inquiries</Text>
        </View>
      </View>

      <FlatList
        data={properties || []}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const safePrice = Number(item?.price) || 0;
          const currentStatus = item?.status || 'Active';
          const badgeColor = getBadgeColor(currentStatus);

          return (
            <View style={styles.card}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('PropertyDetail', { property: item })}>
                <View style={styles.imageContainer}>
                  <Image source={getImageUri(item)} style={styles.cardImage} />
                  
                  <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                    <View style={[styles.badgeDot, { backgroundColor: '#FFF' }]} />
                    <Text style={styles.badgeText}>{currentStatus.toUpperCase()}</Text>
                  </View>
                </View>
                
                <View style={styles.cardInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{String(item?.title || 'Untitled')}</Text>
                    <Text style={styles.cardPrice}>K{safePrice.toLocaleString()}</Text>
                  </View>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={16} color={colors.secondaryText} />
                    <Text style={styles.cardLocation} numberOfLines={1}>{String(item?.location || 'Unknown')}</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.actionBar}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AddProperty', { property: item })}>
                  <Ionicons name="pencil" size={18} color={colors.primary} />
                  <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>
                <View style={styles.actionDivider} />
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(item)}>
                  <Ionicons name="share-social-outline" size={18} color="#34C759" />
                  <Text style={styles.actionBtnText}>Share</Text>
                </TouchableOpacity>
                <View style={styles.actionDivider} />
                <TouchableOpacity style={styles.actionBtn} onPress={() => openActionMenu(item)}>
                  <Ionicons name="options-outline" size={18} color={colors.text} />
                  <Text style={styles.actionBtnText}>Manage</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* ACTION MENU MODAL */}
      <Modal visible={showActionMenu} transparent animationType="slide" onRequestClose={() => setShowActionMenu(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowActionMenu(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{selectedProperty?.title}</Text>
            
            <TouchableOpacity style={styles.modalAction} onPress={() => handleShare(selectedProperty)}>
              <Ionicons name="share-social-outline" size={24} color="#34C759" />
              <Text style={styles.modalActionText}>Share Listing</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalAction} onPress={openStatusModal}>
              <Ionicons name="sync-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.modalActionText}>Update Status</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalAction} onPress={toggleDeactivation}>
              <Ionicons 
                name={selectedProperty?.status === 'Deactivated' ? "eye-outline" : "eye-off-outline"} 
                size={24} 
                color={selectedProperty?.status === 'Deactivated' ? "#34C759" : "#8E8E93"} 
              />
              <Text style={styles.modalActionText}>
                {selectedProperty?.status === 'Deactivated' ? 'Reactivate Listing' : 'Deactivate Listing'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            <TouchableOpacity style={styles.modalAction} onPress={() => handleDelete(selectedProperty?.id)}>
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              <Text style={[styles.modalActionText, { color: '#FF3B30' }]}>Delete Listing</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* STATUS PICKER MODAL */}
      <Modal visible={showStatusModal} transparent animationType="fade" onRequestClose={() => setShowStatusModal(false)}>
        <View style={styles.centerModalOverlay}>
          <View style={styles.centerModalContent}>
            {!pendingStatus ? (
              <>
                <Text style={styles.centerModalTitle}>Update Status</Text>
                <View style={styles.statusOptionsContainer}>
                  <TouchableOpacity style={styles.statusOption} onPress={() => setPendingStatus('Rented')}>
                    <View style={[styles.statusIconWrap, { backgroundColor: '#FF3B30' }]}><Ionicons name="key" size={20} color="#FFF" /></View>
                    <Text style={styles.statusTitle}>Rented</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.border} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.statusOption} onPress={() => setPendingStatus('Sold')}>
                    <View style={[styles.statusIconWrap, { backgroundColor: '#AF52DE' }]}><Ionicons name="pricetag" size={20} color="#FFF" /></View>
                    <Text style={styles.statusTitle}>Sold</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.border} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.statusOption} onPress={() => setPendingStatus('Booked')}>
                    <View style={[styles.statusIconWrap, { backgroundColor: '#FF9500' }]}><Ionicons name="calendar" size={20} color="#FFF" /></View>
                    <Text style={styles.statusTitle}>Booked</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.border} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.centerCancelBtn} onPress={() => setShowStatusModal(false)}>
                  <Text style={styles.centerCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.step2Header}>
                  <TouchableOpacity onPress={() => setPendingStatus(null)}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.centerModalTitle}>When is it available?</Text>
                  <View style={{ width: 24 }} />
                </View>
                <Text style={styles.centerModalSubtitle}>
                  Enter the date it will be available again (e.g., 15 Nov 2026). This will be shown to clients.
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 15 Nov 2026"
                  placeholderTextColor={colors.secondaryText}
                  value={availableDate}
                  onChangeText={setAvailableDate}
                />
                <TouchableOpacity style={[styles.centerConfirmBtn, { backgroundColor: getBadgeColor(pendingStatus), marginTop: 20 }]} onPress={executeStatusChange}>
                  <Text style={styles.centerConfirmBtnText}>Confirm {pendingStatus}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.centerCancelBtn} onPress={() => setShowStatusModal(false)}>
                  <Text style={styles.centerCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#0F0F12' : '#F7F8FA' },
  
  // 🔥 Toast Styles
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    gap: 12,
  },
  toastText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? '#1C1C1E' : '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  addButton: { backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  dashboardRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 10, gap: 12 },
  statBox: { flex: 1, backgroundColor: colors.card, padding: 16, borderRadius: 16, alignItems: 'center', elevation: 2 },
  statNumber: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 },
  statLabel: { fontSize: 12, color: colors.secondaryText, fontWeight: '600' },
  listContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60 },
  card: { backgroundColor: colors.card, borderRadius: 24, marginBottom: 24, elevation: 6, overflow: 'hidden' },
  imageContainer: { width: '100%', height: 200, position: 'relative' },
  cardImage: { width: '100%', height: '100%', backgroundColor: '#E0E0E0' },
  badge: { position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  cardInfo: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: colors.text, flex: 1, marginRight: 12 },
  cardPrice: { fontSize: 18, fontWeight: '800', color: colors.primary },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  cardLocation: { fontSize: 14, color: colors.secondaryText, marginLeft: 6, flex: 1 },
  actionBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 6 },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: colors.text },
  actionDivider: { width: 1, backgroundColor: colors.border },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 5, backgroundColor: colors.border, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 20, textAlign: 'center' },
  modalAction: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 16 },
  modalActionText: { fontSize: 16, fontWeight: '600', color: colors.text },
  modalDivider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },

  centerModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  centerModalContent: { backgroundColor: colors.card, borderRadius: 24, padding: 24, width: '100%', elevation: 10 },
  centerModalTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8, textAlign: 'center' },
  centerModalSubtitle: { fontSize: 15, color: colors.secondaryText, textAlign: 'center', marginBottom: 20 },
  centerCancelBtn: { marginTop: 16, paddingVertical: 16, borderRadius: 16, backgroundColor: isDark ? '#1C1C1E' : '#F0F0F5', alignItems: 'center' },
  centerCancelBtnText: { fontSize: 16, fontWeight: '700', color: colors.text },
  centerConfirmBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  centerConfirmBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  statusOptionsContainer: { width: '100%', gap: 12 },
  statusOption: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: isDark ? '#1C1C1E' : '#F7F8FA', borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  statusIconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  statusTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },

  step2Header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  input: { backgroundColor: colors.inputBackground, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
});