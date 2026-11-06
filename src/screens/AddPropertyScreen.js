// src/screens/AddPropertyScreen.js
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import Text from '../components/AccessibleText';

const LISTING_TYPES = [
  { id: 'For Rent', label: 'For Rent', icon: 'home-outline' },
  { id: 'For Sale', label: 'For Sale', icon: 'pricetag-outline' },
  { id: 'Booking', label: 'Booking', icon: 'calendar-outline' },
];

const FURNISHED_OPTIONS = ['Furnished', 'Semi-furnished', 'Unfurnished'];
const CONDITION_OPTIONS = ['New', 'Excellent', 'Good', 'Needs work'];
const UTILITY_OPTIONS = ['Water', 'Electricity', 'Internet', 'Security'];
const AMENITY_OPTIONS = ['Schools', 'Hospitals', 'Shopping malls', 'Public transport', 'Parks', 'Restaurants'];

const Chip = ({ label, selected, onPress, colors, isDark }) => (
  <TouchableOpacity
    style={[
      stylesStatic.chip,
      { backgroundColor: isDark ? '#0A2A50' : '#F0F5FF', borderColor: colors.primary },
      selected && { backgroundColor: colors.primary },
    ]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {selected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
    <Text style={[stylesStatic.chipText, { color: colors.primary }, selected && { color: '#FFFFFF' }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function AddPropertyScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const { addProperty, updateProperty, isLoading, user } = useAppStore();
  const { showSuccess, showError } = useToast();

  const propertyToEdit = route?.params?.property;
  const isEditing = !!propertyToEdit;

  const styles = getStyles(colors, isDark);

  // Pre-fill state if editing
  const [title, setTitle] = useState(propertyToEdit?.title || '');
  const [description, setDescription] = useState(propertyToEdit?.description || '');
  const [price, setPrice] = useState(propertyToEdit?.price?.toString() || '');
  const [location, setLocation] = useState(propertyToEdit?.location || '');
  const [bedrooms, setBedrooms] = useState(propertyToEdit?.bedrooms?.toString() || '');
  const [bathrooms, setBathrooms] = useState(propertyToEdit?.bathrooms?.toString() || '');
  const [listingType, setListingType] = useState(propertyToEdit?.listingType || 'For Rent');
  
  const [existingImages, setExistingImages] = useState(propertyToEdit?.images || []);
  const [newImages, setNewImages] = useState([]);
  const allImages = [...existingImages, ...newImages];

  const [area, setArea] = useState(propertyToEdit?.area?.toString() || '');
  const [yearBuilt, setYearBuilt] = useState(propertyToEdit?.yearBuilt?.toString() || '');
  const [parkingSpaces, setParkingSpaces] = useState(propertyToEdit?.parkingSpaces?.toString() || '');
  const [furnished, setFurnished] = useState(propertyToEdit?.furnished || '');
  const [condition, setCondition] = useState(propertyToEdit?.condition || '');
  const [petFriendly, setPetFriendly] = useState(propertyToEdit?.petFriendly || false);
  const [utilities, setUtilities] = useState(propertyToEdit?.utilities || []);
  const [nearbyAmenities, setNearbyAmenities] = useState(propertyToEdit?.nearbyAmenities || []);
  const [deposit, setDeposit] = useState(propertyToEdit?.deposit?.toString() || '');
  const [minimumLease, setMinimumLease] = useState(propertyToEdit?.minimumLease || '');

  const [errors, setErrors] = useState({});
  const isRental = listingType === 'For Rent' || listingType === 'Booking';

  const pickImage = async () => {
    if (allImages.length >= 10) {
      showError('Limit reached', 'You can only upload up to 10 images.');
      return;
    }
    const remainingSlots = 10 - allImages.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      setNewImages((prev) => [...prev, ...newUris]);
      setErrors((prev) => ({ ...prev, images: false }));
    }
  };

  const removeImage = (index) => {
    if (index < existingImages.length) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setNewImages((prev) => prev.filter((_, i) => i !== (index - existingImages.length)));
    }
  };

  const toggleInArray = (value, list, setList) => {
    if (list.includes(value)) setList(list.filter((v) => v !== value));
    else setList([...list, value]);
  };

  const handleSubmit = async () => {
    let newErrors = {};
    if (!title.trim()) newErrors.title = true;
    if (!price.trim()) newErrors.price = true;
    if (!location.trim()) newErrors.location = true;
    if (allImages.length === 0) newErrors.images = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showError('Incomplete Form', 'Please fill in all the red fields.');
      return;
    }
    setErrors({});

    try {
      const formData = new FormData();

      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('location', location);
      formData.append('bedrooms', bedrooms);
      formData.append('bathrooms', bathrooms);
      formData.append('listingType', listingType);

      if (area) formData.append('area', area);
      if (yearBuilt) formData.append('yearBuilt', yearBuilt);
      if (parkingSpaces) formData.append('parkingSpaces', parkingSpaces);
      if (furnished) formData.append('furnished', furnished);
      if (condition) formData.append('condition', condition);
      formData.append('petFriendly', petFriendly ? 'true' : 'false');
      if (utilities.length > 0) formData.append('utilities', JSON.stringify(utilities));
      if (nearbyAmenities.length > 0) formData.append('nearbyAmenities', JSON.stringify(nearbyAmenities));
      
      if (isRental) {
        if (deposit) formData.append('deposit', deposit);
        if (minimumLease) formData.append('minimumLease', minimumLease);
      }

      if (user?.agentProfile) formData.append('hostProfile', JSON.stringify(user.agentProfile));
      formData.append('hostVerified', user?.role?.toLowerCase() === 'agent' ? 'true' : 'false');

      // 🔥 If editing, tell backend to KEEP existing images
      if (isEditing && existingImages.length > 0) {
        formData.append('existingImages', JSON.stringify(existingImages));
      }

      // 🔥 Only append the NEW images (ensuring they are just the URI strings)
      newImages.forEach((uri, index) => {
        // Unwrap any accidental nested arrays
        let safeUri = uri;
        while (Array.isArray(safeUri)) safeUri = safeUri[0];
        if (safeUri && typeof safeUri === 'object' && safeUri.uri) safeUri = safeUri.uri;

        if (typeof safeUri === 'string' && safeUri.length > 5) {
          formData.append('images', {
            uri: safeUri,
            type: 'image/jpeg',
            name: `property_photo_${index}.jpg`,
          });
        }
      });

      if (isEditing) {
        await updateProperty(propertyToEdit.id, formData);
        showSuccess('Property updated successfully! 🎉');
      } else {
        await addProperty(formData);
        showSuccess('Property listed successfully! 🎉');
      }
      
      navigation.goBack();
    } catch (error) {
      console.log('🔥 ERROR in handleSubmit:', error);
      showError('Failed to save property', error?.message || 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isEditing ? 'Edit Listing' : 'Add New Listing'}</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* ============ IMAGES ============ */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>Photos *</Text>
            <Text style={[styles.helper, errors.images && { color: '#FF3B30' }]}>
              {errors.images ? 'Please upload at least one photo.' : 'Add up to 10 photos. The first one is the cover.'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {allImages.map((uri, index) => {
                // 🔥 Safely resolve the image display URI
                let displayUri = uri;
                while (Array.isArray(displayUri)) displayUri = displayUri[0];
                if (displayUri && typeof displayUri === 'object' && displayUri.uri) {
                  displayUri = displayUri.uri;
                }
                if (typeof displayUri === 'string' && displayUri.startsWith('/uploads')) {
                  displayUri = `http://192.168.1.195:5000${displayUri}`;
                }

                return (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri: displayUri }} style={styles.thumbnail} />
                    {index === 0 && (
                      <View style={styles.coverBadge}><Text style={styles.coverBadgeText}>Cover</Text></View>
                    )}
                    <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                      <Ionicons name="close-circle" size={22} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                );
              })}
              <TouchableOpacity style={[styles.addImageBtn, errors.images && { borderColor: '#FF3B30' }]} onPress={pickImage}>
                <Ionicons name="camera-outline" size={32} color={errors.images ? '#FF3B30' : colors.primary} />
                <Text style={[styles.addImageText, errors.images && { color: '#FF3B30' }]}>Add Photos</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* ============ BASICS ============ */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>Basics</Text>

            <Text style={styles.label}>Listing Title *</Text>
            <TextInput
              style={[styles.input, errors.title && { borderColor: '#FF3B30', borderWidth: 1.5 }]}
              placeholder="e.g. Luxury Apartment in Lusaka"
              placeholderTextColor={colors.secondaryText}
              value={title}
              onChangeText={(text) => { setTitle(text); setErrors({ ...errors, title: false }); }}
            />
            {errors.title && <Text style={styles.errorText}>Title is required</Text>}

            <Text style={styles.label}>Listing Type</Text>
            <View style={styles.listingTypeRow}>
              {LISTING_TYPES.map((lt) => {
                const selected = listingType === lt.id;
                return (
                  <TouchableOpacity key={lt.id} style={[styles.listingTypeChip, selected && styles.listingTypeChipActive]} onPress={() => setListingType(lt.id)} activeOpacity={0.8}>
                    <Ionicons name={lt.icon} size={18} color={selected ? '#FFFFFF' : colors.primary} />
                    <Text style={[styles.listingTypeText, selected && styles.listingTypeTextActive]}>{lt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>
              Price (ZMW) *{isRental ? (listingType === 'Booking' ? ' per night' : ' per month') : ''}
            </Text>
            <TextInput
              style={[styles.input, errors.price && { borderColor: '#FF3B30', borderWidth: 1.5 }]}
              placeholder={listingType === 'Booking' ? 'e.g. 450' : 'e.g. 8500'}
              placeholderTextColor={colors.secondaryText}
              value={price}
              onChangeText={(text) => { setPrice(text); setErrors({ ...errors, price: false }); }}
              keyboardType="numeric"
            />
            {errors.price && <Text style={styles.errorText}>Price is required</Text>}

            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={[styles.input, errors.location && { borderColor: '#FF3B30', borderWidth: 1.5 }]}
              placeholder="e.g. Lusaka, Zambia"
              placeholderTextColor={colors.secondaryText}
              value={location}
              onChangeText={(text) => { setLocation(text); setErrors({ ...errors, location: false }); }}
            />
            {errors.location && <Text style={styles.errorText}>Location is required</Text>}

            <View style={styles.rowInputs}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Bedrooms</Text>
                <TextInput style={styles.input} placeholder="3" placeholderTextColor={colors.secondaryText} value={bedrooms} onChangeText={setBedrooms} keyboardType="numeric" />
              </View>
              <View style={[styles.halfInputContainer, { marginLeft: 12 }]}>
                <Text style={styles.label}>Bathrooms</Text>
                <TextInput style={styles.input} placeholder="2" placeholderTextColor={colors.secondaryText} value={bathrooms} onChangeText={setBathrooms} keyboardType="numeric" />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Area (sq ft)</Text>
                <TextInput style={styles.input} placeholder="1200" placeholderTextColor={colors.secondaryText} value={area} onChangeText={setArea} keyboardType="numeric" />
              </View>
              <View style={[styles.halfInputContainer, { marginLeft: 12 }]}>
                <Text style={styles.label}>Year built</Text>
                <TextInput style={styles.input} placeholder="2018" placeholderTextColor={colors.secondaryText} value={yearBuilt} onChangeText={setYearBuilt} keyboardType="numeric" maxLength={4} />
              </View>
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Describe your property..." placeholderTextColor={colors.secondaryText} value={description} onChangeText={setDescription} multiline numberOfLines={4} textAlignVertical="top" />
          </View>

          {/* ============ CONDITION & FEATURES ============ */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>Condition & features</Text>
            <Text style={styles.label}>Furnished</Text>
            <View style={styles.chipsRow}>
              {FURNISHED_OPTIONS.map((f) => (
                <Chip key={f} label={f} selected={furnished === f} onPress={() => setFurnished(furnished === f ? '' : f)} colors={colors} isDark={isDark} />
              ))}
            </View>

            <Text style={styles.label}>Condition</Text>
            <View style={styles.chipsRow}>
              {CONDITION_OPTIONS.map((c) => (
                <Chip key={c} label={c} selected={condition === c} onPress={() => setCondition(condition === c ? '' : c)} colors={colors} isDark={isDark} />
              ))}
            </View>

            <View style={styles.rowInputs}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Parking spaces</Text>
                <TextInput style={styles.input} placeholder="1" placeholderTextColor={colors.secondaryText} value={parkingSpaces} onChangeText={setParkingSpaces} keyboardType="numeric" maxLength={2} />
              </View>
              <View style={[styles.halfInputContainer, { marginLeft: 12 }]}>
                <Text style={styles.label}>Pet friendly</Text>
                <View style={styles.switchRow}>
                  <Switch value={petFriendly} onValueChange={setPetFriendly} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#FFFFFF" />
                  <Text style={styles.switchLabel}>{petFriendly ? 'Yes' : 'No'}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.label}>Utilities included</Text>
            <View style={styles.chipsRow}>
              {UTILITY_OPTIONS.map((u) => (
                <Chip key={u} label={u} selected={utilities.includes(u)} onPress={() => toggleInArray(u, utilities, setUtilities)} colors={colors} isDark={isDark} />
              ))}
            </View>
          </View>

          {/* ============ NEARBY AMENITIES ============ */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>Nearby amenities</Text>
            <Text style={styles.helper}>What's close to this property?</Text>
            <View style={styles.chipsRow}>
              {AMENITY_OPTIONS.map((a) => (
                <Chip key={a} label={a} selected={nearbyAmenities.includes(a)} onPress={() => toggleInArray(a, nearbyAmenities, setNearbyAmenities)} colors={colors} isDark={isDark} />
              ))}
            </View>
          </View>

          {/* ============ RENTAL TERMS ============ */}
          {isRental && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeading}>{listingType === 'Booking' ? 'Booking terms' : 'Rental terms'}</Text>
              <Text style={styles.label}>Deposit (ZMW)</Text>
              <TextInput style={styles.input} placeholder="e.g. 8500" placeholderTextColor={colors.secondaryText} value={deposit} onChangeText={setDeposit} keyboardType="numeric" />
              <Text style={styles.label}>Minimum stay / lease</Text>
              <TextInput style={styles.input} placeholder={listingType === 'Booking' ? 'e.g. 2 nights' : 'e.g. 6 months'} placeholderTextColor={colors.secondaryText} value={minimumLease} onChangeText={setMinimumLease} />
            </View>
          )}

          {/* ============ SUBMIT ============ */}
          <TouchableOpacity style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>{isEditing ? 'Save Changes' : 'List Property'}</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const stylesStatic = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  chipText: { fontSize: 13, fontWeight: '600' },
});

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20, backgroundColor: colors.background },
    headerTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
    backButton: { padding: 4 },
    sectionContainer: { paddingHorizontal: 24, marginBottom: 28 },
    sectionHeading: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
    helper: { fontSize: 13, color: colors.secondaryText, marginBottom: 12 },
    label: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 12, marginBottom: 8 },
    errorText: { color: '#FF3B30', fontSize: 12, marginTop: 4, marginLeft: 4 },
    imageScroll: { flexDirection: 'row', marginBottom: 8 },
    imageWrapper: { position: 'relative', marginRight: 12 },
    thumbnail: { width: 100, height: 100, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.inputBackground },
    coverBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    coverBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
    removeImageBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: colors.card, borderRadius: 12 },
    addImageBtn: { width: 100, height: 100, borderRadius: 16, borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#0A2A50' : '#F0F5FF' },
    addImageText: { fontSize: 12, color: colors.primary, fontWeight: '600', marginTop: 4 },
    input: { backgroundColor: colors.inputBackground, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text, marginBottom: 4, borderWidth: 1, borderColor: colors.border },
    textArea: { height: 110, textAlignVertical: 'top' },
    rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
    halfInputContainer: { flex: 1 },
    listingTypeRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    listingTypeChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: isDark ? '#0A2A50' : '#F0F5FF' },
    listingTypeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    listingTypeText: { fontSize: 13, fontWeight: '600', color: colors.primary },
    listingTypeTextActive: { color: '#FFFFFF' },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.inputBackground, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.border },
    switchLabel: { fontSize: 15, color: colors.text, fontWeight: '500' },
    submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, marginHorizontal: 24, paddingVertical: 18, borderRadius: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
    submitButtonDisabled: { opacity: 0.7 },
    submitButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  });