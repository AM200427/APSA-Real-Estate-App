// src/components/RatingModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';

// Robust role detection — handles 'agent', 'Agent', 'AGENT', undefined
const detectRole = (user) => {
  const candidates = [user?.role, user?.userRole, user?.accountType, user?.type];
  for (const raw of candidates) {
    if (typeof raw === 'string' && raw.trim().toLowerCase() === 'agent') {
      return 'agent';
    }
  }
  return 'client';
};

const RatingModal = ({
  visible,
  onClose,
  onSubmit,
  propertyTitle,
  editingReview = null,
  isEditing = false,
}) => {
  const { user } = useAppStore();
  const userRole = detectRole(user);

  // ✅ Debug log — remove once verified
  useEffect(() => {
    console.log(
      '🔎 RatingModal role check:',
      'user.role =', JSON.stringify(user?.role),
      '| user.userRole =', JSON.stringify(user?.userRole),
      '| detected =', userRole
    );
  }, [user, userRole]);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStars, setSelectedStars] = useState(0);

  useEffect(() => {
    if (editingReview && isEditing) {
      setRating(editingReview.rating || 0);
      setSelectedStars(editingReview.rating || 0);
      setComment(editingReview.comment || '');
    } else {
      setRating(0);
      setSelectedStars(0);
      setComment('');
    }
  }, [editingReview, isEditing, visible]);

  const handleStarPress = (starNumber) => {
    setSelectedStars(starNumber);
    setRating(starNumber);
  };

  const handleSubmit = async () => {
    if (selectedStars === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a comment');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        rating: selectedStars,
        comment: comment.trim(),
        userType: userRole,
        ...(isEditing && { reviewId: editingReview?.id }),
      });

      setRating(0);
      setSelectedStars(0);
      setComment('');
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => handleStarPress(star)}
          style={styles.starButton}
        >
          <Ionicons
            name={star <= selectedStars ? 'star' : 'star-outline'}
            size={40}
            color={star <= selectedStars ? '#FFD700' : '#CCCCCC'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Review' : 'Rate & Review'}
            </Text>
            <View style={styles.headerRight} />
          </View>

          {propertyTitle && (
            <Text style={styles.propertyTitle}>{propertyTitle}</Text>
          )}

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Your Rating</Text>
            {renderStars()}
            {selectedStars > 0 && (
              <Text style={styles.ratingValue}>
                {selectedStars} {selectedStars === 1 ? 'Star' : 'Stars'}
              </Text>
            )}
          </View>

          <View style={styles.postingAsRow}>
            <Ionicons
              name={userRole === 'agent' ? 'business' : 'person'}
              size={16}
              color="#666"
            />
            <Text style={styles.postingAsText}>
              Posting as{' '}
              <Text style={styles.postingAsRole}>
                {userRole === 'agent' ? 'Agent' : 'Client'}
              </Text>
            </Text>
          </View>

          <View style={styles.commentSection}>
            <Text style={styles.commentLabel}>Your Review</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              maxLength={500}
            />
            <Text style={styles.charCount}>
              {comment.length}/500 characters
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (selectedStars === 0 || !comment.trim() || isSubmitting) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={selectedStars === 0 || !comment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Update Review' : 'Submit Review'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A2E' },
  headerRight: { width: 32 },
  propertyTitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  ratingSection: { alignItems: 'center', marginBottom: 16 },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: { padding: 4 },
  ratingValue: { fontSize: 14, color: '#666', marginTop: 8 },

  postingAsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F0F4FF',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  postingAsText: { fontSize: 13, color: '#666' },
  postingAsRole: { fontWeight: '700', color: '#007AFF' },

  commentSection: { marginBottom: 20 },
  commentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333',
  },
  charCount: { fontSize: 12, color: '#999', textAlign: 'right', marginTop: 4 },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: { backgroundColor: '#CCCCCC' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default RatingModal;