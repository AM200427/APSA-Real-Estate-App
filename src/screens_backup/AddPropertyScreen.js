// src/screens/AddPropertyScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext'; // ✅ Theme hook

export default function AddPropertyScreen({ navigation }) {
  const { colors, isDark } = useTheme(); // ✅ Get theme
  const { addProperty, isLoading } = useAppStore();
  const { showSuccess, showError } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [images, setImages] = useState([]);

  const styles = getStyles(colors, isDark); // ✅ Generate themed styles

  const pickImage = async () => {
    if (images.length >= 10) {
      showError('You have reached the maximum limit of 10 images.');
      return;
    }
    const remainingSlots = 10 - images.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      setImages((prevImages) => [...prevImages, ...newUris]);
    }
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !price || !location) {
      showError('Please fill in title, price, and location');
      return;
    }
    if (images.length === 0) {
      showError('Please upload at least one image of the property');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('location', location);
      formData.append('bedrooms', bedrooms);
      formData.append('bathrooms', bathrooms);

      images.forEach((uri, index) => {
        formData.append('images', {
          uri: uri,
          type: 'image/jpeg',
          name: `property_photo_${index}.jpg`,
        });
      });

      await addProperty(formData);
      showSuccess('Property listed successfully! 🎉');
      navigation.goBack();
    } catch (error) {
      showError('Failed to list property. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Listing</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Images Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.label}>Property Images (Max 10)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.thumbnail} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                    <Ionicons name="close-circle" size={22} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                <Ionicons name="camera-outline" size={32} color={colors.primary} />
                <Text style={styles.addImageText}>Add Photos</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Form Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.label}>Listing Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Luxury Apartment in Lusaka"
              placeholderTextColor={colors.secondaryText}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Price (ZMW)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 8500"
              placeholderTextColor={colors.secondaryText}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lusaka, Zambia"
              placeholderTextColor={colors.secondaryText}
              value={location}
              onChangeText={setLocation}
            />

            <View style={styles.rowInputs}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Bedrooms</Text>
                <TextInput
                  style={styles.input}
                  placeholder="3"
                  placeholderTextColor={colors.secondaryText}
                  value={bedrooms}
                  onChangeText={setBedrooms}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.halfInputContainer, { marginLeft: 12 }]}>
                <Text style={styles.label}>Bathrooms</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2"
                  placeholderTextColor={colors.secondaryText}
                  value={bathrooms}
                  onChangeText={setBathrooms}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your property..."
              placeholderTextColor={colors.secondaryText}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>List Property</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ✅ Styles generated from theme colors
const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: { paddingBottom: 40 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 10,
      paddingBottom: 20,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
    },
    backButton: { padding: 4 },
    sectionContainer: {
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    imageScroll: { flexDirection: 'row', marginBottom: 8 },
    imageWrapper: { position: 'relative', marginRight: 12 },
    thumbnail: {
      width: 100,
      height: 100,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.inputBackground,
    },
    removeImageBtn: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: colors.card,
      borderRadius: 12,
    },
    addImageBtn: {
      width: 100,
      height: 100,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? '#0A2A50' : '#F0F5FF',
    },
    addImageText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
      marginTop: 4,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    rowInputs: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    halfInputContainer: { flex: 1 },
    submitButton: {
      backgroundColor: colors.primary,
      marginHorizontal: 24,
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '700',
    },
  });